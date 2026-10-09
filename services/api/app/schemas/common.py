"""Schemas shared by every API route."""

from typing import Annotated, Any

from pydantic import AnyUrl, BaseModel, ConfigDict, Field, StringConstraints, UrlConstraints

StateCode = Annotated[str, StringConstraints(pattern=r"^[A-Z]{2}$")]
HttpsUrl = Annotated[AnyUrl, UrlConstraints(allowed_schemes=["https"])]


class ContractModel(BaseModel):
    """Strict base for versioned public request and response contracts."""

    model_config = ConfigDict(extra="forbid", use_enum_values=True)


class ErrorDetail(ContractModel):
    """Stable machine-readable API error detail."""

    code: str = Field(min_length=1, max_length=64)
    message: str = Field(min_length=1, max_length=500)
    request_id: str = Field(min_length=1, max_length=128)
    details: list[dict[str, Any]] | None = None


class ErrorResponse(ContractModel):
    """Canonical error response envelope."""

    error: ErrorDetail


class HealthResponse(ContractModel):
    """Liveness response that contains no secret or dependency details."""

    status: str = "ok"
    service: str
    version: str
    environment: str
