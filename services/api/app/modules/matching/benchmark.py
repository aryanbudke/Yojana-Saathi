"""Synthetic label comparison; accuracy requires an independent review manifest."""

import hashlib
from collections import Counter
from datetime import UTC, datetime, timedelta
from pathlib import Path
from typing import Any, Literal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, ValidationError, model_validator

from app.db.enums import ReviewStatus, RuleSeverity, Verdict
from app.modules.matching.evaluator import as_utc, evaluate_candidate
from app.modules.matching.facts import ConfirmedFacts
from app.modules.matching.service import ranking_key, relevance
from app.repositories.matching import CandidateRule, CandidateScheme, CandidateSource

AS_OF = datetime(2026, 10, 9, tzinfo=UTC)
FIXTURE = Path(__file__).parents[3] / "tests/matching/fixtures/synthetic_profiles.json"


class Closed(BaseModel):
    model_config = ConfigDict(extra="forbid")


class Clause(Closed):
    key: str
    expression: dict[str, Any]


class Policy(Closed):
    key: str
    name: str
    scheme_id: UUID
    version_id: UUID
    source_id: UUID
    source_url: str
    required: list[Clause] = Field(min_length=1)
    exclusions: list[Clause]


class Persona(Closed):
    id: str
    description: str
    facts: dict[str, Any]
    policy_variant: Literal[
        "standard", "ambiguous_farmer", "stale_all", "bad_root_farmer", "future_farmer"
    ]
    expected: dict[str, Verdict]
    expected_missing: dict[str, list[str]]
    relevant: list[str]
    invalid: bool


class Corpus(Closed):
    schema_version: Literal["1.0"]
    synthetic_only: Literal[True]
    label_author: str = Field(min_length=1)
    independent_review: None
    warning: str
    policies: list[Policy] = Field(min_length=3)
    profiles: list[Persona] = Field(min_length=30, max_length=50)

    @model_validator(mode="after")
    def complete_labels(self) -> "Corpus":
        keys = {policy.key for policy in self.policies}
        if len(keys) != len(self.policies) or len({p.id for p in self.profiles}) != len(
            self.profiles
        ):
            raise ValueError("Policy keys and profile IDs must be unique")
        for persona in self.profiles:
            if set(persona.expected) != (set() if persona.invalid else keys):
                raise ValueError("Each valid profile must have all policy labels")
            if not set(persona.relevant) <= keys or not set(persona.expected_missing) <= keys:
                raise ValueError("Unknown policy references in labels")
        if any(
            not policy.source_url.startswith("https://policy.example.invalid/")
            for policy in self.policies
        ):
            raise ValueError("This corpus contains only reserved synthetic sources")
        return self


class Review(Closed):
    reviewer: str = Field(min_length=1)
    fixture_sha256: str = Field(pattern=r"^[a-f0-9]{64}$")
    reviewed_at: datetime
    scope: Literal["classification,missing_fields,relevance"]


def candidate(policy: Policy, variant: str) -> CandidateScheme:
    rows = [
        CandidateRule(clause.key, clause.expression, RuleSeverity.REQUIRED, policy.source_id, None)
        for clause in policy.required
    ]
    rows.extend(
        CandidateRule(clause.key, clause.expression, RuleSeverity.EXCLUSION, policy.source_id, None)
        for clause in policy.exclusions
    )
    root = {"schema_version": "1.0", "all": [clause.expression for clause in policy.required]}
    published_at = AS_OF - timedelta(days=1)
    if policy.key == "farmer":
        if variant == "ambiguous_farmer":
            rows.append(
                CandidateRule(
                    "ambiguous",
                    {"manual_review_required": True},
                    RuleSeverity.MANUAL_REVIEW,
                    policy.source_id,
                    None,
                )
            )
        elif variant == "bad_root_farmer":
            root = {
                "schema_version": "1.0",
                "all": [clause.expression for clause in policy.required]
                + [{"field": "is_student", "op": "eq", "value": True}],
            }
        elif variant == "future_farmer":
            published_at = AS_OF + timedelta(days=1)
    return CandidateScheme(
        policy.scheme_id,
        policy.name,
        policy.version_id,
        root,
        ReviewStatus.STALE if variant == "stale_all" else ReviewStatus.VERIFIED,
        published_at,
        AS_OF - timedelta(days=1),
        (CandidateSource(policy.source_id, policy.source_url, "SYNTHETIC ONLY"),),
        tuple(rows),
    )


def fraction(numerator: int, denominator: int) -> dict[str, int | float | None]:
    return {
        "numerator": numerator,
        "denominator": denominator,
        "value": numerator / denominator if denominator else None,
    }


def measure(fixture: Path = FIXTURE, *, review_path: Path | None = None) -> dict[str, Any]:
    raw = fixture.read_bytes()
    corpus = Corpus.model_validate_json(raw)
    digest = hashlib.sha256(raw).hexdigest()
    review = Review.model_validate_json(review_path.read_bytes()) if review_path else None
    if review and (
        review.fixture_sha256 != digest
        or not review.reviewer.strip()
        or review.reviewer.strip().casefold() == corpus.label_author.strip().casefold()
        or as_utc(review.reviewed_at) > datetime.now(UTC)
    ):
        raise ValueError("Review must be independent, date-valid and bound to this exact fixture")
    compared = correct = unsafe_pass = nonpass = unknown_found = unknown_expected = 0
    source_links = source_total = hits = slots = validations = validation_correct = 0
    confusion: Counter[tuple[str, str]] = Counter()
    failures: list[dict[str, Any]] = []
    for persona in corpus.profiles:
        try:
            facts = ConfirmedFacts.model_validate(persona.facts)
        except ValidationError:
            validations += 1
            validation_correct += int(persona.invalid)
            if not persona.invalid:
                failures.append({"profile": persona.id, "error": "unexpected validation failure"})
            continue
        if persona.invalid:
            validations += 1
            failures.append({"profile": persona.id, "error": "invalid profile accepted"})
            continue
        ranked = []
        for policy in corpus.policies:
            scheme = candidate(policy, persona.policy_variant)
            result = evaluate_candidate(scheme, facts, now=AS_OF)
            expected = persona.expected[policy.key]
            compared += 1
            correct += int(expected == result.verdict)
            confusion[(expected.value, result.verdict.value)] += 1
            nonpass += int(expected != Verdict.ALL_CHECKED_CONDITIONS_MET)
            unsafe_pass += int(
                expected != Verdict.ALL_CHECKED_CONDITIONS_MET
                and result.verdict == Verdict.ALL_CHECKED_CONDITIONS_MET
            )
            if result.verdict != expected:
                failures.append(
                    {
                        "profile": persona.id,
                        "policy": policy.key,
                        "expected": expected.value,
                        "actual": result.verdict.value,
                    }
                )
            required_missing = set(persona.expected_missing.get(policy.key, []))
            unknown_expected += len(required_missing)
            unknown_found += len(required_missing & set(result.missing_fields))
            if policy.key in persona.expected_missing and required_missing != set(
                result.missing_fields
            ):
                failures.append(
                    {
                        "profile": persona.id,
                        "policy": policy.key,
                        "error": "missing fields differ",
                        "expected": sorted(required_missing),
                        "actual": list(result.missing_fields),
                    }
                )
            valid_sources = {source.id for source in scheme.sources}
            for outcome in result.outcomes:
                source_total += 1
                source_links += int(outcome.source_id in valid_sources)
            ranked.append(
                (
                    ranking_key(result.verdict, relevance(scheme, facts), scheme.scheme_id),
                    policy.key,
                )
            )
        top3 = [key for _, key in sorted(ranked)[:3]]
        hits += len(set(top3) & set(persona.relevant))
        slots += 3
    provisional = {
        "classification_agreement": fraction(correct, compared),
        "false_positive_rate": fraction(unsafe_pass, nonpass),
        "missing_information_recall": fraction(unknown_found, unknown_expected),
        "precision_at3": fraction(hits, slots),
    }
    return {
        "schema_version": "1.0",
        "engine_version": "rules-1.0.0",
        "synthetic_only": True,
        "profiles": len(corpus.profiles),
        "comparisons": compared,
        "fixture_sha256": digest,
        "evaluated_as_of": AS_OF.isoformat(),
        "independent_review": review.model_dump(mode="json") if review else None,
        "metrics": {
            "eligibility_classification_accuracy": provisional["classification_agreement"]
            if review
            else None,
            "false_positive_rate": provisional["false_positive_rate"] if review else None,
            "missing_information_recall": provisional["missing_information_recall"]
            if review
            else None,
            "recommendation_precision_at3": provisional["precision_at3"] if review else None,
            "source_coverage": fraction(source_links, source_total),
            "guidance_completeness": None,
        },
        "provisional_unreviewed_label_comparison": provisional if review is None else None,
        "validation_checks": fraction(validation_correct, validations),
        "confusion_matrix": {
            f"{expected} -> {actual}": count
            for (expected, actual), count in sorted(confusion.items())
        },
        "failures": failures,
        "limitations": [
            "No independent label review recorded."
            if review is None
            else "Review manifest is supplied evidence, not an authenticated reviewer identity.",
            "All policies, profile facts and URLs are synthetic, not government policy.",
            "Source coverage measures UUID linkage, not official validity or interpretation.",
            "Precision@3 compares three slots with relevance labels; "
            "fewer relevant schemes lower the score.",
            "False positives mean a checked pass where the label is "
            "fail, unknown or manual review.",
            "Guidance completeness is unmeasured: no reviewed real guidance checklist.",
            "No live Gemini quality, PostgreSQL deployment, frontend or joint demo evidence.",
        ],
    }
