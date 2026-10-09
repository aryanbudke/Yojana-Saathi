"""Verified application guidance with conservative session-aware readiness."""

from datetime import UTC, datetime
from typing import Any
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.enums import FactOrigin
from app.db.models import (
    ApplicationStep,
    EligibilityRule,
    ProfileFact,
    ProfileSession,
    RequiredDocument,
    Source,
)
from app.repositories.schemes import published_scheme_by_id_statement
from app.schemas.guidance import (
    DocumentReadiness,
    GuidanceDocument,
    GuidanceResponse,
    GuidanceStep,
)
from app.schemas.scheme import SourceReference

DISCLAIMER = (
    "Yojana Saathi provides preliminary guidance based on reviewed public sources. "
    "Eligibility and approval are determined by the relevant government authority."
)


class GuidanceUnavailableError(ValueError):
    """Raised when safe guidance lacks a verified application link."""


class GuidanceSessionNotFoundError(LookupError):
    """Raised when a supplied session is missing or expired."""


def get_guidance(
    session: Session,
    scheme_id: UUID,
    *,
    session_id: UUID | None = None,
    now: datetime | None = None,
) -> GuidanceResponse | None:
    """Build guidance exclusively from the latest public scheme version."""

    row = session.execute(published_scheme_by_id_statement(scheme_id)).first()
    if row is None:
        return None
    scheme, version = row[0], row[1]
    confirmed_facts = _confirmed_facts(session, session_id, now=now or datetime.now(UTC))

    sources = list(
        session.scalars(
            select(Source)
            .where(Source.scheme_version_id == version.id)
            .order_by(Source.title, Source.id)
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
    rules = list(
        session.scalars(
            select(EligibilityRule).where(EligibilityRule.scheme_version_id == version.id)
        )
    )
    application_url = next(
        (step.official_url for step in steps if step.official_url is not None), None
    )
    if application_url is None:
        raise GuidanceUnavailableError("Verified application link is unavailable.")

    guidance_documents: list[GuidanceDocument] = []
    for document in documents:
        applicability = _condition_applies(document.when_required, confirmed_facts)
        if applicability is False:
            continue
        status = (
            DocumentReadiness.MAY_BE_REQUIRED
            if document.when_required is not None and applicability is None
            else DocumentReadiness.UNKNOWN
        )
        guidance_documents.append(
            GuidanceDocument(
                name=document.name,
                status=status,
                note=(
                    "A confirmed profile fact is needed to determine whether this applies."
                    if status == DocumentReadiness.MAY_BE_REQUIRED
                    else None
                ),
                source_id=document.source_id,
            )
        )

    required_fields = {
        field
        for rule in rules
        for field in _expression_fields(rule.expression)
        if field not in confirmed_facts
    }
    required_fields.update(
        field
        for document in documents
        if document.when_required is not None
        for field in _expression_fields(document.when_required)
        if field not in confirmed_facts
    )
    return GuidanceResponse(
        scheme_id=scheme.id,
        scheme_version_id=version.id,
        scheme_name=scheme.name,
        documents=guidance_documents,
        steps=[
            GuidanceStep(
                step_number=step.step_number,
                instruction=step.instruction,
                official_url=step.official_url,
                source_id=step.source_id,
            )
            for step in steps
        ],
        official_application_url=application_url,
        unresolved_preconditions=[
            f"Missing confirmed fact: {field.replace('_', ' ')}"
            for field in sorted(required_fields)
        ],
        sources=[_source_reference(source) for source in sources],
        disclaimer=DISCLAIMER,
    )


def _confirmed_facts(session: Session, session_id: UUID | None, *, now: datetime) -> dict[str, Any]:
    if session_id is None:
        return {}
    profile_session = session.get(ProfileSession, session_id)
    if profile_session is None or _as_utc(profile_session.expires_at) <= _as_utc(now):
        raise GuidanceSessionNotFoundError("Profile session not found or expired.")
    facts = session.scalars(
        select(ProfileFact).where(
            ProfileFact.session_id == session_id,
            ProfileFact.origin == FactOrigin.USER,
        )
    )
    return {fact.field_name: fact.value_json for fact in facts}


def _condition_applies(expression: dict[str, Any] | None, facts: dict[str, Any]) -> bool | None:
    if expression is None:
        return True
    for combinator in ("all", "any"):
        children = expression.get(combinator)
        if isinstance(children, list) and children:
            results = [
                _condition_applies(child, facts) for child in children if isinstance(child, dict)
            ]
            if len(results) != len(children):
                return None
            if combinator == "all":
                return False if False in results else True if all(results) else None
            return True if True in results else False if all(r is False for r in results) else None
    negated = expression.get("not")
    if isinstance(negated, dict):
        result = _condition_applies(negated, facts)
        return None if result is None else not result

    field = expression.get("field")
    operator = expression.get("op")
    if not isinstance(field, str) or field not in facts or facts[field] == "not_sure":
        return None
    actual = facts[field]
    expected = expression.get("value")
    try:
        if operator == "eq":
            return bool(actual == expected)
        if operator == "in" and isinstance(expected, list):
            return bool(actual in expected)
        if operator == "lt":
            return bool(actual < expected)
        if operator == "lte":
            return bool(actual <= expected)
        if operator == "gt":
            return bool(actual > expected)
        if operator == "gte":
            return bool(actual >= expected)
    except TypeError:
        return None
    return None


def _as_utc(value: datetime) -> datetime:
    """Normalize timestamps from drivers that omit UTC timezone metadata."""

    if value.tzinfo is None:
        return value.replace(tzinfo=UTC)
    return value.astimezone(UTC)


def _expression_fields(expression: dict[str, Any]) -> set[str]:
    fields: set[str] = set()
    field = expression.get("field")
    if isinstance(field, str):
        fields.add(field)
    for key in ("all", "any"):
        children = expression.get(key)
        if isinstance(children, list):
            for child in children:
                if isinstance(child, dict):
                    fields.update(_expression_fields(child))
    negated = expression.get("not")
    if isinstance(negated, dict):
        fields.update(_expression_fields(negated))
    return fields


def _source_reference(source: Source) -> SourceReference:
    return SourceReference(
        id=source.id,
        title=source.title,
        official_url=source.official_url,
        checked_at=source.checked_at,
        document_date=source.document_date,
        excerpt_locator=source.excerpt_locator,
    )
