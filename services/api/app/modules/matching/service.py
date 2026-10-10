"""Match confirmed facts through the backend's publication and audit repositories."""

import hashlib
import json
from typing import cast
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.enums import FactOrigin, Verdict
from app.db.models import ProfileFact
from app.modules.explanations.service import explain
from app.modules.matching.evaluator import evaluate_candidate
from app.modules.matching.facts import ConfirmedFacts
from app.modules.matching.preliminary import normalize_eligibility_text
from app.modules.matching.ranking import (
    in_geographic_scope,
    preliminary_matching_terms,
    preliminary_relevance,
    profile_terms,
    verified_relevance,
)
from app.repositories.matching import CandidateScheme, MatchingRepository, MatchResultWrite
from app.repositories.preliminary_schemes import PreliminarySchemeRepository
from app.schemas.matching import MatchesResponse, RuleResult, SchemeMatchResult
from app.schemas.profile import ProfileField
from app.services.profiles import require_active_session, update_confirmed_fact

ENGINE_VERSION = "direct-rules-2.0.0"


def ranking_key(verdict: Verdict, score: float, scheme_id: UUID) -> tuple[int, float, str]:
    order = {
        Verdict.ALL_CHECKED_CONDITIONS_MET: 0,
        Verdict.NEEDS_INFORMATION: 1,
        Verdict.MANUAL_REVIEW: 2,
        Verdict.NOT_ELIGIBLE: 3,
    }
    return order[verdict], -score, str(scheme_id)


def confirmed_profile(session: Session, session_id: UUID) -> tuple[ConfirmedFacts, set[str]]:
    rows = session.scalars(
        select(ProfileFact).where(
            ProfileFact.session_id == session_id, ProfileFact.origin == FactOrigin.USER
        )
    ).all()
    return ConfirmedFacts.model_validate({row.field_name: row.value_json for row in rows}), {
        row.field_name for row in rows
    }


def profile_hash(facts: ConfirmedFacts) -> str:
    return hashlib.sha256(
        json.dumps(facts.model_dump(), sort_keys=True, separators=(",", ":")).encode()
    ).hexdigest()


def relevance(candidate: CandidateScheme, facts: ConfirmedFacts) -> float:
    """Backward-compatible metadata-only relevance helper."""

    return verified_relevance(candidate, facts)


def match_profile(
    session: Session, session_id: UUID, updates: ConfirmedFacts, limit: int
) -> MatchesResponse:
    require_active_session(session, session_id)
    answered = set(
        session.scalars(
            select(ProfileFact.field_name).where(
                ProfileFact.session_id == session_id, ProfileFact.origin == FactOrigin.USER
            )
        )
    )
    for field in sorted(updates.model_fields_set):
        # Null draft fields are absent information, not a deliberate "not sure" answer.
        if getattr(updates, field) is None and field not in answered:
            continue
        update_confirmed_fact(
            session,
            session_id=session_id,
            field=cast(ProfileField, field),
            value=getattr(updates, field),
        )
    facts, _ = confirmed_profile(session, session_id)
    repository = MatchingRepository(session)
    writes = []
    results = []
    for candidate in repository.list_candidates():
        if not in_geographic_scope(candidate, facts):
            continue
        evaluation = explain(candidate, evaluate_candidate(candidate, facts))
        if evaluation.verdict == Verdict.NOT_ELIGIBLE:
            continue
        score = verified_relevance(candidate, facts, evaluation.outcomes)
        writes.append(
            MatchResultWrite(
                candidate.scheme_version_id,
                evaluation.verdict,
                score,
                evaluation.outcomes,
                evaluation.missing_fields,
            )
        )
        groups = {
            kind: [outcome for outcome in evaluation.outcomes if outcome.result == kind]
            for kind in RuleResult
        }
        results.append(
            SchemeMatchResult(
                scheme_id=candidate.scheme_id,
                scheme_name=candidate.scheme_name,
                scheme_version_id=candidate.scheme_version_id,
                status=evaluation.verdict,
                relevance_score=score,
                matched_rules=groups[RuleResult.PASS],
                failed_rules=groups[RuleResult.FAIL],
                unknown_rules=groups[RuleResult.UNKNOWN],
                manual_review_rules=groups[RuleResult.MANUAL_REVIEW],
                last_verified_at=candidate.verified_at,
                official_source_urls=sorted({source.official_url for source in candidate.sources}),
                verification_status="verified",
                matching_reasons=[
                    outcome.reason
                    for outcome in evaluation.outcomes
                    if outcome.result == RuleResult.PASS
                ],
                missing_information=list(evaluation.missing_fields),
                benefit_text=candidate.benefit_text,
                documents_text="; ".join(candidate.required_documents) or None,
                application_text=" ".join(candidate.application_instructions) or None,
            )
        )
    run_id = repository.record_run(
        session_id=session_id,
        engine_version=ENGINE_VERSION,
        profile_hash=profile_hash(facts),
        results=tuple(writes),
    )
    terms = profile_terms(facts)
    if terms:
        preliminary = PreliminarySchemeRepository(session).list_candidates(search_terms=terms)
        for preliminary_candidate in preliminary:
            score = preliminary_relevance(preliminary_candidate, facts)
            if score <= 0:
                continue
            normalization = normalize_eligibility_text(preliminary_candidate.eligibility_text)
            missing: set[str] = {
                rule.field
                for rule in normalization.proposed_rules
                if getattr(facts, rule.field) is None
            }
            missing.add("official source verification")
            if normalization.uncertain_fragments:
                missing.add("manual review of unstructured eligibility conditions")
            matched_terms = preliminary_matching_terms(preliminary_candidate, facts)
            results.append(
                SchemeMatchResult(
                    scheme_id=preliminary_candidate.scheme_id,
                    scheme_name=preliminary_candidate.name,
                    scheme_version_id=preliminary_candidate.scheme_version_id,
                    status=Verdict.MANUAL_REVIEW,
                    relevance_score=score,
                    matched_rules=[],
                    failed_rules=[],
                    unknown_rules=[],
                    manual_review_rules=[],
                    last_verified_at=None,
                    official_source_urls=[],
                    verification_status="preliminary",
                    matching_reasons=["Draft metadata matches: " + ", ".join(matched_terms)],
                    missing_information=sorted(missing),
                    benefit_text=preliminary_candidate.benefit_text or None,
                    documents_text=preliminary_candidate.documents_text or None,
                    application_text=preliminary_candidate.application_text or None,
                )
            )
    # Keep uncertain verdicts visible; relevance never changes an eligibility decision.
    results.sort(
        key=lambda result: ranking_key(
            Verdict(result.status), result.relevance_score, result.scheme_id
        )
    )
    return MatchesResponse(run_id=run_id, results=results[:limit])
