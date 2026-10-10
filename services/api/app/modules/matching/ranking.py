"""Transparent relevance ordering for verified and preliminary candidates.

Scores are normalized ordering signals. They are not eligibility or approval
probabilities and never override a deterministic rule verdict.
"""

import re
from collections.abc import Iterable

from app.modules.matching.facts import ConfirmedFacts
from app.repositories.matching import CandidateScheme
from app.repositories.preliminary_schemes import PreliminaryScheme
from app.schemas.matching import RuleOutcome, RuleResult

TOKEN = re.compile(r"[^\W\d_]+", re.UNICODE)
STOP_WORDS = frozenset({"and", "for", "the", "with", "support", "scheme", "assistance"})


def profile_terms(facts: ConfirmedFacts) -> set[str]:
    values: list[str] = [value for value in (facts.occupation, facts.category) if value is not None]
    values.extend(facts.support_needs or [])
    return _tokens(values)


def in_geographic_scope(candidate: CandidateScheme, facts: ConfirmedFacts) -> bool:
    return (
        candidate.state_code is None
        or facts.state_code is None
        or candidate.state_code == facts.state_code
    )


def verified_relevance(
    candidate: CandidateScheme,
    facts: ConfirmedFacts,
    outcomes: Iterable[RuleOutcome] = (),
) -> float:
    """Combine metadata relevance, geography, and satisfied reviewed rules."""

    weighted: list[tuple[float, float]] = []
    terms = profile_terms(facts)
    if terms:
        corpus = _tokens(
            [
                candidate.scheme_name,
                candidate.category,
                candidate.summary,
                candidate.benefit_text,
            ]
        )
        weighted.append((0.55, len(terms & corpus) / len(terms)))
    if facts.state_code is not None or candidate.state_code is not None:
        geography = (
            1.0 if candidate.state_code is None or candidate.state_code == facts.state_code else 0.0
        )
        weighted.append((0.15, geography))
    outcomes = tuple(outcomes)
    if outcomes:
        satisfied = sum(outcome.result == RuleResult.PASS for outcome in outcomes)
        weighted.append((0.30, satisfied / len(outcomes)))
    if not weighted:
        return 0.0
    weight = sum(item[0] for item in weighted)
    return round(sum(item_weight * value for item_weight, value in weighted) / weight, 6)


def preliminary_relevance(candidate: PreliminaryScheme, facts: ConfirmedFacts) -> float:
    """Rank draft records using metadata only; raw eligibility is intentionally ignored."""

    terms = profile_terms(facts)
    if not terms:
        return 0.0
    corpus = _tokens(
        [
            candidate.name,
            candidate.category,
            candidate.summary,
            candidate.benefit_text,
            *candidate.categories,
            *candidate.tags,
        ]
    )
    return round(len(terms & corpus) / len(terms), 6)


def _tokens(values: Iterable[str]) -> set[str]:
    return {
        token
        for value in values
        for token in TOKEN.findall(value.casefold())
        if len(token) >= 2 and token not in STOP_WORDS
    }
