"""Curator-only staging search: auth, outage fallback, embedding requests and pgvector ranking.

The pgvector test needs a real PostgreSQL with the vector extension; set
STAGING_SEARCH_PG_URL (e.g. postgresql+psycopg://...) to run it.
"""

import json
import os
from collections.abc import Generator
from io import BytesIO
from pathlib import Path
from typing import Any
from urllib.request import Request

import pytest
from fastapi.testclient import TestClient
from pydantic import SecretStr
from sqlalchemy import Engine, create_engine, text
from sqlalchemy.orm import Session

from app.core.config import Settings
from app.db.base import Base
from app.main import create_app
from app.modules.ai import staging_search
from app.modules.ai.notebook_import import stage_notebook_export
from app.modules.ai.settings import AISettings
from app.modules.ai.staging_search import get_ai_settings

REVIEW_TOKEN = "review-secret-with-at-least-32-characters"
DIMENSIONS = 768
SEARCH = "/api/v1/admin/staging-schemes/search"


def unit_vector(axis: int) -> list[float]:
    return [1.0 if index == axis else 0.0 for index in range(DIMENSIONS)]


def configured() -> AISettings:
    return AISettings(
        _env_file=None,
        api_key=SecretStr("synthetic-test-key"),
        embedding_model="test-embedding",
    )


def admin_settings(database_url: str) -> Settings:
    return Settings(
        _env_file=None,
        APP_ENV="test",
        ALLOWED_ORIGINS="https://admin.example.test",
        DATABASE_URL=database_url,
        ADMIN_REVIEW_TOKEN=REVIEW_TOKEN,
        ADMIN_REVIEWER_ID="reviewer-1",
    )


@pytest.fixture
def sqlite_client() -> Generator[TestClient]:
    engine = create_engine("sqlite+pysqlite://")
    app = create_app(admin_settings("sqlite+pysqlite://"), database_engine=engine)
    app.dependency_overrides[get_ai_settings] = lambda: AISettings(
        _env_file=None, api_key=None, model=None, embedding_model=None
    )
    with TestClient(app) as client:
        yield client


def test_search_requires_reviewer_token(sqlite_client: TestClient) -> None:
    response = sqlite_client.get(SEARCH, params={"q": "farmer"})

    assert response.status_code == 403


def test_search_without_embedding_config_is_unavailable(sqlite_client: TestClient) -> None:
    response = sqlite_client.get(
        SEARCH, params={"q": "farmer"}, headers={"X-Admin-Token": REVIEW_TOKEN}
    )

    assert response.status_code == 503


def test_embed_batches_requests_with_task_and_dimensions(monkeypatch: pytest.MonkeyPatch) -> None:
    calls: list[dict[str, Any]] = []

    def transport(request: Request, *, timeout: int) -> BytesIO:
        payload = json.loads(request.data)  # type: ignore[arg-type]
        calls.append(payload)
        count = len(payload["requests"])
        return BytesIO(json.dumps({"embeddings": [{"values": unit_vector(0)}] * count}).encode())

    monkeypatch.setattr(staging_search, "urlopen", transport)

    vectors = staging_search.embed(configured(), ["text"] * 250, "RETRIEVAL_DOCUMENT")

    assert len(vectors) == 250
    assert [len(call["requests"]) for call in calls] == [100, 100, 50]
    first = calls[0]["requests"][0]
    assert first["taskType"] == "RETRIEVAL_DOCUMENT"
    assert first["outputDimensionality"] == DIMENSIONS
    assert first["model"] == "models/test-embedding"


def test_embed_rejects_wrong_shape(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setattr(
        staging_search,
        "urlopen",
        lambda *a, **k: BytesIO(json.dumps({"embeddings": [{"values": [0.1, 0.2]}]}).encode()),
    )

    with pytest.raises(staging_search.EmbeddingUnavailable):
        staging_search.embed(configured(), ["text"], "RETRIEVAL_QUERY")


@pytest.fixture
def pgvector_engine() -> Generator[Engine]:
    url = os.environ.get("STAGING_SEARCH_PG_URL")
    if not url:
        pytest.skip("STAGING_SEARCH_PG_URL not set")
    # Isolated schema: never touches existing tables in the target database.
    with create_engine(url).begin() as connection:
        connection.execute(text("CREATE EXTENSION IF NOT EXISTS vector"))
        connection.execute(text("DROP SCHEMA IF EXISTS staging_search_test CASCADE"))
        connection.execute(text("CREATE SCHEMA staging_search_test"))
    engine = create_engine(
        url, connect_args={"options": "-csearch_path=staging_search_test,public"}
    )
    Base.metadata.create_all(engine)
    yield engine
    engine.dispose()
    with create_engine(url).begin() as connection:
        connection.execute(text("DROP SCHEMA staging_search_test CASCADE"))


def test_search_ranks_unverified_records_by_similarity(
    pgvector_engine: Engine, tmp_path: Path, monkeypatch: pytest.MonkeyPatch
) -> None:
    export = tmp_path / "schemes_clean.json"
    records = [
        {"scheme_name": "Synthetic Farm Aid", "slug": "synthetic-farm", "eligibility": "Farmer"},
        {"scheme_name": "Synthetic Scholarship", "slug": "synthetic-study", "eligibility": ""},
        {"scheme_name": "Synthetic Pension", "slug": "synthetic-pension", "eligibility": "Aged"},
    ]
    export.write_text(json.dumps(records), encoding="utf-8")
    with Session(pgvector_engine) as session:
        staging_search.replace_snapshot(
            session, stage_notebook_export(export), [unit_vector(i) for i in range(3)]
        )
        session.commit()
    near_scholarship = [0.0] * DIMENSIONS
    near_scholarship[1], near_scholarship[0] = 0.9, 0.1
    monkeypatch.setattr("app.modules.ai.routes.embed", lambda *a, **k: [near_scholarship])

    app = create_app(admin_settings(str(pgvector_engine.url)), database_engine=pgvector_engine)
    app.dependency_overrides[get_ai_settings] = configured
    with TestClient(app) as client:
        response = client.get(
            SEARCH,
            params={"q": "education support", "limit": 2},
            headers={"X-Admin-Token": REVIEW_TOKEN},
        )

    assert response.status_code == 200
    body = response.json()
    assert body["publication_allowed"] is False
    assert [result["slug"] for result in body["results"]] == [
        "synthetic-study",
        "synthetic-farm",
    ]
    top = body["results"][0]
    assert top["review_status"] == "draft"
    assert "eligibility" in top["missing_fields"]
    assert top["similarity"] > body["results"][1]["similarity"]
