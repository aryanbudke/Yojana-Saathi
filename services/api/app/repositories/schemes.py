"""Scheme queries that enforce public publication boundaries."""

from sqlalchemy import Select, and_, func, select

from app.db.enums import ReviewStatus, SchemeStatus
from app.db.models import Scheme, SchemeVersion


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
    )
