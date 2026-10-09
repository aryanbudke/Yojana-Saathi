"""Profile extraction and confirmed-fact contracts."""

from typing import Literal
from uuid import UUID

from pydantic import Field, field_validator

from app.schemas.common import ContractModel, StateCode

FactValue = str | int | float | bool | None


class ProfileFacts(ContractModel):
    """Normalized facts; omitted citizen information remains null."""

    age: int | None = Field(default=None, ge=0, le=120)
    state_code: StateCode | None = None
    occupation: str | None = Field(default=None, min_length=1, max_length=120)
    family_income_inr: int | None = Field(default=None, ge=0, le=1_000_000_000)
    land_area_acres: float | None = Field(default=None, ge=0, le=1_000_000)
    land_registration: Literal["yes", "no", "not_sure"] | None = None
    category: str | None = Field(default=None, min_length=1, max_length=80)
    social_category: str | None = Field(default=None, min_length=1, max_length=80)
    gender: str | None = Field(default=None, min_length=1, max_length=40)
    has_disability: bool | None = None
    is_student: bool | None = None


class ProfileExtractRequest(ContractModel):
    text: str = Field(min_length=1, max_length=1000)
    locale: str = Field(default="en-IN", pattern=r"^[a-z]{2}(?:-[A-Z]{2})?$")

    @field_validator("text")
    @classmethod
    def reject_blank_text(cls, value: str) -> str:
        normalized = value.strip()
        if not normalized:
            raise ValueError("text must contain non-whitespace characters")
        return normalized


class ProfileExtractResponse(ContractModel):
    facts: ProfileFacts
    unknown_fields: list[str]
    needs_review: bool


class ProfileAnswerRequest(ContractModel):
    session_id: UUID
    field: str = Field(min_length=1, max_length=100)
    value: FactValue


class ProfileAnswerResponse(ContractModel):
    session_id: UUID
    facts: ProfileFacts
    requires_rematch: bool = True
