"""Published-version immutability and provenance safety tests."""

from pathlib import Path
from uuid import UUID

import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import Session

from app.db.base import Base
from app.db.enums import ReviewStatus
from app.db.models import SchemeVersion
from app.db.seed import load_seed_file, seed_database
from app.services.curation import (
    PublishedVersionImmutableError,
    SchemeVersionNotFoundError,
    ensure_version_is_mutable,
)

FIXTURE = Path(__file__).parent / "fixtures" / "minimal_seed.json"


def test_application_guard_rejects_published_version() -> None:
    engine = create_engine("sqlite+pysqlite:///:memory:")
    Base.metadata.create_all(engine)
    try:
        with Session(engine) as session:
            seed_database(session, load_seed_file(FIXTURE), allow_test_urls=True)
            session.commit()

            with pytest.raises(PublishedVersionImmutableError):
                ensure_version_is_mutable(session, UUID("51000000-0000-4000-8000-000000000001"))
    finally:
        engine.dispose()


def test_application_guard_allows_draft_version() -> None:
    engine = create_engine("sqlite+pysqlite:///:memory:")
    Base.metadata.create_all(engine)
    try:
        with Session(engine) as session:
            seed_database(session, load_seed_file(FIXTURE), allow_test_urls=True)
            draft_id = UUID("51000000-0000-4000-8000-000000000002")
            session.add(
                SchemeVersion(
                    id=draft_id,
                    scheme_id=UUID("50000000-0000-4000-8000-000000000001"),
                    version=2,
                    summary="Draft version",
                    benefit_text="Draft benefit",
                    eligibility_json={"schema_version": "1.0", "all": []},
                    review_status=ReviewStatus.DRAFT,
                )
            )
            session.commit()

            assert ensure_version_is_mutable(session, draft_id).id == draft_id
    finally:
        engine.dispose()


def test_application_guard_rejects_missing_version() -> None:
    engine = create_engine("sqlite+pysqlite:///:memory:")
    Base.metadata.create_all(engine)
    try:
        with Session(engine) as session, pytest.raises(SchemeVersionNotFoundError):
            ensure_version_is_mutable(session, UUID("51000000-0000-4000-8000-000000000099"))
    finally:
        engine.dispose()


def test_postgresql_migration_installs_all_immutability_triggers() -> None:
    migration = (
        Path(__file__).parents[1]
        / "migrations"
        / "versions"
        / "20261009_0003_immutable_versions.py"
    ).read_text()

    assert "trg_scheme_versions_immutable" in migration
    for table_name in (
        "sources",
        "eligibility_rules",
        "required_documents",
        "application_steps",
    ):
        assert f'"{table_name}"' in migration
    assert "trg_{table_name}_published_version_immutable" in migration
