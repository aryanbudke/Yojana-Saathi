"""Add indexes for public discovery, version lookup, and expiry cleanup.

Revision ID: 20261009_0002
Revises: 20261009_0001
Create Date: 2026-10-09
"""

from collections.abc import Sequence

from alembic import op

revision: str = "20261009_0002"
down_revision: str | None = "20261009_0001"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_index(
        "ix_schemes_status_state_code_category",
        "schemes",
        ["status", "state_code", "category"],
        unique=False,
    )
    op.create_index(
        "ix_scheme_versions_scheme_id_review_status_published_at",
        "scheme_versions",
        ["scheme_id", "review_status", "published_at"],
        unique=False,
    )
    op.create_index(
        "ix_eligibility_rules_scheme_version_id",
        "eligibility_rules",
        ["scheme_version_id"],
        unique=False,
    )
    op.create_index(
        "ix_profile_sessions_expires_at",
        "profile_sessions",
        ["expires_at"],
        unique=False,
    )


def downgrade() -> None:
    op.drop_index("ix_profile_sessions_expires_at", table_name="profile_sessions")
    op.drop_index("ix_eligibility_rules_scheme_version_id", table_name="eligibility_rules")
    op.drop_index(
        "ix_scheme_versions_scheme_id_review_status_published_at",
        table_name="scheme_versions",
    )
    op.drop_index("ix_schemes_status_state_code_category", table_name="schemes")
