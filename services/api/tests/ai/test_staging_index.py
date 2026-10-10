"""Synthetic-only indexing tests; SQLite checks persistence, not pgvector search."""

import hashlib
import importlib.util
import json
import runpy
import sys
from collections.abc import Generator
from email.message import Message
from pathlib import Path
from types import ModuleType
from typing import Any
from unittest.mock import Mock
from urllib.error import HTTPError

import pytest
from pydantic import SecretStr
from sqlalchemy import Engine, Table, create_engine, event, select
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.db.models import StagingScheme
from app.modules.ai import staging_search
from app.modules.ai.notebook_import import stage_notebook_export
from app.modules.ai.settings import AISettings
from app.modules.ai.staging_search import EmbeddingUnavailable, replace_snapshot

DIMENSIONS = 768
VECTOR = [1.0] + [0.0] * (DIMENSIONS - 1)


@pytest.fixture
def export(tmp_path: Path) -> Path:
    path = tmp_path / "synthetic-schemes.json"
    path.write_text(
        json.dumps(
            [
                {
                    "slug": "synthetic-new",
                    "scheme_name": "SYNTHETIC TEST ONLY",
                    "eligibility": "",
                }
            ]
        )
    )
    return path


@pytest.fixture
def database(tmp_path: Path) -> Generator[Engine]:
    engine = create_engine(f"sqlite+pysqlite:///{tmp_path / 'synthetic.db'}")
    assert isinstance(StagingScheme.__table__, Table)
    StagingScheme.__table__.create(engine)
    with Session(engine) as session:
        session.add(
            StagingScheme(
                slug="synthetic-existing",
                name="SYNTHETIC OLD TEST ONLY",
                record={},
                missing_fields=[],
                input_sha256="0" * 64,
                embedding=VECTOR,
            )
        )
        session.commit()
    yield engine
    engine.dispose()


@pytest.fixture
def indexer(monkeypatch: pytest.MonkeyPatch) -> ModuleType:
    script = Path(__file__).parents[2] / "scripts/index_notebook_staging.py"
    spec = importlib.util.spec_from_file_location("index_notebook_staging_test", script)
    assert spec is not None and spec.loader is not None
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    monkeypatch.setattr(module, "validate_document_lengths", lambda *a: None)
    return module


def slugs(engine: Engine) -> list[str]:
    with Session(engine) as session:
        return list(session.scalars(select(StagingScheme.slug)))


@pytest.mark.parametrize(
    "vectors",
    [
        [],
        [[0.0] * DIMENSIONS],
        [[1.0]],
        [[float("nan")] * DIMENSIONS],
        [[1e100] * DIMENSIONS],
        [[1.0] + [0.0] * 383],
    ],
)
def test_invalid_vectors_fail_before_snapshot_delete(
    database: Engine, export: Path, vectors: list[list[float]]
) -> None:
    with Session(database) as session:
        with pytest.raises(ValueError):
            replace_snapshot(session, stage_notebook_export(export), vectors)
        session.commit()
    assert slugs(database) == ["synthetic-existing"]


def test_empty_snapshot_does_not_erase_records(database: Engine) -> None:
    with Session(database) as session:
        with pytest.raises(ValueError):
            replace_snapshot(session, {"records": [], "input_sha256": "1" * 64}, [])
        session.commit()
    assert slugs(database) == ["synthetic-existing"]


def test_cli_success_uses_existing_model_and_provenance(
    database: Engine,
    export: Path,
    indexer: ModuleType,
    monkeypatch: pytest.MonkeyPatch,
    capsys: pytest.CaptureFixture[str],
) -> None:
    embedded: list[tuple[list[str], str, int]] = []
    disposed: list[bool] = []

    def embed(settings: Any, texts: list[str], task: str, *, retries: int) -> list[list[float]]:
        embedded.append((texts, task, retries))
        return [VECTOR]

    monkeypatch.setattr(sys, "argv", ["index_notebook_staging.py", str(export)])
    monkeypatch.setattr(indexer, "embed", embed)
    monkeypatch.setattr(indexer, "create_database_engine", lambda: database)
    monkeypatch.setattr(database, "dispose", lambda: disposed.append(True))
    indexer.main()
    with Session(database) as session:
        row = session.scalars(select(StagingScheme)).one()
        assert row.slug == "synthetic-new"
        assert row.record["scheme_name"] == "SYNTHETIC TEST ONLY"
        assert "eligibility" in row.missing_fields
        assert row.input_sha256 == hashlib.sha256(export.read_bytes()).hexdigest()
    assert embedded[0][1:] == ("RETRIEVAL_DOCUMENT", 6)
    assert "scheme_name: SYNTHETIC TEST ONLY" in embedded[0][0][0]
    assert disposed == [True]
    assert "1 unverified draft" in capsys.readouterr().out


@pytest.mark.parametrize(
    "failure", ["invalid-export", "missing-export", "embedding", "config", "database", "engine"]
)
def test_cli_failure_preserves_existing_snapshot_and_redacts_errors(
    database: Engine,
    export: Path,
    indexer: ModuleType,
    monkeypatch: pytest.MonkeyPatch,
    capsys: pytest.CaptureFixture[str],
    failure: str,
) -> None:
    touched: list[str] = []

    def engine() -> Engine:
        touched.append("database")
        if failure == "engine":
            raise SQLAlchemyError("database://synthetic-secret-must-never-leak")
        return database

    def embed(*args: Any, **kwargs: Any) -> list[list[float]]:
        touched.append("embedding")
        if failure == "embedding":
            raise EmbeddingUnavailable("synthetic provider unavailable")
        return [VECTOR]

    if failure == "invalid-export":
        export.write_text("not JSON")
    elif failure == "missing-export":
        export.unlink()
    elif failure == "config":
        monkeypatch.setenv("GEMINI_EMBEDDING_MODEL", "invalid/synthetic-secret")
    elif failure == "database":

        def fail_insert(connection: Any, cursor: Any, statement: str, *args: Any) -> None:
            if statement.startswith("INSERT INTO staging_schemes"):
                raise SQLAlchemyError("database://synthetic-secret-must-never-leak")

        event.listen(database, "before_cursor_execute", fail_insert)

    monkeypatch.setattr(sys, "argv", ["index_notebook_staging.py", str(export)])
    monkeypatch.setattr(indexer, "embed", embed)
    monkeypatch.setattr(indexer, "create_database_engine", engine)
    with pytest.raises(SystemExit) as result:
        indexer.main()
    assert result.value.code == 2
    assert slugs(database) == ["synthetic-existing"]
    assert "synthetic-secret" not in capsys.readouterr().err
    if failure in {"invalid-export", "missing-export", "config"}:
        assert touched == []
    elif failure == "embedding":
        assert touched == ["embedding"]


def test_token_preflight_failure_prevents_embedding_and_database_writes(
    database: Engine,
    export: Path,
    indexer: ModuleType,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    preflight = Mock(side_effect=EmbeddingUnavailable("SYNTHETIC document exceeds token limit"))
    embedding, engine = Mock(), Mock(return_value=database)
    monkeypatch.setattr(sys, "argv", ["index_notebook_staging.py", str(export)])
    monkeypatch.setattr(indexer, "validate_document_lengths", preflight)
    monkeypatch.setattr(indexer, "embed", embedding)
    monkeypatch.setattr(indexer, "create_database_engine", engine)
    with pytest.raises(SystemExit) as result:
        indexer.main()
    assert result.value.code == 2
    preflight.assert_called_once()
    embedding.assert_not_called()
    engine.assert_not_called()
    assert slugs(database) == ["synthetic-existing"]


def test_provider_input_rejection_keeps_snapshot_without_opening_database(
    database: Engine,
    export: Path,
    indexer: ModuleType,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    config = AISettings(
        _env_file=None, api_key=SecretStr("synthetic-key"), embedding_model="test-embedding"
    )
    transport = Mock(
        side_effect=HTTPError("https://test.invalid", 400, "input limit", Message(), None)
    )
    engine = Mock(return_value=database)
    monkeypatch.setattr(sys, "argv", ["index_notebook_staging.py", str(export)])
    monkeypatch.setattr(indexer, "AISettings", lambda: config)
    monkeypatch.setattr(staging_search, "urlopen", transport)
    monkeypatch.setattr(indexer, "create_database_engine", engine)
    with pytest.raises(SystemExit) as result:
        indexer.main()
    assert result.value.code == 2
    transport.assert_called_once()
    engine.assert_not_called()
    assert slugs(database) == ["synthetic-existing"]


def test_cli_entrypoint_rejects_missing_file_without_external_calls(
    tmp_path: Path, monkeypatch: pytest.MonkeyPatch, capsys: pytest.CaptureFixture[str]
) -> None:
    script = Path(__file__).parents[2] / "scripts/index_notebook_staging.py"
    monkeypatch.setattr(sys, "argv", [str(script), str(tmp_path / "missing-synthetic.json")])
    with pytest.raises(SystemExit) as result:
        runpy.run_path(str(script), run_name="__main__")
    assert result.value.code == 2
    assert "error:" in capsys.readouterr().err
