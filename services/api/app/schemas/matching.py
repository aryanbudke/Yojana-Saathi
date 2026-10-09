"""Deterministic matching request and response contracts."""

from datetime import datetime
from enum import StrEnum
from uuid import UUID

from pydantic import Field

from app.db.enums import Verdict
from app.schemas.common import ContractModel, HttpsUrl
from app.schemas.profile import ProfileFacts


class RuleResult(StrEnum):
    PASS = "pass"
    FAIL = "fail"
    UNKNOWN = "unknown"
    MANUAL_REVIEW = "manual_review"


class MatchesRequest(ContractModel):
    session_id: UUID
    facts: ProfileFacts
    limit: int = Field(default=5, ge=1, le=20)


class RuleOutcome(ContractModel):
    rule_key: str = Field(min_length=1, max_length=160)
    result: RuleResult
    source_id: UUID
    reason: str = Field(min_length=1)
    required_field: str | None = Field(default=None, max_length=100)


class SchemeMatchResult(ContractModel):
    scheme_id: UUID
    scheme_name: str = Field(min_length=1, max_length=255)
    scheme_version_id: UUID
    status: Verdict
    relevance_score: float = Field(ge=0, le=1)
    matched_rules: list[RuleOutcome]
    failed_rules: list[RuleOutcome]
    unknown_rules: list[RuleOutcome]
    manual_review_rules: list[RuleOutcome] = Field(default_factory=list)
    last_verified_at: datetime
    official_source_urls: list[HttpsUrl] = Field(min_length=1)


class MatchesResponse(ContractModel):
    run_id: UUID
    results: list[SchemeMatchResult]
