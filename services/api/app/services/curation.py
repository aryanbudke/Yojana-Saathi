"""Safety guards for append-only, source-backed scheme curation."""

from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.models import SchemeVersion


class SchemeVersionNotFoundError(LookupError):
    """Raised when a requested scheme version does not exist."""


class PublishedVersionImmutableError(ValueError):
    """Raised when code attempts to mutate an already published version."""


def ensure_version_is_mutable(session: Session, version_id: UUID) -> SchemeVersion:
    """Load an unpublished version or reject the attempted mutation."""

    version = session.scalar(select(SchemeVersion).where(SchemeVersion.id == version_id))
    if version is None:
        raise SchemeVersionNotFoundError(f"scheme version not found: {version_id}")
    if version.published_at is not None:
        raise PublishedVersionImmutableError(f"published scheme version is immutable: {version_id}")
    return version
