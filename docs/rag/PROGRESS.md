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
- Commit: task commit `docs(ai): document exact live RAG setup` (resolve by title).
- Next task: LIVE-03 verify connected project availability; stop dependent live tasks if unavailable.
