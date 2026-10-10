"""Email verification and scheme-decision API contracts."""

import re
from datetime import datetime
from enum import StrEnum
from uuid import UUID

from pydantic import Field, field_validator

from app.schemas.common import ContractModel

EMAIL_PATTERN = re.compile(r"^[^\s@]+@[^\s@]+\.[^\s@]+$")


class VerificationStartRequest(ContractModel):
    session_id: UUID
    scheme_id: UUID
    name: str = Field(min_length=1, max_length=120)
    email: str = Field(min_length=3, max_length=254)

    @field_validator("name")
    @classmethod
    def normalize_name(cls, value: str) -> str:
        normalized = " ".join(value.split())
        if not normalized or any(ord(character) < 32 for character in normalized):
            raise ValueError("name contains invalid characters")
        return normalized

    @field_validator("email")
    @classmethod
    def normalize_email(cls, value: str) -> str:
        normalized = value.strip().casefold()
        if not EMAIL_PATTERN.fullmatch(normalized):
            raise ValueError("enter a valid email address")
        return normalized


class VerificationStartResponse(ContractModel):
    verification_token: str = Field(min_length=40, max_length=4096)
    expires_at: datetime
    resend_after_seconds: int = Field(ge=1, le=300)


class VerificationConfirmRequest(ContractModel):
    verification_token: str = Field(min_length=40, max_length=4096)
    otp: str = Field(pattern=r"^\d{6}$")


class EligibilityStatus(StrEnum):
    ELIGIBLE = "eligible"
    NOT_ELIGIBLE = "not_eligible"
    NEEDS_REVIEW = "needs_review"


class NotificationStatus(StrEnum):
    SENT = "sent"
    ALREADY_SENT = "already_sent"
    FAILED_RETRYABLE = "failed_retryable"


class EligibilityDecisionResponse(ContractModel):
    status: EligibilityStatus
    scheme_id: UUID
    scheme_name: str
    reason: str
    next_steps: list[str]
    notification_status: NotificationStatus
    notification_retry_token: str | None = Field(default=None, max_length=8192)


class NotificationRetryRequest(ContractModel):
    notification_retry_token: str = Field(min_length=40, max_length=8192)
