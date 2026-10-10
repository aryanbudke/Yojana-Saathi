"""Direct SQL access to imported, unverified scheme records."""

from dataclasses import dataclass
from typing import Any
from uuid import UUID

from sqlalchemy import String, cast, or_, select
from sqlalchemy.orm import Session

from app.db.enums import GovernmentLevel, ReviewStatus
from app.db.models import Scheme, SchemeVersion


@dataclass(frozen=True)
class PreliminaryScheme:
    scheme_id: UUID
    scheme_version_id: UUID
    slug: str
    name: str
    government_level: GovernmentLevel
    state_code: str | None
    category: str
    summary: str
    benefit_text: str
    eligibility_text: str
    application_text: str
    documents_text: str
    categories: tuple[str, ...]
    tags: tuple[str, ...]


class PreliminarySchemeRepository:
    """Read candidate-import records without embeddings or semantic search."""

    def __init__(self, session: Session) -> None:
        self.session = session

    def list_candidates(
        self, *, search_terms: set[str] | None = None, limit: int = 5000
    ) -> list[PreliminaryScheme]:
        if not 1 <= limit <= 5000:
            raise ValueError("limit must be between 1 and 5000")
        eligibility_text = cast(SchemeVersion.eligibility_json, String)
        statement = (
            select(Scheme, SchemeVersion)
            .join(SchemeVersion, SchemeVersion.scheme_id == Scheme.id)
            .where(
                SchemeVersion.review_status == ReviewStatus.DRAFT,
                SchemeVersion.published_at.is_(None),
                SchemeVersion.verified_at.is_(None),
                eligibility_text.contains("candidate-import-v1"),
            )
            .order_by(Scheme.name, Scheme.id)
        )
        terms = sorted(
            {term.strip().casefold() for term in (search_terms or set()) if len(term.strip()) >= 2}
        )
        if terms:
            searchable = (
                Scheme.name,
                Scheme.category,
                SchemeVersion.summary,
                SchemeVersion.benefit_text,
                eligibility_text,
            )
            statement = statement.where(
                or_(
                    *(
                        cast(column, String).ilike(f"%{_escape_like(term)}%", escape="\\")
                        for term in terms
                        for column in searchable
                    )
                )
            )
        rows = self.session.execute(statement.limit(limit)).all()
        candidates: list[PreliminaryScheme] = []
        for scheme, version in rows:
            raw: dict[str, Any] = version.eligibility_json
            if raw.get("schema_version") != "candidate-import-v1" or not raw.get("unverified"):
                continue
            candidates.append(
                PreliminaryScheme(
                    scheme_id=scheme.id,
                    scheme_version_id=version.id,
                    slug=scheme.slug,
                    name=scheme.name,
                    government_level=scheme.government_level,
                    state_code=scheme.state_code,
                    category=scheme.category,
                    summary=version.summary,
                    benefit_text=version.benefit_text,
                    eligibility_text=str(raw.get("raw_eligibility_text", "")),
                    application_text=str(raw.get("raw_application_text", "")),
                    documents_text=str(raw.get("raw_documents_text", "")),
                    categories=tuple(str(value) for value in raw.get("raw_categories", [])),
                    tags=tuple(str(value) for value in raw.get("raw_tags", [])),
                )
            )
        return candidates


def _escape_like(value: str) -> str:
    return value.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_")
