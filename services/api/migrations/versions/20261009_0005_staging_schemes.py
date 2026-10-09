"""Store unverified notebook records with embeddings for curator search.

Revision ID: 20261009_0005
Revises: 20261009_0004
Create Date: 2026-10-09
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op
from pgvector.sqlalchemy import Vector
from sqlalchemy.dialects import postgresql

revision: str = "20261009_0005"
down_revision: str | None = "20261009_0004"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.execute("CREATE EXTENSION IF NOT EXISTS vector")
    # ponytail: exact scan is fine for a few thousand rows; add an HNSW index if this grows.
    op.create_table(
        "staging_schemes",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("slug", sa.String(length=255), nullable=False),
        sa.Column("name", sa.Text(), nullable=False),
        sa.Column("record", postgresql.JSONB(), nullable=False),
        sa.Column("missing_fields", postgresql.JSONB(), nullable=False),
        sa.Column("input_sha256", sa.String(length=64), nullable=False),
        sa.Column("embedding", Vector(768), nullable=False),
        sa.Column("imported_at", sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_staging_schemes")),
        sa.UniqueConstraint("slug", name=op.f("uq_staging_schemes_slug")),
    )
    # Match 0004: no Supabase anon/authenticated access; the backend role bypasses RLS.
    op.execute('ALTER TABLE "staging_schemes" ENABLE ROW LEVEL SECURITY;')


def downgrade() -> None:
    op.drop_table("staging_schemes")
