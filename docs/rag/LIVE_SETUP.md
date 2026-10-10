# Live RAG setup using the existing backend

The RAG implementation is complete locally. This runbook configures and verifies
it; it does not rebuild it. The supplied SQL connection now passes and the target
already has migration0005, pgvector and `vector(768)` staging storage. The supplied
Gemini key now passes768-dimensional query preflight with the existing Blueprint
models configured privately. Oversized text now uses native-token-checked chunks
and pooled scheme vectors; eight actual records pass a16-query PostgreSQL smoke
check. Full-snapshot indexing/quality and authenticated answers remain unverified;
reviewer settings are absent.
The connector's visible project is still
unrelated/inactive; direct SQL access uses the user's supplied target instead.
Do not use the unrelated project, example localhost URL or frontend environment files.

## 1. Supply authorized server configuration

Connect the Supabase account containing the actual Yojana Saathi project, or
supply an existing server configuration file path. In that project's Connect
panel, obtain its PostgreSQL connection string; preserve the actual host,
username, database and port. Use the `postgresql+psycopg://` SQLAlchemy scheme
and configured TLS. The backend README selects the session pooler for deployment.
See [Supabase connection guidance](https://supabase.com/docs/guides/database/connecting-to-postgres)
and [TLS verification](https://supabase.com/docs/guides/platform/ssl-enforcement).
Do not substitute a Supabase HTTP API URL or anon/service-role key for a SQL URL.

Store values privately in the backend hosting environment, or in
`/Users/srujanmirji/yojana-saathi/workspaces/rag-workbench/services/api/.env`.
If creating this file, copy `services/api/.env.example` only when `.env` is
absent, then replace its database default with the authorized connection.
Do not overwrite an existing configuration or commit it. Both Settings classes
load `.env` relative to the backend working directory; process variables take
precedence. Never print settings objects, connection URLs or tokens.

| Existing variable | Required value/source |
| --- | --- |
| `DATABASE_URL` | Authorized staging PostgreSQL SQLAlchemy connection; role must apply the existing migrations and access the staging table despite RLS |
| `GEMINI_API_KEY` | Authorized server-only Gemini API key |
| `GEMINI_EMBEDDING_MODEL` | Account-enabled short embedding model ID; same ID for indexing and query server, capable of768-dimensional output |
| `GEMINI_MODEL` | Account-enabled short generation model ID supporting the existing structured JSON request |
| `ADMIN_REVIEW_TOKEN` | Private reviewer secret of at least32 characters, generated/stored in your secret manager |
| `ADMIN_REVIEWER_ID` | Actual non-sensitive reviewer identity; must accompany the review token |
| `STAGING_SEARCH_PG_URL` | Authorized PostgreSQL test connection with `vector` installed and schema-create/drop permissions; fixtures use unique explicitly qualified temporary schemas |
| `RAG_VERIFY_BASE_URL` | Actual authorized running backend origin; used by the verification client, not backend Settings |
| `RAG_VERIFY_QUERY` | Actual dataset-supported question without citizen information; verification-client process variable |

`APP_ENV`, `ALLOWED_ORIGINS`, `LOG_LEVEL` and `SESSION_TTL_HOURS` retain their
existing runtime meanings in `.env.example`; production requires its actual
HTTPS origin allowlist. The Blueprint currently configures `gemini-embedding-001`
and `gemini-flash-lite-latest`; these names do not prove account access.
No `PGVECTOR_*` setting exists: pgvector is the database `vector` extension.
`ADMIN_PUBLISH_TOKEN`/`ADMIN_PUBLISHER_ID` are a separate optional pair and are
not needed for staging RAG. No publication operation belongs in this workflow.

## 2. Connect, then migrate the configured staging target

Use a backend environment installed from this checkout. If one is absent, follow
`services/api/README.md` to create `.venv` and install `.[dev]` first. All commands
below run from this checkout's `services/api` directory. Never set a secret in
command arguments. Stop on any failure.

The following guarded command checks connection and revision before applying
the existing migrations. Run only after confirming the target is authorized
staging and the query backend uses this revision. Production uses the existing
Render migration-before-start deployment; do not migrate ahead of its code.

```bash
.venv/bin/python - <<'PY'
from alembic import command
from alembic.config import Config
from sqlalchemy import text
from app.core.config import Settings
from app.db.session import create_database_engine
engine = None
try:
    settings = Settings()
    engine = create_database_engine(settings)
    with engine.connect() as connection:
        assert connection.scalar(text('SELECT 1')) == 1
    print('Database connection passed')
    config = Config('alembic.ini')
    command.current(config)
    command.upgrade(config, 'head')
    with engine.connect() as connection:
        assert connection.scalar(text('SELECT version_num FROM alembic_version')) == '20261009_0005'
        assert connection.scalar(text("SELECT 1 FROM pg_extension WHERE extname = 'vector'")) == 1
    print('Migration revision and vector extension passed')
except Exception:
    raise SystemExit('Connection/migration check failed; inspect configuration privately') from None
finally:
    if engine is not None:
        engine.dispose()
PY
```

Migration0005 already creates `vector(768)` staging storage and enables RLS.
If extension creation is denied, the authorized database administrator must
provision `vector` before retrying; see [Supabase pgvector setup](https://supabase.com/docs/guides/database/extensions/pgvector).
Do not remove RLS as a workaround. The disposable test target also needs `vector`
provisioned by its administrator; the tests intentionally do not install it.

## 3. Reuse the import/index/retrieval workflow

Continue [DATA_WORKFLOW.md](DATA_WORKFLOW.md) sequentially: validate cleaned JSON,
check the actual vector column and provider768-dimensional output, run the
existing index CLI, compare staging count/hash, then test authenticated search
and answers. The existing local review artifact already matches all3,397 input
records; offline review is not a database import. Indexing replaces the entire
authorized staging snapshot transactionally. Never use the publication seed CLI.

The fixture reads `STAGING_SEARCH_PG_URL` from the process, not Pydantic Settings.
If stored in backend `.env`, load it without printing it to run the two tests:

```bash
.venv/bin/python - <<'PY'
from dotenv import load_dotenv
import pytest
load_dotenv('.env', override=False)
raise SystemExit(pytest.main([
    'tests/ai/test_staging_search.py::test_search_ranks_unverified_records_by_similarity',
    'tests/ai/test_staging_search.py::test_ask_answers_from_retrieved_records_with_checked_citations',
    '-o', 'addopts=', '-q', '-rs',
]))
PY
```

For the workflow's HTTP verification, supply `RAG_VERIFY_BASE_URL` and
`RAG_VERIFY_QUERY` in the verification process environment. Tokens stay in
server configuration and are sent only to the approved origin in `X-Admin-Token`.
Start the existing Uvicorn backend only after migrations/index compatibility
pass; configured deployed origins require the same model and code revision.
Check actual returned/cited records and human answer support for each actual
query; a citation subset alone does not establish relevance or correct policy.
Record passing, failed and blocked checks separately in `PROGRESS.md`.

All records remain unverified drafts. Provider token-limit rejection must halt
indexing; do not enable truncation, mix MiniLM384 vectors or silently switch
models to force success. Actual-data indexing and answer
verification remain blocked until long-record handling is resolved and reviewer
configuration is supplied. The index CLI refuses oversized records before bulk
embedding or database writes; a successful small query embedding is not full-data
coverage. Generation-model access remains unverified.
Connection and migration checks have passed; see `PROGRESS.md` for test outcomes.
