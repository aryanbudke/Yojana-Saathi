"""Liveness endpoint."""

from fastapi import APIRouter, Request

from app.schemas.common import HealthResponse

router = APIRouter(tags=["system"])


@router.get("/health", response_model=HealthResponse)
def health(request: Request) -> HealthResponse:
    """Report process liveness without leaking dependency or secret values."""

    settings = request.app.state.settings
    return HealthResponse(
        service=settings.app_name,
        version=settings.app_version,
        environment=settings.app_env,
    )
