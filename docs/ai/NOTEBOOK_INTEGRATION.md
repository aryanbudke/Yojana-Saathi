# SarkarSeva notebook connection

The actual cleaned notebook export has now passed the existing offline importer with3,397 unverified records. All lack official URLs and verification dates;13 lack documents and4 lack application text. It cannot enter public matching directly. The validated local review artifact and [measured report](../rag/dataset-validation.json) preserve source hashes and draft status; full-snapshot indexing and generated citations remain unverified. A bounded eight-record smoke check now passes16/16 actual title/topic queries with Gemini vectors and PostgreSQL in a disposable schema; the shared staging snapshot is still empty.

## Export and import

Run the notebook's preprocessing through the export cell to produce `sarkarseva_processed/schemes_clean.json`. Use that JSON, not `scheme_documents.json`, the FAISS index or generated answers. The cleaned records retain separate eligibility, application and document fields; the flattened documents require fragile text splitting.

From `services/api`, with the existing backend environment installed:

```bash
.venv/bin/python scripts/import_notebook_dataset.py \
  /absolute/path/sarkarseva_processed/schemes_clean.json \
  --output /absolute/path/sarkarseva-staging.json
```

Use an existing output directory and a new filename. The command rejects empty/malformed exports, non-text field values, missing identities and duplicate slugs (ignoring case/outer whitespace). It validates the entire export before writing, never overwrites an existing output, preserves original field values, records the input SHA-256 and lists missing policy/source fields for each record. Incomplete policy records remain visible to curators rather than disappearing.

Every staged record has `review_status: draft`, and the artifact has `publication_allowed: false`. Imported `verification_status`, URLs and dates are retained as raw claims, not trusted review evidence. Even a record with every field populated still requires independent verification. This staging format intentionally fails the existing `SeedBundle` contract; it does not write to PostgreSQL, change API responses or call an AI service.

## Connect reviewed records to the backend

Developer 2 can select a small useful subset and map it to the existing `app/schemas/seed.py` contract:

| Notebook field | Backend field or review work |
| --- | --- |
| `scheme_name`, `slug` | `name`, `slug`; review length and stable identity |
| `details`, `benefits` | `summary`, `benefit_text`; verify against official evidence |
| `level`, `schemeCategory` | `government_level`, `category`; normalize to contract limits |
| `eligibility` | Reviewed `eligibility_json` and individual source-linked `rules`; no automatic threshold extraction |
| `application`, `documents` | Reviewed, ordered `steps` and individual `documents`, each with source IDs |
| `official_url`, `last_verified` | Independently checked `sources`, dates and excerpt locators; raw values are insufficient |
| Not present | Scheme/version/source IDs, active status, explicit geography, reviewer/publication evidence |

Do not guess applicant geography from text or apply relatives' ages/incomes to the citizen. Unsupported or ambiguous policy clauses need manual review. Complete every mandatory rule and exclusion before approving a scheme. The existing curation CLI validates only a supplied reviewed backend bundle; follow `docs/backend-handoff.md` for the publication workflow. No published scheme or backend-owned code is changed by this adapter.

After a reviewed bundle is available, use the existing candidate repository, deterministic matcher, question selection and source-linked guidance. The notebook's similarity search can be considered later for relevance retrieval, with verified/published filtering and measured retrieval tests; optional RAG stays deferred until the core gates pass. OpenAI answer generation and the FAISS runtime are not added to this project; the notebook's similarity search is instead available to curators as described below.

## Curator staging search (pgvector)

Reviewers can semantically search the unverified notebook records to decide which schemes to curate first. This replaces the notebook's FAISS index with PostgreSQL `pgvector` and Gemini embeddings. It is a discovery aid only: results never feed matching, questions, guidance or publication.

1. Run migrations (`20261009_0005` enables the `vector` extension, creates `staging_schemes` and turns on row-level security for it, matching `0004`). Supabase supports `vector`; other hosts must provide it.
2. Set `GEMINI_API_KEY` and `GEMINI_EMBEDDING_MODEL` (configured for 768 dimensions). Live provider compatibility still requires verification.
3. From `services/api`, index the export. Each run validates the entire nonempty export, the model's native token count for every final chunk, and all embeddings before replacing the whole staging table in one transaction. Oversized texts are split without dropping characters, and normalized chunk vectors are token-weighted into the existing scheme vector. Token preflight and embedding/configuration failures never open a database write; database/commit failures roll back the replacement. This is a full snapshot replacement, not an append operation:

   ```bash
   .venv/bin/python scripts/index_notebook_staging.py /absolute/path/sarkarseva_processed/schemes_clean.json
   ```

4. Search with the reviewer token:

   ```bash
   curl -H "X-Admin-Token: $ADMIN_REVIEW_TOKEN" \
     "http://127.0.0.1:8000/api/v1/admin/staging-schemes/search?q=scholarship+for+college&limit=10"
   ```

5. Ask a question (curator RAG). The top records are retrieved as above, and `GEMINI_MODEL` writes a short answer from them:

   ```bash
   curl -X POST -H "X-Admin-Token: $ADMIN_REVIEW_TOKEN" -H "Content-Type: application/json" \
     -d '{"question": "Which schemes help widows, and what is missing from their records?", "limit": 6}' \
     http://127.0.0.1:8000/api/v1/admin/staging-schemes/ask
   ```

   The response has `answer`, `cited_slugs` and the retrieved `sources`. The server rejects the entire generated answer if any citation was not retrieved, and the prompt treats record text as untrusted. Uncited output is replaced with a fixed insufficient-evidence message. Citation membership does not prove each statement is supported; curator review remains required. Answers come from unverified drafts, so they are triage notes for curators, never citizen guidance. If the model is overloaded/unconfigured or the staging database is unavailable, the endpoint returns 503.

Every result carries `review_status: draft`, its `missing_fields` and the raw record; the response has `publication_allowed: false`. Similarity is a cosine score for ordering, not relevance or eligibility evidence. The embedded text is name, level, category, details, benefits, eligibility and tags. Search queries are sent to Gemini, so curators should not paste citizen data into them.

`tests/ai/test_staging_search.py` covers reviewer/publisher isolation, query bounds, source DTOs, empty retrieval, citation rejection/abstention, provider batching/retries and sanitized database/provider outages using synthetic mocked retrieval. A PostgreSQL SQL-compilation check verifies cosine ordering and stable slug tie-breaking; it does not execute vector search.

`tests/ai/test_staging_index.py` uses synthetic exports and the existing model on SQLite to verify provenance, successful full replacement, invalid input rejection before deletion, and rollback after an insert fails following deletion. It also checks sanitized configuration/database failures and cleanup. SQLite is used for transaction verification only.

The two pgvector integration tests run only when `STAGING_SEARCH_PG_URL` points at an authorized PostgreSQL target with `vector` already provisioned. Each run creates a unique temporary schema, explicitly qualifies its ORM queries and table creation to that schema, and drops only its own schema in cleanup. Tests never install extensions or drop a fixed/shared schema. Both tests now pass against the supplied Supabase connection using synthetic records/provider responses; full-dataset Gemini retrieval and actual generated citations remain unverified. The separate eight-record smoke check uses actual provider vectors and PostgreSQL, preserves full embedded text and cleans up its disposable schema. Pooling can dilute narrow clauses; it is not independent passage retrieval.

Run local checks from `services/api`:

```bash
.venv/bin/ruff check .
.venv/bin/ruff format --check .
.venv/bin/mypy app tests scripts/index_notebook_staging.py
.venv/bin/python -m pytest --cov=app --cov-report=term-missing
```

Use a fresh environment installed from this checkout for actual CLI execution. Tests use explicitly synthetic transports and records; they never fall back to those fixtures in production. See `docs/rag/PROGRESS.md` for current evidence and external blockers.

## Verification and outstanding evidence

The adapter tests use explicitly synthetic temporary records. They verify that raw text is preserved, false verification claims cannot publish, missing eligibility remains visible, invalid/duplicate inputs fail, CLI import works and failures do not overwrite existing output.

The actual export is now available and offline review import has passed. The supplied SQL connection, migration0005, pgvector and staging vector(768)/RLS checks have passed. The two PostgreSQL tests pass with synthetic records and mocked provider responses. The supplied Gemini key now verifies768-dimensional query output after request compatibility was corrected. The actual index command refuses a4825-token record against the model's2048-token limit before bulk embedding or database writes. Long-record handling and reviewer settings still block actual indexing/answers; generation-model access is unverified. The last recorded Render health was reachable, but curator search returned503 because its administrative role was unconfigured; this is not a successful RAG verification. Phase C also requires independent profile labels, real guidance review and frontend/live evidence. This connection does not establish official source authenticity, matching accuracy or a completed live integration.

## Canonical dataset handoff

The canonical input is repository-root `data/schemes/schemes_clean.json`; it now
contains a byte-identical local copy of the supplied root export, excluded from Git. Follow [the sequential data workflow](../rag/DATA_WORKFLOW.md)
for offline schema/count/quality review, read-only database/provider compatibility
preflight, indexing and protected retrieval checks. The notebook's384-dimensional
MiniLM/FAISS artifacts are incompatible with this768-dimensional Gemini index:
re-embed the cleaned JSON using the query server's configured model. Never pad,
truncate or mix old vectors, and keep all records as curator-only drafts.
