"""Validated public speech contracts."""

from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator

SpeechLanguage = Literal["en-IN", "hi-IN", "kn-IN"]


class SpeechContract(BaseModel):
    model_config = ConfigDict(extra="forbid")


class TranscriptionResponse(SpeechContract):
    transcript: str = Field(min_length=1, max_length=4000)
    language_code: SpeechLanguage
    needs_review: bool = True


class SynthesisRequest(SpeechContract):
    text: str = Field(min_length=1, max_length=2000)
    source_language_code: SpeechLanguage = "en-IN"
    target_language_code: SpeechLanguage

    @field_validator("text")
    @classmethod
    def reject_blank_text(cls, value: str) -> str:
        normalized = value.strip()
        if not normalized:
            raise ValueError("text must contain non-whitespace characters")
        return normalized
