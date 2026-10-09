"""Reviewed, unanswered questions that can change a current deterministic verdict."""

from typing import Any
from uuid import UUID

from fastapi import HTTPException
from pydantic import ValidationError
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.enums import Verdict
from app.db.models import MatchResult, MatchRun
from app.modules.matching.evaluator import evaluate_candidate
from app.modules.matching.facts import STATE_CODES, ConfirmedFacts, contains_sensitive_identifier
from app.modules.matching.rules import All, Atom, Expression, Manual, Not, parse_rule
from app.modules.matching.service import confirmed_profile, profile_hash, relevance
from app.repositories.matching import CandidateScheme, MatchingRepository, MatchRunNotFoundError
from app.schemas.question import NextQuestionResponse
from app.services.profiles import require_active_session


def atoms(node: Expression) -> list[Atom]:
    if isinstance(node, Atom):
        return [node]
    if isinstance(node, Manual):
        return []
    if isinstance(node, Not):
        return atoms(node.child)
    children = node.all if isinstance(node, All) else node.any
    return [atom for child in children for atom in atoms(child)]


def can_change(candidate: CandidateScheme, facts: ConfirmedFacts, field: str) -> bool:
    original = evaluate_candidate(candidate, facts).verdict
    probes: list[Any] = []
    for rule in candidate.rules:
        for atom in atoms(parse_rule(rule.expression)):
            if atom.field != field:
                continue
            values = atom.value if isinstance(atom.value, list) else [atom.value]
            probes.extend(values)
            for value in values:
                if isinstance(value, bool):
                    probes.extend([True, False])
                elif isinstance(value, (int, float)):
                    probes.extend([value - 1, value + 1, 0])
                elif field == "land_registration":
                    probes.extend(["yes", "no"])
                elif field == "state_code":
                    probes.extend(sorted(STATE_CODES))
                else:
                    probes.append("other")
    for value in probes:
        try:
            changed = ConfirmedFacts.model_validate(facts.model_dump() | {field: value})
        except ValidationError:
            continue
        if evaluate_candidate(candidate, changed).verdict != original:
            return True
    return False


def next_question(session: Session, session_id: UUID, run_id: UUID) -> NextQuestionResponse:
    require_active_session(session, session_id)
    run = session.get(MatchRun, run_id)
    if run is None or run.session_id != session_id:
        raise MatchRunNotFoundError("Match run not found for profile session.")
    facts, answered = confirmed_profile(session, session_id)
    if run.profile_hash != profile_hash(facts):
        raise HTTPException(status_code=409, detail="Profile changed. Run matching again.")
    recorded = set(
        session.scalars(select(MatchResult.scheme_version_id).where(MatchResult.run_id == run_id))
    )
    available: dict[str, tuple[float, str]] = {}
    for candidate in MatchingRepository(session).list_candidates():
        if candidate.scheme_version_id not in recorded:
            continue
        evaluation = evaluate_candidate(candidate, facts)
        if evaluation.verdict != Verdict.NEEDS_INFORMATION:
            continue
        counted: set[str] = set()
        for rule in candidate.rules:
            if not rule.question_template or contains_sensitive_identifier(rule.question_template):
                continue
            fields = {atom.field for atom in atoms(parse_rule(rule.expression))}
            # A multi-field template needs a reviewed per-field mapping from the data owner.
            if len(fields) != 1:
                continue
            rule_field = next(iter(fields))
            if (
                rule_field in answered
                or rule_field in counted
                or rule_field not in evaluation.missing_fields
            ):
                continue
            if not can_change(candidate, facts, rule_field):
                continue
            counted.add(rule_field)
            impact = 1 + relevance(candidate, facts)
            previous = available.get(rule_field)
            available[rule_field] = (
                impact + (previous[0] if previous else 0),
                previous[1] if previous else rule.question_template,
            )
    if not available:
        return NextQuestionResponse()
    field = min(available, key=lambda key: (-available[key][0], key))
    question = available[field][1]
    if field in {"land_registration", "has_disability", "is_student"}:
        return NextQuestionResponse(
            field=field,
            question=question,
            answer_type="single_choice",
            options=["yes", "no", "not_sure"],
            reason="This reviewed condition can change your results. Choose Not sure "
            "if you do not know.",
        )
    numeric = field in {"age", "family_income_inr", "land_area_acres"}
    label = {
        "age": "your age in years",
        "family_income_inr": "your annual family income in rupees",
        "land_area_acres": "the land area in acres",
    }.get(field, field.replace("_", " "))
    return NextQuestionResponse(
        field=field,
        question=question,
        answer_type="number" if numeric else "text",
        options=["not_sure"],
        reason=f"Answer with {label}. This reviewed condition can change your results.",
    )
