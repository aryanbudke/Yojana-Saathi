"""Guest saved-scheme endpoints."""

from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy.orm import Session

from app.api.dependencies import get_db_session
from app.schemas.saved import SavedSchemesResponse, SaveSchemeRequest
from app.services.profiles import ProfileSessionNotFoundError
from app.services.saved_schemes import (
    SavableSchemeNotFoundError,
    SavedSchemeLimitError,
    list_saved_schemes,
    save_scheme,
    unsave_scheme,
)

router = APIRouter(prefix="/api/v1/saved", tags=["saved schemes"])


@router.post("", response_model=SavedSchemesResponse)
def save(
    payload: SaveSchemeRequest,
    session: Annotated[Session, Depends(get_db_session)],
) -> SavedSchemesResponse:
    try:
        response = save_scheme(session, session_id=payload.session_id, scheme_id=payload.scheme_id)
    except ProfileSessionNotFoundError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except SavableSchemeNotFoundError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except SavedSchemeLimitError as exc:
        raise HTTPException(status_code=409, detail=str(exc)) from exc
    session.commit()
    return response


@router.get("", response_model=SavedSchemesResponse)
def saved(
    session_id: Annotated[UUID, Query()],
    session: Annotated[Session, Depends(get_db_session)],
) -> SavedSchemesResponse:
    try:
        return list_saved_schemes(session, session_id=session_id)
    except ProfileSessionNotFoundError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


@router.delete("/{scheme_id}", status_code=status.HTTP_204_NO_CONTENT)
def unsave(
    scheme_id: UUID,
    session_id: Annotated[UUID, Query()],
    session: Annotated[Session, Depends(get_db_session)],
) -> Response:
    try:
        unsave_scheme(session, session_id=session_id, scheme_id=scheme_id)
    except ProfileSessionNotFoundError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    session.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)
