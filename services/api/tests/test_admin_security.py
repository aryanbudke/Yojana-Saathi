"""Administrative role separation and official URL safety tests."""

from pathlib import Path
from uuid import UUID

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, func, select
from sqlalchemy.orm import Session
from sqlalchemy.pool import StaticPool

from app.core.config import Settings
from app.core.official_urls import OfficialUrlValidationError, validate_official_url
from app.db.base import Base
from app.db.enums import ReviewStatus
from app.db.models import AdminAuditLog, ApplicationStep, SchemeVersion, Source
from app.db.seed import load_seed_file, seed_database
from app.main import create_app
from app.services.curation import CurationValidationError, review_scheme_version

FIXTURE = Path(__file__).parent / "fixtures" / "minimal_seed.json"
VERSION_ID = UUID("51000000-0000-4000-8000-000000000001")
REVIEW_TOKEN = "review-secret-with-at-least-32-characters"
PUBLISH_TOKEN = "publish-secret-with-at-least-32-characters"


def test_placeholder_seed_is_blocked_without_explicit_test_override() -> None:
    engine = create_engine("sqlite+pysqlite:///:memory:")
    Base.metadata.create_all(engine)
    try:
        with (
            Session(engine) as session,
            pytest.raises(OfficialUrlValidationError, match="placeholder"),
        ):
            seed_database(session, load_seed_file(FIXTURE))
    finally:
        engine.dispose()


@pytest.mark.parametrize(
    "url",
    [
        "http://ministry.gov.in/scheme",
        "https://user:password@ministry.gov.in/scheme",
        "https://127.0.0.1/scheme",
        "https://scheme.example.test/apply",
    ],
)
def test_unsafe_official_urls_are_rejected(url: str) -> None:
    with pytest.raises(OfficialUrlValidationError):
        validate_official_url(url)


def test_curation_rejects_placeholder_source_even_after_test_seed() -> None:
    engine = create_engine("sqlite+pysqlite:///:memory:")
    Base.metadata.create_all(engine)
    try:
        with Session(engine) as session:
            seed_database(session, load_seed_file(FIXTURE), allow_test_urls=True)
            version = session.get(SchemeVersion, VERSION_ID)
            assert version is not None
            version.published_at = None
            version.review_status = ReviewStatus.DRAFT
            version.reviewed_by = None
            version.verified_at = None
            session.flush()

            with pytest.raises(CurationValidationError, match="placeholder"):
                review_scheme_version(session, VERSION_ID, reviewer="reviewer")
    finally:
        engine.dispose()


def test_admin_review_and_publish_require_separate_roles() -> None:
    engine = create_engine(
        "sqlite+pysqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(engine)
    with Session(engine) as session:
        seed_database(session, load_seed_file(FIXTURE), allow_test_urls=True)
        version = session.get(SchemeVersion, VERSION_ID)
        source = session.scalar(select(Source))
        step = session.scalar(select(ApplicationStep))
        assert version is not None and source is not None and step is not None
        version.published_at = None
        version.review_status = ReviewStatus.DRAFT
        version.reviewed_by = None
        version.verified_at = None
        source.official_url = "https://ministry.gov.in/schemes/test"
        step.official_url = "https://ministry.gov.in/schemes/test/apply"
        session.commit()
    settings = Settings(
        _env_file=None,
        APP_ENV="test",
        ALLOWED_ORIGINS="https://admin.example.test",
        DATABASE_URL="sqlite+pysqlite://",
        ADMIN_REVIEW_TOKEN=REVIEW_TOKEN,
        ADMIN_REVIEWER_ID="reviewer-1",
        ADMIN_PUBLISH_TOKEN=PUBLISH_TOKEN,
        ADMIN_PUBLISHER_ID="publisher-1",
    )
    with TestClient(create_app(settings, database_engine=engine)) as client:
        missing = client.post(f"/api/v1/admin/scheme-versions/{VERSION_ID}/review")
        reviewed = client.post(
            f"/api/v1/admin/scheme-versions/{VERSION_ID}/review",
            headers={"X-Admin-Token": REVIEW_TOKEN},
        )
        wrong_role = client.post(
            f"/api/v1/admin/scheme-versions/{VERSION_ID}/publish",
            headers={"X-Admin-Token": REVIEW_TOKEN},
        )
        published = client.post(
            f"/api/v1/admin/scheme-versions/{VERSION_ID}/publish",
            headers={"X-Admin-Token": PUBLISH_TOKEN},
        )

        assert missing.status_code == 403
        assert reviewed.status_code == 200
        assert reviewed.json()["action"] == "verify"
        assert wrong_role.status_code == 403
        assert published.status_code == 200
        assert published.json()["action"] == "publish"
        with Session(engine) as session:
            actors = list(
                session.scalars(select(AdminAuditLog.actor_id).order_by(AdminAuditLog.at))
            )
            count = session.scalar(select(func.count()).select_from(AdminAuditLog))
            assert actors == ["reviewer-1", "publisher-1"]
            assert count == 2
