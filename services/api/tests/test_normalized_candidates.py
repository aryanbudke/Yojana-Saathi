"""Safety and provenance checks for normalized curation candidates."""

import json
from pathlib import Path
from typing import Any, cast

CURATION_DIR = Path(__file__).parents[3] / "data" / "curation"


def _load(name: str) -> dict[str, Any]:
    return cast(
        dict[str, Any],
        json.loads((CURATION_DIR / name).read_text(encoding="utf-8")),
    )


def test_normalized_candidates_are_draft_and_source_linked() -> None:
    candidates = _load("normalized-candidates-v1.json")
    audit = _load("source-audit-v1.json")
    audited_sources = {
        scheme["draft_slug"]: {source["url"] for source in scheme["sources"]}
        for scheme in audit["schemes"]
    }

    assert candidates["review_status"] == "draft"
    assert candidates["publication_allowed"] is False
    assert len(candidates["schemes"]) == 10

    for scheme in candidates["schemes"]:
        assert scheme["government_level"] == "central"
        assert scheme["state_code"] is None
        assert scheme["rules"]
        assert scheme["steps"]
        source_urls = audited_sources[scheme["draft_slug"]]
        for item_type in ("rules", "documents", "steps"):
            for item in scheme[item_type]:
                assert item["source_url"] in source_urls
        assert [step["step_number"] for step in scheme["steps"]] == list(
            range(1, len(scheme["steps"]) + 1)
        )


def test_ambiguous_policies_require_manual_review() -> None:
    candidates = _load("normalized-candidates-v1.json")
    by_slug = {scheme["draft_slug"]: scheme for scheme in candidates["schemes"]}

    for slug in ("pm-svanidhi", "ab-pmjay", "rkvyshfshc"):
        assert any(rule["severity"] == "manual_review" for rule in by_slug[slug]["rules"])


def test_income_values_use_explicit_annual_inr_units() -> None:
    candidates = _load("normalized-candidates-v1.json")

    income_expressions = []
    for scheme in candidates["schemes"]:
        for rule in scheme["rules"]:
            expression = rule["expression"]
            if expression.get("field", "").endswith("_income_inr_per_year"):
                income_expressions.append(expression)

    assert income_expressions
    assert all(expression["unit"] == "INR_PER_YEAR" for expression in income_expressions)
