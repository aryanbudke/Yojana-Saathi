"""Schemas shared by every API route."""

from typing import Any

from pydantic import BaseModel, ConfigDict, Field


class ErrorDetail(BaseModel):
    """Stable machine-readable API error detail."""

    model_config = ConfigDict(extra="forbid")

    code: str = Field(min_length=1, max_length=64)
    message: str = Field(min_length=1, max_length=500)
    request_id: str = Field(min_length=1, max_length=128)
    details: list[dict[str, Any]] | None = None


class ErrorResponse(BaseModel):
    """Canonical error response envelope."""

    model_config = ConfigDict(extra="forbid")

    error: ErrorDetail


class HealthResponse(BaseModel):
    """Liveness response that contains no secret or dependency details."""

    model_config = ConfigDict(extra="forbid")

    status: str = "ok"
    service: str
    version: str
    environment: str
