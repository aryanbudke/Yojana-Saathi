"""Strict validation at AI/matching boundaries without changing shared wire fields."""

import re

from pydantic import ConfigDict, field_validator

from app.schemas.profile import ProfileFacts

STATE_CODES = frozenset(
    [
        "AN",
        "AP",
        "AR",
        "AS",
        "BR",
        "CH",
        "CG",
        "DN",
        "DL",
        "GA",
        "GJ",
        "HR",
        "HP",
        "JK",
        "JH",
        "KA",
        "KL",
        "LA",
        "LD",
        "MP",
        "MH",
        "MN",
        "ML",
        "MZ",
        "NL",
        "OD",
        "PY",
        "PB",
        "RJ",
        "SK",
        "TN",
        "TS",
        "TR",
        "UP",
        "UK",
        "WB",
    ]
)


def contains_sensitive_identifier(text: str) -> bool:
    return (
        re.search(
            r"(?<!\d)\d{4}[ -]?\d{4}[ -]?\d{4}(?!\d)|"
            r"\b(?:aadhaar|aadhar|bank\s+account|ifsc|pan\s+(?:card|number))\b|"
            r"\b[^\s@]+@[^\s@]+\.[^\s@]+\b|\b[6-9]\d{9}\b|\b[A-Z]{5}\d{4}[A-Z]\b",
            text,
            re.IGNORECASE,
        )
        is not None
    )


class ConfirmedFacts(ProfileFacts):
    model_config = ConfigDict(extra="forbid", strict=True, allow_inf_nan=False)

    @field_validator("state_code")
    @classmethod
    def known_state(cls, value: str | None) -> str | None:
        if value is not None and value not in STATE_CODES:
            raise ValueError("Use a recognized Indian state or union territory code")
        return value

    @field_validator("occupation", "category", "social_category", "gender")
    @classmethod
    def nonblank(cls, value: str | None) -> str | None:
        if value is not None and not value.strip():
            raise ValueError("Use non-whitespace text")
        if value is not None and contains_sensitive_identifier(value):
            raise ValueError("Direct identity and banking information is not a profile fact")
        return value
