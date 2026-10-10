"""Bounded Gemini REST extraction; no model output is persisted or evaluated."""

import json
from collections import deque
from functools import lru_cache
from http.client import HTTPException
from threading import Lock
from time import monotonic
from urllib.error import HTTPError
from urllib.request import Request, urlopen

from pydantic import ValidationError

from app.modules.ai.prompts import EXTRACTION_PROMPT
from app.modules.ai.settings import AISettings
from app.modules.ai.validation import Draft, validate_extraction
from app.modules.matching.facts import contains_sensitive_identifier
from app.modules.speech.settings import SpeechSettings
from app.schemas.profile import ProfileExtractResponse

SARVAM_CHAT_URL = "https://api.sarvam.ai/v1/chat/completions"
SARVAM_TRANSLATE_URL = "https://api.sarvam.ai/translate"


class ExtractionUnavailable(RuntimeError):
    pass


class ExtractionLimited(RuntimeError):
    pass


class GeminiExtractor:
    def __init__(self, settings: AISettings, sarvam_settings: SpeechSettings | None = None) -> None:
        self.settings = settings
        self.sarvam_settings = sarvam_settings
        self.requests: deque[float] = deque()
        self.lock = Lock()

    def extract(self, text: str, locale: str) -> ProfileExtractResponse:
        key = self.settings.api_key
        model = self.settings.model
        if locale not in {"en-IN", "hi-IN", "kn-IN"}:
            raise ExtractionUnavailable
        if not 1 <= len(text.strip()) <= 1000 or contains_sensitive_identifier(text):
            raise ExtractionUnavailable
        gemini_configured = (
            key is not None and bool(key.get_secret_value().strip()) and model is not None
        )
        sarvam_key = self.sarvam_settings.api_key if self.sarvam_settings else None
        sarvam_configured = sarvam_key is not None and bool(sarvam_key.get_secret_value().strip())
        if not gemini_configured and not sarvam_configured:
            raise ExtractionUnavailable
        # shortcut: global per-process budget; use a shared limiter before multi-worker deployment.
        with self.lock:
            now = monotonic()
            while self.requests and self.requests[0] <= now - 60:
                self.requests.popleft()
            if len(self.requests) >= 20:
                raise ExtractionLimited
            self.requests.append(now)
        if not gemini_configured:
            return self._extract_with_sarvam(text, locale)
        assert key is not None and model is not None
        payload = {
            "systemInstruction": {"parts": [{"text": EXTRACTION_PROMPT}]},
            "contents": [
                {"role": "user", "parts": [{"text": json.dumps({"text": text, "locale": locale})}]}
            ],
            "generationConfig": {
                "temperature": 0,
                "maxOutputTokens": 2048,
                "responseFormat": {
                    "text": {"mimeType": "APPLICATION_JSON", "schema": Draft.model_json_schema()}
                },
            },
        }
        request = Request(
            f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent",
            data=json.dumps(payload).encode(),
            headers={"Content-Type": "application/json", "x-goog-api-key": key.get_secret_value()},
            method="POST",
        )
        try:
            with urlopen(request, timeout=10) as response:
                raw = response.read(64001)
            if len(raw) > 64000:
                raise ValueError("Oversized response")
            envelope = json.loads(raw)
            candidates = envelope["candidates"]
            if len(candidates) != 1 or candidates[0]["finishReason"] != "STOP":
                raise ValueError("Incomplete generation")
            parts = candidates[0]["content"]["parts"]
            output = "".join(part["text"] for part in parts if not part.get("thought", False))
            facts = validate_extraction(output, text)
        except (
            OSError,
            HTTPException,
            ValueError,
            TypeError,
            KeyError,
            IndexError,
            AttributeError,
            RecursionError,
        ):
            raise ExtractionUnavailable from None
        return ProfileExtractResponse(
            facts=facts,
            needs_review=True,
            unknown_fields=[
                field
                for field, value in facts.model_dump().items()
                if value is None or value == "not_sure"
            ],
        )

    def _extract_with_sarvam(self, text: str, locale: str) -> ProfileExtractResponse:
        settings = self.sarvam_settings
        key = settings.api_key if settings else None
        if settings is None or key is None or not key.get_secret_value().strip():
            raise ExtractionUnavailable
        extraction_text = self._translate_for_extraction(
            text, locale, settings, key.get_secret_value()
        )
        payload = {
            "model": settings.chat_model,
            "messages": [
                {"role": "system", "content": EXTRACTION_PROMPT},
                {
                    "role": "user",
                    "content": json.dumps(
                        {
                            "text": extraction_text,
                            "locale": "en-IN",
                            "original_locale": locale,
                        }
                    ),
                },
            ],
            "temperature": 0,
            "max_tokens": 2048,
            "response_format": {
                "type": "json_schema",
                "json_schema": {
                    "name": "profile_extraction",
                    "strict": True,
                    "schema": Draft.model_json_schema(),
                },
            },
        }
        request = Request(
            SARVAM_CHAT_URL,
            data=json.dumps(payload).encode(),
            headers={
                "Content-Type": "application/json",
                "api-subscription-key": key.get_secret_value(),
            },
            method="POST",
        )
        try:
            facts = None
            for attempt in range(2):
                try:
                    with urlopen(request, timeout=20) as response:
                        raw = response.read(64001)
                    if len(raw) > 64000:
                        raise ValueError("Oversized response")
                    envelope = json.loads(raw)
                    choices = envelope["choices"]
                    if len(choices) != 1 or choices[0]["finish_reason"] != "stop":
                        raise ValueError("Incomplete generation")
                    output = choices[0]["message"]["content"]
                    if not isinstance(output, str):
                        raise ValueError("Missing structured output")
                    facts = validate_extraction(output, extraction_text)
                    break
                except HTTPError:
                    raise
                except (
                    ValueError,
                    TypeError,
                    KeyError,
                    IndexError,
                    AttributeError,
                    RecursionError,
                ):
                    if attempt == 1:
                        raise
            if facts is None:
                raise ValueError("Missing validated extraction")
        except HTTPError as exc:
            if exc.code == 429:
                raise ExtractionLimited from None
            raise ExtractionUnavailable from None
        except (
            OSError,
            HTTPException,
            ValueError,
            TypeError,
            KeyError,
            IndexError,
            AttributeError,
            RecursionError,
        ):
            raise ExtractionUnavailable from None
        return ProfileExtractResponse(
            facts=facts,
            needs_review=True,
            unknown_fields=[
                field
                for field, value in facts.model_dump().items()
                if value is None or value == "not_sure"
            ],
        )

    @staticmethod
    def _translate_for_extraction(
        text: str, locale: str, settings: SpeechSettings, key: str
    ) -> str:
        if locale == "en-IN":
            return text
        request = Request(
            SARVAM_TRANSLATE_URL,
            data=json.dumps(
                {
                    "input": text,
                    "source_language_code": locale,
                    "target_language_code": "en-IN",
                    "model": settings.translation_model,
                    "mode": "formal",
                }
            ).encode(),
            headers={"Content-Type": "application/json", "api-subscription-key": key},
            method="POST",
        )
        try:
            with urlopen(request, timeout=20) as response:
                raw = response.read(16001)
            if len(raw) > 16000:
                raise ValueError("Oversized translation")
            translated = json.loads(raw)["translated_text"]
            if not isinstance(translated, str) or not translated.strip():
                raise ValueError("Missing translation")
            return translated.strip()
        except HTTPError as exc:
            if exc.code == 429:
                raise ExtractionLimited from None
            raise ExtractionUnavailable from None
        except (OSError, HTTPException, ValueError, TypeError, KeyError):
            raise ExtractionUnavailable from None


@lru_cache
def get_extractor() -> GeminiExtractor:
    try:
        settings = AISettings()
    except ValidationError:
        settings = AISettings(_env_file=None, api_key=None, model=None)
    try:
        sarvam_settings = SpeechSettings()
    except ValidationError:
        sarvam_settings = SpeechSettings(_env_file=None, api_key=None)
    return GeminiExtractor(settings, sarvam_settings)
