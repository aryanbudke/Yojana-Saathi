"""Create the initial source-backed scheme and session schema.

Revision ID: 20261009_0001
Revises:
Create Date: 2026-10-09
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "20261009_0001"
down_revision: str | None = None
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None

government_level = sa.Enum(
    "central",
    "state",
    name="governmentlevel",
    native_enum=False,
    create_constraint=True,
)
scheme_status = sa.Enum(
    "active",
    "closed",
    "unknown",
    name="schemestatus",
    native_enum=False,
    create_constraint=True,
)
review_status = sa.Enum(
    "draft",
    "verified",
    "stale",
    "rejected",
    name="reviewstatus",
    native_enum=False,
    create_constraint=True,
)
rule_severity = sa.Enum(
    "required",
    "exclusion",
    "manual_review",
    name="ruleseverity",
    native_enum=False,
    create_constraint=True,
)
fact_origin = sa.Enum(
    "user",
    "model_extracted",
    "imported",
    name="factorigin",
    native_enum=False,
    create_constraint=True,
)
verdict = sa.Enum(
    "all_checked_conditions_met",
    "needs_information",
    "not_eligible",
    "manual_review",
    name="verdict",
    native_enum=False,
    create_constraint=True,
)


def upgrade() -> None:
    op.create_table(
        "schemes",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("slug", sa.String(length=160), nullable=False),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("government_level", government_level, nullable=False),
        sa.Column("state_code", sa.String(length=2), nullable=True),
        sa.Column("category", sa.String(length=80), nullable=False),
        sa.Column("status", scheme_status, nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.CheckConstraint(
            "state_code IS NULL OR char_length(state_code) = 2",
            name=op.f("ck_schemes_state_code_length"),
        ),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_schemes")),
        sa.UniqueConstraint("slug", name=op.f("uq_schemes_slug")),
    )
    op.create_table(
        "profile_sessions",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("consent_version", sa.String(length=40), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.CheckConstraint(
            "expires_at > created_at", name=op.f("ck_profile_sessions_expiry_after_creation")
        ),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_profile_sessions")),
    )
    op.create_table(
        "admin_audit_log",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("actor_id", sa.String(length=255), nullable=False),
        sa.Column("entity", sa.String(length=100), nullable=False),
        sa.Column("entity_id", sa.Uuid(), nullable=False),
        sa.Column("action", sa.String(length=100), nullable=False),
        sa.Column("at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("details", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_admin_audit_log")),
    )
    op.create_table(
        "scheme_versions",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("scheme_id", sa.Uuid(), nullable=False),
        sa.Column("version", sa.Integer(), nullable=False),
        sa.Column("summary", sa.Text(), nullable=False),
        sa.Column("benefit_text", sa.Text(), nullable=False),
        sa.Column("eligibility_json", postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column("verified_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("reviewed_by", sa.String(length=255), nullable=True),
        sa.Column("review_status", review_status, nullable=False),
        sa.Column("published_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.CheckConstraint("version >= 1", name=op.f("ck_scheme_versions_positive_version")),
        sa.CheckConstraint(
            "published_at IS NULL OR review_status = 'verified'",
            name=op.f("ck_scheme_versions_published_requires_verified"),
        ),
        sa.ForeignKeyConstraint(
            ["scheme_id"],
            ["schemes.id"],
            name=op.f("fk_scheme_versions_scheme_id_schemes"),
            ondelete="RESTRICT",
        ),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_scheme_versions")),
        sa.UniqueConstraint(
            "scheme_id",
            "version",
            name=op.f("uq_scheme_versions_scheme_id_version"),
        ),
    )
    op.create_table(
        "profile_facts",
        sa.Column("session_id", sa.Uuid(), nullable=False),
        sa.Column("field_name", sa.String(length=100), nullable=False),
        sa.Column("value_json", postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column("origin", fact_origin, nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(
            ["session_id"],
            ["profile_sessions.id"],
            name=op.f("fk_profile_facts_session_id_profile_sessions"),
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("session_id", "field_name", name=op.f("pk_profile_facts")),
    )
    op.create_table(
        "match_runs",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("session_id", sa.Uuid(), nullable=False),
        sa.Column("run_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("engine_version", sa.String(length=80), nullable=False),
        sa.Column("profile_hash", sa.String(length=64), nullable=False),
        sa.ForeignKeyConstraint(
            ["session_id"],
            ["profile_sessions.id"],
            name=op.f("fk_match_runs_session_id_profile_sessions"),
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_match_runs")),
    )
    op.create_table(
        "saved_schemes",
        sa.Column("session_id", sa.Uuid(), nullable=False),
        sa.Column("scheme_id", sa.Uuid(), nullable=False),
        sa.Column("saved_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(
            ["scheme_id"],
            ["schemes.id"],
            name=op.f("fk_saved_schemes_scheme_id_schemes"),
            ondelete="CASCADE",
        ),
        sa.ForeignKeyConstraint(
            ["session_id"],
            ["profile_sessions.id"],
            name=op.f("fk_saved_schemes_session_id_profile_sessions"),
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("session_id", "scheme_id", name=op.f("pk_saved_schemes")),
    )
    op.create_table(
        "sources",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("scheme_version_id", sa.Uuid(), nullable=False),
        sa.Column("official_url", sa.Text(), nullable=False),
        sa.Column("title", sa.String(length=500), nullable=False),
        sa.Column("document_date", sa.Date(), nullable=True),
        sa.Column("checked_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("excerpt_locator", sa.String(length=500), nullable=False),
        sa.ForeignKeyConstraint(
            ["scheme_version_id"],
            ["scheme_versions.id"],
            name=op.f("fk_sources_scheme_version_id_scheme_versions"),
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_sources")),
        sa.UniqueConstraint(
            "id",
            "scheme_version_id",
            name=op.f("uq_sources_id_scheme_version_id"),
        ),
    )
    op.create_table(
        "match_results",
        sa.Column("run_id", sa.Uuid(), nullable=False),
        sa.Column("scheme_version_id", sa.Uuid(), nullable=False),
        sa.Column("verdict", verdict, nullable=False),
        sa.Column("relevance_score", sa.Float(), nullable=False),
        sa.Column("rule_results", postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column("missing_fields", postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.CheckConstraint(
            "relevance_score >= 0 AND relevance_score <= 1",
            name=op.f("ck_match_results_relevance_score_range"),
        ),
        sa.ForeignKeyConstraint(
            ["run_id"],
            ["match_runs.id"],
            name=op.f("fk_match_results_run_id_match_runs"),
            ondelete="CASCADE",
        ),
        sa.ForeignKeyConstraint(
            ["scheme_version_id"],
            ["scheme_versions.id"],
            name=op.f("fk_match_results_scheme_version_id_scheme_versions"),
            ondelete="RESTRICT",
        ),
        sa.PrimaryKeyConstraint("run_id", "scheme_version_id", name=op.f("pk_match_results")),
    )
    _create_source_backed_tables()


def _create_source_backed_tables() -> None:
    source_fk = lambda table: sa.ForeignKeyConstraint(  # noqa: E731
        ["source_id", "scheme_version_id"],
        ["sources.id", "sources.scheme_version_id"],
        name=op.f(f"fk_{table}_source_id_scheme_version_id_sources"),
        ondelete="RESTRICT",
    )
    op.create_table(
        "eligibility_rules",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("scheme_version_id", sa.Uuid(), nullable=False),
        sa.Column("rule_key", sa.String(length=160), nullable=False),
        sa.Column("expression", postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column("severity", rule_severity, nullable=False),
        sa.Column("source_id", sa.Uuid(), nullable=False),
        sa.Column("question_template", sa.String(length=500), nullable=True),
        sa.ForeignKeyConstraint(
            ["scheme_version_id"],
            ["scheme_versions.id"],
            name=op.f("fk_eligibility_rules_scheme_version_id_scheme_versions"),
            ondelete="CASCADE",
        ),
        source_fk("eligibility_rules"),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_eligibility_rules")),
        sa.UniqueConstraint(
            "scheme_version_id",
            "rule_key",
            name=op.f("uq_eligibility_rules_scheme_version_id_rule_key"),
        ),
    )
    op.create_table(
        "required_documents",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("scheme_version_id", sa.Uuid(), nullable=False),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("when_required", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column("source_id", sa.Uuid(), nullable=False),
        sa.ForeignKeyConstraint(
            ["scheme_version_id"],
            ["scheme_versions.id"],
            name=op.f("fk_required_documents_scheme_version_id_scheme_versions"),
            ondelete="CASCADE",
        ),
        source_fk("required_documents"),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_required_documents")),
        sa.UniqueConstraint(
            "scheme_version_id", "name", name=op.f("uq_required_documents_scheme_version_id_name")
        ),
    )
    op.create_table(
        "application_steps",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("scheme_version_id", sa.Uuid(), nullable=False),
        sa.Column("step_number", sa.Integer(), nullable=False),
        sa.Column("instruction", sa.Text(), nullable=False),
        sa.Column("official_url", sa.Text(), nullable=True),
        sa.Column("source_id", sa.Uuid(), nullable=False),
        sa.CheckConstraint(
            "step_number >= 1", name=op.f("ck_application_steps_positive_step_number")
        ),
        sa.ForeignKeyConstraint(
            ["scheme_version_id"],
            ["scheme_versions.id"],
            name=op.f("fk_application_steps_scheme_version_id_scheme_versions"),
            ondelete="CASCADE",
        ),
        source_fk("application_steps"),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_application_steps")),
        sa.UniqueConstraint(
            "scheme_version_id",
            "step_number",
            name=op.f("uq_application_steps_scheme_version_id_step_number"),
        ),
    )


def downgrade() -> None:
    for table_name in (
        "application_steps",
        "required_documents",
        "eligibility_rules",
        "match_results",
        "sources",
        "saved_schemes",
        "match_runs",
        "profile_facts",
        "scheme_versions",
        "admin_audit_log",
        "profile_sessions",
        "schemes",
    ):
        op.drop_table(table_name)
