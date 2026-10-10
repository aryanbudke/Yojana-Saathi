# Notebook data → curator staging → retrieval verification

Current state: the actual cleaned JSON passes the existing importer with3,397
unverified records. The supplied PostgreSQL target has migration0005, pgvector
and `vector(768)` staging storage; Gemini768-dimensional output is confirmed.
Token-checked chunking now preserves oversized text and pools chunk embeddings
into the existing one-vector-per-scheme contract. A bounded smoke test using the
three longest records and five other actual records passes16/16 title/topic
queries against PostgreSQL in a disposable schema. This is an eight-record
smoke check, not full-dataset relevance or citation verification. The shared
staging snapshot is still empty; full indexing and authenticated answers are
subsequent gates. Reviewer configuration remains absent. See
[chunk smoke evidence](chunk-smoke-verification.json) and `PROGRESS.md`.
Keep records unverified. Run these steps sequentially and stop on any failure.
Use a backend environment installed from this checkout.

## 1. Offline import and quality review

Place the actual cleaned export at repository-root
`data/schemes/schemes_clean.json`. If only `updated_data.csv` is available, rerun
the notebook's preprocessing/export cells; do not run its FAISS or answer cells.
From the repository root:

```bash
cd services/api
.venv/bin/python scripts/import_notebook_dataset.py \
  ../../data/schemes/schemes_clean.json \
  --output ../../data/schemes/staging-review.json
```

No credentials or database are needed. The existing importer validates the whole
export, records its hash and refuses to overwrite an existing output. Review the
artifact before indexing. If it already exists, compare hashes and choose a new
review filename rather than deleting review evidence.

From `services/api`, produce actual denominators without dumping record text:

```bash
.venv/bin/python - <<'PY'
import json
from collections import Counter
from pathlib import Path
from app.modules.ai.notebook_import import stage_notebook_export
staged = stage_notebook_export(Path('../../data/schemes/schemes_clean.json'))
records = staged['records']
assert isinstance(records, list)
missing = Counter(field for item in records for field in item['missing_fields'])
print(json.dumps({'records': len(records), 'input_sha256': staged['input_sha256'],
                  'publication_allowed': staged['publication_allowed'],
                  'missing_field_counts': dict(missing)}, sort_keys=True))
PY
```

Inspect missing eligibility, benefits, application/documents, official URLs and
verification dates against those denominators. Nonempty URLs/dates are raw claims,
not verified sources. Duplicate identities and non-text fields must be resolved
in a reviewed export; do not silently discard records or guess policy details.
No particular record count is asserted before the actual file is supplied.

## 2. Check embedding compatibility and the target database

| Artifact/path | Embedding contract | Use here |
| --- | --- | --- |
| Notebook `all-MiniLM-L6-v2` / FAISS `IndexFlatIP` | 384 dimensions (historical notebook execution) | Do not load into this backend |
| Existing Gemini retrieval client | Explicit `outputDimensionality=768`, document/query task types | Re-embed cleaned JSON |
| Existing model/migration | `StagingScheme.embedding`, `vector(768)` | Curator staging only |

A FAISS index is a different storage format; its vectors also occupy a different
model space. Do not pad, truncate, reinterpret or mix them with Gemini vectors.
Matching dimensions alone does not establish model compatibility. Index documents
and query them with the **same `GEMINI_EMBEDDING_MODEL`** and dimension setting.
The Blueprint currently names `gemini-embedding-001`; that name is configuration,
not proof that a particular account can call it. The existing embedding client
rejects wrong-size, zero, nonfinite, boolean/string and float32-overflow vectors.
The request uses top-level `taskType` and `outputDimensionality` from the
[REST contract](https://ai.google.dev/api/embeddings). Live Gemini001 ignored
these fields when nested in `embedContentConfig`, returning3072 values; the
corrected top-level request is verified to return768. `autoTruncate=false` is
still sent in `embedContentConfig`, but the live API accepted an over-limit
document, so this flag does not establish full input coverage.
Google documents an input limit of2,048 tokens for
[`gemini-embedding-001`](https://ai.google.dev/gemini-api/docs/models/gemini-embedding-001).
Character counts do not establish token counts. The actual export includes
documents up to20,581 characters; provider acceptance and token coverage still
require live checks. The largest actual document counts4825 tokens. The existing
index CLI reads the model's native input limit and counts documents longest-first
before generating any embeddings. Oversized texts are recursively split near
central newline boundaries, with a character midpoint fallback. Every final
chunk is independently counted and must fit the native limit. Joining those
chunks reconstructs the exact original embedded text, including whitespace;
no clauses or characters are dropped. Malformed/oversized metadata/count
responses and provider errors stop before bulk embedding and database access.
Count requests add provider traffic and must fit the account's quota.

Gemini document chunks use the configured model, retrieval-document task and768
dimensions. Normalize each chunk vector, take its token-weighted mean within the
scheme, then normalize the result. This is a deliberate scheme-discovery
approximation that preserves the current single-vector storage/API contract;
it does not provide independently searchable passages. Specific clauses can be
diluted by pooling, so query review remains required. If broader recall review
fails, coordinate passage storage with the backend owner rather than claiming
accuracy. Short records use their existing unsplit text. Query embeddings and
cosine ranking remain unchanged, and answers still use the complete raw record.
See Google's [normalization guidance](https://ai.google.dev/gemini-api/docs/embeddings)
and [bounded smoke evidence](chunk-smoke-verification.json). The historical
[preflight report](gemini-preflight.json) records the original oversized-input
refusal, before chunking was implemented. No automatic model switch is provided.

The staging model does not store embedding-model identity. Keep an external run
record containing the input SHA-256, actual row count, model identifier,768
dimensions and timestamp. Changing models requires a full staging re-embedding
plus coordinated query-server configuration/restart, even for another768 model.
Never switch models against an existing index and assume its scores remain valid.

Use authorized **server-side** `DATABASE_URL`, `GEMINI_API_KEY`,
`GEMINI_EMBEDDING_MODEL`, `GEMINI_MODEL`, reviewer token/actor configuration; no
secrets in command arguments, chat, Git or reports. The shared Settings/AISettings
read the existing server environment/`.env`. Local defaults are only defaults;
they do not establish a running database. Do not migrate production Supabase ahead
of deployed code; coordinate schema/configuration with the backend owner.

Before paid bulk embedding or indexing, run this read-only preflight from
`services/api` in the authorized target environment. It checks the actual column
and makes one provider query-embedding request, so provider access is required:

```bash
.venv/bin/python - <<'PY'
from sqlalchemy import text
from app.db.models import STAGING_EMBEDDING_DIMENSIONS
from app.db.session import create_database_engine
from app.modules.ai.settings import AISettings
from app.modules.ai.staging_search import embed
settings = AISettings()
assert settings.embedding_model, 'Configure the query/document embedding model'
engine = create_database_engine()
try:
    with engine.connect() as db:
        installed = db.scalar(text("SELECT 1 FROM pg_extension WHERE extname = 'vector'"))
        actual = db.scalar(text("SELECT format_type(atttypid, atttypmod) FROM pg_attribute "
                                "WHERE attrelid = to_regclass('staging_schemes') "
                                "AND attname = 'embedding' AND NOT attisdropped"))
        assert installed and actual == f'vector({STAGING_EMBEDDING_DIMENSIONS})', \
            'Target must provide the existing staging table and vector(768) migration'
    [vector] = embed(settings, ['Curator index compatibility check'], 'RETRIEVAL_QUERY')
    assert len(vector) == STAGING_EMBEDDING_DIMENSIONS
    print('Compatible column/provider vector:', settings.embedding_model, len(vector))
finally:
    engine.dispose()
PY
```

Also confirm that this model name is the one used by the deployed query server;
the preflight cannot inspect remote server configuration. Do not create extensions
or alter tables as a workaround for a failed check. Keep TLS verification enabled;
if this local Python runtime lacks issuer certificates, configure a trusted CA
bundle via `SSL_CERT_FILE` in that runtime before provider requests.

## 3. Transactional indexing and snapshot verification

Use only an authorized staging target. This command replaces the **entire**
curator staging snapshot; it never publishes or touches public scheme versions.
Complete offline review and preflight before running it:

```bash
.venv/bin/python scripts/index_notebook_staging.py ../../data/schemes/schemes_clean.json
```

The existing pipeline token-checks all chunks and embeds/pools all records before
database replacement, validates vectors, and commits deletion/insertion together. Validation/provider failures
leave staging untouched; database/commit failures roll back the replacement.
Do not use `staging-review.json` as the input; it is a different review contract.

After indexing, compare actual count and provenance to the original export:

```bash
.venv/bin/python - <<'PY'
from pathlib import Path
from sqlalchemy import func, select
from sqlalchemy.orm import Session
from app.db.models import StagingScheme
from app.db.session import create_database_engine
from app.modules.ai.notebook_import import stage_notebook_export
staged = stage_notebook_export(Path('../../data/schemes/schemes_clean.json'))
engine = create_database_engine()
try:
    with Session(engine) as db:
        count = db.scalar(select(func.count()).select_from(StagingScheme))
        hashes = set(db.scalars(select(StagingScheme.input_sha256).distinct()))
        assert count == len(staged['records'])
        assert hashes == {staged['input_sha256']}
        print('Actual staging count/hash agree:', count, staged['input_sha256'])
finally:
    engine.dispose()
PY
```

These checks establish snapshot consistency, not official source authenticity or
retrieval quality. Preserve the run record and review artifact. Never load these
unverified records through the publication seed CLI or candidate repository.

## 4. Retrieval and answer verification

Answer requests preserve each complete record up to32,000 characters. Larger
records fail before a model request instead of silently dropping policy clauses.
The [offline context check](answer-context-validation.json) inspected all3,397
actual records: largest25,021 characters, zero truncations. This checks request
construction only; provider acceptance and answer support still need live review.

Run the existing two PostgreSQL integration tests first with
`STAGING_SEARCH_PG_URL` supplied through an authorized disposable test environment:

```bash
.venv/bin/python -m pytest tests/ai/test_staging_search.py -v
```

A skipped test is not a pass. Tests explicitly qualify ORM/DDL with unique
schemas rather than relying on pooler startup `search_path`, and drop only their own
schemas; `vector` must already be installed. Their records/provider responses are
synthetic, so passing them still does not verify the real export or Gemini answers.

For real verification, configure `RAG_VERIFY_BASE_URL` to the backend being
verified and `RAG_VERIFY_QUERY` to a question with evidence in the actual export.
Do not paste citizen information into a provider query. The documented local
origin is `http://127.0.0.1:8000`; use it only after starting/configuring the API.
The previously observed Render origin is `https://yojana-saathi-api.onrender.com`;
health alone does not establish curator readiness. The reviewer must be configured.

From the authorized server environment, exercise the existing protected API
without putting its token in command arguments or printing source text:

```bash
.venv/bin/python - <<'PY'
import json, os
from urllib.parse import urlencode, urlsplit
from urllib.request import HTTPRedirectHandler, Request, build_opener
from app.core.config import Settings
from app.schemas.admin import StagingSearchResponse, StagingAskResponse
class NoRedirect(HTTPRedirectHandler):
    def redirect_request(self, *args, **kwargs):
        return None
opener = build_opener(NoRedirect())
settings = Settings()
assert settings.admin_review_token and settings.admin_reviewer_id, 'Reviewer configuration required'
base = os.environ['RAG_VERIFY_BASE_URL'].rstrip('/')
parsed = urlsplit(base)
assert parsed.scheme == 'https' or (parsed.scheme == 'http' and parsed.hostname in {'localhost', '127.0.0.1'}), 'Use HTTPS or local development'
assert not parsed.username and not parsed.password and not parsed.query and not parsed.fragment
question = os.environ['RAG_VERIFY_QUERY'].strip()
assert 2 <= len(question) <= 500
headers = {'X-Admin-Token': settings.admin_review_token.get_secret_value(),
           'Content-Type': 'application/json'}
search = Request(base + '/api/v1/admin/staging-schemes/search?' + urlencode({'q': question, 'limit': 3}), headers=headers)
with opener.open(search, timeout=90) as response:
    found = StagingSearchResponse.model_validate_json(response.read(2_000_000))
assert found.results, 'No indexed records returned'
ask = Request(base + '/api/v1/admin/staging-schemes/ask', headers=headers,
              data=json.dumps({'question': question, 'limit': 3}).encode(), method='POST')
with opener.open(ask, timeout=90) as response:
    answered = StagingAskResponse.model_validate_json(response.read(2_000_000))
assert answered.sources, 'No indexed sources returned'
assert set(answered.cited_slugs) <= {item.slug for item in answered.sources}
assert not found.publication_allowed and not answered.publication_allowed
assert all(item.review_status == 'draft' for item in [*found.results, *answered.sources])
print('Retrieved draft slugs:', [item.slug for item in found.results])
print('Answer citations:', answered.cited_slugs, '; curator review still required')
PY
```

Do not send a reviewer credential to an unapproved origin. The client refuses
redirects so a server redirect cannot forward the token to another host. This check proves
response/citation contracts only. Inspect actual answer text against the cited raw
records separately: reject unsupported amounts, rules, links or approval claims.
A fixed no-evidence answer is valid abstention, not successful coverage. Record
queries, returned/cited slugs, missing fields, human relevance/support judgments,
errors and exact denominators. Also check unanswered questions, prompt injection,
timeouts and empty staging. Public matching/guidance must continue using only
published, independently reviewed source-backed versions.

Until the actual file, database and provider/configuration are available, record
all real-data checks as BLOCKED in `docs/rag/PROGRESS.md`; never fabricate results.
