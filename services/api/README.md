# Yojana Saathi API

## Local setup

```bash
python3.12 -m venv .venv
.venv/bin/pip install -e '.[dev]'
.venv/bin/alembic upgrade head
.venv/bin/uvicorn app.main:app --reload
```

Runtime configuration is documented in `.env.example`. Keep database and API
credentials out of Git.

## Curated data workflow

Seed files are strict, versioned JSON contracts. Validate before accessing the
database:

```bash
.venv/bin/python -m app.cli.curation validate path/to/seed.json
```

Load an approved bundle inside one transaction:

```bash
.venv/bin/python -m app.cli.curation seed path/to/seed.json
```

For draft versions created by a curation workflow, a reviewer must first verify
the version and a publisher must then publish it:

```bash
.venv/bin/python -m app.cli.curation review VERSION_UUID --actor REVIEWER_ID
.venv/bin/python -m app.cli.curation publish VERSION_UUID --actor PUBLISHER_ID
```

Review is rejected unless the version contains at least one official source and
one source-backed rule. Publication is rejected unless review provenance is
present. Each transition writes an audit record. Once published, the version
and all of its sources, rules, document requirements, and steps are immutable;
create a new version for any correction.

The fixture under `tests/fixtures` is synthetic and uses the reserved `.invalid`
domain. It must never be presented as government guidance or loaded into a
production environment.

## Anonymous-session retention

Profile sessions expire after `SESSION_TTL_HOURS` (24 hours by default, bounded
to 1–168 hours). Expired sessions are rejected by profile and guidance APIs.
Run the following command from a scheduled job to physically remove expired
sessions; PostgreSQL cascades removal to their facts, match runs/results, and
guest saves:

```bash
.venv/bin/python -m app.cli.sessions purge-expired
```

## Matching-engine integration boundary

Developer 3 should depend on the protocols and DTOs in
`app.repositories.matching`, not query publication tables directly:

- `CandidateRepository.list_candidates()` returns only active schemes with the
  latest verified, published version, including `scheme_version_id`, reviewed
  rule expressions, rule-source IDs, question templates, and official sources.
- `MatchRunRepository.record_run(...)` accepts deterministic outcomes, validates
  each rule/source pair against the reviewed candidate, and persists the engine
  version and caller-provided profile digest for reproducibility.
- `MatchRunRepository.question_candidates(...)` returns deduplicated unknown
  fields with reviewed question templates for the requested session-owned run.

The AI/rule module owns extraction, evaluation, ranking, and question selection;
the repository owns publication filtering, provenance checks, and persistence.

## Administrative roles and official links

The review and publish endpoints are disabled until their separate role
credentials are configured:

- `ADMIN_REVIEW_TOKEN` (32+ characters) with `ADMIN_REVIEWER_ID`
- `ADMIN_PUBLISH_TOKEN` (32+ characters) with `ADMIN_PUBLISHER_ID`

Send the applicable secret only in `X-Admin-Token`. Reviewer credentials cannot
publish, publisher credentials cannot review, and actor IDs come from server
configuration rather than request data. Both transitions write audit records.

Source and application links are revalidated before review/publication. They
must use HTTPS with a reviewed named public host; reserved placeholder domains,
embedded credentials, localhost/private targets, and raw IP hosts are rejected.
The `allow_test_urls` override exists only for synthetic test fixtures and is
never used by the curation CLI or administrative API.

## Guest saved schemes

Active anonymous sessions can call `GET /api/v1/saved`, `POST /api/v1/saved`,
and `DELETE /api/v1/saved/{scheme_id}`. Saves are idempotent, capped at 50 per
session, isolated by session ID, and only return schemes that still pass the
verified public-publication boundary. Deleting or purging the parent session
cascades to its saved rows in PostgreSQL.

## Railway deployment

The checked-in `railway.json` uses Railpack, runs `alembic upgrade head` as a
pre-deploy command, starts Uvicorn on Railway's injected `PORT`, and gates
traffic on `GET /health`. When connecting this monorepo, set the Railway service
root directory to `services/api`.

Configure secrets as Railway service variables, never repository files:

- `APP_ENV=production`
- `DATABASE_URL` using the Supabase PostgreSQL session pooler URL and the
  `postgresql+psycopg://` SQLAlchemy scheme
- `ALLOWED_ORIGINS` as a comma-separated HTTPS allowlist
- separate `ADMIN_REVIEW_TOKEN`/`ADMIN_REVIEWER_ID` and
  `ADMIN_PUBLISH_TOKEN`/`ADMIN_PUBLISHER_ID` pairs if admin APIs are enabled

After deployment, generate a Railway domain and smoke-test `/health`, `/docs`
(non-production only), and one verified `/api/v1/schemes` query. Production
OpenAPI UI is intentionally disabled.
