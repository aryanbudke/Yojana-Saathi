"""F07 guest saved-scheme endpoint tests."""

from collections.abc import Generator
from datetime import UTC, datetime, timedelta
from pathlib import Path
from typing import cast
from uuid import UUID

import pytest
from fastapi.testclient import TestClient
from httpx import Response
from sqlalchemy import create_engine, func, select
from sqlalchemy.orm import Session
from sqlalchemy.pool import StaticPool

from app.core.config import Settings
from app.db.base import Base
from app.db.models import ProfileSession, SavedScheme
from app.db.seed import load_seed_file, seed_database
from app.db.session import create_session_factory
from app.main import create_app

FIXTURE = Path(__file__).parent / "fixtures" / "minimal_seed.json"
SCHEME_ID = UUID("50000000-0000-4000-8000-000000000001")
SESSION_A = UUID("70000000-0000-4000-8000-000000000011")
SESSION_B = UUID("70000000-0000-4000-8000-000000000012")
EXPIRED_SESSION = UUID("70000000-0000-4000-8000-000000000013")


@pytest.fixture
def saved_context() -> Generator[tuple[TestClient, Session]]:
    engine = create_engine(
        "sqlite+pysqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(engine)
    factory = create_session_factory(engine)
    now = datetime.now(UTC)
    with factory.begin() as session:
        seed_database(session, load_seed_file(FIXTURE), allow_test_urls=True)
        session.add_all(
            [
                ProfileSession(id=SESSION_A, created_at=now, expires_at=now + timedelta(hours=1)),
                ProfileSession(id=SESSION_B, created_at=now, expires_at=now + timedelta(hours=1)),
                ProfileSession(
                    id=EXPIRED_SESSION,
                    created_at=now - timedelta(hours=2),
                    expires_at=now - timedelta(hours=1),
                ),
            ]
        )
    settings = Settings(
        _env_file=None,
        APP_ENV="test",
        ALLOWED_ORIGINS="https://web.example.test",
        DATABASE_URL="sqlite+pysqlite://",
    )
    with (
        TestClient(create_app(settings, database_engine=engine)) as client,
        factory() as inspection_session,
    ):
        yield client, inspection_session


def _save(client: TestClient, session_id: UUID) -> Response:
    return cast(
        Response,
        client.post(
            "/api/v1/saved",
            json={"session_id": str(session_id), "scheme_id": str(SCHEME_ID)},
        ),
    )


def test_save_is_duplicate_free_and_returns_verified_summary(
    saved_context: tuple[TestClient, Session],
) -> None:
    client, inspection_session = saved_context

    first = _save(client, SESSION_A)
    second = _save(client, SESSION_A)

    assert first.status_code == 200
    assert second.status_code == 200
    assert len(second.json()["items"]) == 1
    assert second.json()["items"][0]["scheme"]["id"] == str(SCHEME_ID)
    count = inspection_session.scalar(select(func.count()).select_from(SavedScheme))
    assert count == 1


def test_saved_lists_are_isolated_by_session(
    saved_context: tuple[TestClient, Session],
) -> None:
    client, _ = saved_context
    assert _save(client, SESSION_A).status_code == 200

    other = client.get("/api/v1/saved", params={"session_id": str(SESSION_B)})

    assert other.status_code == 200
    assert other.json()["items"] == []


def test_unsave_is_idempotent_and_reversible(
    saved_context: tuple[TestClient, Session],
) -> None:
    client, _ = saved_context
    assert _save(client, SESSION_A).status_code == 200

    first = client.delete(f"/api/v1/saved/{SCHEME_ID}", params={"session_id": str(SESSION_A)})
    second = client.delete(f"/api/v1/saved/{SCHEME_ID}", params={"session_id": str(SESSION_A)})
    listed = client.get("/api/v1/saved", params={"session_id": str(SESSION_A)})

    assert first.status_code == 204
    assert second.status_code == 204
    assert listed.json()["items"] == []


def test_expired_session_cannot_access_saved_schemes(
    saved_context: tuple[TestClient, Session],
) -> None:
    client, _ = saved_context

    response = _save(client, EXPIRED_SESSION)

    assert response.status_code == 404
    assert response.json()["error"]["message"] == "Profile session not found or expired."


def test_unpublished_scheme_cannot_be_saved(
    saved_context: tuple[TestClient, Session],
) -> None:
    client, _ = saved_context

    response = client.post(
        "/api/v1/saved",
        json={
            "session_id": str(SESSION_A),
            "scheme_id": "50000000-0000-4000-8000-000000000099",
        },
    )

    assert response.status_code == 404
    assert response.json()["error"]["message"] == "Published scheme not found."
