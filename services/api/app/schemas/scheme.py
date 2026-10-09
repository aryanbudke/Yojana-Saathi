"""Scheme discovery and detail response contracts."""

from datetime import date, datetime
from uuid import UUID

from pydantic import Field

from app.db.enums import GovernmentLevel, ReviewStatus, RuleSeverity, SchemeStatus
from app.schemas.common import ContractModel, HttpsUrl, StateCode


class SourceReference(ContractModel):
    id: UUID
    title: str = Field(min_length=1, max_length=500)
    official_url: HttpsUrl
    checked_at: datetime
    document_date: date | None = None
    excerpt_locator: str = Field(min_length=1, max_length=500)


class SchemeSummary(ContractModel):
    id: UUID
    slug: str = Field(min_length=1, max_length=160)
    name: str = Field(min_length=1, max_length=255)
    government_level: GovernmentLevel
    state_code: StateCode | None = None
    category: str = Field(min_length=1, max_length=80)
    status: SchemeStatus
    scheme_version_id: UUID
    summary: str = Field(min_length=1)
    review_status: ReviewStatus
    last_verified_at: datetime
    official_sources: list[SourceReference] = Field(min_length=1)


class SchemeListResponse(ContractModel):
    items: list[SchemeSummary]
    next_cursor: str | None = Field(default=None, max_length=256)


class EligibilityRuleDetail(ContractModel):
    rule_key: str = Field(min_length=1, max_length=160)
    explanation: str = Field(min_length=1)
    severity: RuleSeverity
    source: SourceReference


class RequiredDocumentDetail(ContractModel):
    name: str = Field(min_length=1, max_length=255)
    when_required: dict[str, object] | None = None
    source: SourceReference


class ApplicationStepDetail(ContractModel):
    step_number: int = Field(ge=1)
    instruction: str = Field(min_length=1)
    official_url: HttpsUrl | None = None
    source: SourceReference


class SchemeDetailResponse(SchemeSummary):
    benefit_text: str = Field(min_length=1)
    eligibility_rules: list[EligibilityRuleDetail]
    required_documents: list[RequiredDocumentDetail]
    application_steps: list[ApplicationStepDetail]
