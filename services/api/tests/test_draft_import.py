"""Unverified candidate import safety tests."""

import csv
import io
import json
import zipfile
from collections.abc import Generator
from pathlib import Path

import pytest
from sqlalchemy import create_engine, func, select
from sqlalchemy.orm import Session

from app.cli import import_drafts as import_drafts_cli
from app.db.base import Base
from app.db.draft_import import (
    DEFAULT_MEMBER,
    DraftImportValidationError,
    import_draft_candidates,
    load_sarkarseva_drafts,
)
from app.db.enums import ReviewStatus, SchemeStatus
from app.db.models import Scheme, SchemeVersion, Source
from app.repositories.schemes import published_schemes_statement


@pytest.fixture
def session() -> Generator[Session]:
    engine = create_engine("sqlite+pysqlite:///:memory:")
    Base.metadata.create_all(engine)
    try:
        with Session(engine) as database_session:
            yield database_session
    finally:
        engine.dispose()


def _write_archive(path: Path, *, verification_status: str = "unverified") -> None:
    output = io.StringIO(newline="")
    columns = [
        "scheme_name",
        "slug",
        "details",
        "benefits",
        "eligibility",
        "application",
        "documents",
        "level",
        "schemeCategory",
        "tags",
        "official_url",
        "last_verified",
        "verification_status",
    ]
    writer = csv.DictWriter(output, fieldnames=columns)
    writer.writeheader()
    writer.writerow(
        {
            "scheme_name": "Candidate Scheme",
            "slug": "candidate-scheme",
            "details": "Unverified candidate summary.",
            "benefits": "Unverified candidate benefit.",
            "eligibility": "Applicant may be eligible.",
            "application": "Unverified application notes.",
            "documents": "Unverified document notes.",
            "level": "Central",
            "schemeCategory": "Education & Learning, Skills",
            "tags": "Student, Training",
            "official_url": "",
            "last_verified": "",
            "verification_status": verification_status,
        }
    )
    with zipfile.ZipFile(path, "w") as archive:
        archive.writestr(DEFAULT_MEMBER, output.getvalue())


def test_import_is_idempotent_and_keeps_candidates_private(
    tmp_path: Path, session: Session
) -> None:
    archive_path = tmp_path / "candidates.zip"
    _write_archive(archive_path)
    candidates = load_sarkarseva_drafts(archive_path, expected_count=1)

    first = import_draft_candidates(session, candidates)
    session.commit()
    second = import_draft_candidates(session, candidates)
    session.commit()

    assert first.inserted == 1
    assert second.inserted == 0
    assert second.skipped == 1
    assert session.scalar(select(func.count()).select_from(Scheme)) == 1
    assert session.scalar(select(func.count()).select_from(SchemeVersion)) == 1
    assert session.scalar(select(func.count()).select_from(Source)) == 0
    assert session.scalar(select(Scheme.status)) == SchemeStatus.UNKNOWN
    assert session.scalar(select(SchemeVersion.review_status)) == ReviewStatus.DRAFT
    assert session.scalar(select(SchemeVersion.published_at)) is None
    assert session.execute(published_schemes_statement()).all() == []


def test_import_rejects_records_not_explicitly_unverified(tmp_path: Path) -> None:
    archive_path = tmp_path / "candidates.zip"
    _write_archive(archive_path, verification_status="verified")

    with pytest.raises(DraftImportValidationError, match="not explicitly unverified"):
        load_sarkarseva_drafts(archive_path)


def test_cli_validates_without_database_write(
    tmp_path: Path, capsys: pytest.CaptureFixture[str]
) -> None:
    archive_path = tmp_path / "candidates.zip"
    _write_archive(archive_path)

    exit_code = import_drafts_cli.main([str(archive_path), "--expected-count", "1"])

    assert exit_code == 0
    assert json.loads(capsys.readouterr().out) == {"parsed": 1, "write": False}


def test_cli_write_imports_candidates(
    tmp_path: Path,
    capsys: pytest.CaptureFixture[str],
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    archive_path = tmp_path / "candidates.zip"
    database_path = tmp_path / "drafts.sqlite3"
    _write_archive(archive_path)
    engine = create_engine(f"sqlite+pysqlite:///{database_path}")
    Base.metadata.create_all(engine)
    monkeypatch.setattr(import_drafts_cli, "create_database_engine", lambda: engine)

    exit_code = import_drafts_cli.main([str(archive_path), "--expected-count", "1", "--write"])

    assert exit_code == 0
    assert json.loads(capsys.readouterr().out) == {
        "inserted": 1,
        "parsed": 1,
        "skipped": 0,
        "write": True,
    }
    verification_engine = create_engine(f"sqlite+pysqlite:///{database_path}")
    try:
        with Session(verification_engine) as verification_session:
            assert verification_session.scalar(select(func.count()).select_from(Scheme)) == 1
    finally:
        verification_engine.dispose()
