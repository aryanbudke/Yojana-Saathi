"""Application guidance response contracts."""

from enum import StrEnum
from uuid import UUID

from pydantic import Field

from app.schemas.common import ContractModel, HttpsUrl
from app.schemas.scheme import SourceReference


class DocumentReadiness(StrEnum):
    PRESENT = "present"
    MISSING = "missing"
    UNKNOWN = "unknown"
    MAY_BE_REQUIRED = "may_be_required"


class GuidanceDocument(ContractModel):
    name: str = Field(min_length=1, max_length=255)
    status: DocumentReadiness
    note: str | None = None
    source_id: UUID


class GuidanceStep(ContractModel):
    step_number: int = Field(ge=1)
    instruction: str = Field(min_length=1)
    official_url: HttpsUrl | None = None
    source_id: UUID


class GuidanceResponse(ContractModel):
    scheme_id: UUID
    scheme_version_id: UUID
    scheme_name: str = Field(min_length=1, max_length=255)
    documents: list[GuidanceDocument]
    steps: list[GuidanceStep]
    official_application_url: HttpsUrl
    unresolved_preconditions: list[str]
    sources: list[SourceReference] = Field(min_length=1)
    disclaimer: str = Field(min_length=1)
