# Developer 2 Progress

This log tracks `tasks/task-two.md` in strict dependency order. A task advances
only after its acceptance checks pass and its work is committed.

| ID | Task | Status |
|---|---|---|
| T2-01 | FastAPI skeleton, configuration, health, CORS, error contract | COMPLETED |
| T2-02 | PostgreSQL models and Alembic migrations | COMPLETED |
| T2-03 | Stable API DTOs and public frontend fixtures | COMPLETED |
| T2-04 | Database indexes, publication filters, test seeding | COMPLETED |
| T2-05 | Select and document 10–15 high-confidence schemes | BLOCKED |
| T2-06 | Curate official source data, eligibility, and exclusions | BLOCKED |
| T2-07 | Normalize codes, units, rule JSON, and conditional documents | BLOCKED |
| T2-08 | Enforce source linkage and immutable published versions | COMPLETED |
| T2-09 | Peer review records and provide synthetic fixtures | BLOCKED |
| T2-10 | CLI seed and review/publish controls | COMPLETED |
| T2-11 | F02 scheme discovery API | COMPLETED |
| T2-12 | F05 scheme detail API | COMPLETED |
| T2-13 | F06 application guidance API | COMPLETED |
| T2-14 | F01 ephemeral sessions and confirmed facts | COMPLETED |
| T2-15 | Matching and question repository/service interfaces | COMPLETED |
| T2-16 | Admin restrictions and official URL validation | COMPLETED |
| T2-17 | Optional F07 guest saves (after all P0 work) | PENDING |
| T2-18 | Supabase migration/seed and real-record smoke test | PENDING |
| T2-19 | Backend deployment and secret configuration | PENDING |
| T2-20 | Full backend verification gate | PENDING |
| T2-21 | Dataset/OpenAPI/runbook handoff | PENDING |
| T2-22 | Provenance and database-design report contribution | PENDING |

## T2-01 — FastAPI skeleton, configuration, health, CORS, error contract

- **Status:** COMPLETED
- **Files created or modified:** `README.md`, `.gitignore`, `tasks/task-two.md`,
  `PROGRESS.md`, `services/api/pyproject.toml`, `services/api/.env.example`,
  `services/api/app/main.py`, `services/api/app/core/config.py`,
  `services/api/app/core/errors.py`, `services/api/app/api/health.py`, shared
  response schemas, package markers, and Task 1 tests.
- **Tests executed:**
  - `.venv/bin/ruff check .` — passed
  - `.venv/bin/ruff format --check .` — passed
  - `.venv/bin/mypy app tests` — passed (13 source files)
  - `.venv/bin/pytest --cov=app --cov-report=term-missing` — 10 passed,
    96% coverage; one upstream Starlette TestClient deprecation warning on
    Python 3.14
- **Problems encountered:** The workspace began with no tracked project files.
  The first test run exposed application-factory settings injection and
  Starlette 404-handler compatibility issues; both were corrected and all
  checks rerun successfully. Dependency installation initially lacked sandbox
  network access and completed after explicit approval.
- **Commit reference:** `336f751` — `feat(api): establish backend service foundation`
- **Next task:** T2-02 — PostgreSQL models and Alembic migrations

## T2-02 — PostgreSQL models and Alembic migrations

- **Status:** COMPLETED
- **Files created or modified:** `services/api/pyproject.toml`,
  `services/api/.env.example`, `services/api/app/core/config.py`,
  `services/api/app/db/{base,enums,models,types}.py`, `services/api/alembic.ini`,
  `services/api/migrations/env.py`, migration templates and README,
  `services/api/migrations/versions/20261009_0001_initial_schema.py`,
  `services/api/tests/test_database_schema.py`, and `PROGRESS.md`.
- **Tests executed:**
  - `.venv/bin/ruff check .` — passed
  - `.venv/bin/ruff format --check .` — passed (22 files)
  - `.venv/bin/mypy app tests` — passed (19 source files)
  - `.venv/bin/pytest --cov=app --cov-report=term-missing` — 15 passed,
    98% coverage; one upstream Starlette TestClient deprecation warning
  - `.venv/bin/alembic upgrade head --sql` — passed; generated PostgreSQL DDL
    includes enum, publication, expiry, score, state, version, and step checks
- **Problems encountered:** Initial strict checks identified import formatting, model
  metadata typing, and enum persistence mismatches. Enum columns now persist their
  lowercase public values and emit database check constraints; all checks passed
  after correction.
- **Commit reference:** `fe33e56` — `feat(db): add source-backed PostgreSQL schema`
- **Next task:** T2-03 — Stable API DTOs and public frontend fixtures

## T2-03 — Stable API DTOs and public frontend fixtures

- **Status:** COMPLETED
- **Files created or modified:** `services/api/app/schemas/common.py`,
  `services/api/app/schemas/{profile,scheme,matching,question,guidance}.py`,
  `packages/contracts/README.md`, seven response fixtures under
  `packages/contracts/fixtures`, `services/api/tests/test_contract_fixtures.py`,
  and `PROGRESS.md`.
- **Tests executed:**
  - `.venv/bin/ruff check .` — passed
  - `.venv/bin/ruff format --check .` — passed (28 files)
  - `.venv/bin/mypy app tests` — passed (25 source files)
  - `.venv/bin/pytest --cov=app --cov-report=term-missing` — 26 passed,
    98% coverage; one upstream Starlette TestClient deprecation warning
- **Problems encountered:** The first verification pass found only import order
  and formatter differences. Contract coverage was expanded to include the
  scheme-detail response, and question validation now rejects orphaned options.
- **Commit reference:** `e969449` — `feat(api): define public DTO contracts and fixtures`
- **Next task:** T2-04 — Database indexes, publication filters, and test seeding

## T2-04 — Database indexes, publication filters, and test seeding

- **Status:** COMPLETED
- **Files created or modified:** `services/api/app/db/models.py`,
  `services/api/app/db/{session,seed}.py`,
  `services/api/app/repositories/schemes.py`,
  `services/api/app/schemas/seed.py`, migrations `0001` and `0002`, the
  synthetic seed fixture, `services/api/tests/test_seed_and_publication.py`,
  and `PROGRESS.md`.
- **Tests executed:**
  - `.venv/bin/ruff check .` — passed
  - `.venv/bin/ruff format --check .` — passed (35 files)
  - `.venv/bin/mypy app tests` — passed (31 source files)
  - `.venv/bin/pytest --cov=app --cov-report=term-missing` — 31 passed,
    96% coverage; one upstream Starlette TestClient deprecation warning
  - `.venv/bin/alembic upgrade head --sql` — passed and emitted all four
    required query/expiry indexes
- **Problems encountered:** Initial verification found an inaccurate negative
  provenance mutation, SQLite resource warnings, and SQLAlchemy 2.1's variadic
  `Select` annotation. The test now mutates the actual rule source, engines are
  disposed deterministically, and the query type matches the installed API.
- **Commit reference:** `7c76bd6` — `feat(db): enforce published queries and seeded fixtures`
- **Next task:** T2-05 — Select and document 10–15 high-confidence schemes

## T2-05–T2-07 and T2-09 — Real-scheme data work

- **Status:** BLOCKED
- **Files created or modified:** `PROGRESS.md`
- **Tests executed:** Not applicable; no real scheme data was committed.
- **Problems encountered:** On 2026-10-09 the user explicitly took ownership
  of choosing schemes and manually collecting/scraping their official source
  material. The stopped research produced no repository data. These tasks must
  resume only after the user supplies that reviewed input; synthetic fixtures
  remain clearly labeled and cannot satisfy this gate.
- **Commit reference:** Pending progress-only record
- **Next task:** T2-08 — Enforce source linkage and immutable published versions

## T2-08 — Enforce source linkage and immutable published versions

- **Status:** COMPLETED
- **Files created or modified:**
  `services/api/app/services/curation.py`,
  `services/api/migrations/versions/20261009_0003_immutable_versions.py`,
  `services/api/tests/test_curation_guards.py`, and `PROGRESS.md`.
- **Tests executed:**
  - `.venv/bin/ruff check .` — passed
  - `.venv/bin/ruff format --check .` — passed (39 files)
  - `.venv/bin/mypy app tests` — passed (34 source files)
  - `.venv/bin/pytest --cov=app --cov-report=term-missing` — 35 passed,
    96% coverage; one upstream Starlette TestClient deprecation warning
  - `.venv/bin/alembic upgrade head --sql` plus trigger-name assertions —
    passed for the version table and all four source-backed child tables
- **Problems encountered:** The initial trigger test looked for dynamically
  formatted names in source text rather than generated SQL. Verification now
  asserts the emitted offline PostgreSQL DDL, while unit tests cover the
  application-level immutable-version guard.
- **Commit reference:** `e906959` — `feat(db): protect published scheme versions`
- **Next task:** T2-10 — CLI seed and review/publish controls

## T2-10 — CLI seed and review/publish controls

- **Status:** COMPLETED
- **Files created or modified:** `services/api/app/services/curation.py`,
  `services/api/app/cli/curation.py`, `services/api/README.md`,
  `services/api/tests/test_curation_workflow.py`, package markers, and
  `PROGRESS.md`.
- **Tests executed:**
  - `.venv/bin/ruff check .` — passed
  - `.venv/bin/ruff format --check .` — passed (42 files)
  - `.venv/bin/mypy app tests` — passed (37 source files)
  - `.venv/bin/pytest --cov=app --cov-report=term-missing` — 40 passed,
    94% coverage; one upstream Starlette TestClient deprecation warning
  - `.venv/bin/python -m app.cli.curation validate
    tests/fixtures/minimal_seed.json` — passed with one validated synthetic scheme
- **Problems encountered:** Strict typing required an explicit mixed-value CLI
  result type, and SQLite drops timezone metadata after reload; the test now
  normalizes the SQLite timestamp while production PostgreSQL remains
  timezone-aware.
- **Commit reference:** `ed3b019` — `feat(admin): add audited scheme curation CLI`
- **Next task:** T2-11 — F02 scheme discovery API

## T2-11 — F02 scheme discovery API

- **Status:** COMPLETED
- **Files created or modified:** `services/api/app/main.py`,
  `services/api/app/api/dependencies.py`,
  `services/api/app/api/v1/schemes.py`,
  `services/api/app/repositories/schemes.py`,
  `services/api/app/services/scheme_discovery.py`,
  `services/api/app/core/errors.py`, discovery/publication tests, package markers,
  and `PROGRESS.md`.
- **Tests executed:**
  - `.venv/bin/ruff check .` — passed
  - `.venv/bin/ruff format --check .` — passed (48 files)
  - `.venv/bin/mypy app tests` — passed (42 source files)
  - `.venv/bin/pytest --cov=app --cov-report=term-missing` — 48 passed,
    95% coverage; one upstream Starlette TestClient deprecation warning
- **Problems encountered:** SQLAlchemy 2.1 deprecated `Result.tuples()` and
  tightened inferred mapping types; result unpacking and source-map annotations
  were updated before final verification.
- **Commit reference:** `50ee4eb` — `feat(api): add verified scheme discovery endpoint`
- **Next task:** T2-12 — F05 scheme detail API

## T2-12 — F05 scheme detail API

- **Status:** COMPLETED
- **Files created or modified:** `services/api/app/api/v1/schemes.py`,
  `services/api/app/repositories/schemes.py`,
  `services/api/app/services/scheme_detail.py`,
  `services/api/tests/test_scheme_detail_api.py`, and `PROGRESS.md`.
- **Tests executed:**
  - `.venv/bin/ruff check .` — passed
  - `.venv/bin/ruff format --check .` — passed (50 files)
  - `.venv/bin/mypy app tests` — passed (44 source files)
  - `.venv/bin/pytest --cov=app --cov-report=term-missing` — 52 passed,
    95% coverage; one upstream Starlette TestClient deprecation warning
- **Problems encountered:** The initial formatter check found two mechanical
  layout differences; both were formatted and the full suite rerun. No API or
  source-integrity failures remained.
- **Commit reference:** `090da59` — `feat(api): add source-linked scheme details`
- **Next task:** T2-13 — F06 application guidance API

## T2-13 — F06 application guidance API

- **Status:** COMPLETED
- **Files created or modified:** `services/api/app/main.py`,
  `services/api/app/api/v1/guidance.py`,
  `services/api/app/services/guidance.py`,
  `services/api/tests/test_guidance_api.py`, and `PROGRESS.md`.
- **Tests executed:**
  - `.venv/bin/ruff check .` — passed
  - `.venv/bin/ruff format --check .` — passed (53 files)
  - `.venv/bin/mypy app tests` — passed (47 source files)
  - `.venv/bin/pytest --cov=app --cov-report=term-missing` — 56 passed,
    93% coverage; one upstream Starlette TestClient deprecation warning
- **Problems encountered:** SQLite removes timezone metadata from stored UTC
  timestamps, so expiry checks now normalize values to UTC at the service
  boundary. Strict typing also required explicit boolean conversion for
  comparisons over JSON values.
- **Commit reference:** `HEAD` — `feat(api): add verified application guidance`
- **Next task:** T2-14 — F01 ephemeral sessions and confirmed facts

## T2-14 — F01 ephemeral sessions and confirmed facts

- **Status:** COMPLETED
- **Files created or modified:** `services/api/app/main.py`,
  `services/api/app/schemas/profile.py`,
  `services/api/app/api/v1/profiles.py`,
  `services/api/app/services/profiles.py`,
  `services/api/app/cli/sessions.py`, `services/api/tests/test_profiles_api.py`,
  `services/api/README.md`, and `PROGRESS.md`.
- **Tests executed:**
  - `.venv/bin/ruff check .` — passed
  - `.venv/bin/ruff format --check .` — passed (57 files)
  - `.venv/bin/mypy app tests` — passed (51 source files)
  - `.venv/bin/pytest --cov=app --cov-report=term-missing` — 61 passed,
    91% coverage; one upstream Starlette TestClient deprecation warning
- **Problems encountered:** SQLite returns stored UTC timestamps without
  timezone metadata, so active-session comparisons normalize timestamps. An
  early test fixture closed its shared in-memory engine before an inspection
  session; resource teardown order was corrected and the clean full suite was
  rerun. User-origin facts are explicitly protected from model overwrites.
- **Commit reference:** `HEAD` — `feat(api): add ephemeral profile sessions`
- **Next task:** T2-15 — Matching and question repository interfaces

## T2-15 — Matching and question repository/service interfaces

- **Status:** COMPLETED
- **Files created or modified:**
  `services/api/app/repositories/matching.py`,
  `services/api/app/services/profiles.py`,
  `services/api/tests/test_matching_repository.py`, `services/api/README.md`,
  and `PROGRESS.md`.
- **Tests executed:**
  - `.venv/bin/ruff check .` — passed
  - `.venv/bin/ruff format --check .` — passed (59 files)
  - `.venv/bin/mypy app tests` — passed (53 source files)
  - `.venv/bin/pytest --cov=app --cov-report=term-missing` — 65 passed,
    91% coverage; one upstream Starlette TestClient deprecation warning
- **Problems encountered:** A reused local name confused strict SQLAlchemy type
  inference, and one import block needed canonical ordering. Both were corrected
  before the full suite reran. Match writes are prevalidated so an invalid
  rule/source pair cannot leave a partially flushed run.
- **Commit reference:** `HEAD` — `feat(db): add matching integration repositories`
- **Next task:** T2-16 — Admin restrictions and official URL validation

## T2-16 — Admin restrictions and official URL validation

- **Status:** COMPLETED
- **Files created or modified:** `services/api/app/core/config.py`,
  `services/api/app/core/admin_auth.py`,
  `services/api/app/core/official_urls.py`,
  `services/api/app/schemas/admin.py`,
  `services/api/app/api/v1/admin.py`, `services/api/app/main.py`,
  `services/api/app/db/seed.py`, `services/api/app/services/curation.py`,
  `services/api/.env.example`, `services/api/README.md`, affected test seed
  call sites, `services/api/tests/test_admin_security.py`, and `PROGRESS.md`.
- **Tests executed:**
  - `.venv/bin/ruff check .` — passed
  - `.venv/bin/ruff format --check .` — passed (64 files)
  - `.venv/bin/mypy app tests` — passed (58 source files)
  - `.venv/bin/pytest --cov=app --cov-report=term-missing` — 73 passed,
    91% coverage; one upstream Starlette TestClient deprecation warning
- **Problems encountered:** Initial changes were behaviorally correct but had
  four formatter differences. Seed validation was also moved ahead of every
  insert so a later invalid URL cannot leave earlier pending records. The full
  suite passed after both corrections.
- **Commit reference:** `HEAD` — `feat(admin): secure curation and validate official URLs`
- **Next task:** T2-17 — Optional guest saved schemes
