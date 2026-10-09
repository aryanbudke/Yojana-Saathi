"""Developer 3 handoff tests for verified candidates and persisted match runs."""

from collections.abc import Generator
from datetime import UTC, datetime, timedelta
from pathlib import Path
from uuid import UUID, uuid4

import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import Session

from app.db.base import Base
from app.db.enums import Verdict
from app.db.models import ProfileSession
from app.db.seed import load_seed_file, seed_database
from app.repositories.matching import (
    MatchingRepository,
    MatchResultWrite,
    MatchRunNotFoundError,
)
from app.schemas.matching import RuleOutcome, RuleResult

FIXTURE = Path(__file__).parent / "fixtures" / "minimal_seed.json"
VERSION_ID = UUID("51000000-0000-4000-8000-000000000001")
SOURCE_ID = UUID("52000000-0000-4000-8000-000000000001")


@pytest.fixture
def repository() -> Generator[tuple[MatchingRepository, Session, UUID]]:
    engine = create_engine("sqlite+pysqlite:///:memory:")
    Base.metadata.create_all(engine)
    session = Session(engine)
    seed_database(session, load_seed_file(FIXTURE), allow_test_urls=True)
    session_id = uuid4()
    session.add(
        ProfileSession(
            id=session_id,
            created_at=datetime.now(UTC),
            expires_at=datetime.now(UTC) + timedelta(hours=1),
        )
    )
    session.commit()
    try:
        yield MatchingRepository(session), session, session_id
    finally:
        session.close()
        engine.dispose()


def _unknown_result(*, source_id: UUID = SOURCE_ID) -> MatchResultWrite:
    return MatchResultWrite(
        scheme_version_id=VERSION_ID,
        verdict=Verdict.NEEDS_INFORMATION,
        relevance_score=0.8,
        rule_results=(
            RuleOutcome(
                rule_key="adult",
                result=RuleResult.UNKNOWN,
                source_id=source_id,
                reason="Age is not confirmed.",
                required_field="age",
            ),
        ),
        missing_fields=("age", "age"),
    )


def test_candidates_contain_only_source_linked_public_rules(
    repository: tuple[MatchingRepository, Session, UUID],
) -> None:
    matching, _, _ = repository

    candidates = matching.list_candidates()

    assert len(candidates) == 1
    candidate = candidates[0]
    assert candidate.scheme_version_id == VERSION_ID
    assert candidate.rules[0].source_id == candidate.sources[0].id
    assert candidate.rules[0].question_template == "Are you at least 18 years old?"
    assert candidate.published_at is not None


def test_persisted_unknown_outcome_produces_reviewed_question_candidate(
    repository: tuple[MatchingRepository, Session, UUID],
) -> None:
    matching, session, session_id = repository
    run_id = matching.record_run(
        session_id=session_id,
        engine_version="rules-1.0.0",
        profile_hash="a" * 64,
        results=(_unknown_result(),),
    )
    session.commit()

    candidates = matching.question_candidates(session_id=session_id, run_id=run_id)

    assert len(candidates) == 1
    assert candidates[0].required_field == "age"
    assert candidates[0].question_template == "Are you at least 18 years old?"
    assert candidates[0].source_id == SOURCE_ID


def test_outcome_source_must_match_reviewed_rule(
    repository: tuple[MatchingRepository, Session, UUID],
) -> None:
    matching, session, session_id = repository

    with pytest.raises(ValueError, match="official source"):
        matching.record_run(
            session_id=session_id,
            engine_version="rules-1.0.0",
            profile_hash="b" * 64,
            results=(_unknown_result(source_id=uuid4()),),
        )
    session.rollback()


def test_question_run_must_belong_to_active_session(
    repository: tuple[MatchingRepository, Session, UUID],
) -> None:
    matching, session, session_id = repository
    other_session_id = uuid4()
    session.add(
        ProfileSession(
            id=other_session_id,
            created_at=datetime.now(UTC),
            expires_at=datetime.now(UTC) + timedelta(hours=1),
        )
    )
    run_id = matching.record_run(
        session_id=session_id,
        engine_version="rules-1.0.0",
        profile_hash="c" * 64,
        results=(_unknown_result(),),
    )
    session.commit()

    with pytest.raises(MatchRunNotFoundError):
        matching.question_candidates(session_id=other_session_id, run_id=run_id)
