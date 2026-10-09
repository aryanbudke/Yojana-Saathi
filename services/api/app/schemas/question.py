"""Dynamic follow-up question contracts."""

from typing import Literal
from uuid import UUID

from pydantic import Field, model_validator

from app.schemas.common import ContractModel


class NextQuestionRequest(ContractModel):
    session_id: UUID
    run_id: UUID


class NextQuestionResponse(ContractModel):
    field: str | None = Field(default=None, max_length=100)
    question: str | None = Field(default=None, max_length=500)
    answer_type: Literal["single_choice", "number", "text"] | None = None
    options: list[str] = Field(default_factory=list)
    reason: str | None = Field(default=None, max_length=500)

    @model_validator(mode="after")
    def ensure_complete_question(self) -> "NextQuestionResponse":
        values = (self.field, self.answer_type, self.reason)
        if self.question is None and any(value is not None for value in values):
            raise ValueError("question metadata must be null when no question is available")
        if self.question is None and self.options:
            raise ValueError("options must be empty when no question is available")
        if self.question is not None and any(value is None for value in values):
            raise ValueError("question metadata is required when a question is available")
        if self.answer_type == "single_choice" and not self.options:
            raise ValueError("single-choice questions require options")
        return self
