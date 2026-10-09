"""Public scheme discovery orchestration and cursor handling."""

import base64
import json
from dataclasses import dataclass
from uuid import UUID

from sqlalchemy.orm import Session

from app.db.enums import GovernmentLevel
from app.db.models import Scheme, SchemeVersion, Source
from app.repositories.schemes import (
    SchemeSearchFilters,
    search_published_schemes,
    sources_for_versions,
)
from app.schemas.scheme import SchemeListResponse, SchemeSummary, SourceReference


class InvalidCursorError(ValueError):
    """Raised when a discovery cursor is malformed or unsupported."""


@dataclass(frozen=True)
class DiscoveryQuery:
    query: str | None = None
    state_code: str | None = None
    category: str | None = None
    government_level: GovernmentLevel | None = None
    cursor: str | None = None
    limit: int = 20


def discover_schemes(session: Session, query: DiscoveryQuery) -> SchemeListResponse:
    """Return a validated page of public, reviewed scheme summaries."""

    after_name, after_id = decode_cursor(query.cursor) if query.cursor else (None, None)
    rows = search_published_schemes(
        session,
        SchemeSearchFilters(
            query=query.query,
            state_code=query.state_code,
            category=query.category,
            government_level=query.government_level,
            after_name=after_name,
            after_id=after_id,
        ),
        limit=query.limit + 1,
    )
    has_next = len(rows) > query.limit
    page_rows = rows[: query.limit]
    source_map = sources_for_versions(session, [version.id for _, version in page_rows])
    items = [
        scheme_summary(scheme, version, source_map[version.id]) for scheme, version in page_rows
    ]
    next_cursor = None
    if has_next and page_rows:
        last_scheme = page_rows[-1][0]
        next_cursor = encode_cursor(last_scheme.name.casefold(), last_scheme.id)
    return SchemeListResponse(items=items, next_cursor=next_cursor)


def encode_cursor(name: str, scheme_id: UUID) -> str:
    payload = json.dumps(
        {"v": 1, "name": name, "id": str(scheme_id)},
        separators=(",", ":"),
        sort_keys=True,
    ).encode()
    return base64.urlsafe_b64encode(payload).decode().rstrip("=")


def decode_cursor(cursor: str) -> tuple[str, UUID]:
    try:
        padded = cursor + "=" * (-len(cursor) % 4)
        payload = json.loads(base64.urlsafe_b64decode(padded).decode())
        if set(payload) != {"v", "name", "id"} or payload["v"] != 1:
            raise InvalidCursorError("unsupported cursor payload")
        name = payload["name"]
        if not isinstance(name, str) or not name:
            raise InvalidCursorError("cursor name is invalid")
        return name, UUID(payload["id"])
    except (ValueError, TypeError, KeyError, json.JSONDecodeError) as exc:
        if isinstance(exc, InvalidCursorError):
            raise
        raise InvalidCursorError("cursor is invalid") from exc


def scheme_summary(scheme: Scheme, version: SchemeVersion, sources: list[Source]) -> SchemeSummary:
    if version.verified_at is None:
        raise RuntimeError("published scheme version is missing verified_at")
    return SchemeSummary(
        id=scheme.id,
        slug=scheme.slug,
        name=scheme.name,
        government_level=scheme.government_level,
        state_code=scheme.state_code,
        category=scheme.category,
        status=scheme.status,
        scheme_version_id=version.id,
        summary=version.summary,
        review_status=version.review_status,
        last_verified_at=version.verified_at,
        official_sources=[_to_source(source) for source in sources],
    )


def _to_source(source: Source) -> SourceReference:
    return SourceReference(
        id=source.id,
        title=source.title,
        official_url=source.official_url,
        checked_at=source.checked_at,
        document_date=source.document_date,
        excerpt_locator=source.excerpt_locator,
    )
