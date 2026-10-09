"""Render Blueprint deployment configuration tests."""

from pathlib import Path
from typing import Any, cast

import yaml


def test_render_blueprint_configures_production_api_safely() -> None:
    blueprint_path = Path(__file__).parents[3] / "render.yaml"
    blueprint = cast(dict[str, Any], yaml.safe_load(blueprint_path.read_text()))
    service = cast(dict[str, Any], blueprint["services"][0])

    assert service["type"] == "web"
    assert service["runtime"] == "python"
    assert service["rootDir"] == "services/api"
    assert service["branch"] == "main"
    assert service["healthCheckPath"] == "/health"
    assert service["startCommand"].startswith("alembic upgrade head && ")
    assert "--host 0.0.0.0 --port $PORT" in service["startCommand"]

    env_vars = {item["key"]: item for item in cast(list[dict[str, Any]], service["envVars"])}
    assert env_vars["APP_ENV"]["value"] == "production"
    assert env_vars["DATABASE_URL"]["sync"] is False
    assert env_vars["ALLOWED_ORIGINS"]["sync"] is False
    assert "value" not in env_vars["DATABASE_URL"]
    assert "value" not in env_vars["ALLOWED_ORIGINS"]
    assert env_vars["GEMINI_API_KEY"]["sync"] is False
    assert "value" not in env_vars["GEMINI_API_KEY"]
    assert env_vars["GEMINI_EMBEDDING_MODEL"]["value"] == "gemini-embedding-001"
