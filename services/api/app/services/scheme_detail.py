"""Source-linked public scheme detail assembly."""

import json
from typing import Any
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.models import (
    ApplicationStep,
    EligibilityRule,
    RequiredDocument,
    Source,
)
from app.repositories.schemes import published_scheme_by_id_statement
from app.schemas.scheme import (
    ApplicationStepDetail,
    EligibilityRuleDetail,
    RequiredDocumentDetail,
    SchemeDetailResponse,
    SourceReference,
)


def get_scheme_detail(session: Session, scheme_id: UUID) -> SchemeDetailResponse | None:
    """Load a public version with all rule, document, step, and source links."""

    row = session.execute(published_scheme_by_id_statement(scheme_id)).first()
    if row is None:
        return None
    scheme, version = row[0], row[1]
    if version.verified_at is None:
        raise RuntimeError("published scheme version is missing verified_at")

    sources = list(
        session.scalars(
            select(Source)
            .where(Source.scheme_version_id == version.id)
            .order_by(Source.title, Source.id)
        )
    )
    source_map = {source.id: _source_reference(source) for source in sources}
    rules = list(
        session.scalars(
            select(EligibilityRule)
            .where(EligibilityRule.scheme_version_id == version.id)
            .order_by(EligibilityRule.rule_key, EligibilityRule.id)
        )
    )
    documents = list(
        session.scalars(
            select(RequiredDocument)
            .where(RequiredDocument.scheme_version_id == version.id)
            .order_by(RequiredDocument.name, RequiredDocument.id)
        )
    )
    steps = list(
        session.scalars(
            select(ApplicationStep)
            .where(ApplicationStep.scheme_version_id == version.id)
            .order_by(ApplicationStep.step_number, ApplicationStep.id)
        )
    )

    return SchemeDetailResponse(
        id=scheme.id,
        slug=scheme.slug,
        name=scheme.name,
        government_level=scheme.government_level,
        state_code=scheme.state_code,
        category=scheme.category,
        status=scheme.status,
        scheme_version_id=version.id,
        summary=version.summary,
        review_status=version.review_status,
        last_verified_at=version.verified_at,
        official_sources=list(source_map.values()),
        benefit_text=version.benefit_text,
        eligibility_rules=[
            EligibilityRuleDetail(
                rule_key=rule.rule_key,
                explanation=describe_rule_expression(rule.expression),
                severity=rule.severity,
                source=source_map[rule.source_id],
            )
            for rule in rules
        ],
        required_documents=[
            RequiredDocumentDetail(
                name=document.name,
                when_required=document.when_required,
                source=source_map[document.source_id],
            )
            for document in documents
        ],
        application_steps=[
            ApplicationStepDetail(
                step_number=step.step_number,
                instruction=step.instruction,
                official_url=step.official_url,
                source=source_map[step.source_id],
            )
            for step in steps
        ],
    )


def describe_rule_expression(expression: dict[str, Any]) -> str:
    """Render reviewed DSL structure without evaluating or inventing a rule."""

    for combinator, joining_word in (("all", " and "), ("any", " or ")):
        children = expression.get(combinator)
        if isinstance(children, list) and children:
            rendered = [
                describe_rule_expression(child) for child in children if isinstance(child, dict)
            ]
            if len(rendered) == len(children):
                return joining_word.join(f"({item})" for item in rendered)
    negated = expression.get("not")
    if isinstance(negated, dict):
        return f"not ({describe_rule_expression(negated)})"

    field = expression.get("field")
    operator = expression.get("op")
    if not isinstance(field, str) or not isinstance(operator, str):
        return f"Reviewed condition: {json.dumps(expression, sort_keys=True)}"
    label = field.replace("_", " ")
    value = expression.get("value")
    operators = {
        "eq": "must equal",
        "in": "must be one of",
        "lt": "must be less than",
        "lte": "must be at most",
        "gt": "must be greater than",
        "gte": "must be at least",
    }
    phrase = operators.get(operator)
    if phrase is None:
        return f"Reviewed condition: {json.dumps(expression, sort_keys=True)}"
    rendered_value = json.dumps(value, ensure_ascii=False, sort_keys=True)
    return f"{label} {phrase} {rendered_value}."


def _source_reference(source: Source) -> SourceReference:
    return SourceReference(
        id=source.id,
        title=source.title,
        official_url=source.official_url,
        checked_at=source.checked_at,
        document_date=source.document_date,
        excerpt_locator=source.excerpt_locator,
    )
