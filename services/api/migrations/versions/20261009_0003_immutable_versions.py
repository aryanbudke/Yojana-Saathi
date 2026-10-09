"""Protect published versions and their source-backed child records.

Revision ID: 20261009_0003
Revises: 20261009_0002
Create Date: 2026-10-09
"""

from collections.abc import Sequence

from alembic import op

revision: str = "20261009_0003"
down_revision: str | None = "20261009_0002"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None

CHILD_TABLES = (
    "sources",
    "eligibility_rules",
    "required_documents",
    "application_steps",
)


def upgrade() -> None:
    op.execute(
        """
        CREATE FUNCTION reject_published_version_mutation()
        RETURNS trigger AS $$
        BEGIN
            IF OLD.published_at IS NOT NULL THEN
                RAISE EXCEPTION 'published scheme version % is immutable', OLD.id
                    USING ERRCODE = '55000';
            END IF;
            IF TG_OP = 'DELETE' THEN
                RETURN OLD;
            END IF;
            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;
        """
    )
    op.execute(
        """
        CREATE TRIGGER trg_scheme_versions_immutable
        BEFORE UPDATE OR DELETE ON scheme_versions
        FOR EACH ROW EXECUTE FUNCTION reject_published_version_mutation();
        """
    )
    op.execute(
        """
        CREATE FUNCTION reject_published_version_child_mutation()
        RETURNS trigger AS $$
        DECLARE
            old_version uuid;
            new_version uuid;
        BEGIN
            IF TG_OP <> 'INSERT' THEN
                old_version := OLD.scheme_version_id;
            END IF;
            IF TG_OP <> 'DELETE' THEN
                new_version := NEW.scheme_version_id;
            END IF;
            IF EXISTS (
                SELECT 1
                FROM scheme_versions
                WHERE id IN (old_version, new_version)
                  AND published_at IS NOT NULL
            ) THEN
                RAISE EXCEPTION 'records of a published scheme version are immutable'
                    USING ERRCODE = '55000';
            END IF;
            IF TG_OP = 'DELETE' THEN
                RETURN OLD;
            END IF;
            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;
        """
    )
    for table_name in CHILD_TABLES:
        op.execute(
            f"""
            CREATE TRIGGER trg_{table_name}_published_version_immutable
            BEFORE INSERT OR UPDATE OR DELETE ON {table_name}
            FOR EACH ROW EXECUTE FUNCTION reject_published_version_child_mutation();
            """
        )


def downgrade() -> None:
    for table_name in reversed(CHILD_TABLES):
        op.execute(f"DROP TRIGGER trg_{table_name}_published_version_immutable ON {table_name};")
    op.execute("DROP FUNCTION reject_published_version_child_mutation();")
    op.execute("DROP TRIGGER trg_scheme_versions_immutable ON scheme_versions;")
    op.execute("DROP FUNCTION reject_published_version_mutation();")
