"""Independently specified truth tables and synthetic policy expectations."""

from datetime import UTC, datetime
from itertools import product
from typing import Any
from uuid import UUID

import pytest

from app.db.enums import ReviewStatus, RuleSeverity, Verdict
from app.modules.matching.evaluator import evaluate_candidate
from app.modules.matching.rules import combine, evaluate, parse_rule
from app.repositories.matching import CandidateRule, CandidateScheme, CandidateSource
from app.schemas.matching import RuleResult
from app.schemas.profile import ProfileFacts

SOURCE = UUID(int=1)
NOW = datetime(2026, 10, 9, tzinfo=UTC)
P, F, U, M = RuleResult
AND = [[P, F, U, M], [F, F, F, F], [U, F, U, M], [M, F, M, M]]
OR = [[P, P, P, P], [P, F, U, M], [P, U, U, M], [P, M, M, M]]


def atom(field: str = "age", op: str = "gte", value: Any = 18) -> dict[str, Any]:
    return {"field": field, "op": op, "value": value}


def candidate(rules: tuple[CandidateRule, ...] | None = None, **changes: Any) -> CandidateScheme:
    rules = rules or (
        CandidateRule("adult", atom(), RuleSeverity.REQUIRED, SOURCE, "What is your age?"),
    )
    values: dict[str, Any] = dict(
        scheme_id=UUID(int=2),
        scheme_name="SYNTHETIC TEST ONLY",
        scheme_version_id=UUID(int=3),
        review_status=ReviewStatus.VERIFIED,
        published_at=NOW,
        verified_at=NOW,
        eligibility_json={
            "schema_version": "1.0",
            "all": [r.expression for r in rules if r.severity == RuleSeverity.REQUIRED],
        },
        sources=(
            CandidateSource(SOURCE, "https://policy.example.invalid/source", "Synthetic source"),
        ),
        rules=rules,
    )
    return CandidateScheme(**(values | changes))


@pytest.mark.parametrize("left,right", list(product(range(4), repeat=2)))
def test_truth_tables(left: int, right: int) -> None:
    values = list(RuleResult)
    assert combine("all", [values[left], values[right]]) == AND[left][right]
    assert combine("any", [values[left], values[right]]) == OR[left][right]


@pytest.mark.parametrize(
    "op,age,expected",
    [
        ("eq", 18, P),
        ("eq", 19, F),
        ("lt", 18, F),
        ("lt", 17, P),
        ("lte", 18, P),
        ("gt", 18, F),
        ("gt", 19, P),
        ("gte", 18, P),
        ("gte", 17, F),
    ],
)
def test_boundaries(op: str, age: int, expected: RuleResult) -> None:
    assert evaluate(parse_rule(atom(op=op)), ProfileFacts(age=age)).result == expected


def test_zero_false_null_and_not_sure_are_distinct() -> None:
    income = parse_rule(atom("family_income_inr", "lte", 0))
    assert evaluate(income, ProfileFacts(family_income_inr=0)).result == P
    assert evaluate(income, ProfileFacts()).result == U
    own = parse_rule(atom("land_registration", "eq", "yes"))
    assert evaluate(own, ProfileFacts(land_registration="no")).result == F
    assert evaluate(own, ProfileFacts(land_registration="not_sure")).result == U
    assert (
        evaluate(
            parse_rule(atom("has_disability", "eq", False)), ProfileFacts(has_disability=False)
        ).result
        == P
    )


def test_nested_or_not_and_unused_unknown_branch() -> None:
    tree = parse_rule({"any": [atom(), {"not": atom("land_registration", "eq", "yes")}]})
    assert evaluate(tree, ProfileFacts(age=24)).result == P
    assert evaluate(tree, ProfileFacts(age=24)).missing_fields == ()
    assert evaluate(tree, ProfileFacts()).missing_fields == ("age", "land_registration")
    assert evaluate(parse_rule({"not": atom()}), ProfileFacts()).result == U
    manual = parse_rule({"manual_review_required": True})
    assert (
        evaluate(parse_rule({"not": {"manual_review_required": True}}), ProfileFacts()).result == M
    )
    assert evaluate(manual, ProfileFacts()).result == M


@pytest.mark.parametrize(
    "raw",
    [
        {},
        {"all": []},
        {"any": []},
        {"not": None},
        {"all": [atom()], "any": [atom()]},
        atom(op="between"),
        atom("aadhaar", "eq", "secret"),
        atom(value=True),
        atom(value=float("nan")),
        atom("occupation", "gt", "farmer"),
        atom(op="in", value=[]),
        atom(op="eq", value=[18]),
    ],
)
def test_invalid_ast_is_rejected(raw: dict[str, Any]) -> None:
    with pytest.raises(ValueError):
        parse_rule(raw)


def test_depth_and_size_limits() -> None:
    raw = atom()
    for _ in range(17):
        raw = {"not": raw}
    with pytest.raises(ValueError):
        parse_rule(raw)
    with pytest.raises(ValueError):
        parse_rule({"all": [atom() for _ in range(257)]})


def test_known_exclusion_overrides_unknown_and_manual() -> None:
    rules = (
        CandidateRule("adult", atom(), RuleSeverity.REQUIRED, SOURCE, "Age?"),
        CandidateRule(
            "excluded",
            atom("land_registration", "eq", "no"),
            RuleSeverity.EXCLUSION,
            SOURCE,
            "Registration?",
        ),
        CandidateRule(
            "ambiguous", {"manual_review_required": True}, RuleSeverity.MANUAL_REVIEW, SOURCE, None
        ),
    )
    result = evaluate_candidate(candidate(rules), ProfileFacts(land_registration="no"), now=NOW)
    assert result.verdict == Verdict.NOT_ELIGIBLE
    assert result.outcomes[1].result == F
    assert result.outcomes[0].required_field == "age"


@pytest.mark.parametrize(
    "changes",
    [
        {"review_status": ReviewStatus.STALE},
        {"sources": ()},
        {"eligibility_json": {"schema_version": "9.0", "all": [atom()]}},
    ],
)
def test_stale_missing_sources_and_unsupported_schema_need_review(changes: dict[str, Any]) -> None:
    assert (
        evaluate_candidate(candidate(**changes), ProfileFacts(age=24), now=NOW).verdict
        == Verdict.MANUAL_REVIEW
    )


def test_bogus_source_or_unmapped_policy_cannot_pass() -> None:
    bogus = CandidateRule("adult", atom(), RuleSeverity.REQUIRED, UUID(int=99), None)
    assert (
        evaluate_candidate(candidate((bogus,)), ProfileFacts(age=24), now=NOW).verdict
        == Verdict.MANUAL_REVIEW
    )
    root = {"schema_version": "1.0", "all": [atom(), atom("family_income_inr", "lt", 200000)]}
    assert (
        evaluate_candidate(candidate(eligibility_json=root), ProfileFacts(age=24), now=NOW).verdict
        == Verdict.MANUAL_REVIEW
    )


def test_multifield_missing_is_preserved_and_result_is_deterministic() -> None:
    rule = CandidateRule(
        "both",
        {"all": [atom(), atom("land_registration", "eq", "yes")]},
        RuleSeverity.REQUIRED,
        SOURCE,
        "What is your age?",
    )
    first = evaluate_candidate(candidate((rule,)), ProfileFacts(), now=NOW)
    assert first.missing_fields == ("age", "land_registration")
    assert first.outcomes[0].required_field == "age"
    assert first == evaluate_candidate(candidate((rule,)), ProfileFacts(), now=NOW)
