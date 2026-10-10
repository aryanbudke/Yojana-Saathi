"""Verified matching candidates and deterministic run-persistence boundaries."""

from dataclasses import dataclass
from datetime import UTC, datetime
from typing import Any, Protocol
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.enums import GovernmentLevel, ReviewStatus, RuleSeverity, Verdict
from app.db.models import EligibilityRule, MatchResult, MatchRun
from app.repositories.schemes import published_schemes_statement, sources_for_versions
from app.schemas.matching import RuleOutcome, RuleResult
from app.services.profiles import require_active_session


@dataclass(frozen=True)
class CandidateSource:
    id: UUID
    official_url: str
    title: str


@dataclass(frozen=True)
class CandidateRule:
    rule_key: str
    expression: dict[str, Any]
    severity: RuleSeverity
    source_id: UUID
    question_template: str | None


@dataclass(frozen=True)
class CandidateScheme:
    scheme_id: UUID
    scheme_name: str
    scheme_version_id: UUID
    eligibility_json: dict[str, Any]
    review_status: ReviewStatus
    published_at: datetime
    verified_at: datetime
    sources: tuple[CandidateSource, ...]
    rules: tuple[CandidateRule, ...]
    slug: str = ""
    government_level: GovernmentLevel = GovernmentLevel.CENTRAL
    state_code: str | None = None
    category: str = ""
    summary: str = ""
    benefit_text: str = ""


@dataclass(frozen=True)
class MatchResultWrite:
    scheme_version_id: UUID
    verdict: Verdict
    relevance_score: float
    rule_results: tuple[RuleOutcome, ...]
    missing_fields: tuple[str, ...]


@dataclass(frozen=True)
class QuestionRuleCandidate:
    scheme_version_id: UUID
    rule_key: str
    required_field: str
    question_template: str
    source_id: UUID


class CandidateRepository(Protocol):
    """Interface consumed by the deterministic rule engine."""

    def list_candidates(self) -> list[CandidateScheme]: ...


class MatchRunRepository(Protocol):
    """Interface for auditable outcomes and follow-up-question inputs."""

    def record_run(
        self,
        *,
        session_id: UUID,
        engine_version: str,
        profile_hash: str,
        results: tuple[MatchResultWrite, ...],
    ) -> UUID: ...

    def question_candidates(
        self, *, session_id: UUID, run_id: UUID
    ) -> list[QuestionRuleCandidate]: ...


class MatchingRepository(CandidateRepository, MatchRunRepository):
    """SQLAlchemy implementation enforcing publication and source boundaries."""

    def __init__(self, session: Session) -> None:
        self.session = session

    def list_candidates(self) -> list[CandidateScheme]:
        rows = list(self.session.execute(published_schemes_statement()))
        version_ids = [row[1].id for row in rows]
        source_map = sources_for_versions(self.session, version_ids)
        rule_map: dict[UUID, list[EligibilityRule]] = {version_id: [] for version_id in version_ids}
        if version_ids:
            fetched_rules = self.session.scalars(
                select(EligibilityRule)
                .where(EligibilityRule.scheme_version_id.in_(version_ids))
                .order_by(EligibilityRule.scheme_version_id, EligibilityRule.rule_key)
            )
            for rule in fetched_rules:
                rule_map[rule.scheme_version_id].append(rule)

        candidates: list[CandidateScheme] = []
        for scheme, version in rows:
            if version.published_at is None or version.verified_at is None:
                continue
            sources = source_map[version.id]
            source_ids = {source.id for source in sources}
            candidate_rules = rule_map[version.id]
            if not candidate_rules or any(
                rule.source_id not in source_ids for rule in candidate_rules
            ):
                continue
            candidates.append(
                CandidateScheme(
                    scheme_id=scheme.id,
                    scheme_name=scheme.name,
                    scheme_version_id=version.id,
                    eligibility_json=version.eligibility_json,
                    review_status=version.review_status,
                    published_at=version.published_at,
                    verified_at=version.verified_at,
                    sources=tuple(
                        CandidateSource(
                            id=source.id,
                            official_url=source.official_url,
                            title=source.title,
                        )
                        for source in sources
                    ),
                    rules=tuple(
                        CandidateRule(
                            rule_key=rule.rule_key,
                            expression=rule.expression,
                            severity=rule.severity,
                            source_id=rule.source_id,
                            question_template=rule.question_template,
                        )
                        for rule in candidate_rules
                    ),
                    slug=scheme.slug,
                    government_level=scheme.government_level,
                    state_code=scheme.state_code,
                    category=scheme.category,
                    summary=version.summary,
                    benefit_text=version.benefit_text,
                )
            )
        return candidates

    def record_run(
        self,
        *,
        session_id: UUID,
        engine_version: str,
        profile_hash: str,
        results: tuple[MatchResultWrite, ...],
    ) -> UUID:
        require_active_session(self.session, session_id)
        if not engine_version.strip() or len(engine_version) > 80:
            raise ValueError("engine_version must contain 1 to 80 characters.")
        if len(profile_hash) != 64 or any(
            character not in "0123456789abcdef" for character in profile_hash.lower()
        ):
            raise ValueError("profile_hash must be a 64-character hexadecimal digest.")
        candidates = {
            candidate.scheme_version_id: candidate for candidate in self.list_candidates()
        }
        if len({result.scheme_version_id for result in results}) != len(results):
            raise ValueError("Match results must contain unique scheme versions.")
        for result in results:
            if not 0 <= result.relevance_score <= 1:
                raise ValueError("relevance_score must be between 0 and 1.")
            candidate = candidates.get(result.scheme_version_id)
            if candidate is None:
                raise ValueError("Match result references a non-public scheme version.")
            self._validate_rule_outcomes(candidate, result.rule_results)
        run = MatchRun(
            session_id=session_id,
            run_at=datetime.now(UTC),
            engine_version=engine_version.strip(),
            profile_hash=profile_hash.lower(),
        )
        self.session.add(run)
        self.session.flush()
        for result in results:
            self.session.add(
                MatchResult(
                    run_id=run.id,
                    scheme_version_id=result.scheme_version_id,
                    verdict=result.verdict,
                    relevance_score=result.relevance_score,
                    rule_results=[
                        outcome.model_dump(mode="json") for outcome in result.rule_results
                    ],
                    missing_fields=list(dict.fromkeys(result.missing_fields)),
                )
            )
        self.session.flush()
        return run.id

    def question_candidates(self, *, session_id: UUID, run_id: UUID) -> list[QuestionRuleCandidate]:
        require_active_session(self.session, session_id)
        run = self.session.get(MatchRun, run_id)
        if run is None or run.session_id != session_id:
            raise MatchRunNotFoundError("Match run not found for profile session.")
        results = list(
            self.session.scalars(
                select(MatchResult)
                .where(MatchResult.run_id == run_id)
                .order_by(MatchResult.relevance_score.desc(), MatchResult.scheme_version_id)
            )
        )
        rules = list(
            self.session.scalars(
                select(EligibilityRule).where(
                    EligibilityRule.scheme_version_id.in_(
                        [result.scheme_version_id for result in results]
                    )
                )
            )
        )
        rule_index = {(rule.scheme_version_id, rule.rule_key): rule for rule in rules}
        candidates: list[QuestionRuleCandidate] = []
        seen_fields: set[str] = set()
        for result in results:
            for raw_outcome in result.rule_results:
                outcome = RuleOutcome.model_validate(raw_outcome)
                if (
                    outcome.result != RuleResult.UNKNOWN
                    or outcome.required_field is None
                    or outcome.required_field in seen_fields
                ):
                    continue
                rule = rule_index.get((result.scheme_version_id, outcome.rule_key))
                if rule is None or rule.question_template is None:
                    continue
                seen_fields.add(outcome.required_field)
                candidates.append(
                    QuestionRuleCandidate(
                        scheme_version_id=result.scheme_version_id,
                        rule_key=rule.rule_key,
                        required_field=outcome.required_field,
                        question_template=rule.question_template,
                        source_id=rule.source_id,
                    )
                )
        return candidates

    @staticmethod
    def _validate_rule_outcomes(
        candidate: CandidateScheme, outcomes: tuple[RuleOutcome, ...]
    ) -> None:
        source_by_rule = {rule.rule_key: rule.source_id for rule in candidate.rules}
        for outcome in outcomes:
            if source_by_rule.get(outcome.rule_key) != outcome.source_id:
                raise ValueError(
                    "Rule outcome must reference a reviewed rule and its official source."
                )


class MatchRunNotFoundError(LookupError):
    """Raised when question selection references another or absent session run."""
