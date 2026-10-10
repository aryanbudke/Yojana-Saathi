"""Bounded Sarvam REST client; audio and transcripts are never persisted."""

import base64
import binascii
import json
from collections import deque
from functools import lru_cache
from http.client import HTTPException
from threading import Lock
from time import monotonic
from urllib.error import HTTPError
from urllib.request import Request, urlopen
from uuid import uuid4

from pydantic import ValidationError

from app.modules.speech.schemas import SpeechLanguage, TranscriptionResponse
from app.modules.speech.settings import SpeechSettings

SARVAM_ORIGIN = "https://api.sarvam.ai"
MAX_AUDIO_BYTES = 8 * 1024 * 1024
MAX_RESPONSE_BYTES = 16 * 1024 * 1024
SUPPORTED_AUDIO_TYPES = {
    "audio/aac": "recording.aac",
    "audio/flac": "recording.flac",
    "audio/m4a": "recording.m4a",
    "audio/mp4": "recording.m4a",
    "audio/mpeg": "recording.mp3",
    "audio/ogg": "recording.ogg",
    "audio/opus": "recording.opus",
    "audio/wav": "recording.wav",
    "audio/webm": "recording.webm",
}


class SpeechUnavailable(RuntimeError):
    pass


class SpeechLimited(RuntimeError):
    pass


class InvalidAudio(ValueError):
    pass


class SarvamSpeech:
    def __init__(self, settings: SpeechSettings) -> None:
        self.settings = settings
        self.requests: deque[float] = deque()
        self.lock = Lock()

    def _key(self) -> str:
        key = self.settings.api_key
        if key is None or not key.get_secret_value().strip():
            raise SpeechUnavailable
        return key.get_secret_value()

    def _claim_budget(self) -> None:
        with self.lock:
            now = monotonic()
            while self.requests and self.requests[0] <= now - 60:
                self.requests.popleft()
            if len(self.requests) >= 30:
                raise SpeechLimited
            self.requests.append(now)

    def _json_request(self, path: str, payload: dict[str, object]) -> dict[str, object]:
        self._claim_budget()
        request = Request(
            f"{SARVAM_ORIGIN}{path}",
            data=json.dumps(payload).encode(),
            headers={
                "Content-Type": "application/json",
                "api-subscription-key": self._key(),
            },
            method="POST",
        )
        try:
            with urlopen(request, timeout=20) as response:
                raw = response.read(MAX_RESPONSE_BYTES + 1)
            if len(raw) > MAX_RESPONSE_BYTES:
                raise ValueError("Oversized Sarvam response")
            parsed = json.loads(raw)
            if not isinstance(parsed, dict):
                raise ValueError("Invalid Sarvam response")
            return parsed
        except HTTPError as exc:
            if exc.code == 429:
                raise SpeechLimited from None
            raise SpeechUnavailable from None
        except (OSError, HTTPException, ValueError, TypeError, json.JSONDecodeError):
            raise SpeechUnavailable from None

    def transcribe(
        self, audio: bytes, content_type: str, language_code: SpeechLanguage
    ) -> TranscriptionResponse:
        mime = content_type.split(";", 1)[0].lower().strip()
        if not audio or len(audio) > MAX_AUDIO_BYTES or mime not in SUPPORTED_AUDIO_TYPES:
            raise InvalidAudio
        self._claim_budget()
        boundary = f"yojana-saathi-{uuid4().hex}"
        chunks: list[bytes] = []

        def field(name: str, value: str) -> None:
            chunks.extend(
                [
                    f"--{boundary}\r\n".encode(),
                    f'Content-Disposition: form-data; name="{name}"\r\n\r\n'.encode(),
                    value.encode(),
                    b"\r\n",
                ]
            )

        field("model", self.settings.stt_model)
        field("mode", "transcribe")
        field("language_code", language_code)
        chunks.extend(
            [
                f"--{boundary}\r\n".encode(),
                (
                    'Content-Disposition: form-data; name="file"; '
                    f'filename="{SUPPORTED_AUDIO_TYPES[mime]}"\r\n'
                ).encode(),
                f"Content-Type: {mime}\r\n\r\n".encode(),
                audio,
                b"\r\n",
                f"--{boundary}--\r\n".encode(),
            ]
        )
        request = Request(
            f"{SARVAM_ORIGIN}/speech-to-text",
            data=b"".join(chunks),
            headers={
                "Content-Type": f"multipart/form-data; boundary={boundary}",
                "api-subscription-key": self._key(),
            },
            method="POST",
        )
        try:
            with urlopen(request, timeout=35) as response:
                raw = response.read(65537)
            if len(raw) > 65536:
                raise ValueError("Oversized Sarvam response")
            payload = json.loads(raw)
            transcript = payload["transcript"].strip()
            detected = payload.get("language_code") or language_code
            if not transcript or detected not in {"en-IN", "hi-IN", "kn-IN"}:
                raise ValueError("Invalid transcription")
            return TranscriptionResponse(
                transcript=transcript, language_code=detected, needs_review=True
            )
        except HTTPError as exc:
            if exc.code == 429:
                raise SpeechLimited from None
            raise SpeechUnavailable from None
        except (OSError, HTTPException, ValueError, TypeError, KeyError, json.JSONDecodeError):
            raise SpeechUnavailable from None

    def synthesize(
        self,
        text: str,
        source_language_code: SpeechLanguage,
        target_language_code: SpeechLanguage,
    ) -> bytes:
        spoken_text = text
        if source_language_code != target_language_code:
            translated = self._json_request(
                "/translate",
                {
                    "input": text,
                    "source_language_code": source_language_code,
                    "target_language_code": target_language_code,
                    "model": self.settings.translation_model,
                    "mode": "formal",
                },
            )
            value = translated.get("translated_text")
            if not isinstance(value, str) or not value.strip():
                raise SpeechUnavailable
            spoken_text = value.strip()
        payload = self._json_request(
            "/text-to-speech",
            {
                "text": spoken_text,
                "language_code": target_language_code,
                "model": self.settings.tts_model,
                "pace": 1.0,
                "speech_sample_rate": 24000,
            },
        )
        audios = payload.get("audios")
        if (
            not isinstance(audios, list)
            or not audios
            or not all(isinstance(x, str) for x in audios)
        ):
            raise SpeechUnavailable
        try:
            audio = base64.b64decode("".join(audios), validate=True)
        except (ValueError, binascii.Error):
            raise SpeechUnavailable from None
        if not audio or len(audio) > MAX_RESPONSE_BYTES:
            raise SpeechUnavailable
        return audio


@lru_cache
def get_speech_service() -> SarvamSpeech:
    try:
        settings = SpeechSettings()
    except ValidationError:
        settings = SpeechSettings(_env_file=None, api_key=None)
    return SarvamSpeech(settings)
