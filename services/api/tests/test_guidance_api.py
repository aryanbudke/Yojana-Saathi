"""F06 application guidance API integration tests."""

from collections.abc import Generator
from datetime import UTC, datetime, timedelta
from pathlib import Path
from uuid import UUID

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, select
from sqlalchemy.pool import StaticPool

from app.core.config import Settings
from app.db.base import Base
from app.db.enums import FactOrigin
from app.db.models import ProfileFact, ProfileSession, RequiredDocument
from app.db.seed import load_seed_file, seed_database
from app.db.session import create_session_factory
from app.main import create_app

FIXTURE = Path(__file__).parent / "fixtures" / "minimal_seed.json"
SCHEME_ID = "50000000-0000-4000-8000-000000000001"
ACTIVE_SESSION_ID = UUID("70000000-0000-4000-8000-000000000001")
EXPIRED_SESSION_ID = UUID("70000000-0000-4000-8000-000000000002")


@pytest.fixture
def guidance_client() -> Generator[TestClient]:
    engine = create_engine(
        "sqlite+pysqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(engine)
    factory = create_session_factory(engine)
    now = datetime.now(UTC)
    with factory.begin() as session:
        seed_database(session, load_seed_file(FIXTURE))
        document = session.scalar(select(RequiredDocument))
        assert document is not None
        document.when_required = {"field": "age", "op": "gte", "value": 18}
        session.add_all(
            [
                ProfileSession(
                    id=ACTIVE_SESSION_ID,
                    created_at=now,
                    expires_at=now + timedelta(hours=1),
                ),
                ProfileSession(
                    id=EXPIRED_SESSION_ID,
                    created_at=now - timedelta(hours=2),
                    expires_at=now - timedelta(hours=1),
                ),
            ]
        )
        session.flush()
        session.add(
            ProfileFact(
                session_id=ACTIVE_SESSION_ID,
                field_name="age",
                value_json=17,
                origin=FactOrigin.USER,
            )
        )
    settings = Settings(
        _env_file=None,
        APP_ENV="test",
        ALLOWED_ORIGINS="https://web.example.test",
        DATABASE_URL="sqlite+pysqlite://",
    )
    with TestClient(create_app(settings, database_engine=engine)) as client:
        yield client


def test_guidance_without_session_is_conservative(guidance_client: TestClient) -> None:
    response = guidance_client.get(f"/api/v1/guidance/{SCHEME_ID}")

    assert response.status_code == 200
    payload = response.json()
    assert payload["documents"][0]["status"] == "may_be_required"
    assert payload["official_application_url"].startswith("https://")
    assert payload["steps"][0]["source_id"] == payload["sources"][0]["id"]
    assert payload["unresolved_preconditions"] == ["Missing confirmed fact: age"]


def test_confirmed_fact_can_remove_inapplicable_document(
    guidance_client: TestClient,
) -> None:
    response = guidance_client.get(
        f"/api/v1/guidance/{SCHEME_ID}",
        params={"session_id": str(ACTIVE_SESSION_ID)},
    )

    assert response.status_code == 200
    assert response.json()["documents"] == []
    assert response.json()["unresolved_preconditions"] == []


def test_expired_session_is_rejected(guidance_client: TestClient) -> None:
    response = guidance_client.get(
        f"/api/v1/guidance/{SCHEME_ID}",
        params={"session_id": str(EXPIRED_SESSION_ID)},
    )

    assert response.status_code == 404
    assert response.json()["error"]["message"] == "Profile session not found or expired."


def test_missing_scheme_is_rejected(guidance_client: TestClient) -> None:
    response = guidance_client.get("/api/v1/guidance/50000000-0000-4000-8000-000000000099")

    assert response.status_code == 404
    assert response.json()["error"]["code"] == "NOT_FOUND"
