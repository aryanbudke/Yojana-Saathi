"""Responses for audited administrative state transitions."""

from typing import Literal
from uuid import UUID

from app.schemas.common import ContractModel


class CurationActionResponse(ContractModel):
    scheme_version_id: UUID
    action: Literal["verify", "publish"]
    source_count: int
    rule_count: int
    document_count: int
    step_count: int


class StagingSearchResult(ContractModel):
    slug: str
    name: str
    similarity: float
    review_status: Literal["draft"] = "draft"
    missing_fields: list[str]
    record: dict[str, str | None]


class StagingSearchResponse(ContractModel):
    """Unverified curation leads; publication_allowed is always false."""

    publication_allowed: Literal[False] = False
    results: list[StagingSearchResult]
