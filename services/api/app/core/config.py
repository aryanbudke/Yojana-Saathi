"""Validated runtime configuration loaded from environment variables."""

from functools import lru_cache
from typing import Literal
from urllib.parse import urlparse

from pydantic import Field, SecretStr, field_validator, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Runtime settings with secure defaults for local development."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
        case_sensitive=False,
    )

    app_name: str = "Yojana Saathi API"
    app_version: str = "0.1.0"
    app_env: Literal["development", "test", "staging", "production"] = "development"
    log_level: Literal["DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"] = "INFO"
    allowed_origins_csv: str = Field(
        default="http://localhost:3000",
        validation_alias="ALLOWED_ORIGINS",
    )
    session_ttl_hours: int = Field(default=24, ge=1, le=168)
    admin_review_token: SecretStr | None = Field(
        default=None, min_length=32, validation_alias="ADMIN_REVIEW_TOKEN"
    )
    admin_reviewer_id: str | None = Field(
        default=None, min_length=1, max_length=255, validation_alias="ADMIN_REVIEWER_ID"
    )
    admin_publish_token: SecretStr | None = Field(
        default=None, min_length=32, validation_alias="ADMIN_PUBLISH_TOKEN"
    )
    admin_publisher_id: str | None = Field(
        default=None, min_length=1, max_length=255, validation_alias="ADMIN_PUBLISHER_ID"
    )
    database_url: str = Field(
        default="postgresql+psycopg://postgres:postgres@localhost:5432/yojana_saathi",
        min_length=1,
        validation_alias="DATABASE_URL",
    )

    @field_validator("allowed_origins_csv")
    @classmethod
    def validate_allowed_origins(cls, value: str) -> str:
        origins = [origin.strip().rstrip("/") for origin in value.split(",") if origin.strip()]
        if not origins:
            raise ValueError("ALLOWED_ORIGINS must contain at least one origin")
        if "*" in origins:
            raise ValueError("Wildcard CORS origins are not allowed")
        for origin in origins:
            parsed = urlparse(origin)
            if parsed.scheme not in {"http", "https"} or not parsed.netloc:
                raise ValueError(f"Invalid CORS origin: {origin}")
            if parsed.path not in {"", "/"} or parsed.params or parsed.query or parsed.fragment:
                raise ValueError(f"CORS origin must not contain a path or query: {origin}")
        return ",".join(dict.fromkeys(origins))

    @property
    def allowed_origins(self) -> list[str]:
        """Return normalized, de-duplicated CORS origins."""

        return self.allowed_origins_csv.split(",")

    @model_validator(mode="after")
    def validate_admin_role_pairs(self) -> "Settings":
        pairs = (
            (self.admin_review_token, self.admin_reviewer_id, "review"),
            (self.admin_publish_token, self.admin_publisher_id, "publish"),
        )
        for token, actor, role in pairs:
            if (token is None) != (actor is None):
                raise ValueError(f"admin {role} token and actor ID must be configured together")
        return self


@lru_cache
def get_settings() -> Settings:
    """Return the process-wide validated settings instance."""

    return Settings()
