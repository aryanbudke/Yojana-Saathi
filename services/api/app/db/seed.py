"""Validated seed-file loading for deterministic development and tests."""

from pathlib import Path

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.official_urls import validate_official_url
from app.db.models import (
    ApplicationStep,
    EligibilityRule,
    RequiredDocument,
    Scheme,
    SchemeVersion,
    Source,
)
from app.schemas.seed import SeedBundle


class SeedConflictError(ValueError):
    """Raised when a seed bundle would overwrite existing scheme identity."""


def load_seed_file(path: Path) -> SeedBundle:
    """Parse and validate a versioned JSON seed bundle."""

    return SeedBundle.model_validate_json(path.read_text(encoding="utf-8"))


def seed_database(session: Session, bundle: SeedBundle, *, allow_test_urls: bool = False) -> int:
    """Insert a validated bundle without committing the caller's transaction."""

    for record in bundle.schemes:
        for source in record.sources:
            validate_official_url(str(source.official_url), allow_test_urls=allow_test_urls)
        for step in record.steps:
            if step.official_url is not None:
                validate_official_url(str(step.official_url), allow_test_urls=allow_test_urls)

    inserted = 0
    for record in bundle.schemes:
        existing_id = session.scalar(select(Scheme.id).where(Scheme.slug == record.slug))
        if existing_id is not None:
            raise SeedConflictError(f"scheme slug already exists: {record.slug}")

        session.add(
            Scheme(
                id=record.id,
                slug=record.slug,
                name=record.name,
                government_level=record.government_level,
                state_code=record.state_code,
                category=record.category,
                status=record.status,
            )
        )
        session.flush()
        session.add(
            SchemeVersion(
                id=record.version_id,
                scheme_id=record.id,
                version=record.version,
                summary=record.summary,
                benefit_text=record.benefit_text,
                eligibility_json=record.eligibility_json,
                verified_at=record.verified_at,
                reviewed_by=record.reviewed_by,
                review_status=record.review_status,
                published_at=record.published_at,
            )
        )
        session.flush()
        session.add_all(
            Source(
                id=source.id,
                scheme_version_id=record.version_id,
                official_url=str(source.official_url),
                title=source.title,
                document_date=source.document_date,
                checked_at=source.checked_at,
                excerpt_locator=source.excerpt_locator,
            )
            for source in record.sources
        )
        session.flush()
        session.add_all(
            EligibilityRule(
                id=rule.id,
                scheme_version_id=record.version_id,
                rule_key=rule.rule_key,
                expression=rule.expression,
                severity=rule.severity,
                source_id=rule.source_id,
                question_template=rule.question_template,
            )
            for rule in record.rules
        )
        session.add_all(
            RequiredDocument(
                id=document.id,
                scheme_version_id=record.version_id,
                name=document.name,
                when_required=document.when_required,
                source_id=document.source_id,
            )
            for document in record.documents
        )
        session.add_all(
            ApplicationStep(
                id=step.id,
                scheme_version_id=record.version_id,
                step_number=step.step_number,
                instruction=step.instruction,
                official_url=str(step.official_url) if step.official_url else None,
                source_id=step.source_id,
            )
            for step in record.steps
        )
        inserted += 1
    session.flush()
    return inserted
