"""Strict validation at AI/matching boundaries without changing shared wire fields."""

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
        return value
