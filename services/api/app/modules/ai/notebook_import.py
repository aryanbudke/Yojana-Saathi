"""Import the notebook's cleaned JSON into a review artifact, never a published seed."""

import hashlib
from pathlib import Path

from pydantic import StrictStr, TypeAdapter, ValidationError

_RECORDS = TypeAdapter(list[dict[str, StrictStr | None]])
_REVIEW_FIELDS = (
    "details",
    "benefits",
    "eligibility",
    "application",
    "documents",
    "level",
    "schemeCategory",
    "official_url",
    "last_verified",
)


def stage_notebook_export(path: Path) -> dict[str, object]:
    raw = path.read_bytes()
    try:
        records = _RECORDS.validate_json(raw)
    except ValidationError:
        raise ValueError("Expected a JSON list of records with text or null field values") from None
    if not records:
        raise ValueError("The export contains no records")

    slugs: set[str] = set()
    staged: list[dict[str, object]] = []
    for number, record in enumerate(records, start=1):
        for field in ("scheme_name", "slug"):
            if not (record.get(field) or "").strip():
                raise ValueError(f"Record {number} needs a nonblank {field}")
        slug = (record["slug"] or "").strip().casefold()
        if slug in slugs:
            raise ValueError(f"Record {number} has a duplicate slug; resolve it before import")
        slugs.add(slug)
        staged.append(
            {
                "record": record,
                "review_status": "draft",
                "missing_fields": [
                    field for field in _REVIEW_FIELDS if not (record.get(field) or "").strip()
                ],
            }
        )

    return {
        "schema_version": "sarkarseva-staging-1.0",
        "input_sha256": hashlib.sha256(raw).hexdigest(),
        "publication_allowed": False,
        "publication_requirements": [
            "Independently reviewed official sources, dates and excerpt locators",
            "Reviewed typed eligibility rules, exclusions and question templates",
            "Source-linked application steps and document requirements",
            "Reviewed scheme status, geography and backend SeedBundle mapping",
        ],
        "records": staged,
    }
