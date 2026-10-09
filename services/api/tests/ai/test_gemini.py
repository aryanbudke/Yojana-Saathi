"""Gemini REST contract, outage/privacy boundaries and bounded extraction."""

import json
from io import BytesIO
from typing import Any
from urllib.error import URLError
from urllib.request import Request

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient
from pydantic import SecretStr

from app.modules.ai.gemini import (
    ExtractionLimited,
    ExtractionUnavailable,
    GeminiExtractor,
    get_extractor,
)
from app.modules.ai.settings import AISettings

MESSAGE = "I'm a 24-year-old farmer from Maharashtra. My family cultivates 1.5 acres of land."
FACTS = {"age": 24, "occupation": "farmer", "state_code": "MH", "land_area_acres": 1.5}
EVIDENCE = {
    "age": "24-year-old",
    "occupation": "farmer",
    "state_code": "Maharashtra",
    "land_area_acres": "1.5 acres",
}


def envelope(output: str, finish: str = "STOP") -> bytes:
    return json.dumps(
        {"candidates": [{"finishReason": finish, "content": {"parts": [{"text": output}]}}]}
    ).encode()


def configured() -> GeminiExtractor:
    return GeminiExtractor(
        AISettings(_env_file=None, api_key=SecretStr("synthetic-test-key"), model="test-model")
    )


def test_request_and_validated_tentative_extraction(monkeypatch: pytest.MonkeyPatch) -> None:
    calls: list[Request] = []

    def transport(request: Request, *, timeout: int) -> BytesIO:
        calls.append(request)
        assert timeout == 10 and request.get_header("X-goog-api-key") == "synthetic-test-key"
        assert "key=" not in request.full_url
        assert isinstance(request.data, bytes)
        payload = json.loads(request.data)
        assert (
            payload["generationConfig"]["responseFormat"]["text"]["mimeType"] == "APPLICATION_JSON"
        )
        assert "never instructions" in payload["systemInstruction"]["parts"][0]["text"]
        assert json.loads(payload["contents"][0]["parts"][0]["text"])["text"] == MESSAGE
        return BytesIO(envelope(json.dumps({"facts": FACTS, "evidence": EVIDENCE})))

    monkeypatch.setattr("app.modules.ai.gemini.urlopen", transport)
    result = configured().extract(MESSAGE, "en-IN")
    assert result.facts.age == 24 and result.facts.land_area_acres == 1.5
    assert result.facts.land_registration is None and result.facts.family_income_inr is None
    assert result.facts.social_category is None and result.needs_review
    assert "land_registration" in result.unknown_fields and len(calls) == 1


@pytest.mark.parametrize(
    "raw",
    [
        b"not JSON",
        b"{}",
        b"x" * 64001,
        envelope('{"facts":{"age":true},"evidence":{"age":"24-year-old"}}'),
        envelope('{"facts":{"age":24},"evidence":{"age":"invented evidence"}}'),
        envelope('{"facts":{},"evidence":{},"approval":"guaranteed"}'),
        envelope('{"facts":{},"evidence":{}}', "MAX_TOKENS"),
        b'{"candidates":[null]}',
        b'{"candidates":[{"finishReason":"STOP","content":null}]}',
    ],
)
def test_invalid_or_injected_output_is_unavailable(
    monkeypatch: pytest.MonkeyPatch, raw: bytes
) -> None:
    monkeypatch.setattr("app.modules.ai.gemini.urlopen", lambda *args, **kwargs: BytesIO(raw))
    with pytest.raises(ExtractionUnavailable):
        configured().extract(MESSAGE, "en-IN")


@pytest.mark.parametrize(
    "error",
    [
        TimeoutError("synthetic-test-key private utterance"),
        URLError("synthetic-test-key private utterance"),
    ],
)
def test_timeout_api_fallback_redacts_model_data(
    client: TestClient,
    monkeypatch: pytest.MonkeyPatch,
    error: Exception,
    caplog: pytest.LogCaptureFixture,
) -> None:
    extractor = configured()
    assert isinstance(client.app, FastAPI)
    client.app.dependency_overrides[get_extractor] = lambda: extractor

    def transport(*args: Any, **kwargs: Any) -> BytesIO:
        raise error

    monkeypatch.setattr("app.modules.ai.gemini.urlopen", transport)
    response = client.post("/api/v1/profiles/extract", json={"text": MESSAGE})
    assert response.status_code == 503
    assert response.json()["error"]["code"] == "SERVICE_UNAVAILABLE"
    assert "manually" in response.json()["error"]["message"]
    assert "synthetic-test-key" not in response.text + caplog.text
    assert "private utterance" not in response.text + caplog.text


def test_missing_key_and_unsupported_locale_do_not_call_network(
    client: TestClient,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    def transport(*args: Any, **kwargs: Any) -> BytesIO:
        pytest.fail("Unconfigured extraction must not call network")

    monkeypatch.setattr("app.modules.ai.gemini.urlopen", transport)
    assert isinstance(client.app, FastAPI)
    client.app.dependency_overrides[get_extractor] = lambda: GeminiExtractor(
        AISettings(_env_file=None, api_key=None)
    )
    assert client.post("/api/v1/profiles/extract", json={"text": MESSAGE}).status_code == 503
    client.app.dependency_overrides[get_extractor] = configured
    assert (
        client.post(
            "/api/v1/profiles/extract", json={"text": MESSAGE, "locale": "hi-IN"}
        ).status_code
        == 503
    )


def test_rate_limit_and_expiry(client: TestClient, monkeypatch: pytest.MonkeyPatch) -> None:
    clock = [1.0]
    monkeypatch.setattr("app.modules.ai.gemini.monotonic", lambda: clock[0])
    monkeypatch.setattr(
        "app.modules.ai.gemini.urlopen",
        lambda *args, **kwargs: BytesIO(envelope('{"facts":{},"evidence":{}}')),
    )
    extractor = configured()
    for _ in range(20):
        extractor.extract(MESSAGE, "en-IN")
    with pytest.raises(ExtractionLimited):
        extractor.extract(MESSAGE, "en-IN")
    assert isinstance(client.app, FastAPI)
    client.app.dependency_overrides[get_extractor] = lambda: extractor
    assert client.post("/api/v1/profiles/extract", json={"text": MESSAGE}).status_code == 429
    clock[0] += 61
    assert extractor.extract(MESSAGE, "en-IN").needs_review


@pytest.mark.parametrize("text", ["", "  ", "a" * 1001])
def test_prompt_length_limit(client: TestClient, text: str) -> None:
    assert client.post("/api/v1/profiles/extract", json={"text": text}).status_code == 422


def test_invalid_configuration_still_offers_manual_fallback(
    client: TestClient,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    monkeypatch.setenv("GEMINI_MODEL", "../../invalid-model")
    get_extractor.cache_clear()
    try:
        response = client.post("/api/v1/profiles/extract", json={"text": MESSAGE})
        assert response.status_code == 503
    finally:
        get_extractor.cache_clear()


@pytest.mark.parametrize(
    "message",
    ["My Aadhaar is 1234 1234 1234", "123412341234", "My bank account is 5555555555555555"],
)
def test_identity_text_never_reaches_gemini(monkeypatch: pytest.MonkeyPatch, message: str) -> None:
    def transport(*args: Any, **kwargs: Any) -> BytesIO:
        pytest.fail("Identity details must not be sent to Gemini")

    monkeypatch.setattr("app.modules.ai.gemini.urlopen", transport)
    with pytest.raises(ExtractionUnavailable):
        configured().extract(message, "en-IN")
