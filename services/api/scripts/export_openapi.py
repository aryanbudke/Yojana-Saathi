"""Export the deterministic FastAPI contract without starting a server."""

import json
from pathlib import Path

from sqlalchemy import create_engine

from app.core.config import Settings
from app.main import create_app


def main() -> None:
    output = Path(__file__).parents[1] / "openapi.json"
    settings = Settings(
        _env_file=None,
        APP_ENV="test",
        ALLOWED_ORIGINS="https://contract.example.test",
        DATABASE_URL="sqlite+pysqlite://",
    )
    engine = create_engine("sqlite+pysqlite://")
    try:
        schema = create_app(settings, database_engine=engine).openapi()
    finally:
        engine.dispose()
    output.write_text(json.dumps(schema, indent=2, sort_keys=True) + "\n", encoding="utf-8")


if __name__ == "__main__":
    main()
