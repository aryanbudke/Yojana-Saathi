# Developer 2 Progress

This log tracks `tasks/task-two.md` in strict dependency order. A task advances
only after its acceptance checks pass and its work is committed.

| ID | Task | Status |
|---|---|---|
| T2-01 | FastAPI skeleton, configuration, health, CORS, error contract | COMPLETED |
| T2-02 | PostgreSQL models and Alembic migrations | COMPLETED |
| T2-03 | Stable API DTOs and public frontend fixtures | COMPLETED |
| T2-04 | Database indexes, publication filters, test seeding | PENDING |
| T2-05 | Select and document 10–15 high-confidence schemes | PENDING |
| T2-06 | Curate official source data, eligibility, and exclusions | PENDING |
| T2-07 | Normalize codes, units, rule JSON, and conditional documents | PENDING |
| T2-08 | Enforce source linkage and immutable published versions | PENDING |
| T2-09 | Peer review records and provide synthetic fixtures | PENDING |
| T2-10 | CLI seed and review/publish controls | PENDING |
| T2-11 | F02 scheme discovery API | PENDING |
| T2-12 | F05 scheme detail API | PENDING |
| T2-13 | F06 application guidance API | PENDING |
| T2-14 | F01 ephemeral sessions and confirmed facts | PENDING |
| T2-15 | Matching and question repository/service interfaces | PENDING |
| T2-16 | Admin restrictions and official URL validation | PENDING |
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
- **Commit reference:** `HEAD` — `feat(api): define public DTO contracts and fixtures`
- **Next task:** T2-04 — Database indexes, publication filters, and test seeding
