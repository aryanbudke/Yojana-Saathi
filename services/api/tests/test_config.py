"""Configuration validation tests."""

import pytest
from pydantic import ValidationError

from app.core.config import Settings


def test_origins_are_normalized_and_deduplicated() -> None:
    settings = Settings(
        _env_file=None,
        ALLOWED_ORIGINS="https://web.example.test/, http://localhost:3000,https://web.example.test",
    )

    assert settings.allowed_origins == ["https://web.example.test", "http://localhost:3000"]


@pytest.mark.parametrize(
    "origins",
    ["*", "", "web.example.test", "https://web.example.test/path"],
)
def test_invalid_origins_are_rejected(origins: str) -> None:
    with pytest.raises(ValidationError):
        Settings(_env_file=None, ALLOWED_ORIGINS=origins)


def test_session_ttl_is_bounded() -> None:
    with pytest.raises(ValidationError):
        Settings(_env_file=None, SESSION_TTL_HOURS=0)


def test_admin_token_requires_matching_actor_and_minimum_length() -> None:
    with pytest.raises(ValidationError):
        Settings(_env_file=None, ADMIN_REVIEW_TOKEN="short", ADMIN_REVIEWER_ID="reviewer")
    with pytest.raises(ValidationError, match="configured together"):
        Settings(_env_file=None, ADMIN_PUBLISH_TOKEN="x" * 32)
