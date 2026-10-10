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
- Commit reference: `4bd2aff` — `docs(ai): record RAG verification evidence and external blockers`.
- Next task: resume RAG-04 when these external resources are available. Original Developer3 independent-review, matching-accuracy and live-demo gates remain outstanding.

## Delivery state

RAG-01 through RAG-03 are verified and committed in sequence on `feat/rag-workbench`; RAG-04 remains blocked. No frontend file changes relative to base and no edits to upstream's concurrent changes. Local tests used an existing shared venv through a temporary symlink without reinstalling or changing dependencies; removed that link at completion. Recreate a fresh local venv installed from this worktree before continuing development.

## RAG-04 prerequisite delivery — notebook handoff follow-up

These local prerequisites are authorized by the dataset follow-up. Complete A before B; the real-data gate remains blocked throughout.

| Task | Status | Dependency |
| --- | --- | --- |
| RAG-04-A Locate exports and prepare canonical import | COMPLETED | Search whole repository; if missing, document `data/schemes/schemes_clean.json` and verify fail-closed import command |
| RAG-04-B Embedding compatibility and verification workflow | COMPLETED | A committed; reuse existing pipeline, reject384-dimensional vectors, read-only database preflight before indexing, synthetic automated checks |
| RAG-04-C Actual dataset/database verification | BLOCKED | Actual CSV/export, authorized pgvector database and server environment; no frontend changes |

### RAG-04-A — Locate exports and prepare canonical import

- Status: COMPLETED
- Files: `data/schemes/README.md`, this progress file.
- Search: entire repository/root and all workspaces, excluding dependency/build/Git folders, for `updated_data.csv`, `schemes_clean.*`, `scheme_documents*`, `indexed_documents*`, `*.index`, notebooks. Only the original notebook was found; no actual export or CSV. No record-count/schema/data-quality result can be reported for absent files.
- Inspected notebook cells1/11/14/17/18: CSV input, cleaned JSON export, document flattening, SentenceTransformer model, normalized vectors, FAISS IndexFlatIP and index/metadata exports. Kept notebook source/output untouched; no notebook execution or inferred government records.
- Command: existing importer expects `../../data/schemes/schemes_clean.json` from `services/api`; new artifact filename `../../data/schemes/staging-review.json`. Import command is credential-free and cannot publish or overwrite output.
- Tests: canonical missing-input command exited2 as expected; no output/dataset created. Existing importer tests10 passed; relevant Ruff/mypy and diff checks passed. No Python code changes in this task.
- Problems: dataset still absent; historical count3,397 is not reproduced or asserted.
- Commit: `0bc05dc` — `docs(ai): prepare missing notebook dataset handoff`.
- Next task: RAG-04-B after commit.

### RAG-04-B — Embedding compatibility and verification workflow

- Status: COMPLETED (prepared/tested locally; live workflow not executed)
- Scope/files: compatibility regression in existing indexing tests, `docs/rag/DATA_WORKFLOW.md`, dataset README/runbook links and this progress file. Reuse existing importer/indexer/search/ask; no new models, providers, dimensions or frontend code.
- Compatibility: notebook MiniLM/FAISS384 versus backend Gemini retrieval768. No FAISS import, vector padding/truncation or mixed-model index. Backend validates provider dimensionality and finite nonzero float32 values before replacement; re-embed raw cleaned records using the same configured model as queries.
- Workflow: offline validation/quality summary, read-only pgvector schema and environment preflight, transactional indexing, count/hash validation and protected retrieval/citation checks. No live command will run against absent data/credentials.
- Tests: added synthetic384-dimension regression; existing replacement validator rejected it before deletion and preserved the old snapshot. Focused indexing/retrieval65 passed,2 PostgreSQL skips; full backend323 passed,2 skips,94% app coverage. Ruff lint/format and strict mypy97 files passed. All4 documented Python blocks parse/compile; offline quality-summary block executed with a labeled synthetic export and correctly counted missing eligibility/official_url. No live database/provider/API assertions in the new workflow were executed. Diff/unchanged-frontend checks passed.
- Problems: database/model identity metadata is not stored in existing staging table. Keep document/query configuration identical; model changes require full re-embedding and coordinated backend configuration/restart, even if dimensions match. No schema ownership changes authorized.
- Commit: `fe2657e` — `test(ai): verify notebook vector incompatibility and data workflow`.
- Next task: RAG-04-C real-data/database gate, blocked until inputs exist.

### RAG-04-C — Actual dataset/database verification

- Status: BLOCKED
- Files: this progress file only; no real dataset or database mutation.
- Required resources remain absent: actual cleaned JSON or CSV and authorized pgvector/server configuration. The previous Render health/read-only observations remain historical evidence, not new real-data verification. Two actual PostgreSQL tests skipped; no source authenticity, real count3,397, semantic retrieval quality or real Gemini answer support claimed.
- Ready command expects repository-root `data/schemes/schemes_clean.json`; supply the actual file there and configure secrets server-side to resume the documented workflow. No further credentials requested in chat.
- Next task: execute real preflight/index/retrieval gates once resources are available; record actual results and denominators before completion.

## Dataset arrival — sequential real-data prerequisites

The repeated dataset request triggered a new search including ignored files. The actual root CSV/exports are now present; earlier missing-file observations are historical and superseded by this section.

| Task | Status | Dependency |
| --- | --- | --- |
| RAG-04-C1 Actual export validation and local review import | COMPLETED | Strict existing importer; measured record/schema/quality and vector metadata; original files preserved; no publication |
| RAG-04-C2 PostgreSQL/provider indexing and retrieval | BLOCKED | C1 committed; authorized server/test database and Gemini/reviewer configuration still required |

### RAG-04-C1 — Actual export validation and local review import

- Status: COMPLETED (offline structural/data-quality validation only)
- Files: `docs/rag/dataset-validation.json`, dataset README/workflow references, this progress file; locally ignored canonical dataset/review artifact under `data/schemes`. No frontend files or public scheme tables changed.
- Discovery: actual input `/Users/srujanmirji/yojana-saathi/schemes_clean.json`; original CSV and other exports are sibling files at workspace root. Search includes ignored files but excludes dependencies/build/Git. No authorized PostgreSQL test config found: backend files are `.env.example` templates; frontend `.env.local` belongs to another developer and is not used/read for backend secrets. Required backend environment variables are not set in this process (presence booleans checked only).
- Validation: existing `stage_notebook_export` accepted3397 unique/nonblank identities and strict text/null fields; cleaned CSV3397 is text-equivalent to JSON, original CSV3400, both document exports3397 and indexed slug order matches. All3397 raw statuses are unverified; official_url/last_verified missing3397, documents missing13, application missing4. Nonempty eligibility text does not imply correct or reviewed policy.
- Embeddings: existing NPY parsed with stdlib (NumPy not installed here; no dependency added); shape3397x384, float32, all finite/nonzero, max unit-norm deviation1.3230193540714197e-7. No FAISS deserialization or conversion attempted. Gemini768 re-embedding remains mandatory.
- Limitations:1189/3397 raw answer contexts exceed the existing4000-character cap; maximum context25021 characters, maximum embedding document20581 characters. Some source text is truncated for answers; whole-record/full-policy coverage cannot be claimed. Actual provider input limits and retrieval usefulness require live checks. These are measured structural/coverage limits, not fabricated scheme guidance.
- Verification: existing import CLI created the real3397-record local review artifact; hash equals original/canonical input (`7a37ee1dd159521ea86e5fb21c86dceb5220b42bb43657d43d797d1d5a65392a`), all review rows are draft/publication_allowed=false. Actual CSV/document/NPY/provenance assertions passed and measured JSON report written. Full backend323 passed,2 PostgreSQL skipped; Ruff lint/format and strict mypy97 files passed. No database/provider indexing calls or new dependencies. Dataset/review files are ignored; original files are untouched.
- Commit: `d59285d` — `docs(ai): record actual dataset validation and review import`.
- Next task: C2 when authorized resources become available.

### RAG-04-C2 — Remaining live gate

- Status: BLOCKED
- Dataset is available and offline-validated; earlier missing-dataset notes above are historical. Remaining missing resources are authorized PostgreSQL/pgvector test configuration and authorized Gemini/query/reviewer server environment. No backend `.env` or configured test URL found; `.env.example` is a template, not authorization or credentials.
- Prepared workflow checks actual vector column/model compatibility before indexing; no saved MiniLM/FAISS vectors are used. Live indexing and retrieval, actual database schema/dimensions, model compatibility and semantic answer support remain unverified. No production data or frontend modified.
- Next task: use authorized configuration to run PostgreSQL tests and the existing preflight/index/retrieval workflow, recording real outcomes before completing RAG-04.

## Authorized live-verification continuation

User authorized the next live-verification steps. Work remains backend-only and sequential; missing external configuration is not fabricated.

| Task | Status | Acceptance / dependency |
| --- | --- | --- |
| RAG-05 Preserve complete bounded answer evidence | COMPLETED | Full-record request construction verified for all3397 records; oversized records rejected before transport; local checks passed |
| RAG-06-A Reject silently truncated embeddings | COMPLETED | Document/query requests disable truncation; provider rejection preserves snapshot; local checks passed |
| RAG-06 Authorized PostgreSQL/provider live verification | BLOCKED | Correct server/test configuration and project/account required; no production schema/data changes or credentials in chat |

### RAG-05 — Preserve complete bounded answer evidence

- Status: COMPLETED
- Files: `services/api/app/modules/ai/staging_search.py`, `services/api/tests/ai/test_staging_search.py`, `docs/rag/answer-context-validation.json`, `docs/rag/DATA_WORKFLOW.md`, `docs/rag/PROGRESS.md`. No frontend, prompt or shared database/schema changes.
- Design: reuse existing answer request/citation validators; bounded full record contexts covering current maximum25021 characters. Oversized future records fail closed instead of silently losing clauses. No new chunking store/models/dependencies or claims of semantic answer accuracy.
- Configuration audit: repository including ignored files still has no backend.env or supplied PostgreSQL test URL; configured key presence false. Supabase connector discovery returned only one inactive unrelated project, `tanvo`; no authorization/project correspondence to Yojana Saathi found, so no queries, restoration, branch creation or writes against that project. Requested actual configuration path/account name while proceeding locally.
- Tests: two regression tests failed before the fix and passed afterward; focused52 passed/2 PostgreSQL skipped; full backend325 passed/2 PostgreSQL skipped,94% app coverage. Ruff lint/format108 files and strict mypy97 files passed. Offline intercepted requests inspected all3397 actual records with exact full-text equality; maximum25021 characters, zero truncations/rejections, zero provider/database calls. Existing Starlette test-client deprecation warning only.
- Problems: live resources remain unavailable. The historical4000-character results in `dataset-validation.json` describe the previous implementation; `answer-context-validation.json` records the verified fix. Semantic relevance, provider acceptance and actual answers remain unverified.
- Commit: `df08112` — `fix(ai): preserve complete staging answer evidence`.
- Next task: RAG-06-A embedding truncation safeguard, then RAG-06 live verification when authorized configuration is available.

### RAG-06-A — Reject silently truncated embeddings

- Status: COMPLETED
- Scope: existing embedding request configuration, document/query contract tests and workflow/progress documentation. Reuse existing provider error handling and embed-before-write pipeline; no model switch, chunking store, database or frontend changes.
- Dependency: RAG-05 verified and committed. Google REST documentation exposes `embedContentConfig.autoTruncate`; set false while retaining retrieval task and768-dimensional output. Actual provider behavior/token coverage remains blocked by configuration.
- Files: `services/api/app/modules/ai/staging_search.py`, `services/api/tests/ai/test_staging_search.py`, `services/api/tests/ai/test_staging_index.py`, `docs/rag/DATA_WORKFLOW.md`, `docs/rag/PROGRESS.md`.
- Tests: document/query contract regressions failed before the fix; focused70 passed/2 PostgreSQL skipped. Simulated HTTP400 input rejection reached the real embedding client through the index CLI, made one request with no retry, never opened the database, and preserved the existing synthetic snapshot. Full backend328 passed/2 PostgreSQL skipped,94% app coverage; Ruff lint/format108 files, mypy97 files and diff whitespace check passed. No frontend differences against base commit.
- Problems: one test formatting failure fixed before completion. Documentation describes Gemini001's2048-token limit; actual token counts, API/model acceptance and rejection semantics remain unverified without provider configuration. A rejected long record must halt the import until a coordinated chunking/model migration is reviewed; truncation is not a workaround.
- Commit: `6bd2e1b` — `fix(ai): reject truncated staging embedding inputs`.
- Next task: RAG-06 live verification only with authorized configuration.

### RAG-06 — Live verification remains blocked

- Status: BLOCKED
- Dependencies: authorized PostgreSQL/pgvector disposable test URL, correct staging database and Gemini/reviewer environment. No backend configuration file supplied; connected Supabase project remains unrelated/inactive and was not queried or changed.
- Tests: two PostgreSQL integration tests skipped; actual provider preflight, re-embedding/indexing and authenticated retrieval/answer checks not run. No official source authenticity or eligibility approval inferred from3397 unverified records.
- Commit: documentation recorded with RAG-06-A; no live verification commit claimed.
- Next task: use a supplied authorized configuration path/account to perform the existing workflow sequentially; stop on incompatible schema, model or oversized provider inputs.

## Live-only integration request — 2026-10-10

The user requested live integration only, preserving the completed RAG implementation.
Downstream live tasks must wait for an authorized configuration; setup instructions
are preparation, not evidence that those commands ran.

### LIVE-01 — Inspect existing backend configuration and migrations

- Status: COMPLETED
- Files modified: this progress document only. Inspected backend `.env.example`, shared Settings/AISettings, admin auth, migration environment and versions0004/0005, backend README/handoff, Render Blueprint, existing importer/index CLI and PostgreSQL fixtures.
- Verification: `alembic heads` reports `20261009_0005`; this is repository history, not a live database revision. Migration0005 enables `vector`, creates `staging_schemes` with `vector(768)` and enables RLS. Existing retrieval is exact cosine search; no HNSW/IVFFlat index migration is needed for this dataset.
- Problems: local URL in the template is a placeholder/default, not a configured live target. Production migration must accompany deployment of this revision; do not advance an older deployed backend to an unknown migration revision.
- Commit: `7a363de` — `docs(ai): audit live backend configuration and migrations`.
- Next task: LIVE-02 document exact environment names and setup using existing commands.

### LIVE-02 — Exact environment/setup contract

- Status: COMPLETED
- Files: `docs/rag/LIVE_SETUP.md`, this progress document. No runtime code or frontend modifications.
- Scope: derive environment names from existing configuration/fixtures, distinguish reviewer from publication credentials, supply connection/migration/test setup and reuse the existing data workflow. No invented project/credential/model values.
- Verification: both inline Python command blocks parse; variable aliases match Settings/AISettings, installed dotenv loader confirmed, existing PostgreSQL fixture process-variable behavior and exact test selectors checked. Diff whitespace check passed. These checks did not execute migrations or connect to a database.
- Problems: credentials and authorized target absent; runbook commands must not be reported as executed live.
- Commit: `a4c3b1c` — `docs(ai): document exact live RAG setup`.
- Next task: LIVE-03 verify connected project availability; stop dependent live tasks if unavailable.

### LIVE-03 — Authorized project discovery and blocker verification

- Status: COMPLETED (availability check only; authorized target not found)
- Files modified: this progress document. Connected Supabase `list_projects` returned only inactive `tanvo`, unrelated to Yojana Saathi. No SQL, migrations, restores, project creation or writes against it.
- Configuration: whole workspace search including ignored files found backend templates but no backend `.env`. Process presence checks were false for DATABASE_URL, STAGING_SEARCH_PG_URL, GEMINI_API_KEY, GEMINI_MODEL, GEMINI_EMBEDDING_MODEL, ADMIN_REVIEW_TOKEN, ADMIN_REVIEWER_ID and HTTP-verification variables. Frontend `.env.local` was neither read nor modified.
- Passing verification: existing importer revalidated the original export, canonical copy and existing review artifact for equality/hash;3397 draft/unverified rows, publication_allowed=false. Existing regression suite328 passed,94% app coverage; Ruff lint and mypy97 files passed. No runtime code rebuilt.
- Failed tests: none. No live connection failure fabricated; absent configuration prevented an attempt.
- Blocked tests: both PostgreSQL tests were explicitly invoked and skipped with `STAGING_SEARCH_PG_URL not set`. This is not PostgreSQL verification. Existing Starlette test-client deprecation warning only.
- Commit: `22058ad` — `docs(ai): record live integration blockers and regression results`.
- Next task: LIVE-04 connection/migrations only after a correct authorized configuration/account is supplied, following `LIVE_SETUP.md` and the existing data workflow.

### Remaining requested live tasks

| User step | Status | Evidence/dependency |
| --- | --- | --- |
| 4 Connection checks and migrations | BLOCKED | Authorized Yojana Saathi SQL configuration unavailable; repository head checked, live revision not checked |
| 5 Dataset validation and staging import | BLOCKED | Offline3397-record validation/review artifact passed; real PostgreSQL staging import not run |
| 6 Gemini768-dimensional embeddings | BLOCKED | API key and account-enabled model configuration absent; no provider call or real dimension confirmation |
| 7 PostgreSQL vector indexing/retrieval | BLOCKED | No database or embeddings; no vector query executed |
| 8 Two PostgreSQL tests | BLOCKED | Invoked, both skipped for missing STAGING_SEARCH_PG_URL |
| 9 Actual query quality/citations | BLOCKED | No authenticated live retrieval; synthetic contract checks do not establish actual relevance/support |
| 10 Keep records unpublished | Constraint preserved | No database/publication writes; offline records remain unverified drafts. Live staging boundary still requires target verification |
| 11 Regression tests and progress | Local checks COMPLETED; live checks BLOCKED |328 passed,0 failed,2 skipped; updated progress and setup handoff |

Required next input is an authorized server configuration **path**, or connection
to the Supabase account/project holding Yojana Saathi; no credentials in chat.
Setup names/commands are in `docs/rag/LIVE_SETUP.md`. No frontend changes,
deployment, production migration, paid embedding calls or live success claims.

## Supplied SQL configuration continuation — 2026-10-10

### LIVE-04 — Database connection, migration and vector-schema verification

- Status: COMPLETED
- Files: ignored private `services/api/.env` (mode0600, never committed), owned `services/api/tests/ai/test_staging_search.py` fixture, `docs/rag/live-database-validation.json`, `docs/rag/LIVE_SETUP.md`, `docs/rag/DATA_WORKFLOW.md`, `docs/ai/NOTEBOOK_INTEGRATION.md`, this progress document. No frontend or RAG runtime changes. Supplied database credentials were sent through non-echoing input and saved only in the ignored private configuration; Sarvam key is not used/stored by this Gemini client.
- Passing checks: SQL SELECT1; migration revision20261009_0005; existing vector extension; staging embedding column vector(768); staging RLS enabled. `alembic upgrade head` completed with no pending migration. Existing shared staging row count0; no source dataset rows inserted. Database metadata only, no credentials or citizen/record text printed.
- Failure reproduced: the two PostgreSQL tests both errored at setup with DuplicateTable. Supabase's pooler did not apply the startup search_path, so unqualified DDL hit the existing shared staging table and failed; no existing rows/table were deleted. Each temporary schema was cleaned up.
- Fix: use SQLAlchemy's existing engine-level schema_translate_map to qualify all ORM/DDL into the unique test schema. No runtime database model/schema changes or new dependencies. Focused retry2 passed/0 failed/0 skipped. Full regression330 passed/0 failed/0 skipped,92.67% app coverage in the redacted runner. Existing non-PostgreSQL fixtures used SQLite; only the two isolated-schema tests received the authorized SQL URL. Shared staging rows0 before and after; temporary schema inventory unchanged after cleanup. Ruff lint/format108 files and mypy97 files passed. Initial setup errors are resolved; no current failed tests.
- Remaining configuration: GEMINI_API_KEY, GEMINI_EMBEDDING_MODEL, GEMINI_MODEL, ADMIN_REVIEW_TOKEN and ADMIN_REVIEWER_ID absent. Actual3397-record export/review artifact revalidated and equal; publication_allowed=false. Real import needs actual compatible embeddings, never fabricated vectors.
- Commit: `6f5839d` — `fix(ai): isolate pgvector tests on Supabase poolers`.
- Next task: LIVE-05 real-data staging import/indexing when authorized Gemini configuration is supplied; authenticated answers also require reviewer settings.

### LIVE-05 — Actual-data staging import/indexing and answers

- Status: BLOCKED
- Files modified: progress/setup/evidence documentation only; existing importer/indexer/RAG modules reused unchanged.
- Dataset:3397 records offline-validated, canonical input and existing review artifact agree; all are unverified drafts. No original export overwritten, no MiniLM384 vectors imported, no fabricated768 vectors used. Shared staging contains0 actual records.
- Dependencies: Gemini API key and account-enabled embedding/generation models in backend configuration. Reviewer token (32+ characters) and actual reviewer ID needed for protected answers. These five existing variables are missing. Sarvam credentials are not accepted by the existing Gemini REST client; no provider replacement attempted.
- Passing: database migration/schema/vector checks, both previously skipped PostgreSQL tests,330 regression tests. Failed:0 after the fixture fix (initial2 setup errors resolved). Blocked: real provider dimension confirmation,3397-record embedding/indexing, actual query relevance/support and authenticated live answers.
- Integration evidence: PostgreSQL test data/provider responses are synthetic even though the database is real. Their citation checks do not verify actual Gemini citations, policy accuracy or official eligibility. Unverified data remains unpublished; no publication operation or frontend change.
- Credential handling: advise rotation of the database password and Sarvam key because they were pasted into chat; replacements belong only in private server configuration. No secret values included in reports, command arguments or Git.
- Commit: blocker/evidence recorded with LIVE-04; no completed real-data indexing commit claimed.
- Next task: use an authorized configuration path with missing Gemini/reviewer values, perform provider/vector preflight, then existing transactional index/count/hash/retrieval workflow. Do not ask for secret values in chat.

## Supplied Gemini key continuation — 2026-10-10

### LIVE-05-A — Correct live embedding contract and enforce document input limits

- Status: COMPLETED
- Scope/files: existing `staging_search.py`, `scripts/index_notebook_staging.py`, their owned tests, `docs/rag/gemini-preflight.json`, `docs/rag/token-preflight-regression.json`, setup/workflow/notebook/progress documentation. No frontend, database schema/model or RAG rebuild. Private ignored.env updated with supplied key and the existing Blueprint model IDs, preserving other entries and mode0600; secrets omitted from output/reports/Git.
- Live finding: nested task/dimension fields in embedContentConfig produced3072 values and a66889-byte response, rejected by the existing strict client. Top-level taskType/outputDimensionality returned768. Corrected client query preflight now passes with the supplied Gemini key; generation-model access remains unverified.
- Coverage finding: model metadata reports inputTokenLimit2048; model-native countTokens reports4825 for the20581-character longest actual document. API accepted that document even with autoTruncate=false, so the earlier locally tested flag alone does not prove full source coverage. Do not infer token safety from a200 response or from character count.
- Fix: preserve the existing model/vector contract, restore working top-level task/dimension fields, retain the optional truncation flag, and add native token validation before the existing bulk embedding step. Read model limit once, count every document longest-first, validate bounded JSON/count types and fail closed on oversized input/config/transport errors. No embeddings or database connection before all document checks pass.
- Tests:12 focused TDD failures before implementation; focused89 passed/2 PostgreSQL skipped without explicit test URL. Additional token configuration/transport/size/count regressions and CLI refusal/preservation coverage added. Live corrected query returns768 values. Actual index CLI exits2 after only model metadata/countTokens requests with the4825/2048 mismatch; no bulk embeddings or database writes.
- Problems: one test typing failure fixed before completion. Initial full redacted regression349 passed/0 failed/0 skipped, but coverage instrumentation imported AI modules before tracing, yielding78.58%; corrected runner traces collection-time imports and passes the explicit80% gate at93.92% app coverage. No live provider requests allowed during regressions; PostgreSQL tests remain real and isolated.
- Final verification:349 passed/0 failed/0 skipped including both PostgreSQL tests; document token guard100% statement coverage. Ruff lint/format108 files, mypy97 files, diff whitespace, secret-exclusion and private.env0600 checks passed. Shared staging rows0 before/after; temporary schemas cleaned. No frontend differences against base. Sanitized JSON evidence distinguishes initial3072 mismatch from corrected768 output and the controlled oversized-record refusal.
- Commit: task commit `fix(ai): validate live embedding dimensions and document limits` (resolve by title).
- Next task: resolve long-record handling before actual3397-record indexing; reviewer token and actual actor ID also remain required for authenticated answers. Never silently switch embedding models or load truncated/fabricated vectors.

### LIVE-05-B — Full-record indexing and authenticated answers

- Status: BLOCKED
- Files: progress/evidence/setup docs only for this remaining gate. Key and existing model IDs are configured privately; the earlier missing-Gemini-key notes are historical. Key access and query768 output are verified, generation-model access is not.
- Dependencies: reviewed long-record handling consistent with the existing retrieval/database contract; the actual document is4825 tokens against the configured model's2048 limit. Existing single-vector-per-record schema cannot represent independent chunk retrieval without coordinated design. No automatic model switch, schema change, raw-record truncation, partial dataset import or fabricated vectors performed. Protected API also needs ADMIN_REVIEW_TOKEN and an actual ADMIN_REVIEWER_ID in private backend configuration.
- Passing: provider query/model metadata/countTokens checks and349 regressions including real PostgreSQL tests. Failed tests:0 remaining; initial request-contract and local TDD failures resolved. Blocked: full actual-data embedding/indexing, deployed reviewer API readiness, real query quality/support and actual generation/citation verification.
- Commit: evidence recorded with LIVE-05-A; no completed full-data indexing commit claimed.
- Next task: coordinate chunk handling or an explicitly chosen account-enabled model with a larger native input limit and matching query-server configuration, then rerun guarded indexing/count/hash/retrieval checks. Reviewer credentials remain server-only. Rotate the Gemini key pasted into chat; replacement must not be sent in chat.

## Sequential continuation — full-record embedding preparation

### LIVE-05-C — Token-checked chunks with one vector per scheme

- Status: COMPLETED
- Dependency/order: LIVE-05-A is verified/committed. Complete this implementation, regression checks and a bounded actual-data provider smoke check before full-snapshot indexing; indexing and authenticated answers are subsequent tasks.
- Scope: owned staging embedding helpers, index CLI caller, synthetic provider/persistence tests, workflow/setup/progress documentation and sanitized evidence. Query routes/DTOs, shared models/migrations, frontend and public publication services stay outside scope.
- Design: recursively split only oversized document text, preserving exact character order and whitespace; count every leaf with the configured model. Normalize chunk vectors, token-weight their mean, then normalize the scheme vector. Short documents retain the existing text. This fits the existing single-vector-per-record discovery contract without a schema/model switch. All raw evidence remains intact for answers/citations.
- Limit: pooling can dilute specific clauses; it does not provide independent passage retrieval. A bounded actual-data smoke check is required before bulk indexing, and broader relevance/citation review remains a separate live gate. No official policy/eligibility verification is claimed.
- Tests: eleven new chunk/pooling tests failed before implementation, as expected (missing helpers). Final369 passed/0 failed/0 skipped, including both real PostgreSQL tests;94% app coverage,100% statement coverage in both chunk helpers. Unicode/no-whitespace/newline boundaries, exact reconstruction/order, invalid model/count/transport responses, weighted normalization, cancellation/invalid vectors and CLI transaction preservation are covered. Ruff lint/format and strict mypy101 source files passed; one initial test typing issue and formatter issue were fixed before completion.
- Live smoke: the three longest actual records plus five distinct topical records produce14 chunks, maximum1896 native tokens; exact source reconstruction and unit-normalized768 vectors verified. Real Gemini document/query embeddings plus real PostgreSQL retrieval yield16/16 expected top1 hits across eight title/eight topical queries.23 provider requests (metadata1, counts20, embedding batches2). Actual subset stored only in a unique disposable schema, cleaned afterward; shared staging rows remain0. No generation/citation or full-corpus relevance result inferred. Evidence: `chunk-smoke-verification.json`, `chunk-regression.json`.
- Review: caller search confirmed only the owned index CLI used the previous guard; its fixtures/tests migrated with it. Schema, query embeddings/routes, public APIs and all source records are unchanged. Diff/secret exclusion/private.env0600/frontend-preservation checks passed. No extra dependencies or independent passage storage added.
- Commit: `fix(ai): embed complete staging records with token-checked chunks` (resolve by title).
- Next task: actual full-snapshot indexing, only after this task passes and is committed.

### LIVE-05-D — Full actual-data PostgreSQL staging snapshot

- Status: BLOCKED
- Dependency: LIVE-05-C verified and committed as `1dd2ad6`; no next feature task started before that commit.
- Scope: existing index CLI, authorized PostgreSQL target and actual3397-record cleaned JSON. No publication, frontend, schema/model switch or synthetic scheme vectors.
- Passing: all3437 native token checks completed;3397 records produce3417 chunks,17 records split, maximum2044 leaf tokens against2048 allowed. Exact embedded-text reconstruction confirmed; canonical input still equals the original and uses the existing source hash.
- Provider failure: the first100-input embedding batch received HTTP429 on every attempt (one initial request plus six bounded retries). Seven attempts are seven retries of that same batch, not700 successfully embedded records. CLI exits2 before database replacement. Shared staging rows remain0 before/after; actual_snapshot_indexed=false. Full indexing is not complete.
- Diagnosis: subsequent single small query returns200 with768 values, confirming key/model access. A100-input short synthetic diagnostic receives429 with quotaMetric `generativelanguage.googleapis.com/embed_content_free_tier_requests`, quotaId `EmbedContentRequestsPerMinutePerUserPerProjectPerModel-FreeTier`, quotaValue100 and29s retry delay. This is available request-quota pressure, not evidence of missing credentials or disabled billing. Reduce batch size to leave quota headroom and verify pacing before retrying; do not repeatedly retry an oversized available-quota request or switch models.
- Tests:369 regression tests passed with0 failures/0 skips before the live attempt. Live token coverage passed; bulk embedding operation failed with429; actual full-corpus retrieval and generated citations remain blocked. Eight-record actual-data smoke evidence still passes but is not full indexing.
- Files: this progress document, `full-index-verification.json`, `quota-diagnostic.json`, `batch-quota-diagnostic.json`, workflow/setup documentation. Runtime code unchanged in this continuation.
- Commit: `docs(ai): record indexing quota blocker and private reviewer setup` (resolve by title).
- Next task: fix/verify quota-safe embedding batching within LIVE-05-D, rerun the existing full transaction/count/hash workflow, then authenticated full-corpus retrieval/answers. Do not mark this task complete until actual indexing is verified.

### Private reviewer configuration — explicit user command continuation

- Status: COMPLETED (configuration only; API verification pending LIVE-05-D)
- User supplied actual actor ID `yojana-saathi-admin-01` and requested `openssl rand -hex 32`.
- Files: ignored private `services/api/.env` only; generated64-character token through OpenSSL subprocess, retained solely in the private reviewer setting, and stored the authorized actor ID. No secret value printed in logs/chat/argv or committed. Existing database/Gemini settings preserved; no publisher role enabled.
- Verification: existing Settings accepts the reviewer pair, file mode0600 confirmed, Git ignore confirmed. Authenticated API/generation/citation checks not performed while full indexing is blocked.
- Commit: private environment excluded; sanitized documentation recorded with the quota-blocker commit above.
- Next task: use this configuration after full indexing passes; no further reviewer credential required in chat.

## Authenticated integration continuation — 2026-10-10

The user explicitly requested the following sequence. A real eight-record subset
in a unique temporary PostgreSQL schema will exercise protected routes without
claiming that the empty shared staging table is a full index. No auth dependency
override, frontend change, publication or remote deployment is authorized here.

| Task | Status | Verification / dependency |
| --- | --- | --- |
| AUTH-01 Private environment | COMPLETED | Settings/AISettings, private mode/ignore and read-only PostgreSQL schema checks |
| AUTH-02 Authenticated retrieval | COMPLETED | Real actual-data subset and provider embeddings, normal reviewer auth |
| AUTH-03 Grounded generation | COMPLETED | AUTH-02 committed; configured model and actual retrieved records |
| AUTH-04 Citation/source review | COMPLETED | AUTH-03 committed; membership, raw-record equality and claim-support review |
| AUTH-05 PostgreSQL integration tests | COMPLETED | Two existing isolated-schema tests; provider mocks explicitly distinguished |
| AUTH-06 Full3397 indexing | BLOCKED | Verified quota headroom/pacing, native token guards and full transaction |
| AUTH-07 Publication boundary | PENDING | No unverified draft enters published/public matching tables |
| AUTH-08 Regression checks | PENDING | All tests, relevant lint/types and secret/frontend preservation |
| AUTH-09 Final evidence/progress | PENDING | Completed, failed and blocked outcomes clearly separated |

### AUTH-01 — Private environment verification

- Status: COMPLETED
- Files: `docs/rag/admin-environment-verification.json`, this progress document; private.env read without printing values and not modified.
- Passing: existing Settings/AISettings accept database, Gemini key/models and reviewer token/actor pair; only presence booleans and non-secret model IDs reported. Private.env ignored by Git and mode0600. Database SELECT1 passes, revision20261009_0005, staging vector(768), RLS enabled; shared staging0 rows. No migrations/writes performed. Publisher role absent and not required.
- Failed checks: none. Deployed server configuration remains unverified; local settings do not establish remote readiness.
- Commit: `docs(ai): verify authorized RAG server configuration` (resolve by title).
- Next task: AUTH-02 actual-subset authenticated retrieval, only after this commit.

### AUTH-02 — Authenticated actual-subset retrieval

- Status: COMPLETED
- Dependency: AUTH-01 committed as `1cbdf63`.
- Scope: existing application factory with real private Settings and actual provider configuration; real Uvicorn HTTP listener bound to an observed ephemeral loopback port; unique temporary PostgreSQL schema configured through the supported engine factory parameter. No dependency overrides or auth mocks.
- Dataset: three longest actual records plus five other actual scheme records; native-token chunks and real Gemini768 vectors. Shared staging remains the existing empty snapshot. This is a bounded integration test, not full3397 indexing.
- Verification:403 for both missing/wrong credentials,200 for all16 valid title/topic queries;16/16 expected top1 results. Returned raw records equal the actual export, all review statuses draft, publication_allowed=false. Real Gemini, PostgreSQL and TCP HTTP used; no mocks/overrides. Full corpus remains unverified.
- Files: owned sanitized retrieval evidence and this progress file; temporary harness outside repository, no frontend/runtime API changes.
- Commit: `test(ai): verify authenticated actual-data subset retrieval` (resolve by title).
- Next task: AUTH-03 generation only after this task verifies and commits.

### AUTH-03 — Authenticated actual-source generation

- Status: COMPLETED
- Dependency: AUTH-02 verified/committed as `3fa5182`.
- Scope: existing protected API, configured Gemini model and eight actual records in a temporary PostgreSQL schema; no auth/provider overrides or frontend changes.
- Problem/fix: initial API503 was a sanitized provider400: generateContent REST responseFormat.text.mimeType expects APPLICATION_JSON, not the SDK-style application/json string. Confirmed against Google's REST reference (https://ai.google.dev/api/generate-content?hl=ja#TextResponseFormat). One shared-client field fixed; strict schema, response bounds and citation checks preserved. Caller search covers the owned route and tests.
- Verification: request-contract assertion failed before the fix; final73 focused tests passed,2 database tests deferred to AUTH-05; Ruff lint/format and mypy pass. Actual protected HTTP ask now200 with configured generation model, a non-empty draft-framed answer and apy citation. Model acceptance and generation pass; claim/source review remains AUTH-04.
- Files: staging_search.py, its existing request-contract test, authenticated-subset-answer.json, generation-diagnostic.json and this progress file. Secrets excluded; private config0600/ignored; no frontend diff.
- Commit: `fix(ai): use REST JSON enum for authenticated draft answers` (resolve by title).
- Next task: AUTH-04 citation/source support review after this commit.

### AUTH-04 — Actual citation/source and claim support

- Status: COMPLETED
- Dependency: AUTH-03 verified/committed as `7b1c3f1`.
- Verification: generated inline [apy] and cited_slugs match an actual retrieved source; all three returned raw records equal the original export exactly. Each remains unverified/draft, official_url empty and publication_allowed=false. Manual support review checks all five pension amounts plus age60/until-death against apy benefits. Draft framing present; no independent official-policy or eligibility verification inferred.
- Scope/limit: one actual-source answer in the eight-record schema, not statistical grounding accuracy or full3397 retrieval. Citation membership alone does not prove arbitrary future answers true. Source-integrity and supported-claim assertions pass.
- Files: citation-support-verification.json, temporary-schema cleanup evidence and this progress document. No runtime/frontend edits or publication writes.
- Problems: none after AUTH-03 request fix. Temporary server/schema cleanup verified; shared staging remains0 before/after.
- Commit: `test(ai): verify actual retrieved citation and pension claim support` (resolve by title).
- Next task: AUTH-05 two PostgreSQL integration tests after this commit.

### AUTH-05 — PostgreSQL/pgvector integration tests

- Status: COMPLETED
- Dependency: AUTH-04 committed as `9cc8d22`.
- Tests: both previously conditional database tests pass on the authorized PostgreSQL target: similarity ordering and retrieved-record answer/citation plumbing.2 passed,0 failed,0 skipped. Config supplied internally from private.env; no credentials printed.
- Scope: real PostgreSQL/pgvector, isolated temporary schemas, synthetic fixtures and mocked provider responses. Actual provider/source/HTTP verification is AUTH-02 through AUTH-04 and is not inferred from these tests.
- Verification: shared staging remains0, temporary-schema inventory unchanged after cleanup; no frontend/publication changes.
- Files: postgresql-integration-verification.json and this progress file.
- Problems: none. Commit: `test(ai): run both authorized pgvector integration checks` (resolve by title).
- Next task: AUTH-06 quota-safe full3397 indexing after this commit.

### AUTH-06 — Full actual-data staging indexing

- Status: IN PROGRESS
- Dependency: AUTH-05 verified/committed as `6ed4e4b`.
- Scope: existing CLI/model/vector/schema contract, all3397 actual records; no frontend/publication changes.
- Fix: batch20 leaves headroom below the observed100-input-per-minute quota; existing bounded429 retries preserved. Both task-type batching assertions failed before the fix. Final109 focused tests passed,2 database tests previously passed AUTH-05; Ruff lint/format/mypy pass.
- Live preflight:20 actual documents pass native token checks, real embeddings768 and normalized pooled vectors; no database writes. Full CLI now running using real HTTPS with TLS validation and connection reuse, preserving all production parsing/limits/token guards. No fake provider responses, oldFAISS vectors or DB/auth bypass.
- Files: owned batching constant/test, small-batch-verification.json, full-index-continuation.json and this progress file. Full transaction/count/hash/source/vector checks pending. Shared staging remains unchanged until every embedding succeeds.
- Commit: pending full verification. Next task: AUTH-07 after this task is verified/committed; real-data failures must remain explicit.

- First full retry stopped during native token preflight (last saved checkpoint1300 checks) before embedding or database writes. Exact preflight failure reason was not captured. A separate authorized connection confirms shared staging0. The instrumentation runner's stale final read-only socket then failed; it has exited. Retrying with bounded read-only connection timeouts, fresh diagnostic DB connections and at most two retries of transient HTTPS I/O errors in the temporary real-transport harness. Runtime token guards unchanged; no cached/fabricated responses. Initial attempt retained in full-index-retry-initial.json; full-index-continuation.json tracks the fresh run.

### User-requested stop — 2026-10-10

- Live tests stopped at the user's explicit request. AUTH-06 remains BLOCKED, not completed. The fresh native preflight passed3437 checks, producing3417 chunks (maximum2044 tokens); only120 actual chunk embeddings succeeded before the user-requested stop, with Gemini429 quota responses between batches. No complete snapshot or database transaction occurred; full3397 retrieval/grounding is unverified. Report records the final observed counts and provider errors.
- Passing completed checks: private config, normal authenticated eight-record retrieval16/16, actual draft generation/citation support, and both real PostgreSQL tests. Initial generation400 was fixed and verified. Focused batching tests109 passed/2 DB tests previously passed separately; full regression after this change was not run.
- Remaining AUTH-07/08/09 work is paused by the user's stop instruction; no further tests or indexing scheduled. All unverified records remain draft evidence; no publication writes made. Frontend untouched. Local batching fix remains uncommitted because the full-index task did not pass verification.

## Local website testing — new user scope

The user authorized localhost website integration after stopping bulk indexing. Work remains sequential: WEB-01 isolated eight-record API demo; WEB-02 matching website test page; WEB-03 browser verification and handoff. The latest frontend is preserved in a separate worktree/branch feat/local-rag-demo; no edits to the other developer's checkout.

### WEB-01 — Reviewer-authenticated local sample API

- Status: COMPLETED
- Files: scripts/serve_local_rag_demo.py, tests/ai/test_local_rag_demo.py, verified20-input batching fix/test, local-demo-verification.json and this progress file.
- Implementation: reuses import, native-token chunking, actual Gemini768 embeddings, pooling, existing models/application/routes and reviewer auth.8 actual records go into a unique disposable schema; other local tables are empty, with no published schemes. No public staging replacement or publication writes. Bind127.0.0.1:8000 only; reject non-development or missing reviewer configuration. Normal shutdown removes only the owned schema.
- Verification:5 new synthetic control-flow tests pass (normal auth factory, safe create/drop, preparation failures prevent DB writes, server failure cleanup);114 related tests pass/2 previously verified PostgreSQL tests skipped in this local run. Ruff/format/mypy pass after two import/type and two line-length issues were fixed. Real HTTP health200, absent/wrong token403, authenticated actual Atal search200 with apy first, publication_allowed=false; empty public catalogue200. Server remains running for manual testing.
- Full3397 index remains incomplete; no bulk run resumed. Secrets remain private; no frontend edits in the upstream checkout.
- Commit: `feat(ai): serve an isolated authenticated local RAG sample` (resolve by title).
- Next task: WEB-02 frontend test page in the isolated latest-UI worktree after this commit.
