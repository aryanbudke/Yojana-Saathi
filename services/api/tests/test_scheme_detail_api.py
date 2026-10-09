"""F05 scheme detail API integration tests."""

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
from app.services.scheme_detail import describe_rule_expression

FIXTURE = Path(__file__).parent / "fixtures" / "minimal_seed.json"
SCHEME_ID = "50000000-0000-4000-8000-000000000001"


@pytest.fixture
def detail_client() -> Generator[TestClient]:
    engine = create_engine(
        "sqlite+pysqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(engine)
    factory = create_session_factory(engine)
    with factory.begin() as session:
        seed_database(session, load_seed_file(FIXTURE), allow_test_urls=True)
    settings = Settings(
        _env_file=None,
        APP_ENV="test",
        ALLOWED_ORIGINS="https://web.example.test",
        DATABASE_URL="sqlite+pysqlite://",
    )
    with TestClient(create_app(settings, database_engine=engine)) as client:
        yield client


def test_detail_returns_source_linked_rules_documents_and_steps(
    detail_client: TestClient,
) -> None:
    response = detail_client.get(f"/api/v1/schemes/{SCHEME_ID}")

    assert response.status_code == 200
    payload = response.json()
    source_id = payload["official_sources"][0]["id"]
    assert payload["scheme_version_id"] == "51000000-0000-4000-8000-000000000001"
    assert payload["eligibility_rules"][0]["source"]["id"] == source_id
    assert payload["required_documents"][0]["source"]["id"] == source_id
    assert payload["application_steps"][0]["source"]["id"] == source_id
    assert payload["eligibility_rules"][0]["explanation"] == "age must be at least 18."


def test_detail_missing_scheme_uses_error_contract(detail_client: TestClient) -> None:
    response = detail_client.get("/api/v1/schemes/50000000-0000-4000-8000-000000000099")

    assert response.status_code == 404
    assert response.json()["error"]["code"] == "NOT_FOUND"
    assert response.json()["error"]["message"] == "Scheme not found."


def test_detail_rejects_invalid_uuid(detail_client: TestClient) -> None:
    response = detail_client.get("/api/v1/schemes/not-a-uuid")

    assert response.status_code == 422
    assert response.json()["error"]["code"] == "VALIDATION_ERROR"


def test_rule_description_preserves_composition() -> None:
    expression = {
        "all": [
            {"field": "age", "op": "gte", "value": 18},
            {"not": {"field": "status", "op": "eq", "value": "excluded"}},
        ]
    }

    assert describe_rule_expression(expression) == (
        '(age must be at least 18.) and (not (status must equal "excluded".))'
    )
