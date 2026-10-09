# Yojana Saathi backend handoff

## Delivery status

The FastAPI application, PostgreSQL schema, Alembic migrations, reviewed
publication boundary, scheme discovery/detail/guidance APIs, ephemeral profile
sessions, matching repository interfaces, secured curation routes, and guest
saves are implemented on `feat/backend-db`.

One external deliverable remains unavailable:

- **Production dataset:** 3,397 SarkarSeva candidates are stored in Supabase as
  private `draft` versions for future curation. None has official provenance or
  independent review, so there are zero verified public schemes. The reserved
  `.invalid` synthetic test fixture was not loaded into production.

The production API is live at
`https://yojana-saathi-api.onrender.com`. External smoke tests verified health,
production documentation denial, Supabase-backed scheme listing, CORS, and the
standard not-found error envelope.

The Supabase database is migrated through Alembic revision `20261009_0004`.
All 12 application tables have row-level security enabled. Draft candidates are
excluded from every public query until official sources, source-linked rules,
independent review, and publication metadata are present.

## Local runbook

From `services/api`:

```bash
python3.12 -m venv .venv
.venv/bin/pip install -e '.[dev]'
cp .env.example .env
.venv/bin/alembic upgrade head
.venv/bin/uvicorn app.main:app --reload
```

Never commit `.env`. Set `DATABASE_URL` to a PostgreSQL URL using the
`postgresql+psycopg://` SQLAlchemy scheme.

Verification commands:

```bash
.venv/bin/ruff check .
.venv/bin/ruff format --check .
.venv/bin/mypy app tests
.venv/bin/pytest --cov=app --cov-report=term-missing
.venv/bin/alembic heads
.venv/bin/alembic upgrade head --sql
```

## API and contract artifacts

- Generated OpenAPI: `services/api/openapi.json`
- Contract fixtures: `packages/contracts/fixtures/`
- Synthetic seed: `services/api/tests/fixtures/minimal_seed.json`
- Draft importer: `services/api/app/cli/import_drafts.py`
- Environment template: `services/api/.env.example`
- Render Blueprint: `render.yaml`

Regenerate OpenAPI after route or DTO changes:

```bash
.venv/bin/python scripts/export_openapi.py
```

Backend-owned routes under `/api/v1`:

- `GET /schemes`
- `GET /schemes/{scheme_id}`
- `GET /guidance/{scheme_id}`
- `POST /profiles/sessions`
- `POST /profiles/answers`
- `DELETE /profiles/sessions/{session_id}`
- `GET`, `POST`, and `DELETE /saved`
- role-restricted review and publish routes under `/admin/scheme-versions`

Developer 3 owns `/matches`, `/questions/next`, extraction, deterministic rule
evaluation, ranking, and question selection. Integration contracts are in
`app.repositories.matching`: `CandidateRepository`, `MatchRunRepository`,
`CandidateScheme`, `MatchResultWrite`, and `QuestionRuleCandidate`.

## Curation and deployment

Validate, seed, review, and publish only independently reviewed bundles:

```bash
.venv/bin/python -m app.cli.curation validate path/to/seed.json
.venv/bin/python -m app.cli.curation seed path/to/seed.json
.venv/bin/python -m app.cli.curation review VERSION_UUID --actor REVIEWER_ID
.venv/bin/python -m app.cli.curation publish VERSION_UUID --actor PUBLISHER_ID
```

Import the repository's `render.yaml` as a Render Blueprint. Supply the
database URL and CORS allowlist when prompted; add separate reviewer/publisher
credentials only if admin APIs are enabled. The checked-in config runs
migrations before starting and gates traffic on `/health`.

After the user supplies approved scheme data:

1. Validate the bundle locally.
2. Seed, query, and inspect real records through the publication boundary.
3. Smoke-test a real scheme through list, detail, and guidance endpoints.
