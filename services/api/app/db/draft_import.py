"""Controlled import of unverified SarkarSeva records as private drafts."""

import csv
import io
import zipfile
from collections import Counter
from dataclasses import dataclass
from pathlib import Path
from uuid import NAMESPACE_URL, UUID, uuid5

from sqlalchemy import insert, select
from sqlalchemy.orm import Session

from app.db.enums import GovernmentLevel, ReviewStatus, SchemeStatus
from app.db.models import Scheme, SchemeVersion

DEFAULT_MEMBER = "sarkarseva_processed/schemes_clean.csv"
REQUIRED_COLUMNS = {
    "scheme_name",
    "slug",
    "details",
    "benefits",
    "eligibility",
    "application",
    "documents",
    "level",
    "schemeCategory",
    "tags",
    "official_url",
    "last_verified",
    "verification_status",
}


class DraftImportValidationError(ValueError):
    """Raised when candidate data is unsafe or malformed for draft import."""


@dataclass(frozen=True)
class DraftCandidate:
    scheme_id: UUID
    version_id: UUID
    slug: str
    name: str
    government_level: GovernmentLevel
    category: str
    summary: str
    benefit_text: str
    eligibility_json: dict[str, object]


@dataclass(frozen=True)
class DraftImportResult:
    parsed: int
    inserted: int
    skipped: int


def load_sarkarseva_drafts(
    archive_path: Path,
    *,
    member: str = DEFAULT_MEMBER,
    expected_count: int | None = None,
) -> list[DraftCandidate]:
    """Read cleaned candidate rows without extracting or trusting notebook code."""

    try:
        with zipfile.ZipFile(archive_path) as archive, archive.open(member) as raw_file:
            text_file = io.TextIOWrapper(raw_file, encoding="utf-8-sig", newline="")
            reader = csv.DictReader(text_file)
            columns = set(reader.fieldnames or ())
            missing_columns = REQUIRED_COLUMNS - columns
            if missing_columns:
                raise DraftImportValidationError(
                    f"candidate CSV is missing columns: {sorted(missing_columns)}"
                )
            candidates = [
                _candidate_from_row(row, row_number) for row_number, row in enumerate(reader, 2)
            ]
    except (KeyError, zipfile.BadZipFile) as exc:
        raise DraftImportValidationError(f"invalid candidate archive: {exc}") from exc

    if expected_count is not None and len(candidates) != expected_count:
        raise DraftImportValidationError(
            f"expected {expected_count} candidate rows, found {len(candidates)}"
        )
    slug_counts = Counter(candidate.slug for candidate in candidates)
    duplicate_slugs = sorted(slug for slug, count in slug_counts.items() if count > 1)
    if duplicate_slugs:
        raise DraftImportValidationError(f"duplicate candidate slugs: {duplicate_slugs[:10]}")
    return candidates


def import_draft_candidates(
    session: Session, candidates: list[DraftCandidate]
) -> DraftImportResult:
    """Insert only missing candidates as unpublished, unreviewed draft versions."""

    existing_slugs = set(session.scalars(select(Scheme.slug)))
    pending = [candidate for candidate in candidates if candidate.slug not in existing_slugs]
    if pending:
        session.execute(
            insert(Scheme),
            [
                {
                    "id": candidate.scheme_id,
                    "slug": candidate.slug,
                    "name": candidate.name,
                    "government_level": candidate.government_level,
                    "state_code": None,
                    "category": candidate.category,
                    "status": SchemeStatus.UNKNOWN,
                }
                for candidate in pending
            ],
        )
        session.execute(
            insert(SchemeVersion),
            [
                {
                    "id": candidate.version_id,
                    "scheme_id": candidate.scheme_id,
                    "version": 1,
                    "summary": candidate.summary,
                    "benefit_text": candidate.benefit_text,
                    "eligibility_json": candidate.eligibility_json,
                    "verified_at": None,
                    "reviewed_by": None,
                    "review_status": ReviewStatus.DRAFT,
                    "published_at": None,
                }
                for candidate in pending
            ],
        )
    session.flush()
    return DraftImportResult(
        parsed=len(candidates),
        inserted=len(pending),
        skipped=len(candidates) - len(pending),
    )


def _candidate_from_row(row: dict[str, str | None], row_number: int) -> DraftCandidate:
    def required(name: str) -> str:
        value = (row.get(name) or "").strip()
        if not value:
            raise DraftImportValidationError(f"row {row_number} has blank {name}")
        return value

    slug = required("slug")
    name = required("scheme_name")
    level = required("level").lower()
    if level not in {GovernmentLevel.CENTRAL.value, GovernmentLevel.STATE.value}:
        raise DraftImportValidationError(f"row {row_number} has invalid level: {level}")
    verification_status = required("verification_status").lower()
    if verification_status != "unverified":
        raise DraftImportValidationError(
            f"row {row_number} is not explicitly unverified: {verification_status}"
        )
    if (row.get("official_url") or "").strip() or (row.get("last_verified") or "").strip():
        raise DraftImportValidationError(
            f"row {row_number} contains review metadata; use the reviewed seed workflow"
        )

    categories = [value.strip() for value in required("schemeCategory").split(",") if value.strip()]
    tags = [value.strip() for value in (row.get("tags") or "").split(",") if value.strip()]
    scheme_id = uuid5(NAMESPACE_URL, f"yojana-saathi:draft:scheme:{slug}")
    return DraftCandidate(
        scheme_id=scheme_id,
        version_id=uuid5(scheme_id, "version:1"),
        slug=slug,
        name=name,
        government_level=GovernmentLevel(level),
        category=categories[0],
        summary=required("details"),
        benefit_text=required("benefits"),
        eligibility_json={
            "schema_version": "candidate-import-v1",
            "unverified": True,
            "source_dataset": "SarkarSeva_Project",
            "source_slug": slug,
            "raw_eligibility_text": required("eligibility"),
            "raw_application_text": (row.get("application") or "").strip(),
            "raw_documents_text": (row.get("documents") or "").strip(),
            "raw_categories": categories,
            "raw_tags": tags,
        },
    )
