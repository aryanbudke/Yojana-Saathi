"""Synthetic control-flow checks for the local-only disposable reviewer demo."""

import importlib.util
import re
from pathlib import Path
from types import ModuleType
from unittest.mock import MagicMock, Mock

import pytest

from app.core.config import Settings
from app.modules.ai.staging_search import EmbeddingUnavailable


@pytest.fixture
def demo(monkeypatch: pytest.MonkeyPatch) -> ModuleType:
    path = Path(__file__).parents[2] / "scripts/serve_local_rag_demo.py"
    spec = importlib.util.spec_from_file_location("local_rag_demo_test", path)
    assert spec and spec.loader
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    settings = Settings(
        _env_file=None,
        APP_ENV="development",
        DATABASE_URL="sqlite+pysqlite://",
        ADMIN_REVIEW_TOKEN="synthetic-reviewer-token-at-least32",
        ADMIN_REVIEWER_ID="synthetic-reviewer",
    )
    monkeypatch.setattr(module, "Settings", lambda: settings)
    records = [
        {
            "record": {
                "slug": slug,
                "scheme_name": "SYNTHETIC ONLY",
                "verification_status": "unverified",
            }
        }
        for slug in module.DEMO_SLUGS
    ]
    monkeypatch.setattr(
        module, "stage_notebook_export", lambda path: {"records": records, "input_sha256": "1" * 64}
    )
    monkeypatch.setattr(
        module, "prepare_document_chunks", Mock(return_value=[[("SYNTHETIC", 1)]] * 8)
    )
    monkeypatch.setattr(module, "embed", Mock(return_value=[[1.0] + [0.0] * 767] * 8))
    monkeypatch.setattr(module, "pool_document_vectors", lambda chunks, vectors: vectors)
    monkeypatch.setattr(module, "create_database_engine", Mock(return_value=MagicMock()))
    monkeypatch.setattr(module.Base.metadata, "create_all", Mock())
    monkeypatch.setattr(module, "Session", MagicMock())
    monkeypatch.setattr(module, "replace_snapshot", Mock())
    monkeypatch.setattr(module, "create_app", Mock(return_value=Mock(dependency_overrides={})))
    monkeypatch.setattr(module.uvicorn, "run", Mock())
    return module


def test_local_demo_uses_normal_auth_and_drops_only_its_schema(demo: ModuleType) -> None:
    assert demo.main() == 0
    engine = demo.create_database_engine.return_value
    statements = [
        str(call.args[0])
        for call in engine.begin.return_value.__enter__.return_value.execute.call_args_list
    ]
    assert re.fullmatch(r'CREATE SCHEMA "rag_local_demo_[0-9a-f]{32}"', statements[0])
    assert statements[1] == statements[0].replace("CREATE", "DROP") + " CASCADE"
    snapshot = demo.replace_snapshot.call_args.args[1]
    assert len(snapshot["records"]) == 8
    assert all(
        item["record"]["verification_status"] == "unverified" for item in snapshot["records"]
    )
    assert (
        demo.create_app.call_args.kwargs["database_engine"] is engine.execution_options.return_value
    )
    assert demo.uvicorn.run.call_args.kwargs["host"] == "127.0.0.1"
    engine.dispose.assert_called_once()


@pytest.mark.parametrize("failure", ["configuration", "dataset", "embedding"])
def test_failed_preparation_never_opens_database(
    demo: ModuleType, monkeypatch: pytest.MonkeyPatch, failure: str
) -> None:
    if failure == "configuration":
        monkeypatch.setattr(
            demo,
            "Settings",
            lambda: Settings(
                _env_file=None, APP_ENV="production", DATABASE_URL="sqlite+pysqlite://"
            ),
        )
    elif failure == "dataset":
        monkeypatch.setattr(
            demo, "stage_notebook_export", Mock(side_effect=ValueError("SYNTHETIC bad input"))
        )
    else:
        demo.embed.side_effect = EmbeddingUnavailable("SYNTHETIC quota failure")
    assert demo.main() == 1
    demo.create_database_engine.assert_not_called()
    demo.uvicorn.run.assert_not_called()


def test_server_failure_still_cleans_owned_schema(demo: ModuleType) -> None:
    demo.uvicorn.run.side_effect = OSError("SYNTHETIC port unavailable")
    assert demo.main() == 1
    engine = demo.create_database_engine.return_value
    assert engine.begin.return_value.__enter__.return_value.execute.call_count == 2
    engine.dispose.assert_called_once()
