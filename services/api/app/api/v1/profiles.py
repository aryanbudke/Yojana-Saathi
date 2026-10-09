"""Anonymous profile-session persistence routes."""

from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from pydantic import ValidationError
from sqlalchemy.orm import Session

from app.api.dependencies import get_db_session
from app.schemas.profile import (
    ProfileAnswerRequest,
    ProfileAnswerResponse,
    ProfileFacts,
    ProfileSessionCreateRequest,
    ProfileSessionResponse,
)
from app.services.profiles import (
    ProfileSessionNotFoundError,
    create_profile_session,
    delete_profile_session,
    update_confirmed_fact,
)

router = APIRouter(prefix="/api/v1/profiles", tags=["profiles"])


@router.post(
    "/sessions", response_model=ProfileSessionResponse, status_code=status.HTTP_201_CREATED
)
def create_session(
    payload: ProfileSessionCreateRequest,
    request: Request,
    session: Annotated[Session, Depends(get_db_session)],
) -> ProfileSessionResponse:
    """Create a short-lived anonymous profile session."""

    profile_session = create_profile_session(
        session,
        ttl_hours=request.app.state.settings.session_ttl_hours,
        consent_version=payload.consent_version,
    )
    session.commit()
    return ProfileSessionResponse(
        session_id=profile_session.id,
        expires_at=profile_session.expires_at,
        facts=ProfileFacts(),
    )


@router.post("/answers", response_model=ProfileAnswerResponse)
def answer_profile_question(
    payload: ProfileAnswerRequest,
    session: Annotated[Session, Depends(get_db_session)],
) -> ProfileAnswerResponse:
    """Persist one explicitly user-confirmed profile fact."""

    try:
        facts = update_confirmed_fact(
            session,
            session_id=payload.session_id,
            field=payload.field,
            value=payload.value,
        )
    except ProfileSessionNotFoundError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except ValidationError as exc:
        raise HTTPException(status_code=422, detail="Invalid value for profile field.") from exc
    session.commit()
    return ProfileAnswerResponse(session_id=payload.session_id, facts=facts)


@router.delete("/sessions/{session_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_session(
    session_id: UUID,
    session: Annotated[Session, Depends(get_db_session)],
) -> Response:
    """Allow a guest to delete transient profile data immediately."""

    try:
        delete_profile_session(session, session_id)
    except ProfileSessionNotFoundError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    session.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)
