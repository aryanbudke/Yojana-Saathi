# Developer 2 Progress

This log tracks `tasks/task-two.md` in strict dependency order. A task advances
only after its acceptance checks pass and its work is committed.

| ID | Task | Status |
|---|---|---|
| T2-01 | FastAPI skeleton, configuration, health, CORS, error contract | COMPLETED |
| T2-02 | PostgreSQL models and Alembic migrations | COMPLETED |
| T2-03 | Stable API DTOs and public frontend fixtures | COMPLETED |
| T2-04 | Database indexes, publication filters, test seeding | COMPLETED |
| T2-05 | Select and document 10–15 high-confidence schemes | COMPLETED |
| T2-06 | Curate official source data, eligibility, and exclusions | COMPLETED |
| T2-07 | Normalize codes, units, rule JSON, and conditional documents | COMPLETED |
| T2-08 | Enforce source linkage and immutable published versions | COMPLETED |
| T2-09 | Peer review records and provide synthetic fixtures | BLOCKED |
| T2-10 | CLI seed and review/publish controls | COMPLETED |
| T2-11 | F02 scheme discovery API | COMPLETED |
| T2-12 | F05 scheme detail API | COMPLETED |
| T2-13 | F06 application guidance API | COMPLETED |
| T2-14 | F01 ephemeral sessions and confirmed facts | COMPLETED |
| T2-15 | Matching and question repository/service interfaces | COMPLETED |
| T2-16 | Admin restrictions and official URL validation | COMPLETED |
| T2-17 | Optional F07 guest saves (after all P0 work) | COMPLETED |
| T2-18 | Supabase migration/seed and real-record smoke test | BLOCKED |
| T2-19 | Backend deployment and secret configuration | COMPLETED |
| T2-20 | Full backend verification gate | COMPLETED |
| T2-21 | Dataset/OpenAPI/runbook handoff | BLOCKED |
| T2-22 | Provenance and database-design report contribution | COMPLETED |

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

## T2-05 — Select and document the first high-confidence schemes

- **Status:** COMPLETED
- **Files created or modified:**
  `data/curation/selected-schemes-v1.json`,
  `services/api/tests/test_curation_selection.py`, and `PROGRESS.md`.
- **Tests executed:** Official-source discovery was limited to primary central
  ministry, statutory authority, or scheme portals. The selection integrity
  test verifies exactly ten unique draft slugs, HTTPS source candidates, an
  explicit research-pending state, and a closed official-host allowlist.
  - `.venv/bin/pytest -q tests` — 87 passed; one upstream Starlette
    TestClient deprecation warning
  - `.venv/bin/ruff check .` — passed
  - `.venv/bin/ruff format --check .` — passed (77 files)
  - `python3 -m json.tool` — selection manifest is valid JSON
  - `.venv/bin/mypy --strict app` — existing URL-field mismatches remain in
    `scheme_discovery.py`, `scheme_detail.py`, and `guidance.py`; T2-05 adds
    no typed application code
- **Problems encountered:** The multi-scheme research job remained in a
  non-terminal processing state, so selection evidence was gathered through
  individual official-source searches. Several portals block automated content
  retrieval; those records remain research-pending and cannot be treated as
  verified until their primary documents are audited.
- **Commit reference:** `HEAD` — `docs(data): select first official-source curation batch`
- **Next task:** T2-06 — Verify official sources, dates, eligibility, and exclusions

## T2-06 — Curate official sources, eligibility, and exclusions

- **Status:** COMPLETED
- **Files created or modified:**
  `data/curation/source-audit-v1.json`,
  `services/api/tests/test_source_audit.py`, and `PROGRESS.md`.
- **Tests executed:** Ten selected records were audited against primary Central
  Government, ministry, statutory-authority, or official scheme sources. The
  audit records source retrieval dates, policy dates where the source states
  one, benefits, eligibility, exclusions, precise locators, and unresolved
  policy ambiguity.
  - `.venv/bin/pytest -q tests` — 89 passed; one upstream Starlette
    TestClient deprecation warning
  - `.venv/bin/ruff check .` — passed
  - `.venv/bin/ruff format --check .` — passed (78 files)
  - `python3 -m json.tool` — source-audit manifest is valid JSON
- **Problems encountered:** PM SVANidhi was restructured in August 2025, but
  the current overview does not restate complete vendor-onboarding evidence;
  that record is explicitly barred from receiving a deterministic eligibility
  rule. AB PM-JAY uses dynamic national and State beneficiary datasets, and
  Soil Health Cards are delivered through State/UT sampling rather than a
  uniform national application. These boundaries are recorded as ambiguities,
  not guessed rules. The audit also replaces superseded PMMVY 1.0 facts with
  PMMVY 2.0 material effective 1 April 2022.
- **Commit reference:** `HEAD` — `docs(data): audit official sources for first scheme batch`
- **Next task:** T2-07 — Normalize the audited facts, documents, and steps

## T2-07 — Normalize rules, units, documents, and steps

- **Status:** COMPLETED
- **Files created or modified:**
  `data/curation/normalized-candidates-v1.json`,
  `services/api/tests/test_normalized_candidates.py`, and `PROGRESS.md`.
- **Tests executed:** The ten candidates are normalized as Central schemes
  with null State codes, stable categories, structured rule expressions,
  source-linked conditional documents, and ordered application steps. Income
  is represented as integer INR per year. The bundle remains explicitly draft
  and cannot be published before independent review.
  - `.venv/bin/pytest -q tests` — 92 passed; one upstream Starlette
    TestClient deprecation warning
  - `.venv/bin/pytest -q tests/test_normalized_candidates.py tests/test_source_audit.py`
    — 5 passed
  - `.venv/bin/ruff check .` — passed
  - `.venv/bin/ruff format --check .` — passed (79 files)
  - `.venv/bin/mypy --strict tests/test_normalized_candidates.py tests/test_source_audit.py`
    — passed
  - Production URL validator — 18 unique official URLs accepted
  - `python3 -m json.tool` — normalized candidate manifest is valid JSON
- **Problems encountered:** The normalization deliberately converts PM
  SVANidhi onboarding, PM-JAY beneficiary matching, and local Soil Health Card
  delivery into manual-review rules. It does not infer deterministic answers
  from incomplete or locally variable policy. PMMVY 2.0 conditional benefits
  and NMMSS annual-income units are encoded explicitly.
- **Commit reference:** `HEAD` — `feat(data): normalize first source-backed scheme batch`
- **Next task:** T2-09 — Obtain independent review and record the review outcome

## T2-09 — Independent real-scheme review

- **Status:** BLOCKED
- **Files created or modified:** `services/api/app/db/draft_import.py`,
  `services/api/app/cli/import_drafts.py`,
  `services/api/tests/test_draft_import.py`, `services/api/README.md`, and
  `PROGRESS.md`.
- **Tests executed:** The supplied SarkarSeva archive validated at exactly
  3,397 unique cleaned rows. Importer tests prove deterministic IDs,
  idempotency, explicit-unverified enforcement, and exclusion from public
  publication queries.
  - First Supabase import — 3,397 inserted, zero skipped
  - Second Supabase import — zero inserted, 3,397 skipped
  - Live database inspection — 3,397 schemes, 3,397 draft versions, zero
    sources/rules/documents/steps, and zero public candidates
  - Deployed `GET /api/v1/schemes` — 200 with an empty typed collection
  - `.venv/bin/ruff check .` — passed
  - `.venv/bin/ruff format --check .` — passed (76 files)
  - `.venv/bin/mypy app tests` — passed (68 source files)
  - `.venv/bin/pytest --cov=app --cov-report=term-missing` — 86 passed,
    91% coverage; one upstream Starlette TestClient deprecation warning
- **Problems encountered:** At the user's direction, all 3,397 records were
  imported to Supabase as `unknown` schemes with private `draft` versions.
  Their raw text is retained for future curation, but the archive has no
  official source URLs, verification dates, source-linked rules, or independent
  review. Therefore this staging import does not complete T2-05–T2-07 or T2-09
  and none of the records can be published.
- **Commit reference:** `b7e79d4` — `feat(data): import SarkarSeva candidates as private drafts`
- **Next task:** T2-06 — Verify the selected official sources and scheme facts

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

## T2-17 — Optional F07 guest saved schemes

- **Status:** COMPLETED
- **Files created or modified:** `services/api/app/main.py`,
  `services/api/app/schemas/saved.py`,
  `services/api/app/services/saved_schemes.py`,
  `services/api/app/services/scheme_discovery.py`,
  `services/api/app/api/v1/saved.py`,
  `services/api/tests/test_saved_schemes_api.py`, `services/api/README.md`, and
  `PROGRESS.md`.
- **Tests executed:**
  - `.venv/bin/ruff check .` — passed
  - `.venv/bin/ruff format --check .` — passed (68 files)
  - `.venv/bin/mypy app tests` — passed (62 source files)
  - `.venv/bin/pytest --cov=app --cov-report=term-missing` — 78 passed,
    91% coverage; one upstream Starlette TestClient deprecation warning
- **Problems encountered:** FastAPI's re-exported test client exposes an
  untyped `post` return to mypy, so the test helper now applies one explicit
  response cast. Import ordering and formatting were normalized before the
  clean full-suite rerun.
- **Commit reference:** `HEAD` — `feat(api): add guest saved schemes`
- **Next task:** T2-18 — Supabase migration, seed, and smoke query

## T2-18 — Supabase migration, seed, and real-record smoke test

- **Status:** BLOCKED
- **Files created or modified:** `services/api/app/core/config.py`,
  `services/api/migrations/versions/20261009_0004_enable_rls.py`,
  `services/api/tests/test_config.py`,
  `services/api/tests/test_supabase_security.py`, `docs/backend-handoff.md`,
  `docs/backend-report-contribution.md`, and `PROGRESS.md`. Supabase received
  migrations through revision `20261009_0004`; no seed records were inserted.
- **Tests executed:**
  - Supabase connection smoke query — passed (`current_database()` returned
    `postgres`)
  - Live `alembic upgrade head` — passed at revision `20261009_0004`
  - Live schema inspection — 12/12 application tables, 14 foreign keys,
    78 check constraints, and 23 non-primary indexes present
  - Live immutability inspection — five triggers and two trigger functions
    present
  - Live RLS inspection — enabled on 12/12 application tables
  - Initial live data inspection before draft import — zero schemes, versions,
    sources, or audit rows
  - `.venv/bin/ruff check .` — passed
  - `.venv/bin/ruff format --check .` — passed (72 files)
  - `.venv/bin/mypy app tests` — passed (64 source files)
  - `.venv/bin/pytest --cov=app --cov-report=term-missing` — 81 passed,
    91% coverage; one upstream Starlette TestClient deprecation warning
- **Problems encountered:** Blank optional admin variables initially prevented
  settings startup; empty values are now ignored and regression-tested. The
  schema migration and security checks are complete. Supabase now contains
  3,397 private draft candidates, but none has official provenance or review
  evidence. The synthetic `.invalid` fixture was deliberately not inserted into
  production, so verified-record seeding and public API smoke tests remain
  blocked.
- **Commit reference:** `HEAD` — `feat(db): migrate and secure Supabase schema`
- **Next task:** Supply and review the real scheme seed bundle, then validate,
  seed, and smoke-query it before marking T2-18 complete

## T2-19 — Backend deployment and secret configuration

- **Status:** COMPLETED
- **Files created or modified:** root `render.yaml`,
  `services/api/.python-version`, `services/api/pyproject.toml`,
  `services/api/README.md`, `services/api/tests/test_render_deployment.py`,
  `docs/backend-handoff.md`, `docs/backend-report-contribution.md`, and
  `PROGRESS.md`. The obsolete `services/api/railway.json` was removed at the
  user's request.
- **Tests executed:** The Blueprint was checked against current official Render
  Blueprint, monorepo, FastAPI, health-check, and Python-version documentation.
  - YAML parse and deployment assertions — passed
  - Migration-gated production startup with injected `PORT=8099` — passed
  - Live Supabase `alembic upgrade head` during startup — passed
  - `GET /health` — 200 with production environment response
  - `GET /docs` in production — 404 as intended
  - `.venv/bin/ruff check .` — passed
  - `.venv/bin/ruff format --check .` — passed (73 files)
  - `.venv/bin/mypy app tests` — passed (65 source files)
  - `.venv/bin/pytest --cov=app --cov-report=term-missing` — 82 passed,
    91% coverage; one upstream Starlette TestClient deprecation warning
- **External Render smoke tests** against
  `https://yojana-saathi-api.onrender.com`:
  - `GET /health` — 200 with production environment response
  - `GET /docs` — 404 as intended in production
  - `GET /api/v1/schemes` — 200 with an empty typed collection from Supabase
  - configured-origin CORS header — present and exact
  - missing scheme — 404 with the standard error envelope and request ID
- **Problems encountered:** Render's dedicated pre-deploy command is paid-only,
  so the free single-instance Blueprint runs Alembic before Uvicorn in its start
  command. Free instances can sleep after inactivity and incur a cold-start
  delay. No secrets were written to Git.
- **Commit reference:** `e109668` — `chore(deploy): add Render deployment blueprint`
- **Next task:** T2-21 — Complete the dataset handoff after real-data seeding

## T2-20 — Full backend verification gate

- **Status:** COMPLETED
- **Files created or modified:** `PROGRESS.md` only.
- **Tests executed:**
  - `.venv/bin/ruff check .` — passed
  - `.venv/bin/ruff format --check .` — passed (68 files)
  - `.venv/bin/mypy app tests` — passed (62 source files)
  - `.venv/bin/pytest --cov=app --cov-report=term-missing` — 78 passed,
    91% coverage; one upstream Starlette TestClient deprecation warning
  - `.venv/bin/alembic heads` — one head, `20261009_0003`
  - `.venv/bin/alembic history` — complete three-migration chain
  - `.venv/bin/alembic upgrade head --sql` — complete PostgreSQL DDL rendered
  - FastAPI OpenAPI generation — 11 paths and all required backend-owned paths
    present
  - `git diff --check` — passed
- **Problems encountered:** No project failures. The sole warning is an upstream
  Starlette deprecation notice for FastAPI's current TestClient re-export on
  Python 3.14; it does not affect runtime behavior.
- **Commit reference:** `HEAD` — `test(api): complete backend verification gate`
- **Next task:** T2-21 — Dataset/OpenAPI/runbook handoff

## T2-21 — Dataset/OpenAPI/runbook handoff

- **Status:** BLOCKED
- **Files created or modified:** `services/api/openapi.json`,
  `services/api/scripts/export_openapi.py`,
  `services/api/tests/test_openapi_artifact.py`, `docs/backend-handoff.md`, and
  `PROGRESS.md`.
- **Tests executed:**
  - OpenAPI exporter run twice — identical SHA-256
    `b46acc3fc884d1635a0c6423c52f9b766b95f58617a99c2d4961b2cfb0828543`
  - `.venv/bin/python -m json.tool openapi.json` — passed
  - `.venv/bin/ruff check .` — passed
  - `.venv/bin/ruff format --check .` — passed (70 files)
  - `.venv/bin/mypy app tests` — passed (63 source files)
  - `.venv/bin/pytest --cov=app --cov-report=term-missing` — 79 passed,
    91% coverage; one upstream Starlette TestClient deprecation warning
- **Problems encountered:** The code, OpenAPI, fixtures, integration interfaces,
  runbook, and deployed API URL are ready, but a real verified dataset snapshot
  cannot be supplied until T2-18 receives user-curated scheme data.
- **Commit reference:** `HEAD` — `docs(api): add backend integration handoff`
- **Next task:** T2-22 — Provenance and database-design report contribution

## T2-22 — Provenance and database-design report contribution

- **Status:** COMPLETED
- **Files created or modified:** `docs/backend-report-contribution.md` and
  `PROGRESS.md`.
- **Tests executed:**
  - `.venv/bin/ruff check .` — passed
  - `.venv/bin/ruff format --check .` — passed (70 files)
  - `.venv/bin/mypy app tests` — passed (63 source files)
  - `.venv/bin/pytest --cov=app --cov-report=term-missing` — 79 passed,
    91% coverage; one upstream Starlette TestClient deprecation warning
  - `git diff --check` — passed
- **Problems encountered:** No failures. The report explicitly distinguishes
  implemented and locally verified work from the blocked real-data and Render
  deployment integrations.
- **Commit reference:** `HEAD` — `docs(report): add backend and provenance contribution`
- **Next task:** Await user-curated schemes to unblock T2-05–T2-07, T2-09,
  T2-18, and T2-21.
