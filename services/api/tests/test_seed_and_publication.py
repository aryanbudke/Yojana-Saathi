"""Seed loader and public publication-boundary integration tests."""

import json
from collections.abc import Generator
from pathlib import Path
from uuid import UUID

import pytest
from pydantic import ValidationError
from sqlalchemy import create_engine, select
from sqlalchemy.orm import Session

from app.db.base import Base
from app.db.enums import ReviewStatus, SchemeStatus
from app.db.models import Scheme, SchemeVersion
from app.db.seed import SeedConflictError, load_seed_file, seed_database
from app.repositories.schemes import published_schemes_statement
from app.schemas.seed import SeedBundle

FIXTURE = Path(__file__).parent / "fixtures" / "minimal_seed.json"


@pytest.fixture
def session() -> Generator[Session]:
    engine = create_engine("sqlite+pysqlite:///:memory:")
    Base.metadata.create_all(engine)
    try:
        with Session(engine) as database_session:
            yield database_session
    finally:
        engine.dispose()


def test_seed_file_inserts_source_backed_record(session: Session) -> None:
    bundle = load_seed_file(FIXTURE)

    inserted = seed_database(session, bundle)
    session.commit()

    assert inserted == 1
    assert session.scalar(select(Scheme.slug)) == "test-only-seed-scheme"
    assert session.scalar(select(SchemeVersion.review_status)) == ReviewStatus.VERIFIED


def test_seed_conflict_does_not_silently_overwrite(session: Session) -> None:
    bundle = load_seed_file(FIXTURE)
    seed_database(session, bundle)
    session.commit()

    with pytest.raises(SeedConflictError, match="scheme slug already exists"):
        seed_database(session, bundle)


def test_seed_validation_rejects_missing_provenance() -> None:
    payload = json.loads(FIXTURE.read_text())
    payload["schemes"][0]["rules"][0]["source_id"] = "52000000-0000-4000-8000-000000000099"

    with pytest.raises(ValidationError, match="unknown source IDs"):
        SeedBundle.model_validate(payload)


def test_public_query_returns_latest_published_version_only(session: Session) -> None:
    bundle = load_seed_file(FIXTURE)
    seed_database(session, bundle)
    session.add(
        SchemeVersion(
            id=UUID("51000000-0000-4000-8000-000000000002"),
            scheme_id=UUID("50000000-0000-4000-8000-000000000001"),
            version=2,
            summary="Unpublished draft must stay private.",
            benefit_text="Draft",
            eligibility_json={"schema_version": "1.0", "all": []},
            review_status=ReviewStatus.DRAFT,
            published_at=None,
        )
    )
    session.commit()

    rows = session.execute(published_schemes_statement()).all()

    assert len(rows) == 1
    assert rows[0].SchemeVersion.version == 1


def test_public_query_hides_closed_scheme(session: Session) -> None:
    seed_database(session, load_seed_file(FIXTURE))
    scheme = session.scalar(select(Scheme))
    assert scheme is not None
    scheme.status = SchemeStatus.CLOSED
    session.commit()

    assert session.execute(published_schemes_statement()).all() == []


def test_required_query_indexes_exist_in_metadata() -> None:
    expected = {
        "schemes": {"ix_schemes_status_state_code_category"},
        "scheme_versions": {"ix_scheme_versions_scheme_id_review_status_published_at"},
        "eligibility_rules": {"ix_eligibility_rules_scheme_version_id"},
        "profile_sessions": {"ix_profile_sessions_expires_at"},
    }

    for table_name, index_names in expected.items():
        actual = {index.name for index in Base.metadata.tables[table_name].indexes}
        assert index_names <= actual
