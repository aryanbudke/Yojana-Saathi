# SarkarSeva notebook connection

The cleaned notebook dataset can enter Yojana Saathi as a local staging artifact for curation. It cannot enter public matching directly: the notebook's saved output has 3,397 unverified records with no official URLs. These saved counts have not been independently reproduced because the CSV and exported artifacts are absent from this workspace.

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

After a reviewed bundle is available, use the existing candidate repository, deterministic matcher, question selection and source-linked guidance. The notebook's similarity search can be considered later for relevance retrieval, with verified/published filtering and measured retrieval tests; optional RAG stays deferred until the core gates pass. OpenAI answer generation and the FAISS runtime are not added to this project.

## Verification and outstanding evidence

The adapter tests use explicitly synthetic temporary records. They verify that raw text is preserved, false verification claims cannot publish, missing eligibility remains visible, invalid/duplicate inputs fail, CLI import works and failures do not overwrite existing output.

The real export is still needed to run the actual import. Phase C also requires independent profile labels, real guidance review and frontend/live evidence. This connection does not establish official source authenticity, matching accuracy or a completed live integration.
