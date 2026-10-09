"""Ephemeral anonymous profile sessions and fact precedence rules."""

from datetime import UTC, datetime, timedelta
from typing import Any
from uuid import UUID

from sqlalchemy import delete, select
from sqlalchemy.orm import Session

from app.db.enums import FactOrigin
from app.db.models import ProfileFact, ProfileSession
from app.schemas.profile import ProfileFacts, ProfileField


class ProfileSessionNotFoundError(LookupError):
    """Raised when a session is absent or no longer active."""


def create_profile_session(
    session: Session,
    *,
    ttl_hours: int,
    consent_version: str | None = None,
    now: datetime | None = None,
) -> ProfileSession:
    """Create an anonymous session containing no direct identity data."""

    created_at = _as_utc(now or datetime.now(UTC))
    profile_session = ProfileSession(
        created_at=created_at,
        expires_at=created_at + timedelta(hours=ttl_hours),
        consent_version=consent_version,
    )
    session.add(profile_session)
    session.flush()
    return profile_session


def update_confirmed_fact(
    session: Session,
    *,
    session_id: UUID,
    field: ProfileField,
    value: Any,
    now: datetime | None = None,
) -> ProfileFacts:
    """Validate and persist a user answer with precedence over extracted data."""

    _require_active_session(session, session_id, now=now)
    normalized = _validated_value(field, value)
    fact = session.get(ProfileFact, (session_id, field))
    if fact is None:
        fact = ProfileFact(
            session_id=session_id,
            field_name=field,
            value_json=normalized,
            origin=FactOrigin.USER,
        )
        session.add(fact)
    else:
        fact.value_json = normalized
        fact.origin = FactOrigin.USER
        fact.updated_at = _as_utc(now or datetime.now(UTC))
    session.flush()
    return get_profile_facts(session, session_id)


def store_extracted_facts(
    session: Session,
    *,
    session_id: UUID,
    facts: ProfileFacts,
    now: datetime | None = None,
) -> ProfileFacts:
    """Store model-extracted facts without replacing user-confirmed answers."""

    _require_active_session(session, session_id, now=now)
    for field, value in facts.model_dump(exclude_none=True).items():
        existing = session.get(ProfileFact, (session_id, field))
        if existing is not None and existing.origin == FactOrigin.USER:
            continue
        if existing is None:
            session.add(
                ProfileFact(
                    session_id=session_id,
                    field_name=field,
                    value_json=value,
                    origin=FactOrigin.MODEL_EXTRACTED,
                )
            )
        else:
            existing.value_json = value
            existing.origin = FactOrigin.MODEL_EXTRACTED
            existing.updated_at = _as_utc(now or datetime.now(UTC))
    session.flush()
    return get_profile_facts(session, session_id)


def get_profile_facts(session: Session, session_id: UUID) -> ProfileFacts:
    """Return the normalized minimal fact set for a session."""

    facts = session.scalars(
        select(ProfileFact)
        .where(ProfileFact.session_id == session_id)
        .order_by(ProfileFact.field_name)
    )
    return ProfileFacts.model_validate({fact.field_name: fact.value_json for fact in facts})


def delete_profile_session(
    session: Session, session_id: UUID, *, now: datetime | None = None
) -> None:
    """Delete an active anonymous session and its cascading transient data."""

    _require_active_session(session, session_id, now=now)
    session.execute(delete(ProfileSession).where(ProfileSession.id == session_id))
    session.flush()


def purge_expired_sessions(session: Session, *, now: datetime | None = None) -> int:
    """Delete expired sessions; dependent facts and runs cascade in PostgreSQL."""

    result = session.execute(
        delete(ProfileSession).where(ProfileSession.expires_at <= (now or datetime.now(UTC)))
    )
    return int(result.rowcount or 0)  # type: ignore[attr-defined]


def _require_active_session(
    session: Session, session_id: UUID, *, now: datetime | None = None
) -> ProfileSession:
    profile_session = session.get(ProfileSession, session_id)
    current_time = _as_utc(now or datetime.now(UTC))
    if profile_session is None or _as_utc(profile_session.expires_at) <= current_time:
        raise ProfileSessionNotFoundError("Profile session not found or expired.")
    return profile_session


def _validated_value(field: ProfileField, value: Any) -> Any:
    normalized = ProfileFacts.model_validate({field: value})
    return normalized.model_dump()[field]


def _as_utc(value: datetime) -> datetime:
    if value.tzinfo is None:
        return value.replace(tzinfo=UTC)
    return value.astimezone(UTC)
