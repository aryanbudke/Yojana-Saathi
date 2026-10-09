"""Session-scoped guest bookmarks over the verified public catalogue."""

from datetime import UTC, datetime
from uuid import UUID

from sqlalchemy import delete, func, select
from sqlalchemy.orm import Session

from app.db.models import SavedScheme, Scheme
from app.repositories.schemes import (
    published_scheme_by_id_statement,
    published_schemes_statement,
    sources_for_versions,
)
from app.schemas.saved import SavedSchemeItem, SavedSchemesResponse
from app.services.profiles import require_active_session
from app.services.scheme_discovery import scheme_summary

MAX_SAVED_SCHEMES = 50


class SavableSchemeNotFoundError(LookupError):
    """Raised when a scheme is not available through the public boundary."""


class SavedSchemeLimitError(ValueError):
    """Raised when a guest session reaches its bounded shortlist size."""


def save_scheme(session: Session, *, session_id: UUID, scheme_id: UUID) -> SavedSchemesResponse:
    """Idempotently save one currently public scheme for an active session."""

    require_active_session(session, session_id)
    if session.execute(published_scheme_by_id_statement(scheme_id)).first() is None:
        raise SavableSchemeNotFoundError("Published scheme not found.")
    existing = session.get(SavedScheme, (session_id, scheme_id))
    if existing is None:
        count = session.scalar(
            select(func.count())
            .select_from(SavedScheme)
            .where(SavedScheme.session_id == session_id)
        )
        if int(count or 0) >= MAX_SAVED_SCHEMES:
            raise SavedSchemeLimitError(f"A session can save at most {MAX_SAVED_SCHEMES} schemes.")
        session.add(
            SavedScheme(
                session_id=session_id,
                scheme_id=scheme_id,
                saved_at=datetime.now(UTC),
            )
        )
        session.flush()
    return list_saved_schemes(session, session_id=session_id)


def list_saved_schemes(session: Session, *, session_id: UUID) -> SavedSchemesResponse:
    """List public summaries saved by exactly one active guest session."""

    require_active_session(session, session_id)
    saved_rows = list(
        session.scalars(
            select(SavedScheme)
            .where(SavedScheme.session_id == session_id)
            .order_by(SavedScheme.saved_at.desc(), SavedScheme.scheme_id)
        )
    )
    if not saved_rows:
        return SavedSchemesResponse(session_id=session_id, items=[])
    public_rows = list(
        session.execute(
            published_schemes_statement().where(
                Scheme.id.in_([saved.scheme_id for saved in saved_rows])
            )
        )
    )
    public_by_scheme = {row[0].id: (row[0], row[1]) for row in public_rows}
    version_ids = [row[1].id for row in public_rows]
    source_map = sources_for_versions(session, version_ids)
    items: list[SavedSchemeItem] = []
    for saved in saved_rows:
        public_row = public_by_scheme.get(saved.scheme_id)
        if public_row is None:
            continue
        scheme, version = public_row
        items.append(
            SavedSchemeItem(
                saved_at=saved.saved_at,
                scheme=scheme_summary(scheme, version, source_map[version.id]),
            )
        )
    return SavedSchemesResponse(session_id=session_id, items=items)


def unsave_scheme(session: Session, *, session_id: UUID, scheme_id: UUID) -> None:
    """Idempotently remove a guest bookmark without touching scheme data."""

    require_active_session(session, session_id)
    session.execute(
        delete(SavedScheme).where(
            SavedScheme.session_id == session_id,
            SavedScheme.scheme_id == scheme_id,
        )
    )
    session.flush()
