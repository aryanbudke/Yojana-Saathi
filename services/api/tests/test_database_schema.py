"""Model and migration metadata tests."""

from pathlib import Path

from sqlalchemy import Enum as SqlEnum
from sqlalchemy import ForeignKeyConstraint, UniqueConstraint

from app.db.base import Base
from app.db.models import EligibilityRule, RequiredDocument, Source

EXPECTED_TABLES = {
    "admin_audit_log",
    "application_steps",
    "eligibility_rules",
    "match_results",
    "match_runs",
    "profile_facts",
    "profile_sessions",
    "required_documents",
    "saved_schemes",
    "scheme_versions",
    "schemes",
    "sources",
    "staging_schemes",
}


def test_all_specified_tables_are_registered() -> None:
    assert set(Base.metadata.tables) == EXPECTED_TABLES


def test_source_has_composite_identity_for_provenance_constraints() -> None:
    table = Base.metadata.tables[Source.__tablename__]
    constraints = {
        tuple(column.name for column in constraint.columns)
        for constraint in table.constraints
        if isinstance(constraint, UniqueConstraint)
    }

    assert ("id", "scheme_version_id") in constraints


def test_source_backed_records_enforce_same_version_source() -> None:
    for model in (EligibilityRule, RequiredDocument):
        table = Base.metadata.tables[model.__tablename__]
        composite_foreign_keys = [
            constraint
            for constraint in table.constraints
            if isinstance(constraint, ForeignKeyConstraint)
            and tuple(column.name for column in constraint.columns)
            == ("source_id", "scheme_version_id")
        ]
        assert len(composite_foreign_keys) == 1


def test_initial_migration_exists() -> None:
    migration = (
        Path(__file__).parents[1] / "migrations" / "versions" / "20261009_0001_initial_schema.py"
    )

    assert migration.is_file()
    assert 'revision: str = "20261009_0001"' in migration.read_text()


def test_enums_persist_public_lowercase_values() -> None:
    government_level = Base.metadata.tables["schemes"].c.government_level.type
    verdict = Base.metadata.tables["match_results"].c.verdict.type

    assert isinstance(government_level, SqlEnum)
    assert isinstance(verdict, SqlEnum)
    assert government_level.enums == ["central", "state"]
    assert verdict.enums == [
        "all_checked_conditions_met",
        "needs_information",
        "not_eligible",
        "manual_review",
    ]
