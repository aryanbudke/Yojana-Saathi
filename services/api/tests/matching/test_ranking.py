"""Ranking signals order candidates without claiming approval likelihood."""

from dataclasses import replace

from app.db.enums import GovernmentLevel
from app.modules.matching.evaluator import evaluate_candidate
from app.modules.matching.facts import ConfirmedFacts
from app.modules.matching.ranking import (
    in_geographic_scope,
    preliminary_relevance,
    verified_relevance,
)
from app.repositories.preliminary_schemes import PreliminaryScheme
from tests.matching.test_rules import NOW, candidate


def test_verified_ranking_uses_metadata_and_satisfied_reviewed_conditions() -> None:
    policy = replace(
        candidate(),
        scheme_name="Farmer Income Support",
        category="Agriculture",
        summary="Income support for farmers",
    )
    known = ConfirmedFacts(age=24, occupation="farmer", support_needs=["income"])
    unknown = ConfirmedFacts(occupation="farmer", support_needs=["income"])

    known_evaluation = evaluate_candidate(policy, known, now=NOW)
    unknown_evaluation = evaluate_candidate(policy, unknown, now=NOW)

    assert verified_relevance(policy, known, known_evaluation.outcomes) == 1.0
    assert verified_relevance(policy, unknown, unknown_evaluation.outcomes) < 1.0
    assert known_evaluation.verdict.value == "all_checked_conditions_met"


def test_geographic_mismatch_is_filtered_before_ranking() -> None:
    policy = replace(candidate(), state_code="KA", government_level=GovernmentLevel.STATE)

    assert in_geographic_scope(policy, ConfirmedFacts(state_code="KA"))
    assert in_geographic_scope(policy, ConfirmedFacts())
    assert not in_geographic_scope(policy, ConfirmedFacts(state_code="MH"))


def test_preliminary_ranking_uses_only_metadata_not_eligibility_prose() -> None:
    base = PreliminaryScheme(
        scheme_id=candidate().scheme_id,
        scheme_version_id=candidate().scheme_version_id,
        slug="draft",
        name="Education Scholarship",
        government_level=GovernmentLevel.CENTRAL,
        state_code=None,
        category="Education",
        summary="Support for students",
        benefit_text="Scholarship assistance",
        eligibility_text="Farmer farmer farmer",
        application_text="Apply locally",
        documents_text="Records",
        categories=("Education",),
        tags=("student", "scholarship"),
    )

    assert preliminary_relevance(base, ConfirmedFacts(support_needs=["education"])) == 1.0
    assert preliminary_relevance(base, ConfirmedFacts(occupation="farmer")) == 0.0
