"""Deterministic explanations from validated policy; no generated policy claims."""

from app.modules.matching.evaluator import Evaluation
from app.modules.matching.rules import All, Atom, Expression, Manual, Not, parse_rule
from app.repositories.matching import CandidateScheme
from app.schemas.matching import RuleResult
from app.services.scheme_detail import describe_rule_expression


def describe(node: Expression) -> str:
    if isinstance(node, Atom):
        return describe_rule_expression(node.model_dump(exclude_none=True))
    if isinstance(node, Manual):
        return "A reviewed condition requires manual verification."
    if isinstance(node, Not):
        return f"not ({describe(node.child)})"
    children = node.all if isinstance(node, All) else node.any
    return (" and " if isinstance(node, All) else " or ").join(
        f"({describe(child)})" for child in children
    )


def explain(candidate: CandidateScheme, evaluation: Evaluation) -> Evaluation:
    rules = {rule.rule_key: rule for rule in candidate.rules}
    outcomes = []
    for outcome in evaluation.outcomes:
        reason = outcome.reason
        if outcome.result != RuleResult.MANUAL_REVIEW:
            node = parse_rule(rules[outcome.rule_key].expression)
            reason += " Reviewed condition: " + describe(node)
        outcomes.append(outcome.model_copy(update={"reason": reason}))
    return Evaluation(evaluation.verdict, tuple(outcomes), evaluation.missing_fields)
