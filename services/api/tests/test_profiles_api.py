"""F01 anonymous profile-session and fact-precedence tests."""

from collections.abc import Generator
from datetime import UTC, datetime, timedelta
from uuid import UUID

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, select
from sqlalchemy.orm import Session
from sqlalchemy.pool import StaticPool

from app.core.config import Settings
from app.db.base import Base
from app.db.enums import FactOrigin
from app.db.models import ProfileFact, ProfileSession
from app.db.session import create_session_factory
from app.main import create_app
from app.schemas.profile import ProfileFacts
from app.services.profiles import (
    purge_expired_sessions,
    store_extracted_facts,
    update_confirmed_fact,
)

EXPIRED_SESSION_ID = UUID("70000000-0000-4000-8000-000000000099")


@pytest.fixture
def profile_context() -> Generator[tuple[TestClient, Session]]:
    engine = create_engine(
        "sqlite+pysqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(engine)
    factory = create_session_factory(engine)
    now = datetime.now(UTC)
    with factory.begin() as database_session:
        database_session.add(
            ProfileSession(
                id=EXPIRED_SESSION_ID,
                created_at=now - timedelta(hours=2),
                expires_at=now - timedelta(hours=1),
            )
        )
    settings = Settings(
        _env_file=None,
        APP_ENV="test",
        ALLOWED_ORIGINS="https://web.example.test",
        DATABASE_URL="sqlite+pysqlite://",
        SESSION_TTL_HOURS=6,
    )
    with (
        TestClient(create_app(settings, database_engine=engine)) as client,
        factory() as inspection_session,
    ):
        yield client, inspection_session


def _create_session(client: TestClient) -> UUID:
    response = client.post("/api/v1/profiles/sessions", json={"consent_version": "privacy-v1"})
    assert response.status_code == 201
    payload = response.json()
    assert payload["facts"]["age"] is None
    created = datetime.fromisoformat(payload["expires_at"])
    assert timedelta(hours=5, minutes=59) <= created - datetime.now(UTC)
    return UUID(payload["session_id"])


def test_user_can_create_session_and_confirm_fact(
    profile_context: tuple[TestClient, Session],
) -> None:
    client, inspection_session = profile_context
    session_id = _create_session(client)

    response = client.post(
        "/api/v1/profiles/answers",
        json={"session_id": str(session_id), "field": "state_code", "value": "MH"},
    )

    assert response.status_code == 200
    assert response.json()["facts"]["state_code"] == "MH"
    fact = inspection_session.scalar(
        select(ProfileFact).where(ProfileFact.session_id == session_id)
    )
    assert fact is not None
    assert fact.origin == FactOrigin.USER


def test_user_can_confirm_structured_support_needs(
    profile_context: tuple[TestClient, Session],
) -> None:
    client, inspection_session = profile_context
    session_id = _create_session(client)

    response = client.post(
        "/api/v1/profiles/answers",
        json={
            "session_id": str(session_id),
            "field": "support_needs",
            "value": ["Education", "housing", "education"],
        },
    )

    assert response.status_code == 200
    assert response.json()["facts"]["support_needs"] == ["education", "housing"]
    fact = inspection_session.get(ProfileFact, (session_id, "support_needs"))
    assert fact is not None and fact.value_json == ["education", "housing"]


def test_invalid_or_expired_updates_are_rejected(
    profile_context: tuple[TestClient, Session],
) -> None:
    client, _ = profile_context
    session_id = _create_session(client)

    invalid = client.post(
        "/api/v1/profiles/answers",
        json={"session_id": str(session_id), "field": "age", "value": 999},
    )
    expired = client.post(
        "/api/v1/profiles/answers",
        json={
            "session_id": str(EXPIRED_SESSION_ID),
            "field": "age",
            "value": 30,
        },
    )

    assert invalid.status_code == 422
    assert invalid.json()["error"]["code"] == "VALIDATION_ERROR"
    assert expired.status_code == 404
    assert expired.json()["error"]["message"] == "Profile session not found or expired."


def test_model_extraction_cannot_overwrite_user_fact(
    profile_context: tuple[TestClient, Session],
) -> None:
    client, database_session = profile_context
    session_id = _create_session(client)
    update_confirmed_fact(
        database_session, session_id=session_id, field="occupation", value="farmer"
    )
    store_extracted_facts(
        database_session,
        session_id=session_id,
        facts=ProfileFacts(age=24, occupation="student"),
    )
    database_session.commit()

    occupation = database_session.get(ProfileFact, (session_id, "occupation"))
    age = database_session.get(ProfileFact, (session_id, "age"))
    assert occupation is not None and occupation.value_json == "farmer"
    assert occupation.origin == FactOrigin.USER
    assert age is not None and age.origin == FactOrigin.MODEL_EXTRACTED


def test_guest_can_delete_session(profile_context: tuple[TestClient, Session]) -> None:
    client, inspection_session = profile_context
    session_id = _create_session(client)

    response = client.delete(f"/api/v1/profiles/sessions/{session_id}")

    assert response.status_code == 204
    inspection_session.expire_all()
    assert inspection_session.get(ProfileSession, session_id) is None


def test_retention_purge_deletes_only_expired_sessions(
    profile_context: tuple[TestClient, Session],
) -> None:
    client, database_session = profile_context
    active_session_id = _create_session(client)

    deleted = purge_expired_sessions(database_session, now=datetime.now(UTC))
    database_session.commit()

    assert deleted == 1
    assert database_session.get(ProfileSession, EXPIRED_SESSION_ID) is None
    assert database_session.get(ProfileSession, active_session_id) is not None
