"""Enable row-level security for Supabase-exposed application tables.

Revision ID: 20261009_0004
Revises: 20261009_0003
Create Date: 2026-10-09
"""

from collections.abc import Sequence

from alembic import op

revision: str = "20261009_0004"
down_revision: str | None = "20261009_0003"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None

APPLICATION_TABLES = (
    "schemes",
    "scheme_versions",
    "sources",
    "eligibility_rules",
    "required_documents",
    "application_steps",
    "profile_sessions",
    "profile_facts",
    "match_runs",
    "match_results",
    "saved_schemes",
    "admin_audit_log",
)


def upgrade() -> None:
    for table_name in APPLICATION_TABLES:
        op.execute(f'ALTER TABLE "{table_name}" ENABLE ROW LEVEL SECURITY;')


def downgrade() -> None:
    for table_name in reversed(APPLICATION_TABLES):
        op.execute(f'ALTER TABLE "{table_name}" DISABLE ROW LEVEL SECURITY;')
