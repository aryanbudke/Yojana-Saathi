"""Authenticated server-to-server transport for the Apps Script mail service."""

import hashlib
import hmac
import json
import time
from dataclasses import dataclass
from typing import Any
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen
from uuid import uuid4


class GoogleAppsScriptError(RuntimeError):
    def __init__(self, code: str, message: str, *, retryable: bool = False) -> None:
        super().__init__(message)
        self.code = code
        self.retryable = retryable


@dataclass(frozen=True)
class GoogleAppsScriptClient:
    url: str
    shared_secret: str
    timeout_seconds: float = 15.0

    def send_otp(self, payload: dict[str, Any]) -> dict[str, Any]:
        return self._post("send_otp", payload)

    def verify_otp(self, payload: dict[str, Any]) -> dict[str, Any]:
        return self._post("verify_otp", payload)

    def send_result(self, payload: dict[str, Any]) -> dict[str, Any]:
        return self._post("send_result", payload)

    def _post(self, action: str, payload: dict[str, Any]) -> dict[str, Any]:
        timestamp = int(time.time())
        nonce = uuid4().hex
        payload_json = json.dumps(
            payload, sort_keys=True, separators=(",", ":"), ensure_ascii=False
        )
        canonical = f"{action}.{timestamp}.{nonce}.{payload_json}".encode()
        signature = hmac.new(
            self.shared_secret.encode(), canonical, hashlib.sha256
        ).hexdigest()
        body = json.dumps(
            {
                "action": action,
                "timestamp": timestamp,
                "nonce": nonce,
                "payload": payload,
                "signature": signature,
            },
            separators=(",", ":"),
            ensure_ascii=False,
        ).encode()
        request = Request(
            self.url,
            data=body,
            headers={"Accept": "application/json", "Content-Type": "application/json"},
            method="POST",
        )
        try:
            with urlopen(request, timeout=self.timeout_seconds) as response:  # noqa: S310
                raw = response.read(32_769)
        except (HTTPError, URLError, TimeoutError) as exc:
            raise GoogleAppsScriptError(
                "delivery_unavailable",
                "The email service is temporarily unavailable.",
                retryable=True,
            ) from exc
        if len(raw) > 32_768:
            raise GoogleAppsScriptError(
                "invalid_response", "The email service response was invalid."
            )
        try:
            data = json.loads(raw)
        except (UnicodeDecodeError, json.JSONDecodeError) as exc:
            raise GoogleAppsScriptError(
                "invalid_response", "The email service response was invalid."
            ) from exc
        if not isinstance(data, dict) or not isinstance(data.get("ok"), bool):
            raise GoogleAppsScriptError(
                "invalid_response", "The email service response was invalid."
            )
        if not data["ok"]:
            raw_error = data.get("error")
            error: dict[str, Any] = raw_error if isinstance(raw_error, dict) else {}
            code = str(error.get("code") or "delivery_failed")[:64]
            message = str(error.get("message") or "The email request could not be completed.")[:300]
            raise GoogleAppsScriptError(
                code,
                message,
                retryable=code in {"delivery_failed", "delivery_unavailable", "busy"},
            )
        result = data.get("data", {})
        if not isinstance(result, dict):
            raise GoogleAppsScriptError(
                "invalid_response", "The email service response was invalid."
            )
        return result
