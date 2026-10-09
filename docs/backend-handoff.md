# Yojana Saathi backend handoff

## Delivery status

The FastAPI application, PostgreSQL schema, Alembic migrations, reviewed
publication boundary, scheme discovery/detail/guidance APIs, ephemeral profile
sessions, matching repository interfaces, secured curation routes, and guest
saves are implemented on `feat/backend-db`.

Two external deliverables remain unavailable:

- **Production dataset:** no user-curated real scheme bundle has been supplied.
  The only seed is the reserved `.invalid` synthetic test fixture and production
  seeding rejects it.
- **Live API URL:** no Supabase PostgreSQL connection string or authenticated
  Railway project/token has been supplied. No deployment has been claimed.

The Supabase project URL and publishable client key are not sufficient to run
DDL migrations; Alembic requires the PostgreSQL session-pooler connection URL.

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
- Environment template: `services/api/.env.example`
- Railway config: `services/api/railway.json`

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

For Railway, configure the service root as `services/api`. Add production
variables in Railway, including the database URL, CORS allowlist, and separate
reviewer/publisher credentials. The checked-in config runs migrations before
starting and gates traffic on `/health`.

After the user supplies approved scheme data and the database connection:

1. Validate the bundle locally.
2. Run `alembic upgrade head` against Supabase.
3. Seed, query, and inspect real records through the publication boundary.
4. Deploy the exact verified commit to Railway.
5. Record the public API URL and smoke-test `/health`, `/api/v1/schemes`, scheme
   detail, guidance, CORS, admin denial, and error payloads.
