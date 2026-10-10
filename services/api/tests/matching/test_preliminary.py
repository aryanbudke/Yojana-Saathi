"""Direct dataset-query and conservative normalization tests."""

from datetime import UTC, datetime
from uuid import uuid4

from sqlalchemy import create_engine
from sqlalchemy.orm import Session

from app.db.base import Base
from app.db.enums import GovernmentLevel, ReviewStatus, SchemeStatus
from app.db.models import Scheme, SchemeVersion
from app.modules.matching.preliminary import normalize_eligibility_text
from app.repositories.preliminary_schemes import PreliminarySchemeRepository


def _draft(session: Session, *, name: str, category: str, tags: list[str]) -> None:
    scheme = Scheme(
        slug=name.casefold().replace(" ", "-"),
        name=name,
        government_level=GovernmentLevel.CENTRAL,
        state_code=None,
        category=category,
        status=SchemeStatus.UNKNOWN,
    )
    session.add(scheme)
    session.flush()
    session.add(
        SchemeVersion(
            scheme_id=scheme.id,
            version=1,
            summary=f"Support for {category}",
            benefit_text="Financial assistance",
            eligibility_json={
                "schema_version": "candidate-import-v1",
                "unverified": True,
                "raw_eligibility_text": f"Applicant must be a {tags[0]}.",
                "raw_application_text": "Apply through the relevant office.",
                "raw_documents_text": "Identity and income records may be requested.",
                "raw_categories": [category],
                "raw_tags": tags,
            },
            verified_at=None,
            reviewed_by=None,
            review_status=ReviewStatus.DRAFT,
            published_at=None,
            created_at=datetime.now(UTC),
        )
    )


def test_direct_sql_query_filters_imported_drafts_without_vectors() -> None:
    engine = create_engine("sqlite+pysqlite:///:memory:")
    Base.metadata.create_all(engine)
    try:
        with Session(engine) as session:
            _draft(session, name="Student Scholarship", category="Education", tags=["student"])
            _draft(session, name="Farmer Support", category="Agriculture", tags=["farmer"])
            session.commit()

            results = PreliminarySchemeRepository(session).list_candidates(
                search_terms={"student", "education"}
            )

            assert [candidate.name for candidate in results] == ["Student Scholarship"]
            assert results[0].tags == ("student",)
            assert results[0].application_text.startswith("Apply")
    finally:
        engine.dispose()


def test_query_excludes_non_imported_drafts() -> None:
    engine = create_engine("sqlite+pysqlite:///:memory:")
    Base.metadata.create_all(engine)
    try:
        with Session(engine) as session:
            scheme = Scheme(
                slug="curated-draft",
                name="Curated Draft",
                government_level=GovernmentLevel.CENTRAL,
                category="Education",
                status=SchemeStatus.UNKNOWN,
            )
            session.add(scheme)
            session.flush()
            session.add(
                SchemeVersion(
                    scheme_id=scheme.id,
                    version=1,
                    summary="Curated separately",
                    benefit_text="Draft",
                    eligibility_json={"schema_version": "1.0", "all": []},
                    review_status=ReviewStatus.DRAFT,
                )
            )
            session.commit()

            assert PreliminarySchemeRepository(session).list_candidates() == []
    finally:
        engine.dispose()


def test_normalizer_only_proposes_narrow_rules_and_flags_other_text() -> None:
    normalized = normalize_eligibility_text(
        "Age must be between 18 and 35. Annual family income must not exceed "
        "Rs. 2.5 lakh. Applicant must be a student. Selection follows local guidelines."
    )

    assert [(rule.field, rule.op, rule.value) for rule in normalized.proposed_rules] == [
        ("age", "gte", 18),
        ("age", "lte", 35),
        ("family_income_inr", "lte", 250000),
        ("occupation", "eq", "student"),
    ]
    assert all(rule.verified is False for rule in normalized.proposed_rules)
    assert normalized.uncertain_fragments == ("Selection follows local guidelines.",)
    assert normalized.requires_verification is True


def test_normalizer_does_not_invent_rules_from_keywords() -> None:
    marker = str(uuid4())
    normalized = normalize_eligibility_text(
        f"Support may be available for farmers subject to policy {marker}."
    )

    assert normalized.proposed_rules == ()
    assert normalized.uncertain_fragments == (
        f"Support may be available for farmers subject to policy {marker}.",
    )
