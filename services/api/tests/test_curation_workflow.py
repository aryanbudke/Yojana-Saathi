"""Review/publish workflow and administrative CLI tests."""

from datetime import UTC, datetime
from pathlib import Path
from uuid import UUID

import pytest
from sqlalchemy import create_engine, delete, func, select
from sqlalchemy.orm import Session

from app.cli.curation import build_parser, main
from app.db.base import Base
from app.db.enums import ReviewStatus
from app.db.models import AdminAuditLog, EligibilityRule, SchemeVersion
from app.db.seed import load_seed_file, seed_database
from app.services.curation import (
    CurationValidationError,
    InvalidReviewTransitionError,
    publish_scheme_version,
    review_scheme_version,
)

FIXTURE = Path(__file__).parent / "fixtures" / "minimal_seed.json"
VERSION_ID = UUID("51000000-0000-4000-8000-000000000001")


def _make_draft(session: Session) -> SchemeVersion:
    seed_database(session, load_seed_file(FIXTURE))
    published = session.get(SchemeVersion, VERSION_ID)
    assert published is not None
    published.published_at = None
    published.review_status = ReviewStatus.DRAFT
    published.reviewed_by = None
    published.verified_at = None
    session.flush()
    return published


def test_review_then_publish_records_audited_transition() -> None:
    engine = create_engine("sqlite+pysqlite:///:memory:")
    Base.metadata.create_all(engine)
    reviewed_at = datetime(2026, 10, 9, 8, 0, tzinfo=UTC)
    published_at = datetime(2026, 10, 9, 9, 0, tzinfo=UTC)
    try:
        with Session(engine) as session:
            version = _make_draft(session)

            review_report = review_scheme_version(
                session, version.id, reviewer="reviewer@example.test", now=reviewed_at
            )
            publish_report = publish_scheme_version(
                session, version.id, actor="publisher@example.test", now=published_at
            )
            session.commit()

            assert review_report.source_count == 1
            assert publish_report.rule_count == 1
            assert version.review_status == ReviewStatus.VERIFIED
            assert version.reviewed_by == "reviewer@example.test"
            assert version.published_at is not None
            assert version.published_at.replace(tzinfo=UTC) == published_at
            assert session.scalar(select(func.count()).select_from(AdminAuditLog)) == 2
    finally:
        engine.dispose()


def test_publish_rejects_unreviewed_draft() -> None:
    engine = create_engine("sqlite+pysqlite:///:memory:")
    Base.metadata.create_all(engine)
    try:
        with Session(engine) as session:
            version = _make_draft(session)

            with pytest.raises(InvalidReviewTransitionError):
                publish_scheme_version(session, version.id, actor="publisher")
    finally:
        engine.dispose()


def test_review_requires_source_backed_rule() -> None:
    engine = create_engine("sqlite+pysqlite:///:memory:")
    Base.metadata.create_all(engine)
    try:
        with Session(engine) as session:
            version = _make_draft(session)
            session.execute(
                delete(EligibilityRule).where(EligibilityRule.scheme_version_id == version.id)
            )
            session.flush()

            with pytest.raises(CurationValidationError, match="eligibility rule"):
                review_scheme_version(session, version.id, reviewer="reviewer")
    finally:
        engine.dispose()


def test_cli_validate_reports_scheme_count(capsys: pytest.CaptureFixture[str]) -> None:
    assert main(["validate", str(FIXTURE)]) == 0

    assert capsys.readouterr().out.strip() == '{"valid": true, "schemes": 1}'


def test_cli_requires_actor_for_review_and_publish() -> None:
    parser = build_parser()

    with pytest.raises(SystemExit):
        parser.parse_args(["review", str(VERSION_ID)])
