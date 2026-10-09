"""Verified application guidance routes."""

from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.api.dependencies import get_db_session
from app.schemas.guidance import GuidanceResponse
from app.services.guidance import (
    GuidanceSessionNotFoundError,
    GuidanceUnavailableError,
    get_guidance,
)

router = APIRouter(prefix="/api/v1/guidance", tags=["guidance"])


@router.get("/{scheme_id}", response_model=GuidanceResponse)
def scheme_guidance(
    scheme_id: UUID,
    session: Annotated[Session, Depends(get_db_session)],
    session_id: Annotated[UUID | None, Query()] = None,
) -> GuidanceResponse:
    """Return ordered, source-backed application readiness guidance."""

    try:
        guidance = get_guidance(session, scheme_id, session_id=session_id)
    except GuidanceSessionNotFoundError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except GuidanceUnavailableError as exc:
        raise HTTPException(status_code=409, detail=str(exc)) from exc
    if guidance is None:
        raise HTTPException(status_code=404, detail="Scheme not found.")
    return guidance
