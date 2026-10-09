"""Public scheme discovery routes."""

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.api.dependencies import get_db_session
from app.db.enums import GovernmentLevel
from app.schemas.common import StateCode
from app.schemas.scheme import SchemeListResponse
from app.services.scheme_discovery import (
    DiscoveryQuery,
    InvalidCursorError,
    discover_schemes,
)

router = APIRouter(prefix="/api/v1/schemes", tags=["schemes"])


@router.get("", response_model=SchemeListResponse)
def list_schemes(
    session: Annotated[Session, Depends(get_db_session)],
    q: Annotated[str | None, Query(min_length=1, max_length=200)] = None,
    state_code: Annotated[StateCode | None, Query()] = None,
    category: Annotated[str | None, Query(min_length=1, max_length=80)] = None,
    government_level: GovernmentLevel | None = None,
    cursor: Annotated[str | None, Query(min_length=1, max_length=256)] = None,
    limit: Annotated[int, Query(ge=1, le=20)] = 20,
) -> SchemeListResponse:
    """Search active schemes without exposing drafts or closed records."""

    try:
        return discover_schemes(
            session,
            DiscoveryQuery(
                query=q,
                state_code=state_code,
                category=category,
                government_level=government_level,
                cursor=cursor,
                limit=limit,
            ),
        )
    except InvalidCursorError as exc:
        raise HTTPException(status_code=422, detail="Invalid pagination cursor.") from exc
