"""Portable SQLAlchemy types with PostgreSQL-native storage variants."""

from enum import StrEnum

from sqlalchemy import JSON
from sqlalchemy.dialects.postgresql import JSONB

JSON_DOCUMENT = JSON().with_variant(JSONB(), "postgresql")


def enum_values(enum_class: type[StrEnum]) -> list[str]:
    """Persist public enum values instead of Python member names."""

    return [member.value for member in enum_class]
