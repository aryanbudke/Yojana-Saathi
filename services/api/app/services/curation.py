"""Safety guards and state transitions for source-backed scheme curation."""

from dataclasses import dataclass
from datetime import UTC, datetime
from uuid import UUID

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.official_urls import OfficialUrlValidationError, validate_official_url
from app.db.enums import ReviewStatus
from app.db.models import (
    AdminAuditLog,
    ApplicationStep,
    EligibilityRule,
    RequiredDocument,
    SchemeVersion,
    Source,
)


class SchemeVersionNotFoundError(LookupError):
    """Raised when a requested scheme version does not exist."""


class PublishedVersionImmutableError(ValueError):
    """Raised when code attempts to mutate an already published version."""


class CurationValidationError(ValueError):
    """Raised when a version is not complete enough to review or publish."""


class InvalidReviewTransitionError(ValueError):
    """Raised for state changes outside draft -> verified -> published."""


@dataclass(frozen=True)
class ProvenanceReport:
    source_count: int
    rule_count: int
    document_count: int
    step_count: int


def ensure_version_is_mutable(session: Session, version_id: UUID) -> SchemeVersion:
    """Load an unpublished version or reject the attempted mutation."""

    version = session.scalar(select(SchemeVersion).where(SchemeVersion.id == version_id))
    if version is None:
        raise SchemeVersionNotFoundError(f"scheme version not found: {version_id}")
    if version.published_at is not None:
        raise PublishedVersionImmutableError(f"published scheme version is immutable: {version_id}")
    return version


def validate_version_provenance(
    session: Session, version_id: UUID, *, allow_test_urls: bool = False
) -> ProvenanceReport:
    """Require source-backed rules and report optional guidance coverage."""

    version = ensure_version_is_mutable(session, version_id)
    source_count = _count_for_version(session, Source, version.id)
    rule_count = _count_for_version(session, EligibilityRule, version.id)
    document_count = _count_for_version(session, RequiredDocument, version.id)
    step_count = _count_for_version(session, ApplicationStep, version.id)

    errors: list[str] = []
    if source_count == 0:
        errors.append("at least one official source is required")
    if rule_count == 0:
        errors.append("at least one source-backed eligibility rule is required")
    if not isinstance(version.eligibility_json, dict) or not version.eligibility_json:
        errors.append("eligibility_json must be a non-empty object")
    sources = session.scalars(select(Source).where(Source.scheme_version_id == version.id))
    steps = session.scalars(
        select(ApplicationStep).where(ApplicationStep.scheme_version_id == version.id)
    )
    try:
        for source in sources:
            validate_official_url(source.official_url, allow_test_urls=allow_test_urls)
        for step in steps:
            if step.official_url is not None:
                validate_official_url(step.official_url, allow_test_urls=allow_test_urls)
    except OfficialUrlValidationError as exc:
        errors.append(str(exc))
    if errors:
        raise CurationValidationError("; ".join(errors))

    return ProvenanceReport(
        source_count=source_count,
        rule_count=rule_count,
        document_count=document_count,
        step_count=step_count,
    )


def review_scheme_version(
    session: Session,
    version_id: UUID,
    *,
    reviewer: str,
    now: datetime | None = None,
    allow_test_urls: bool = False,
) -> ProvenanceReport:
    """Mark a complete draft verified and write an audit record."""

    version = ensure_version_is_mutable(session, version_id)
    if version.review_status != ReviewStatus.DRAFT:
        raise InvalidReviewTransitionError("only draft versions can be reviewed")
    normalized_reviewer = _validated_actor(reviewer)
    report = validate_version_provenance(session, version_id, allow_test_urls=allow_test_urls)
    reviewed_at = now or datetime.now(UTC)
    version.review_status = ReviewStatus.VERIFIED
    version.reviewed_by = normalized_reviewer
    version.verified_at = reviewed_at
    session.add(
        AdminAuditLog(
            actor_id=normalized_reviewer,
            entity="scheme_version",
            entity_id=version.id,
            action="verify",
            at=reviewed_at,
            details={"version": version.version},
        )
    )
    session.flush()
    return report


def publish_scheme_version(
    session: Session,
    version_id: UUID,
    *,
    actor: str,
    now: datetime | None = None,
    allow_test_urls: bool = False,
) -> ProvenanceReport:
    """Publish a verified version exactly once and write an audit record."""

    version = ensure_version_is_mutable(session, version_id)
    if version.review_status != ReviewStatus.VERIFIED:
        raise InvalidReviewTransitionError("only verified versions can be published")
    if version.reviewed_by is None or version.verified_at is None:
        raise CurationValidationError("verified versions require reviewer provenance")
    normalized_actor = _validated_actor(actor)
    report = validate_version_provenance(session, version_id, allow_test_urls=allow_test_urls)
    published_at = now or datetime.now(UTC)
    version.published_at = published_at
    session.add(
        AdminAuditLog(
            actor_id=normalized_actor,
            entity="scheme_version",
            entity_id=version.id,
            action="publish",
            at=published_at,
            details={"version": version.version, "reviewed_by": version.reviewed_by},
        )
    )
    session.flush()
    return report


def _count_for_version(
    session: Session,
    model: type[Source] | type[EligibilityRule] | type[RequiredDocument] | type[ApplicationStep],
    version_id: UUID,
) -> int:
    count = session.scalar(
        select(func.count()).select_from(model).where(model.scheme_version_id == version_id)
    )
    return int(count or 0)


def _validated_actor(actor: str) -> str:
    normalized = actor.strip()
    if not normalized or len(normalized) > 255:
        raise CurationValidationError("actor/reviewer must contain 1–255 characters")
    return normalized
