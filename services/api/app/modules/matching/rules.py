"""Validated, bounded, deterministic four-valued rule AST."""

from __future__ import annotations

import math
import operator
from dataclasses import dataclass
from typing import Annotated, Any, Literal, Self
from uuid import UUID

from pydantic import (
    BaseModel,
    ConfigDict,
    Field,
    StrictBool,
    StrictFloat,
    StrictInt,
    StrictStr,
    TypeAdapter,
    model_validator,
)

from app.modules.matching.facts import ConfirmedFacts
from app.schemas.matching import RuleResult
from app.schemas.profile import ProfileFacts, ProfileField

type Scalar = StrictBool | StrictInt | StrictFloat | Annotated[StrictStr, Field(max_length=200)]
NUMERIC_FIELDS = {"age", "family_income_inr", "land_area_acres"}


class Node(BaseModel):
    model_config = ConfigDict(extra="forbid", frozen=True, allow_inf_nan=False)


class Atom(Node):
    field: ProfileField
    op: Literal["eq", "in", "lt", "lte", "gt", "gte"]
    value: Scalar | Annotated[list[Scalar], Field(min_length=1, max_length=64)]
    source_id: UUID | None = None

    @model_validator(mode="after")
    def comparison_types(self) -> Self:
        if (self.op == "in") != isinstance(self.value, list):
            raise ValueError("Only in accepts a nonempty list")
        if self.op not in {"eq", "in"} and self.field not in NUMERIC_FIELDS:
            raise ValueError("Ordered comparison needs numeric facts")
        values = self.value if isinstance(self.value, list) else [self.value]
        for value in values:
            if self.field in NUMERIC_FIELDS:
                if isinstance(value, bool) or not isinstance(value, (int, float)):
                    raise ValueError("Numeric thresholds must not be booleans or strings")
                if isinstance(value, float) and not math.isfinite(value):
                    raise ValueError("Numeric thresholds must be finite")
            else:
                ConfirmedFacts.model_validate({self.field: value})
                if value == "not_sure":
                    raise ValueError("Unknown is not a policy threshold")
        return self


class All(Node):
    all: Annotated[list[Expression], Field(min_length=1, max_length=64)]


class AnyOf(Node):
    any: Annotated[list[Expression], Field(min_length=1, max_length=64)]


class Not(Node):
    child: Expression = Field(alias="not")


class Manual(Node):
    manual_review_required: Literal[True]
    reason: str | None = Field(default=None, max_length=500)
    source_id: UUID | None = None


type Expression = Atom | All | AnyOf | Not | Manual
All.model_rebuild()
AnyOf.model_rebuild()
Not.model_rebuild()
# Pydantic accepts runtime aliases; its type stub only accepts concrete classes.
ADAPTER: TypeAdapter[Expression] = TypeAdapter(Expression)  # type: ignore[arg-type]
COMPARATORS = {
    "eq": operator.eq,
    "lt": operator.lt,
    "lte": operator.le,
    "gt": operator.gt,
    "gte": operator.ge,
}


def parse_rule(raw: dict[str, Any]) -> Expression:
    pending: list[tuple[object, int]] = [(raw, 0)]
    count = 0
    while pending:
        node, depth = pending.pop()
        count += 1
        if depth > 16 or count > 256:
            raise ValueError("Policy tree exceeds depth 16 or 256 nodes")
        if isinstance(node, dict):
            for kind in ("all", "any"):
                children = node.get(kind)
                if isinstance(children, list):
                    pending.extend((child, depth + 1) for child in children)
            if "not" in node:
                pending.append((node["not"], depth + 1))
    return ADAPTER.validate_python(raw)


def combine(kind: Literal["all", "any"], values: list[RuleResult]) -> RuleResult:
    decisive = RuleResult.FAIL if kind == "all" else RuleResult.PASS
    if not values:
        return RuleResult.MANUAL_REVIEW
    if decisive in values:
        return decisive
    if RuleResult.MANUAL_REVIEW in values:
        return RuleResult.MANUAL_REVIEW
    if RuleResult.UNKNOWN in values:
        return RuleResult.UNKNOWN
    return RuleResult.PASS if kind == "all" else RuleResult.FAIL


@dataclass(frozen=True)
class Check:
    result: RuleResult
    missing_fields: tuple[str, ...] = ()


def evaluate(node: Expression, facts: ProfileFacts) -> Check:
    if isinstance(node, Manual):
        return Check(RuleResult.MANUAL_REVIEW)
    if isinstance(node, Atom):
        value = getattr(facts, node.field)
        if value is None or value == "not_sure":
            return Check(RuleResult.UNKNOWN, (node.field,))
        passed = (
            value in node.value
            if isinstance(node.value, list)
            else COMPARATORS[node.op](value, node.value)
        )
        return Check(RuleResult.PASS if passed else RuleResult.FAIL)
    if isinstance(node, Not):
        child = evaluate(node.child, facts)
        inverse = {RuleResult.PASS: RuleResult.FAIL, RuleResult.FAIL: RuleResult.PASS}
        return Check(inverse.get(child.result, child.result), child.missing_fields)
    children = node.all if isinstance(node, All) else node.any
    checks = [evaluate(child, facts) for child in children]
    result = combine("all" if isinstance(node, All) else "any", [check.result for check in checks])
    missing = (
        tuple(sorted({field for check in checks for field in check.missing_fields}))
        if result in {RuleResult.UNKNOWN, RuleResult.MANUAL_REVIEW}
        else ()
    )
    return Check(result, missing)


def source_ids(node: Expression) -> set[UUID]:
    if isinstance(node, (Atom, Manual)):
        return {node.source_id} if node.source_id is not None else set()
    if isinstance(node, Not):
        return source_ids(node.child)
    children = node.all if isinstance(node, All) else node.any
    return {source for child in children for source in source_ids(child)}


def canonical(node: Expression) -> object:
    """Compare policy meaning, ignoring source annotations and redundant AND nesting."""
    if isinstance(node, Atom):
        return (node.field, node.op, node.value)
    if isinstance(node, Manual):
        return "manual_review"
    if isinstance(node, Not):
        return ("not", canonical(node.child))
    children = node.all if isinstance(node, All) else node.any
    normalized = []
    for child in children:
        value = canonical(child)
        if isinstance(node, All) and isinstance(value, tuple) and value[0] == "all":
            normalized.extend(value[1])
        else:
            normalized.append(value)
    normalized.sort(key=repr)
    if isinstance(node, All) and len(normalized) == 1:
        return normalized[0]
    return ("all" if isinstance(node, All) else "any", tuple(normalized))
