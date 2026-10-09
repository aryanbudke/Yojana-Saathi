"""Role-restricted review and publication endpoints."""

from typing import Annotated, Literal
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.dependencies import get_db_session
from app.core.admin_auth import require_publisher, require_reviewer
from app.schemas.admin import CurationActionResponse
from app.services.curation import (
    CurationValidationError,
    InvalidReviewTransitionError,
    ProvenanceReport,
    PublishedVersionImmutableError,
    SchemeVersionNotFoundError,
    publish_scheme_version,
    review_scheme_version,
)

router = APIRouter(prefix="/api/v1/admin/scheme-versions", tags=["admin"])


@router.post("/{version_id}/review", response_model=CurationActionResponse)
def review_version(
    version_id: UUID,
    reviewer: Annotated[str, Depends(require_reviewer)],
    session: Annotated[Session, Depends(get_db_session)],
) -> CurationActionResponse:
    """Verify a complete draft using the configured reviewer identity."""

    try:
        report = review_scheme_version(session, version_id, reviewer=reviewer)
    except SchemeVersionNotFoundError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except (InvalidReviewTransitionError, PublishedVersionImmutableError) as exc:
        raise HTTPException(status_code=409, detail=str(exc)) from exc
    except CurationValidationError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    session.commit()
    return _response(version_id, "verify", report)


@router.post("/{version_id}/publish", response_model=CurationActionResponse)
def publish_version(
    version_id: UUID,
    publisher: Annotated[str, Depends(require_publisher)],
    session: Annotated[Session, Depends(get_db_session)],
) -> CurationActionResponse:
    """Publish a reviewed version using the separate publisher role."""

    try:
        report = publish_scheme_version(session, version_id, actor=publisher)
    except SchemeVersionNotFoundError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except (InvalidReviewTransitionError, PublishedVersionImmutableError) as exc:
        raise HTTPException(status_code=409, detail=str(exc)) from exc
    except CurationValidationError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    session.commit()
    return _response(version_id, "publish", report)


def _response(
    version_id: UUID,
    action: Literal["verify", "publish"],
    report: ProvenanceReport,
) -> CurationActionResponse:
    return CurationActionResponse(
        scheme_version_id=version_id,
        action=action,
        **report.__dict__,
    )
