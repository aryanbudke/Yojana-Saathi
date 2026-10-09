"""Proposed labels are regression cases, not independently reviewed accuracy."""

import hashlib
import json
import subprocess
import sys
from datetime import UTC, datetime, timedelta
from pathlib import Path

import pytest
from pydantic import ValidationError

from app.modules.matching.benchmark import (
    AS_OF,
    FIXTURE,
    Corpus,
    Persona,
    candidate,
    fraction,
    measure,
)
from app.modules.matching.evaluator import evaluate_candidate
from app.modules.matching.facts import ConfirmedFacts

CORPUS = Corpus.model_validate_json(FIXTURE.read_bytes())
REPORT = Path(__file__).parents[4] / "docs/ai/evaluation.json"


@pytest.mark.parametrize("persona", CORPUS.profiles, ids=lambda item: item.id)
def test_proposed_synthetic_regression_labels(persona: Persona) -> None:
    if persona.invalid:
        with pytest.raises(ValidationError):
            ConfirmedFacts.model_validate(persona.facts)
        return
    facts = ConfirmedFacts.model_validate(persona.facts)
    for policy in CORPUS.policies:
        evaluated = evaluate_candidate(candidate(policy, persona.policy_variant), facts, now=AS_OF)
        assert evaluated.verdict == persona.expected[policy.key]
        if policy.key in persona.expected_missing:
            assert set(evaluated.missing_fields) == set(persona.expected_missing[policy.key])


def test_report_is_reproducible_and_does_not_claim_accuracy() -> None:
    result = measure()
    assert result == json.loads(REPORT.read_text())
    assert result["independent_review"] is None and result["failures"] == []
    for metric in [
        "eligibility_classification_accuracy",
        "false_positive_rate",
        "missing_information_recall",
        "recommendation_precision_at3",
        "guidance_completeness",
    ]:
        assert result["metrics"][metric] is None
    assert 30 <= result["profiles"] <= 50
    assert fraction(0, 0)["value"] is None


@pytest.mark.parametrize("change", ["same_author", "wrong_hash", "future_date", "blank_reviewer"])
def test_review_manifest_must_be_independent_and_bound_to_fixture(
    tmp_path: Path, change: str
) -> None:
    review = {
        "reviewer": "TEST ONLY independent reviewer",
        "fixture_sha256": hashlib.sha256(FIXTURE.read_bytes()).hexdigest(),
        "reviewed_at": AS_OF.isoformat(),
        "scope": "classification,missing_fields,relevance",
    }
    if change == "same_author":
        review["reviewer"] = CORPUS.label_author.upper()
    elif change == "wrong_hash":
        review["fixture_sha256"] = "0" * 64
    elif change == "future_date":
        review["reviewed_at"] = (datetime.now(UTC) + timedelta(days=1)).isoformat()
    else:
        review["reviewer"] = " "
    file = tmp_path / "review.json"
    file.write_text(json.dumps(review))
    with pytest.raises(ValueError):
        measure(review_path=file)


def test_mock_review_unlocks_only_metrics_it_covers(tmp_path: Path) -> None:
    file = tmp_path / "TEST-ONLY-review.json"
    file.write_text(
        json.dumps(
            {
                "reviewer": "TEST ONLY independent reviewer",
                "fixture_sha256": hashlib.sha256(FIXTURE.read_bytes()).hexdigest(),
                "reviewed_at": AS_OF.isoformat(),
                "scope": "classification,missing_fields,relevance",
            }
        )
    )
    result = measure(review_path=file)
    assert result["metrics"]["eligibility_classification_accuracy"] is not None
    assert result["metrics"]["guidance_completeness"] is None
    assert result["provisional_unreviewed_label_comparison"] is None


def test_missing_labels_cannot_silently_shrink_denominators(tmp_path: Path) -> None:
    data = json.loads(FIXTURE.read_bytes())
    data["profiles"][0]["expected"].pop("farmer")
    file = tmp_path / "broken.json"
    file.write_text(json.dumps(data))
    with pytest.raises(ValidationError):
        measure(file)


def test_cli_reproduces_checked_in_report(tmp_path: Path) -> None:
    script = Path(__file__).parents[2] / "scripts/evaluate_matching.py"
    output = tmp_path / "report.json"
    subprocess.run([sys.executable, str(script), "--output", str(output)], check=True)
    assert json.loads(output.read_text()) == measure()


@pytest.mark.parametrize("mismatch", ["classification", "missing_field"])
def test_cli_reports_label_disagreement_and_exits_nonzero(tmp_path: Path, mismatch: str) -> None:
    data = json.loads(FIXTURE.read_bytes())
    if mismatch == "classification":
        data["profiles"][0]["expected"]["farmer"] = "not_eligible"
    else:
        data["profiles"][8]["expected_missing"]["farmer"] = ["age"]
    fixture = tmp_path / "mismatched.json"
    fixture.write_text(json.dumps(data))
    output = tmp_path / "measured.json"
    script = Path(__file__).parents[2] / "scripts/evaluate_matching.py"
    result = subprocess.run(
        [sys.executable, str(script), "--fixture", str(fixture), "--output", str(output)],
        check=False,
    )
    assert result.returncode == 1
    assert json.loads(output.read_text())["failures"]
