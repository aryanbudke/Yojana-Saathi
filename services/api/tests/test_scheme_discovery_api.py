"""F02 scheme discovery API integration tests."""

from collections.abc import Generator
from pathlib import Path

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.pool import StaticPool

from app.core.config import Settings
from app.db.base import Base
from app.db.seed import load_seed_file, seed_database
from app.db.session import create_session_factory
from app.main import create_app
from app.schemas.seed import SeedBundle
from app.services.scheme_discovery import decode_cursor, encode_cursor

FIXTURE = Path(__file__).parent / "fixtures" / "minimal_seed.json"


@pytest.fixture
def discovery_client() -> Generator[TestClient]:
    engine = create_engine(
        "sqlite+pysqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(engine)
    factory = create_session_factory(engine)
    first_bundle = load_seed_file(FIXTURE)
    second_payload = FIXTURE.read_text()
    replacements = {
        "50000000-0000-4000-8000-000000000001": "60000000-0000-4000-8000-000000000001",
        "51000000-0000-4000-8000-000000000001": "61000000-0000-4000-8000-000000000001",
        "52000000-0000-4000-8000-000000000001": "62000000-0000-4000-8000-000000000001",
        "53000000-0000-4000-8000-000000000001": "63000000-0000-4000-8000-000000000001",
        "54000000-0000-4000-8000-000000000001": "64000000-0000-4000-8000-000000000001",
        "55000000-0000-4000-8000-000000000001": "65000000-0000-4000-8000-000000000001",
        "test-only-seed-scheme": "another-test-scheme",
        "Test-only Seed Scheme": "Another Test Scheme",
        "Synthetic record for database seed tests only.": "Second reviewed test record.",
    }
    for original, replacement in replacements.items():
        second_payload = second_payload.replace(original, replacement)
    second_bundle = SeedBundle.model_validate_json(second_payload)
    combined = SeedBundle(
        schema_version="1.0",
        schemes=[first_bundle.schemes[0], second_bundle.schemes[0]],
    )
    with factory.begin() as session:
        seed_database(session, combined, allow_test_urls=True)
    settings = Settings(
        _env_file=None,
        APP_ENV="test",
        ALLOWED_ORIGINS="https://web.example.test",
        DATABASE_URL="sqlite+pysqlite://",
    )
    with TestClient(create_app(settings, database_engine=engine)) as client:
        yield client


def test_discovery_returns_only_public_summary(discovery_client: TestClient) -> None:
    response = discovery_client.get("/api/v1/schemes")

    assert response.status_code == 200
    payload = response.json()
    assert payload["next_cursor"] is None
    assert [item["slug"] for item in payload["items"]] == [
        "another-test-scheme",
        "test-only-seed-scheme",
    ]
    assert payload["items"][0]["review_status"] == "verified"
    assert payload["items"][0]["official_sources"][0]["official_url"].startswith("https://")


def test_state_filter_keeps_central_scheme(discovery_client: TestClient) -> None:
    response = discovery_client.get("/api/v1/schemes?state_code=MH")

    assert response.status_code == 200
    assert len(response.json()["items"]) == 2


def test_search_and_category_filters_narrow_results(
    discovery_client: TestClient,
) -> None:
    matching = discovery_client.get("/api/v1/schemes?q=synthetic&category=testing")
    missing = discovery_client.get("/api/v1/schemes?q=scholarship")

    assert len(matching.json()["items"]) == 1
    assert missing.json() == {"items": [], "next_cursor": None}


def test_invalid_cursor_uses_error_contract(discovery_client: TestClient) -> None:
    response = discovery_client.get("/api/v1/schemes?cursor=not-a-cursor")

    assert response.status_code == 422
    assert response.json()["error"]["code"] == "VALIDATION_ERROR"
    assert response.json()["error"]["request_id"] == response.headers["X-Request-ID"]


def test_cursor_pages_without_duplicates(discovery_client: TestClient) -> None:
    first = discovery_client.get("/api/v1/schemes?limit=1").json()
    assert first["next_cursor"] is not None

    second = discovery_client.get(
        "/api/v1/schemes", params={"limit": 1, "cursor": first["next_cursor"]}
    ).json()

    assert second["next_cursor"] is None
    assert first["items"][0]["id"] != second["items"][0]["id"]


def test_query_validation_uses_error_contract(discovery_client: TestClient) -> None:
    response = discovery_client.get("/api/v1/schemes?state_code=Maharashtra&limit=100")

    assert response.status_code == 422
    assert response.json()["error"]["code"] == "VALIDATION_ERROR"


def test_cursor_round_trip() -> None:
    from uuid import UUID

    scheme_id = UUID("50000000-0000-4000-8000-000000000001")
    cursor = encode_cursor("test-only seed scheme", scheme_id)

    assert decode_cursor(cursor) == ("test-only seed scheme", scheme_id)
