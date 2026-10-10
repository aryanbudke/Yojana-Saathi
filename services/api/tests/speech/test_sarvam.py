"""Sarvam transport, privacy, validation and public endpoint tests."""

import base64
import json
from io import BytesIO
from urllib.request import Request

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient
from pydantic import SecretStr

from app.modules.speech.sarvam import SarvamSpeech, SpeechUnavailable, get_speech_service
from app.modules.speech.settings import SpeechSettings


def configured() -> SarvamSpeech:
    return SarvamSpeech(SpeechSettings(_env_file=None, api_key=SecretStr("synthetic-sarvam-key")))


def test_transcription_uses_bounded_multipart_request(monkeypatch: pytest.MonkeyPatch) -> None:
    calls: list[Request] = []

    def transport(request: Request, *, timeout: int) -> BytesIO:
        calls.append(request)
        assert timeout == 35
        assert request.full_url == "https://api.sarvam.ai/speech-to-text"
        assert request.get_header("Api-subscription-key") == "synthetic-sarvam-key"
        assert isinstance(request.data, bytes)
        assert b'name="language_code"\r\n\r\nhi-IN' in request.data
        assert b'name="model"\r\n\r\nsaaras:v4' in request.data
        assert b"private voice bytes" in request.data
        return BytesIO(
            json.dumps(
                {
                    "request_id": "synthetic",
                    "transcript": "मैं किसान हूँ",
                    "language_code": "hi-IN",
                }
            ).encode()
        )

    monkeypatch.setattr("app.modules.speech.sarvam.urlopen", transport)
    response = configured().transcribe(b"private voice bytes", "audio/webm", "hi-IN")
    assert response.transcript == "मैं किसान हूँ"
    assert response.language_code == "hi-IN" and response.needs_review
    assert len(calls) == 1


def test_synthesis_translates_then_returns_decoded_audio(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    audio = b"RIFFsynthetic-wave"
    calls: list[tuple[str, dict[str, object]]] = []

    def transport(request: Request, *, timeout: int) -> BytesIO:
        assert timeout == 20 and isinstance(request.data, bytes)
        payload = json.loads(request.data)
        calls.append((request.full_url, payload))
        if request.full_url.endswith("/translate"):
            return BytesIO(json.dumps({"translated_text": "ಯೋಜನೆಯ ಮಾಹಿತಿ"}).encode())
        return BytesIO(json.dumps({"audios": [base64.b64encode(audio).decode()]}).encode())

    monkeypatch.setattr("app.modules.speech.sarvam.urlopen", transport)
    result = configured().synthesize("Scheme information", "en-IN", "kn-IN")
    assert result == audio
    assert [call[0] for call in calls] == [
        "https://api.sarvam.ai/translate",
        "https://api.sarvam.ai/text-to-speech",
    ]
    assert calls[0][1]["target_language_code"] == "kn-IN"
    assert calls[1][1]["text"] == "ಯೋಜನೆಯ ಮಾಹಿತಿ"
    assert calls[1][1]["language_code"] == "kn-IN"


def test_missing_key_never_calls_network(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setattr(
        "app.modules.speech.sarvam.urlopen",
        lambda *args, **kwargs: pytest.fail("Missing-key speech must not call Sarvam"),
    )
    service = SarvamSpeech(SpeechSettings(_env_file=None, api_key=None))
    with pytest.raises(SpeechUnavailable):
        service.synthesize("Hello", "en-IN", "en-IN")


def test_public_speech_routes_and_safe_failures(
    client: TestClient, monkeypatch: pytest.MonkeyPatch
) -> None:
    assert isinstance(client.app, FastAPI)
    service = configured()
    client.app.dependency_overrides[get_speech_service] = lambda: service
    monkeypatch.setattr(
        service,
        "transcribe",
        lambda audio, content_type, language: {
            "transcript": "ನಾನು ರೈತ",
            "language_code": language,
            "needs_review": True,
        },
    )
    response = client.post(
        "/api/v1/speech/transcribe?language_code=kn-IN",
        content=b"audio",
        headers={"Content-Type": "audio/webm"},
    )
    assert response.status_code == 200
    assert response.json()["transcript"] == "ನಾನು ರೈತ"
    invalid = client.post(
        "/api/v1/speech/transcribe?language_code=en-IN",
        content=b"audio",
        headers={"Content-Type": "text/plain"},
    )
    assert invalid.status_code == 200  # dependency override owns validation in this contract test
    assert (
        client.post(
            "/api/v1/speech/transcribe?language_code=fr-FR",
            content=b"audio",
            headers={"Content-Type": "audio/webm"},
        ).status_code
        == 422
    )


def test_public_synthesis_route_returns_uncached_audio(
    client: TestClient, monkeypatch: pytest.MonkeyPatch
) -> None:
    assert isinstance(client.app, FastAPI)
    service = configured()
    client.app.dependency_overrides[get_speech_service] = lambda: service
    monkeypatch.setattr(service, "synthesize", lambda *args: b"RIFFsynthetic-wave")
    response = client.post(
        "/api/v1/speech/synthesize",
        json={
            "text": "Scheme details",
            "source_language_code": "en-IN",
            "target_language_code": "hi-IN",
        },
    )
    assert response.status_code == 200
    assert response.content == b"RIFFsynthetic-wave"
    assert response.headers["content-type"] == "audio/wav"
    assert response.headers["cache-control"] == "no-store"


def test_route_rejects_unsupported_audio(client: TestClient) -> None:
    assert isinstance(client.app, FastAPI)
    client.app.dependency_overrides[get_speech_service] = lambda: configured()
    response = client.post(
        "/api/v1/speech/transcribe?language_code=en-IN",
        content=b"not audio",
        headers={"Content-Type": "text/plain"},
    )
    assert response.status_code == 422
    assert "Aadhaar" not in response.text
