"""Bounded Gemini REST extraction; no model output is persisted or evaluated."""

import json
from collections import deque
from functools import lru_cache
from http.client import HTTPException
from threading import Lock
from time import monotonic
from urllib.request import Request, urlopen

from pydantic import ValidationError

from app.modules.ai.prompts import EXTRACTION_PROMPT
from app.modules.ai.settings import AISettings
from app.modules.ai.validation import Draft, validate_extraction
from app.modules.matching.facts import contains_sensitive_identifier
from app.schemas.profile import ProfileExtractResponse


class ExtractionUnavailable(RuntimeError):
    pass


class ExtractionLimited(RuntimeError):
    pass


class GeminiExtractor:
    def __init__(self, settings: AISettings) -> None:
        self.settings = settings
        self.requests: deque[float] = deque()
        self.lock = Lock()

    def extract(self, text: str, locale: str) -> ProfileExtractResponse:
        key = self.settings.api_key
        model = self.settings.model
        if key is None or not key.get_secret_value().strip() or model is None:
            raise ExtractionUnavailable
        if locale != "en-IN":
            raise ExtractionUnavailable
        if not 1 <= len(text.strip()) <= 1000 or contains_sensitive_identifier(text):
            raise ExtractionUnavailable
        # shortcut: global per-process budget; use a shared limiter before multi-worker deployment.
        with self.lock:
            now = monotonic()
            while self.requests and self.requests[0] <= now - 60:
                self.requests.popleft()
            if len(self.requests) >= 20:
                raise ExtractionLimited
            self.requests.append(now)
        payload = {
            "systemInstruction": {"parts": [{"text": EXTRACTION_PROMPT}]},
            "contents": [
                {"role": "user", "parts": [{"text": json.dumps({"text": text, "locale": locale})}]}
            ],
            "generationConfig": {
                "temperature": 0,
                "maxOutputTokens": 2048,
                "responseFormat": {
                    "text": {"mimeType": "application/json", "schema": Draft.model_json_schema()}
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


@lru_cache
def get_extractor() -> GeminiExtractor:
    try:
        settings = AISettings()
    except ValidationError:
        settings = AISettings(_env_file=None, api_key=None, model=None)
    return GeminiExtractor(settings)
