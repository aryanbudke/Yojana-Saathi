# Unverified notebook dataset handoff

The actual export was found at `/Users/srujanmirji/yojana-saathi/schemes_clean.json`.
A byte-identical local copy is now at `data/schemes/schemes_clean.json`, with a
validated review artifact at `data/schemes/staging-review.json`. Both large data
files are locally ignored, not published or committed. The originals are untouched.
See [the measured validation report](../../docs/rag/dataset-validation.json).

The notebook expects `updated_data.csv` and exports under `sarkarseva_processed/`.
If only the CSV is supplied, rerun its preprocessing/export cells to produce
`schemes_clean.json`; rebuilding FAISS or generating notebook answers is unnecessary.
The actual cleaned JSON/CSV now independently validate to3,397 records; all remain
unverified. This count is measured for this file/hash, not hardcoded into import.

The following existing command created the current review artifact. For a future
run choose a new output filename; it intentionally refuses to overwrite this one.
From the repository root, with the existing backend dependencies installed:

```bash
cd services/api
.venv/bin/python scripts/import_notebook_dataset.py \
  ../../data/schemes/schemes_clean.json \
  --output ../../data/schemes/staging-review.json
```

This command validates all records before writing a new review artifact. It
rejects malformed/empty data, non-text values, missing names/slugs and duplicate
slugs. It preserves raw text, records a SHA-256, lists missing policy/source
fields, sets every record to draft, and refuses to overwrite an existing output.
It needs neither database access nor Gemini credentials. A missing input fails
with exit code2; it never creates a replacement synthetic dataset.

`staging-review.json` is a review artifact, not a published seed or indexing input.
Use the original cleaned JSON for indexing. Do not import `schemes.index`,
`scheme_embeddings.npy`, `indexed_documents.json`, `scheme_documents.json` or the
CSV into pgvector. See [the data workflow](../../docs/rag/DATA_WORKFLOW.md) for compatibility preflight,
transactional indexing and protected retrieval verification; live checks remain
blocked.
