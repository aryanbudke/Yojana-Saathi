"""Strict JSON contract for controlled test and curated seed bundles."""

from datetime import date, datetime
from uuid import UUID

from pydantic import Field, model_validator

from app.db.enums import GovernmentLevel, ReviewStatus, RuleSeverity, SchemeStatus
from app.schemas.common import ContractModel, HttpsUrl, StateCode


class SeedSource(ContractModel):
    id: UUID
    official_url: HttpsUrl
    title: str = Field(min_length=1, max_length=500)
    document_date: date | None = None
    checked_at: datetime
    excerpt_locator: str = Field(min_length=1, max_length=500)


class SeedRule(ContractModel):
    id: UUID
    rule_key: str = Field(min_length=1, max_length=160)
    expression: dict[str, object]
    severity: RuleSeverity
    source_id: UUID
    question_template: str | None = Field(default=None, max_length=500)


class SeedDocument(ContractModel):
    id: UUID
    name: str = Field(min_length=1, max_length=255)
    when_required: dict[str, object] | None = None
    source_id: UUID


class SeedStep(ContractModel):
    id: UUID
    step_number: int = Field(ge=1)
    instruction: str = Field(min_length=1)
    official_url: HttpsUrl | None = None
    source_id: UUID


class SeedScheme(ContractModel):
    id: UUID
    slug: str = Field(min_length=1, max_length=160)
    name: str = Field(min_length=1, max_length=255)
    government_level: GovernmentLevel
    state_code: StateCode | None = None
    category: str = Field(min_length=1, max_length=80)
    status: SchemeStatus
    version_id: UUID
    version: int = Field(ge=1)
    summary: str = Field(min_length=1)
    benefit_text: str = Field(min_length=1)
    eligibility_json: dict[str, object]
    verified_at: datetime
    reviewed_by: str = Field(min_length=1, max_length=255)
    review_status: ReviewStatus
    published_at: datetime
    sources: list[SeedSource] = Field(min_length=1)
    rules: list[SeedRule] = Field(min_length=1)
    documents: list[SeedDocument]
    steps: list[SeedStep]

    @model_validator(mode="after")
    def validate_publication_and_source_links(self) -> "SeedScheme":
        if self.review_status != ReviewStatus.VERIFIED:
            raise ValueError("published seed versions must be verified")
        source_ids = {source.id for source in self.sources}
        referenced_ids = {
            *(rule.source_id for rule in self.rules),
            *(document.source_id for document in self.documents),
            *(step.source_id for step in self.steps),
        }
        missing = referenced_ids - source_ids
        if missing:
            raise ValueError(f"seed records reference unknown source IDs: {sorted(missing)}")
        return self


class SeedBundle(ContractModel):
    schema_version: str = Field(pattern=r"^1\.0$")
    schemes: list[SeedScheme] = Field(min_length=1)
