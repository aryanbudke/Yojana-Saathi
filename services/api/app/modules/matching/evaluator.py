"""Evaluate backend-owned immutable rules; preserve existing outcomes and source IDs."""

from dataclasses import dataclass
from datetime import UTC, datetime

from app.db.enums import ReviewStatus, RuleSeverity, Verdict
from app.modules.matching.rules import (
    All,
    Check,
    Expression,
    canonical,
    combine,
    evaluate,
    parse_rule,
    source_ids,
)
from app.repositories.matching import CandidateScheme
from app.schemas.matching import RuleOutcome, RuleResult
from app.schemas.profile import ProfileFacts


@dataclass(frozen=True)
class Evaluation:
    verdict: Verdict
    outcomes: tuple[RuleOutcome, ...]
    missing_fields: tuple[str, ...]


def as_utc(value: datetime) -> datetime:
    return value.replace(tzinfo=UTC) if value.tzinfo is None else value.astimezone(UTC)


def evaluate_candidate(
    candidate: CandidateScheme, facts: ProfileFacts, *, now: datetime | None = None
) -> Evaluation:
    now = as_utc(now or datetime.now(UTC))
    current = (
        candidate.review_status == ReviewStatus.VERIFIED
        and as_utc(candidate.published_at) <= now
        and as_utc(candidate.verified_at) <= now
    )
    valid_sources = {source.id for source in candidate.sources}
    parsed: dict[str, Expression] = {}
    for rule in candidate.rules:
        try:
            parsed[rule.rule_key] = parse_rule(rule.expression)
        except ValueError:
            continue
    policy_valid = False
    try:
        raw = dict(candidate.eligibility_json)
        if raw.pop("schema_version", None) != "1.0":
            raise ValueError("Unsupported schema version")
        root = parse_rule(raw)
        required = [
            parsed[rule.rule_key]
            for rule in candidate.rules
            if rule.severity == RuleSeverity.REQUIRED
        ]
        policy_valid = (
            bool(required)
            and canonical(root) == canonical(All(all=required))
            and source_ids(root) <= valid_sources
        )
    except (ValueError, KeyError):
        pass  # Invalid/unmapped policy is exposed as manual review, never silently passed.
    outcomes = []
    missing: set[str] = set()
    for rule in candidate.rules:
        node = parsed.get(rule.rule_key)
        traceable = (
            rule.source_id in valid_sources
            and node is not None
            and source_ids(node) <= valid_sources
        )
        check = Check(RuleResult.MANUAL_REVIEW)
        if current and traceable and node is not None:
            if rule.severity == RuleSeverity.MANUAL_REVIEW:
                check = Check(RuleResult.MANUAL_REVIEW)
            elif policy_valid or rule.severity == RuleSeverity.EXCLUSION:
                check = evaluate(node, facts)
        result = check.result
        if rule.severity == RuleSeverity.EXCLUSION:
            result = {RuleResult.PASS: RuleResult.FAIL, RuleResult.FAIL: RuleResult.PASS}.get(
                result, result
            )
        missing.update(check.missing_fields)
        reason = {
            RuleResult.PASS: "Checked condition met",
            RuleResult.FAIL: "Applicable exclusion"
            if rule.severity == RuleSeverity.EXCLUSION
            else "Condition not met",
            RuleResult.UNKNOWN: "More information needed",
            RuleResult.MANUAL_REVIEW: "Manual verification required",
        }[result]
        detail = rule.rule_key.replace("_", " ")
        if check.missing_fields:
            detail += "; confirm " + ", ".join(
                field.replace("_", " ") for field in check.missing_fields
            )
        outcomes.append(
            RuleOutcome(
                rule_key=rule.rule_key,
                result=result,
                source_id=rule.source_id,
                reason=f"{reason}: {detail}.",
                required_field=check.missing_fields[0] if check.missing_fields else None,
            )
        )
    verdict = {
        RuleResult.PASS: Verdict.ALL_CHECKED_CONDITIONS_MET,
        RuleResult.FAIL: Verdict.NOT_ELIGIBLE,
        RuleResult.UNKNOWN: Verdict.NEEDS_INFORMATION,
        RuleResult.MANUAL_REVIEW: Verdict.MANUAL_REVIEW,
    }[combine("all", [RuleResult(outcome.result) for outcome in outcomes])]
    if not policy_valid and verdict == Verdict.ALL_CHECKED_CONDITIONS_MET:
        verdict = Verdict.MANUAL_REVIEW
    return Evaluation(verdict, tuple(outcomes), tuple(sorted(missing)))
