"""Developer 3 endpoints mounted into the existing application."""

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import ValidationError
from sqlalchemy.orm import Session

from app.api.dependencies import get_db_session
from app.core.admin_auth import require_reviewer
from app.modules.ai.gemini import (
    ExtractionLimited,
    ExtractionUnavailable,
    GeminiExtractor,
    get_extractor,
)
from app.modules.ai.settings import AISettings
from app.modules.ai.staging_search import EmbeddingUnavailable, embed, get_ai_settings, search
from app.modules.matching.facts import ConfirmedFacts
from app.modules.matching.service import match_profile
from app.modules.questions.service import next_question
from app.repositories.matching import MatchRunNotFoundError
from app.schemas.admin import StagingSearchResponse, StagingSearchResult
from app.schemas.matching import MatchesRequest, MatchesResponse
from app.schemas.profile import ProfileExtractRequest, ProfileExtractResponse
from app.schemas.question import NextQuestionRequest, NextQuestionResponse
from app.services.profiles import ProfileSessionNotFoundError

router = APIRouter(prefix="/api/v1")


class ConfirmedMatchRequest(MatchesRequest):
    facts: ConfirmedFacts


@router.post("/profiles/extract", response_model=ProfileExtractResponse, tags=["profiles"])
def extract(
    payload: ProfileExtractRequest, extractor: Annotated[GeminiExtractor, Depends(get_extractor)]
) -> ProfileExtractResponse:
    try:
        return extractor.extract(payload.text, payload.locale)
    except ExtractionLimited:
        raise HTTPException(
            status_code=429, detail="Extraction limit reached. Use manual entry."
        ) from None
    except ExtractionUnavailable:
        raise HTTPException(
            status_code=503,
            detail="Extraction unavailable. Enter or edit your "
            "profile manually; matching remains available.",
        ) from None


@router.post("/matches", response_model=MatchesResponse, tags=["matching"])
def matches(
    payload: ConfirmedMatchRequest, session: Annotated[Session, Depends(get_db_session)]
) -> MatchesResponse:
    try:
        response = match_profile(session, payload.session_id, payload.facts, payload.limit)
    except ProfileSessionNotFoundError:
        raise HTTPException(
            status_code=404, detail="Profile session not found or expired."
        ) from None
    except ValidationError:
        raise HTTPException(
            status_code=422, detail="Confirmed profile values need correction."
        ) from None
    session.commit()
    return response


@router.post("/questions/next", response_model=NextQuestionResponse, tags=["questions"])
def questions(
    payload: NextQuestionRequest, session: Annotated[Session, Depends(get_db_session)]
) -> NextQuestionResponse:
    try:
        return next_question(session, payload.session_id, payload.run_id)
    except (ProfileSessionNotFoundError, MatchRunNotFoundError):
        raise HTTPException(
            status_code=404, detail="Profile session or match run not found or expired."
        ) from None
    except ValidationError:
        raise HTTPException(
            status_code=422, detail="Confirmed profile values need correction."
        ) from None


@router.get("/admin/staging-schemes/search", response_model=StagingSearchResponse, tags=["admin"])
def search_staging_schemes(
    _: Annotated[str, Depends(require_reviewer)],
    session: Annotated[Session, Depends(get_db_session)],
    ai_settings: Annotated[AISettings, Depends(get_ai_settings)],
    q: Annotated[str, Query(min_length=2, max_length=500)],
    limit: Annotated[int, Query(ge=1, le=50)] = 10,
) -> StagingSearchResponse:
    """Find unverified notebook records worth curating. Never used for citizen matching."""

    try:
        [query_vector] = embed(ai_settings, [q.strip()], "RETRIEVAL_QUERY")
    except EmbeddingUnavailable:
        raise HTTPException(status_code=503, detail="Staging search is unavailable.") from None
    return StagingSearchResponse(
        results=[
            StagingSearchResult(
                slug=scheme.slug,
                name=scheme.name,
                similarity=round(similarity, 4),
                missing_fields=scheme.missing_fields,
                record=scheme.record,
            )
            for scheme, similarity in search(session, query_vector, limit)
        ]
    )
