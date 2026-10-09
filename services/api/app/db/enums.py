"""Stable persistence enums shared across database records and DTOs."""

from enum import StrEnum


class GovernmentLevel(StrEnum):
    CENTRAL = "central"
    STATE = "state"


class SchemeStatus(StrEnum):
    ACTIVE = "active"
    CLOSED = "closed"
    UNKNOWN = "unknown"


class ReviewStatus(StrEnum):
    DRAFT = "draft"
    VERIFIED = "verified"
    STALE = "stale"
    REJECTED = "rejected"


class RuleSeverity(StrEnum):
    REQUIRED = "required"
    EXCLUSION = "exclusion"
    MANUAL_REVIEW = "manual_review"


class FactOrigin(StrEnum):
    USER = "user"
    MODEL_EXTRACTED = "model_extracted"
    IMPORTED = "imported"


class Verdict(StrEnum):
    ALL_CHECKED_CONDITIONS_MET = "all_checked_conditions_met"
    NEEDS_INFORMATION = "needs_information"
    NOT_ELIGIBLE = "not_eligible"
    MANUAL_REVIEW = "manual_review"
