"""Keep the checked-in integration contract synchronized with FastAPI."""

import json
from pathlib import Path

from sqlalchemy import create_engine

from app.core.config import Settings
from app.main import create_app

OPENAPI_ARTIFACT = Path(__file__).parents[1] / "openapi.json"


def test_openapi_artifact_matches_application_contract() -> None:
    settings = Settings(
        _env_file=None,
        APP_ENV="test",
        ALLOWED_ORIGINS="https://contract.example.test",
        DATABASE_URL="sqlite+pysqlite://",
    )
    engine = create_engine("sqlite+pysqlite://")
    try:
        generated = create_app(settings, database_engine=engine).openapi()
    finally:
        engine.dispose()

    assert json.loads(OPENAPI_ARTIFACT.read_text(encoding="utf-8")) == generated
