# Unverified notebook dataset handoff

The actual dataset is missing. Place the notebook's **cleaned JSON records** at
`data/schemes/schemes_clean.json` in this repository. Do not create records from
notebook preview output or use synthetic fixtures as government data.

The notebook expects `updated_data.csv` and exports under `sarkarseva_processed/`.
If only the CSV is supplied, rerun its preprocessing/export cells to produce
`schemes_clean.json`; rebuilding FAISS or generating notebook answers is unnecessary.
The earlier 3,397-record count is historical, not a required or verified count.

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
CSV into pgvector. See `docs/ai/NOTEBOOK_INTEGRATION.md` for the existing protected indexing/search
workflow; live verification remains blocked.
