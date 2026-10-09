# Backend RAG — sequential delivery

Scope: curator-only notebook RAG; unverified drafts never feed citizen matching or guidance. Reuse existing models, protected endpoints, provider client and staging importer. No frontend or backend-owned schema/contract changes. Worktree `workspaces/rag-workbench`, branch `feat/rag-workbench`, base `c39236d`; concurrent upstream changes remain untouched.

| Task | Status | Acceptance / dependency |
| --- | --- | --- |
| RAG-01 Provider validation and grounded answers | COMPLETED | Reject invalid vectors/provider output and unknown citations, fixed abstention for uncited answers; backend tests/lint/types pass; commit before RAG-02 |
| RAG-02 Safe indexing pipeline | COMPLETED | Validate before replacement, failures preserve existing snapshot, use existing database model; synthetic local tests, CLI errors and transaction verification |
| RAG-03 Retrieval and API verification | COMPLETED | Synthetic local auth/error/retrieval contracts and PostgreSQL test harness; full regression/lint/types; no real-data claim |
| RAG-04 Real-data indexing and live verification | BLOCKED | Actual cleaned export, PostgreSQL with vector, server Gemini and reviewer configuration, reachable API; real retrieval/answers measured |

## Repository and configuration inspection

- Read project documentation, Developer 3 assignment, AI/admin contracts, importer, index CLI, RAG services, model and migration; original matching gates are unchanged.
- Searched the entire repository including other workspaces for CSV, JSON/JSONL, Parquet, XLSX, database files and ingestion scripts (excluding dependency/build/Git directories). No `updated_data.csv`, `schemes_clean.json`, `scheme_documents.json` or other real government scheme dataset found. The root `SarkarSeva_Data_Preprocessing.ipynb` references missing input/export files; its saved 3,397-record count is not reproduced evidence. Existing seed/API/profile fixtures are synthetic.
- Reuse `stage_notebook_export`, `StagingScheme` (768-dimensional pgvector), `replace_snapshot`, `search`, `answer`, `scripts/import_notebook_dataset.py`, `scripts/index_notebook_staging.py`, existing migration `20261009_0005` and reviewer-authenticated staging routes. No FAISS/OpenAI runtime or duplicate models.
- Root README documents local health URL `http://127.0.0.1:8000/health`; backend README uses Uvicorn's default port8000. `services/api/.env.example` and Settings default to local PostgreSQL port5432/database `yojana_saathi`. These are configuration defaults, not evidence of running services.
- Existing root `PROGRESS.md` T2-19 records `https://yojana-saathi-api.onrender.com` as a previous deployment. Initial health request on 2026-10-10 timed out after15s. A later curl check returned200 with production health JSON; this recorded URL is reachable. Read-only `/api/v1/schemes?limit=1` returned200 with zero items; unauthenticated staging search returned503, `Administrative role is not configured.` Current deployed RAG revision/provider/indexed data remain unverified. Local port8000 refused connection. No API started, deployed or database modified by this workstream.
- No actual `.env` files found; no PostgreSQL/Docker executables available on PATH. Live dependencies: actual dataset, authorized database URL with vector/migration, server Gemini key/model/embedding-model, reviewer token/actor and running API. Configure secrets on server; never commit or paste them into chat. Do not migrate Supabase ahead of deployed code.
- Existing provider flaws: unknown citations were dropped while answer text survived; unbounded output and nonfinite vectors. Fix trust boundaries first.
- Baseline:9 focused tests passed,2 PostgreSQL tests skipped. All new development data must be explicitly synthetic; local tests do not prove live Gemini or pgvector retrieval.
- Plan revised per user: frontend work removed entirely. Created frontend dependency symlink removed; no frontend files changed.

## RAG-01 — Provider validation and grounded answers

- Status: COMPLETED
- Files: `services/api/app/modules/ai/{staging_search,routes}.py`, `services/api/tests/ai/test_staging_search.py`, `docs/ai/NOTEBOOK_INTEGRATION.md`, this progress file.
- Verification: initial tests reproduced12 validation failures; final focused run30 passed,2 PostgreSQL skips. Full backend suite288 passed,2 PostgreSQL skips;93% total app coverage,86% staging service coverage (database paths still pending). Ruff lint/format and strict mypy app/tests passed (95 source files); diff check passed. Added malformed/oversized output, whitespace, zero/nonfinite/type-invalid vectors, fabricated/duplicate/absent citations, bounded rate-limit retries and sanitized timeout checks.
- Corrected RAG JSON MIME type to `application/json`, as documented by the [Google REST structured-output example](https://ai.google.dev/gemini-api/docs/generate-content/structured-output). No model migration or live provider claim.
- Review: owned AI route/client/fixture changes only, unchanged admin DTOs; no credentials in errors, generated drafts cannot enter public matching.
- Problems: real provider/database unavailable; strict output validation proves citation membership, not the truth of each generated statement.
- Commit: `e5ce440` — `fix(ai): validate staging RAG provider output and citations`.
- Next task: RAG-02 safe indexing pipeline, only after this task is committed.

## RAG-02 — Safe indexing pipeline

- Status: COMPLETED
- Files: existing staging service and index CLI; new `services/api/tests/ai/test_staging_index.py`; notebook runbook and this progress file.
- Acceptance: malformed export/config/provider output fails before database mutation; empty/mismatched/invalid-vector replacement is rejected; database failure rolls back snapshot; successful index persists drafts with provenance and closes the engine.
- Tests: TDD reproduced7 failures before fixes. Final indexing14 passed; full backend302 passed,2 PostgreSQL skips. Index CLI100% statement coverage; staging service93% (pgvector retrieval pending). Ruff lint/format, strict mypy app/tests/index CLI and diff checks passed. Real SQLite persistence/rollback used existing StagingScheme; no SQLite cosine-search claim.
- Changes: shared vector validation (including float32 bounds), explicit nonempty/count checks instead of removable assertions, construct replacement rows before deletion, transaction context/rollback, sanitized configuration/database errors and engine cleanup. Tests cover no-write invalid inputs, provenance, successful replacement, insert-after-delete failure, engine/config/provider failures and CLI entrypoint.
- Problems: no actual dataset or PostgreSQL available. No production seed/database touched.
- Commit: `82bc98b` — `fix(ai): preserve staging snapshots on indexing failures`.
- Next task: RAG-03 retrieval/API verification after commit.

## RAG-03 — Retrieval and API verification

- Status: COMPLETED (local synthetic contracts and SQL compilation only)
- Files: `services/api/app/modules/ai/routes.py`, `services/api/tests/ai/test_staging_search.py`, `docs/ai/NOTEBOOK_INTEGRATION.md` and this progress file; no shared API schema changes.
- Verification: final backend322 passed,2 PostgreSQL skips;94% total app coverage,99% staging-service coverage,100% index CLI coverage in the separate indexing gate. Ruff lint/format, strict mypy app/tests/index CLI, diff and unchanged-frontend checks passed. Synthetic route tests exercise reviewer/publisher isolation, retrieval/source DTOs, empty index, invalid bounds, provider/database errors and citation validation; SQL compilation verifies cosine distance/limit/stable slug ordering.
- Changes: staging database outages return sanitized503 instead of falling through to unexpected500/logged exception; two failing tests reproduced the difference. PostgreSQL fixture uses generated unique schema names, pre-existing vector, staging table only and finally cleanup; code reviewed, actual PostgreSQL execution still skipped and belongs to RAG-04.
- Review: API paths/admin DTOs unchanged; mocks confined to tests, raw verification claims remain draft, no production synthetic fallback; no frontend files differ from base.
- Problems: PostgreSQL tests require an explicitly authorized disposable test database with vector; schema tests cannot establish ranking quality or real-data success.
- Commit: `8d7fa22` — `test(ai): verify curator retrieval contracts and outage handling`.
- Next task: RAG-04 real-data/live gate after local task commit.

## RAG-04 — Real-data indexing and live verification

- Status: BLOCKED — not completed, no real-data RAG verification claimed.
- Files: this progress file and `docs/ai/NOTEBOOK_INTEGRATION.md` (evidence/runbook only).
- Read-only checks: deployed health200; public scheme discovery200/zero items; staging search503 with administrative role unconfigured. These checks do not prove Gemini works or staging is populated. Local API absent. No paid provider calls, index replacement, migrations, deployment or publication performed.
- Environment issue: local Python urllib failed TLS certificate validation (`unable to get local issuer certificate`), while curl succeeded. Using the already-installed certifi CA bundle via process-local `SSL_CERT_FILE` allowed the same venv's urllib health/auth checks to pass with certificate verification enabled. No global settings, dependency or TLS checks changed. Configure a trusted CA bundle in a local runtime before real provider calls; this does not establish Gemini compatibility.
- Missing inputs: actual cleaned export (or original CSV to regenerate it), authorized disposable PostgreSQL test database with vector already provisioned, existing server database/configuration for indexing, Gemini key/model/embedding-model and reviewer token/actor. Locally none supplied; deployed Gemini/database secrets are unknown, and reviewer role is confirmed unconfigured. Never use public/synthetic fixtures as government data.
- External input requested after finishing local work: actual export path and authorized test-database configuration path; credentials must remain in environment configuration. Existing production database/migration/deployment belongs to Developer2; coordinate any live deployment/migration and never migrate Supabase ahead of deployed code.
- Verification still required: execute the two real PostgreSQL integration tests; validate/hash the actual export; index to an authorized staging database; run protected search/ask on real records; inspect citations against record text, measure retrieval usefulness, and record exact denominators/results. No fake successful outputs or omitted integration steps.
- Commit reference: evidence commit `docs(ai): record RAG verification evidence and external blockers` (resolve by title in branch history).
- Next task: resume RAG-04 when these external resources are available. Original Developer3 independent-review, matching-accuracy and live-demo gates remain outstanding.

## Delivery state

RAG-01 through RAG-03 are verified and committed in sequence on `feat/rag-workbench`; RAG-04 remains blocked. No frontend file changes relative to base and no edits to upstream's concurrent changes. Local tests used an existing shared venv through a temporary symlink without reinstalling or changing dependencies; removed that link at completion. Recreate a fresh local venv installed from this worktree before continuing development.
