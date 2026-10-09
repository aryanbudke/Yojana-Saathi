"""Relational model for reviewed schemes, provenance, sessions, and match runs."""

from datetime import UTC, date, datetime
from typing import Any
from uuid import UUID, uuid4

from pgvector.sqlalchemy import Vector
from sqlalchemy import (
    CheckConstraint,
    Date,
    DateTime,
    Enum,
    Float,
    ForeignKey,
    ForeignKeyConstraint,
    Index,
    Integer,
    String,
    Text,
    UniqueConstraint,
    Uuid,
)
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base
from app.db.enums import (
    FactOrigin,
    GovernmentLevel,
    ReviewStatus,
    RuleSeverity,
    SchemeStatus,
    Verdict,
)
from app.db.types import JSON_DOCUMENT, enum_values


def utc_now() -> datetime:
    """Return a timezone-aware UTC timestamp for application-side defaults."""

    return datetime.now(UTC)


class Scheme(Base):
    __tablename__ = "schemes"
    __table_args__ = (
        CheckConstraint(
            "state_code IS NULL OR length(state_code) = 2",
            name="state_code_length",
        ),
        Index("ix_schemes_status_state_code_category", "status", "state_code", "category"),
    )

    id: Mapped[UUID] = mapped_column(Uuid, primary_key=True, default=uuid4)
    slug: Mapped[str] = mapped_column(String(160), unique=True, nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    government_level: Mapped[GovernmentLevel] = mapped_column(
        Enum(
            GovernmentLevel,
            native_enum=False,
            create_constraint=True,
            values_callable=enum_values,
            length=16,
        ),
        nullable=False,
    )
    state_code: Mapped[str | None] = mapped_column(String(2))
    category: Mapped[str] = mapped_column(String(80), nullable=False)
    status: Mapped[SchemeStatus] = mapped_column(
        Enum(
            SchemeStatus,
            native_enum=False,
            create_constraint=True,
            values_callable=enum_values,
            length=16,
        ),
        nullable=False,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=utc_now
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=utc_now, onupdate=utc_now
    )


class SchemeVersion(Base):
    __tablename__ = "scheme_versions"
    __table_args__ = (
        UniqueConstraint("scheme_id", "version"),
        CheckConstraint("version >= 1", name="positive_version"),
        CheckConstraint(
            "published_at IS NULL OR review_status = 'verified'",
            name="published_requires_verified",
        ),
        Index(
            "ix_scheme_versions_scheme_id_review_status_published_at",
            "scheme_id",
            "review_status",
            "published_at",
        ),
    )

    id: Mapped[UUID] = mapped_column(Uuid, primary_key=True, default=uuid4)
    scheme_id: Mapped[UUID] = mapped_column(
        Uuid, ForeignKey("schemes.id", ondelete="RESTRICT"), nullable=False
    )
    version: Mapped[int] = mapped_column(Integer, nullable=False)
    summary: Mapped[str] = mapped_column(Text, nullable=False)
    benefit_text: Mapped[str] = mapped_column(Text, nullable=False)
    eligibility_json: Mapped[dict[str, Any]] = mapped_column(JSON_DOCUMENT, nullable=False)
    verified_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    reviewed_by: Mapped[str | None] = mapped_column(String(255))
    review_status: Mapped[ReviewStatus] = mapped_column(
        Enum(
            ReviewStatus,
            native_enum=False,
            create_constraint=True,
            values_callable=enum_values,
            length=16,
        ),
        nullable=False,
    )
    published_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=utc_now
    )


class Source(Base):
    __tablename__ = "sources"
    __table_args__ = (UniqueConstraint("id", "scheme_version_id"),)

    id: Mapped[UUID] = mapped_column(Uuid, primary_key=True, default=uuid4)
    scheme_version_id: Mapped[UUID] = mapped_column(
        Uuid, ForeignKey("scheme_versions.id", ondelete="CASCADE"), nullable=False
    )
    official_url: Mapped[str] = mapped_column(Text, nullable=False)
    title: Mapped[str] = mapped_column(String(500), nullable=False)
    document_date: Mapped[date | None] = mapped_column(Date)
    checked_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    excerpt_locator: Mapped[str] = mapped_column(String(500), nullable=False)


class EligibilityRule(Base):
    __tablename__ = "eligibility_rules"
    __table_args__ = (
        UniqueConstraint("scheme_version_id", "rule_key"),
        Index("ix_eligibility_rules_scheme_version_id", "scheme_version_id"),
        ForeignKeyConstraint(
            ["source_id", "scheme_version_id"],
            ["sources.id", "sources.scheme_version_id"],
            ondelete="RESTRICT",
        ),
    )

    id: Mapped[UUID] = mapped_column(Uuid, primary_key=True, default=uuid4)
    scheme_version_id: Mapped[UUID] = mapped_column(
        Uuid, ForeignKey("scheme_versions.id", ondelete="CASCADE"), nullable=False
    )
    rule_key: Mapped[str] = mapped_column(String(160), nullable=False)
    expression: Mapped[dict[str, Any]] = mapped_column(JSON_DOCUMENT, nullable=False)
    severity: Mapped[RuleSeverity] = mapped_column(
        Enum(
            RuleSeverity,
            native_enum=False,
            create_constraint=True,
            values_callable=enum_values,
            length=24,
        ),
        nullable=False,
    )
    source_id: Mapped[UUID] = mapped_column(Uuid, nullable=False)
    question_template: Mapped[str | None] = mapped_column(String(500))


class RequiredDocument(Base):
    __tablename__ = "required_documents"
    __table_args__ = (
        UniqueConstraint("scheme_version_id", "name"),
        ForeignKeyConstraint(
            ["source_id", "scheme_version_id"],
            ["sources.id", "sources.scheme_version_id"],
            ondelete="RESTRICT",
        ),
    )

    id: Mapped[UUID] = mapped_column(Uuid, primary_key=True, default=uuid4)
    scheme_version_id: Mapped[UUID] = mapped_column(
        Uuid, ForeignKey("scheme_versions.id", ondelete="CASCADE"), nullable=False
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    when_required: Mapped[dict[str, Any] | None] = mapped_column(JSON_DOCUMENT)
    source_id: Mapped[UUID] = mapped_column(Uuid, nullable=False)


class ApplicationStep(Base):
    __tablename__ = "application_steps"
    __table_args__ = (
        UniqueConstraint("scheme_version_id", "step_number"),
        CheckConstraint("step_number >= 1", name="positive_step_number"),
        ForeignKeyConstraint(
            ["source_id", "scheme_version_id"],
            ["sources.id", "sources.scheme_version_id"],
            ondelete="RESTRICT",
        ),
    )

    id: Mapped[UUID] = mapped_column(Uuid, primary_key=True, default=uuid4)
    scheme_version_id: Mapped[UUID] = mapped_column(
        Uuid, ForeignKey("scheme_versions.id", ondelete="CASCADE"), nullable=False
    )
    step_number: Mapped[int] = mapped_column(Integer, nullable=False)
    instruction: Mapped[str] = mapped_column(Text, nullable=False)
    official_url: Mapped[str | None] = mapped_column(Text)
    source_id: Mapped[UUID] = mapped_column(Uuid, nullable=False)


class ProfileSession(Base):
    __tablename__ = "profile_sessions"
    __table_args__ = (
        CheckConstraint("expires_at > created_at", name="expiry_after_creation"),
        Index("ix_profile_sessions_expires_at", "expires_at"),
    )

    id: Mapped[UUID] = mapped_column(Uuid, primary_key=True, default=uuid4)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    consent_version: Mapped[str | None] = mapped_column(String(40))
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=utc_now
    )


class ProfileFact(Base):
    __tablename__ = "profile_facts"

    session_id: Mapped[UUID] = mapped_column(
        Uuid,
        ForeignKey("profile_sessions.id", ondelete="CASCADE"),
        primary_key=True,
    )
    field_name: Mapped[str] = mapped_column(String(100), primary_key=True)
    value_json: Mapped[Any] = mapped_column(JSON_DOCUMENT, nullable=False)
    origin: Mapped[FactOrigin] = mapped_column(
        Enum(
            FactOrigin,
            native_enum=False,
            create_constraint=True,
            values_callable=enum_values,
            length=24,
        ),
        nullable=False,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=utc_now, onupdate=utc_now
    )


class MatchRun(Base):
    __tablename__ = "match_runs"

    id: Mapped[UUID] = mapped_column(Uuid, primary_key=True, default=uuid4)
    session_id: Mapped[UUID] = mapped_column(
        Uuid, ForeignKey("profile_sessions.id", ondelete="CASCADE"), nullable=False
    )
    run_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=utc_now
    )
    engine_version: Mapped[str] = mapped_column(String(80), nullable=False)
    profile_hash: Mapped[str] = mapped_column(String(64), nullable=False)


class MatchResult(Base):
    __tablename__ = "match_results"
    __table_args__ = (
        CheckConstraint(
            "relevance_score >= 0 AND relevance_score <= 1",
            name="relevance_score_range",
        ),
    )

    run_id: Mapped[UUID] = mapped_column(
        Uuid, ForeignKey("match_runs.id", ondelete="CASCADE"), primary_key=True
    )
    scheme_version_id: Mapped[UUID] = mapped_column(
        Uuid,
        ForeignKey("scheme_versions.id", ondelete="RESTRICT"),
        primary_key=True,
    )
    verdict: Mapped[Verdict] = mapped_column(
        Enum(
            Verdict,
            native_enum=False,
            create_constraint=True,
            values_callable=enum_values,
            length=40,
        ),
        nullable=False,
    )
    relevance_score: Mapped[float] = mapped_column(Float, nullable=False)
    rule_results: Mapped[list[dict[str, Any]]] = mapped_column(JSON_DOCUMENT, nullable=False)
    missing_fields: Mapped[list[str]] = mapped_column(JSON_DOCUMENT, nullable=False)


class SavedScheme(Base):
    __tablename__ = "saved_schemes"

    session_id: Mapped[UUID] = mapped_column(
        Uuid,
        ForeignKey("profile_sessions.id", ondelete="CASCADE"),
        primary_key=True,
    )
    scheme_id: Mapped[UUID] = mapped_column(
        Uuid, ForeignKey("schemes.id", ondelete="CASCADE"), primary_key=True
    )
    saved_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=utc_now
    )


class AdminAuditLog(Base):
    __tablename__ = "admin_audit_log"

    id: Mapped[UUID] = mapped_column(Uuid, primary_key=True, default=uuid4)
    actor_id: Mapped[str] = mapped_column(String(255), nullable=False)
    entity: Mapped[str] = mapped_column(String(100), nullable=False)
    entity_id: Mapped[UUID] = mapped_column(Uuid, nullable=False)
    action: Mapped[str] = mapped_column(String(100), nullable=False)
    at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=utc_now)
    details: Mapped[dict[str, Any] | None] = mapped_column(JSON_DOCUMENT)


STAGING_EMBEDDING_DIMENSIONS = 768


class StagingScheme(Base):
    """Unverified notebook record kept only for curator search; never matched or published."""

    __tablename__ = "staging_schemes"

    id: Mapped[UUID] = mapped_column(Uuid, primary_key=True, default=uuid4)
    slug: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    name: Mapped[str] = mapped_column(Text, nullable=False)
    record: Mapped[dict[str, Any]] = mapped_column(JSON_DOCUMENT, nullable=False)
    missing_fields: Mapped[list[str]] = mapped_column(JSON_DOCUMENT, nullable=False)
    input_sha256: Mapped[str] = mapped_column(String(64), nullable=False)
    embedding: Mapped[list[float]] = mapped_column(
        Vector(STAGING_EMBEDDING_DIMENSIONS), nullable=False
    )
    imported_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=utc_now
    )
