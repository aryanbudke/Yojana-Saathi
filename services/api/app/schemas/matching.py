"""Deterministic matching request and response contracts."""

from datetime import datetime
from enum import StrEnum
from typing import Literal
from uuid import UUID

from pydantic import Field, model_validator

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
    last_verified_at: datetime | None
    official_source_urls: list[HttpsUrl] = Field(default_factory=list)
    verification_status: Literal["verified", "preliminary"] = "verified"
    matching_reasons: list[str] = Field(default_factory=list)
    missing_information: list[str] = Field(default_factory=list)
    benefit_text: str | None = None
    documents_text: str | None = None
    application_text: str | None = None

    @model_validator(mode="after")
    def enforce_verification_boundary(self) -> "SchemeMatchResult":
        if self.verification_status == "verified" and (
            self.last_verified_at is None or not self.official_source_urls
        ):
            raise ValueError("Verified matches require a date and official source")
        if self.verification_status == "preliminary" and (
            self.last_verified_at is not None or self.official_source_urls
        ):
            raise ValueError("Preliminary matches cannot claim verification metadata")
        return self


class MatchesResponse(ContractModel):
    run_id: UUID
    results: list[SchemeMatchResult]
