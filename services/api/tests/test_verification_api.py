"""OTP gating, immutable-profile checks, eligibility decisions, and email idempotency."""

from collections.abc import Generator
from pathlib import Path
from typing import Any

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session
from sqlalchemy.pool import StaticPool

from app.api.v1.verification import get_verification_dependencies
from app.core.config import Settings
from app.db.base import Base
from app.db.seed import load_seed_file, seed_database
from app.main import create_app
from app.services.google_apps_script import GoogleAppsScriptError

SEED = Path(__file__).parent / "fixtures" / "minimal_seed.json"
SCHEME_ID = "50000000-0000-4000-8000-000000000001"
STATE_SECRET = "state-secret-for-tests-only-32-characters"


class FakeGas:
    def __init__(self) -> None:
        self.otp_by_challenge: dict[str, str] = {}
        self.used: dict[str, str] = {}
        self.sent_decisions: set[str] = set()
        self.verify_error: GoogleAppsScriptError | None = None
        self.fail_result_once = False

    def send_otp(self, payload: dict[str, Any]) -> dict[str, Any]:
        self.otp_by_challenge[payload["challenge_id"]] = payload["otp"]
        return {"sent": True}

    def verify_otp(self, payload: dict[str, Any]) -> dict[str, Any]:
        if self.verify_error is not None:
            raise self.verify_error
        challenge = payload["challenge_id"]
        expected = self.otp_by_challenge.get(challenge)
        if expected != payload["otp"]:
            raise GoogleAppsScriptError("invalid_otp", "The code is incorrect.")
        prior_request = self.used.get(challenge)
        if prior_request is not None and prior_request != payload["verification_request_id"]:
            raise GoogleAppsScriptError("otp_used", "This code was already used.")
        self.used[challenge] = payload["verification_request_id"]
        return {"verified": True, "idempotent_replay": prior_request is not None}

    def send_result(self, payload: dict[str, Any]) -> dict[str, Any]:
        if self.fail_result_once:
            self.fail_result_once = False
            raise GoogleAppsScriptError(
                "delivery_failed", "The result email could not be sent.", retryable=True
            )
        decision_id = payload["decision_id"]
        already_sent = decision_id in self.sent_decisions
        self.sent_decisions.add(decision_id)
        return {"sent": True, "already_sent": already_sent}


@pytest.fixture
def verification_context() -> Generator[tuple[TestClient, FakeGas]]:
    engine = create_engine(
        "sqlite+pysqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(engine)
    with Session(engine) as session:
        seed_database(session, load_seed_file(SEED), allow_test_urls=True)
        session.commit()
    settings = Settings(
        _env_file=None,
        APP_ENV="test",
        DATABASE_URL="sqlite+pysqlite://",
        GAS_WEB_APP_URL="https://script.google.com/macros/s/test/exec",
        GAS_SHARED_SECRET="gas-secret-for-tests-only-32-characters",
        VERIFICATION_STATE_SECRET=STATE_SECRET,
    )
    application = create_app(settings, database_engine=engine)
    gas = FakeGas()
    application.dependency_overrides[get_verification_dependencies] = lambda: (
        gas,
        STATE_SECRET,
    )
    with TestClient(application) as client:
        yield client, gas
    engine.dispose()


def create_session(client: TestClient, age: int | None | str = "absent") -> str:
    session_id = client.post("/api/v1/profiles/sessions", json={}).json()["session_id"]
    if age != "absent":
        response = client.post(
            "/api/v1/profiles/answers",
            json={"session_id": session_id, "field": "age", "value": age},
        )
        assert response.status_code == 200
    return str(session_id)


def start(client: TestClient, session_id: str) -> dict[str, Any]:
    response = client.post(
        "/api/v1/verification/start",
        json={
            "session_id": session_id,
            "scheme_id": SCHEME_ID,
            "name": "Asha Citizen",
            "email": "ASHA@example.com",
        },
    )
    assert response.status_code == 200, response.text
    data: dict[str, Any] = response.json()
    return data


def otp_for(gas: FakeGas) -> str:
    return next(reversed(gas.otp_by_challenge.values()))


@pytest.mark.parametrize(
    ("age", "expected"),
    [(24, "eligible"), (17, "not_eligible"), ("absent", "needs_review")],
)
def test_verified_email_runs_existing_scheme_rules_and_sends_once(
    verification_context: tuple[TestClient, FakeGas], age: int | str, expected: str
) -> None:
    client, gas = verification_context
    session_id = create_session(client, age)
    challenge = start(client, session_id)
    assert "otp" not in challenge

    response = client.post(
        "/api/v1/verification/confirm",
        json={
            "verification_token": challenge["verification_token"],
            "otp": otp_for(gas),
        },
    )

    assert response.status_code == 200, response.text
    assert response.json()["status"] == expected
    assert response.json()["notification_status"] == "sent"
    assert len(gas.sent_decisions) == 1

    duplicate = client.post(
        "/api/v1/verification/confirm",
        json={
            "verification_token": challenge["verification_token"],
            "otp": otp_for(gas),
        },
    )
    assert duplicate.status_code == 200
    assert duplicate.json()["notification_status"] == "already_sent"
    assert len(gas.sent_decisions) == 1


def test_incorrect_otp_does_not_evaluate_or_notify(
    verification_context: tuple[TestClient, FakeGas],
) -> None:
    client, gas = verification_context
    challenge = start(client, create_session(client, 24))

    response = client.post(
        "/api/v1/verification/confirm",
        json={"verification_token": challenge["verification_token"], "otp": "000000"},
    )

    assert response.status_code == 400
    assert gas.sent_decisions == set()


@pytest.mark.parametrize(
    ("code", "expected_status"),
    [
        ("otp_expired", 400),
        ("otp_used", 409),
        ("too_many_attempts", 429),
        ("busy", 503),
    ],
)
def test_otp_service_failures_are_safe_and_do_not_notify(
    verification_context: tuple[TestClient, FakeGas], code: str, expected_status: int
) -> None:
    client, gas = verification_context
    challenge = start(client, create_session(client, 24))
    gas.verify_error = GoogleAppsScriptError(code, "Safe public error", retryable=code == "busy")

    response = client.post(
        "/api/v1/verification/confirm",
        json={
            "verification_token": challenge["verification_token"],
            "otp": otp_for(gas),
        },
    )

    assert response.status_code == expected_status
    assert gas.sent_decisions == set()


def test_profile_change_and_tampered_payload_require_restart(
    verification_context: tuple[TestClient, FakeGas],
) -> None:
    client, gas = verification_context
    session_id = create_session(client, 24)
    challenge = start(client, session_id)
    changed = client.post(
        "/api/v1/profiles/answers",
        json={"session_id": session_id, "field": "age", "value": 17},
    )
    assert changed.status_code == 200

    response = client.post(
        "/api/v1/verification/confirm",
        json={
            "verification_token": challenge["verification_token"],
            "otp": otp_for(gas),
        },
    )
    assert response.status_code == 409
    assert gas.used == {}

    extra_facts = client.post(
        "/api/v1/verification/start",
        json={
            "session_id": session_id,
            "scheme_id": SCHEME_ID,
            "name": "Asha",
            "email": "asha@example.com",
            "facts": {"age": 99},
        },
    )
    assert extra_facts.status_code == 422


def test_result_email_failure_returns_retry_token_without_rechecking_otp(
    verification_context: tuple[TestClient, FakeGas],
) -> None:
    client, gas = verification_context
    challenge = start(client, create_session(client, 24))
    gas.fail_result_once = True
    response = client.post(
        "/api/v1/verification/confirm",
        json={
            "verification_token": challenge["verification_token"],
            "otp": otp_for(gas),
        },
    )
    assert response.status_code == 200
    assert response.json()["notification_status"] == "failed_retryable"
    retry_token = response.json()["notification_retry_token"]

    retried = client.post(
        "/api/v1/verification/notifications/retry",
        json={"notification_retry_token": retry_token},
    )
    assert retried.status_code == 200, retried.text
    assert retried.json()["notification_status"] == "sent"


def test_malformed_token_and_otp_are_rejected(
    verification_context: tuple[TestClient, FakeGas],
) -> None:
    client, _ = verification_context
    malformed = client.post(
        "/api/v1/verification/confirm",
        json={"verification_token": "x" * 40, "otp": "123456"},
    )
    assert malformed.status_code == 400
    invalid_otp_shape = client.post(
        "/api/v1/verification/confirm",
        json={"verification_token": "x" * 40, "otp": "12345a"},
    )
    assert invalid_otp_shape.status_code == 422
