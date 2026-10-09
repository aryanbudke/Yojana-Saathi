"""Model output is tentative data, never a policy or verdict authority."""

from typing import Annotated
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, StrictStr

from app.modules.matching.facts import ConfirmedFacts


class Draft(BaseModel):
    model_config = ConfigDict(extra="forbid", strict=True)
    facts: ConfirmedFacts
    evidence: dict[str, Annotated[StrictStr, Field(min_length=1, max_length=1000)]] = Field(
        max_length=11
    )


def validate_extraction(raw: str, original: str) -> ConfirmedFacts:
    if len(raw) > 64000:
        raise ValueError("Oversized output")
    draft = Draft.model_validate_json(raw)
    supplied = {field for field, value in draft.facts.model_dump().items() if value is not None}
    if supplied != set(draft.evidence) or any(
        snippet not in original for snippet in draft.evidence.values()
    ):
        raise ValueError("Each stated fact needs an original verbatim evidence snippet")
    return draft.facts


class Claim(BaseModel):
    model_config = ConfigDict(extra="forbid")
    text: str = Field(min_length=1, max_length=500)
    rule_key: str = Field(min_length=1, max_length=160)
    source_id: UUID


class ExplanationDraft(BaseModel):
    model_config = ConfigDict(extra="forbid")
    why_relevant: list[Claim] = Field(max_length=64)
    must_verify: list[Claim] = Field(max_length=64)
    next_steps: list[Claim] = Field(max_length=64)
    source_ids: list[UUID] = Field(max_length=64)


def validate_explanation(raw: str, allowed: set[tuple[str, str, UUID]]) -> ExplanationDraft:
    draft = ExplanationDraft.model_validate_json(raw)
    claims = draft.why_relevant + draft.must_verify + draft.next_steps
    if any((claim.text, claim.rule_key, claim.source_id) not in allowed for claim in claims):
        raise ValueError("Unsupported rule, source, claim or URL")
    if set(draft.source_ids) != {claim.source_id for claim in claims}:
        raise ValueError("Citations must equal the referenced evidence")
    return draft
