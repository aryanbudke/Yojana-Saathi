"""Scheme queries that enforce public publication boundaries."""

from dataclasses import dataclass
from uuid import UUID

from sqlalchemy import Select, and_, exists, func, or_, select
from sqlalchemy.orm import Session

from app.db.enums import GovernmentLevel, ReviewStatus, SchemeStatus
from app.db.models import Scheme, SchemeVersion, Source


@dataclass(frozen=True)
class SchemeSearchFilters:
    query: str | None = None
    state_code: str | None = None
    category: str | None = None
    government_level: GovernmentLevel | None = None
    after_name: str | None = None
    after_id: UUID | None = None


def published_schemes_statement() -> Select[Scheme, SchemeVersion]:
    """Select each active scheme's latest verified, published version only."""

    latest_version = (
        select(
            SchemeVersion.scheme_id.label("scheme_id"),
            func.max(SchemeVersion.version).label("version"),
        )
        .where(
            SchemeVersion.review_status == ReviewStatus.VERIFIED,
            SchemeVersion.published_at.is_not(None),
        )
        .group_by(SchemeVersion.scheme_id)
        .subquery("latest_published_scheme_version")
    )

    return (
        select(Scheme, SchemeVersion)
        .join(SchemeVersion, SchemeVersion.scheme_id == Scheme.id)
        .join(
            latest_version,
            and_(
                latest_version.c.scheme_id == SchemeVersion.scheme_id,
                latest_version.c.version == SchemeVersion.version,
            ),
        )
        .where(Scheme.status == SchemeStatus.ACTIVE)
        .where(SchemeVersion.verified_at.is_not(None))
        .where(SchemeVersion.reviewed_by.is_not(None))
        .where(exists(select(Source.id).where(Source.scheme_version_id == SchemeVersion.id)))
    )


def search_published_schemes(
    session: Session,
    filters: SchemeSearchFilters,
    *,
    limit: int,
) -> list[tuple[Scheme, SchemeVersion]]:
    """Run bounded keyset-paginated discovery over public scheme versions."""

    statement = published_schemes_statement()
    if filters.query:
        escaped = _escape_like(filters.query.strip())
        pattern = f"%{escaped}%"
        statement = statement.where(
            or_(
                Scheme.name.ilike(pattern, escape="\\"),
                SchemeVersion.summary.ilike(pattern, escape="\\"),
            )
        )
    if filters.state_code:
        statement = statement.where(
            or_(Scheme.state_code.is_(None), Scheme.state_code == filters.state_code)
        )
    if filters.category:
        statement = statement.where(func.lower(Scheme.category) == filters.category.strip().lower())
    if filters.government_level:
        statement = statement.where(Scheme.government_level == filters.government_level)
    if filters.after_name is not None and filters.after_id is not None:
        lowered_name = func.lower(Scheme.name)
        statement = statement.where(
            or_(
                lowered_name > filters.after_name,
                and_(lowered_name == filters.after_name, Scheme.id > filters.after_id),
            )
        )

    statement = statement.order_by(func.lower(Scheme.name), Scheme.id).limit(limit)
    return [(row[0], row[1]) for row in session.execute(statement)]


def sources_for_versions(session: Session, version_ids: list[UUID]) -> dict[UUID, list[Source]]:
    """Load source records in one query and preserve deterministic ordering."""

    grouped: dict[UUID, list[Source]] = {version_id: [] for version_id in version_ids}
    if not version_ids:
        return grouped
    sources = session.scalars(
        select(Source)
        .where(Source.scheme_version_id.in_(version_ids))
        .order_by(Source.scheme_version_id, Source.title, Source.id)
    )
    for source in sources:
        grouped[source.scheme_version_id].append(source)
    return grouped


def _escape_like(value: str) -> str:
    return value.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_")
