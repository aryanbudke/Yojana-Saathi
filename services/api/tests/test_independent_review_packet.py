"""Guards for the independent-review handoff packet."""

import hashlib
import json
from pathlib import Path
from typing import Any, cast

CURATION_DIR = Path(__file__).parents[3] / "data" / "curation"


def _load(name: str) -> dict[str, Any]:
    return cast(
        dict[str, Any],
        json.loads((CURATION_DIR / name).read_text(encoding="utf-8")),
    )


def _sha256(name: str) -> str:
    return hashlib.sha256((CURATION_DIR / name).read_bytes()).hexdigest()


def test_review_packet_is_bound_to_exact_unpublished_artifacts() -> None:
    packet = _load("independent-review-packet-v1.json")
    artifacts = packet["bound_artifacts"]

    assert packet["status"] == "awaiting_independent_review"
    assert artifacts["source_audit_sha256"] == _sha256("source-audit-v1.json")
    assert artifacts["normalized_candidates_sha256"] == _sha256("normalized-candidates-v1.json")
    assert _load("normalized-candidates-v1.json")["publication_allowed"] is False


def test_review_packet_covers_every_candidate_and_requires_identity() -> None:
    packet = _load("independent-review-packet-v1.json")
    candidates = _load("normalized-candidates-v1.json")
    candidate_slugs = {scheme["draft_slug"] for scheme in candidates["schemes"]}
    review_slugs = {review["draft_slug"] for review in packet["scheme_reviews"]}

    assert review_slugs == candidate_slugs
    assert all(review["outcome"] == "awaiting_review" for review in packet["scheme_reviews"])
    assert packet["curator_identity"] not in {"", None}
    assert "reviewer_identity" in packet["required_receipt_fields"]
    assert "signature" in packet["required_receipt_fields"]
