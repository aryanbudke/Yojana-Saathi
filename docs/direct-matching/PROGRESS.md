# Direct matching implementation progress

Tasks are executed in dependency order. A task is marked complete only after its
tests and acceptance checks pass.

| ID | Task | Status |
|---|---|---|
| DM-01 | Inspect dataset and matching/RAG dependency boundary | COMPLETED |
| DM-02 | Add structured support-needs profile input | COMPLETED |
| DM-03 | Normalize safe rules and query dataset directly with SQL | COMPLETED |
| DM-04 | Filter mandatory failures and rank deterministic matches | COMPLETED |
| DM-05 | Explain matches, missing facts, and preliminary status | COMPLETED |
| DM-06 | Separate citizen matching routes from RAG/admin routes | COMPLETED |
| DM-07 | Evaluate labelled profiles and run full regression checks | COMPLETED |

## DM-01 — Dataset and dependency audit

- **Status:** COMPLETED
- **Files created or modified:**
  `docs/direct-matching/DATASET_AUDIT.md`,
  `docs/direct-matching/PROGRESS.md`
- **Verification:** Inspected the supplied CSV in its archive and confirmed
  3,397 rows, the exact 13-column schema, 541 Central records, 2,856 State
  records, and 3,397 records with no official URL or verification date. Traced
  `POST /api/v1/matches` to the deterministic evaluator and documented its
  module-level coupling to the admin RAG routes.
- **Tests executed:**
  `services/api/.venv/bin/pytest -q tests/test_draft_import.py tests/matching/test_api.py`
  — 18 passed; one upstream Starlette TestClient deprecation warning.
- **Problems encountered:** All supplied bulk records are unverified. They can
  be ranked as preliminary candidates but cannot be promoted to verified
  eligibility guidance.
- **Commit reference:** This checkpoint's `docs(matching)` commit.
- **Next task:** DM-02 — Add structured support-needs profile input.

## DM-02 — Structured support-needs profile input

- **Status:** COMPLETED
- **Files created or modified:** Backend profile schema, extraction prompt and
  validation, profile boundary validation and tests; frontend API contract,
  profile model/editors, English/Hindi/Kannada labels, and model tests.
- **Tests executed:**
  - Backend Ruff and focused mypy — passed.
  - Backend profile/extraction/contract tests — 38 passed; one upstream
    Starlette TestClient deprecation warning.
  - Frontend typecheck and ESLint — passed.
  - Frontend profile/i18n tests — 13 passed.
- **Problems encountered:** A support-needs value is a list, while the existing
  profile editor handled scalar values only. It now accepts comma-separated
  input and converts it to a bounded, normalized, duplicate-free list.
- **Commit reference:** This checkpoint's `feat(profile)` commit.
- **Next task:** DM-03 — Normalize safe rules and query the dataset directly
  with SQL.

## DM-03 — Conservative normalization and direct SQL dataset query

- **Status:** COMPLETED
- **Files created or modified:**
  `services/api/app/modules/matching/preliminary.py`,
  `services/api/app/repositories/preliminary_schemes.py`, and
  `services/api/tests/matching/test_preliminary.py`.
- **Tests executed:** Ruff and focused mypy passed; preliminary repository,
  normalizer, and draft-import tests passed (8 tests).
- **Problems encountered:** The initial sentence boundary split an income
  condition after the abbreviation `Rs.` and a fixture accidentally assigned
  the same student eligibility text to every category. Both were corrected and
  the full focused test set was rerun successfully.
- **Safety result:** Proposed age, income, occupation, and residence rules are
  always marked unverified. Unrecognized text is retained as an uncertain
  fragment and no proposed rule is evaluated as citizen eligibility.
- **Commit reference:** This checkpoint's `feat(matching)` commit.
- **Next task:** DM-04 — Exclude mandatory failures and rank direct matches.

## DM-04 — Mandatory filtering and deterministic ranking

- **Status:** COMPLETED
- **Files created or modified:** Verified candidate metadata/repository,
  `app/modules/matching/ranking.py`, matching service, focused ranking tests,
  and API expectations for excluded failures.
- **Tests executed:** Ruff and focused mypy passed; rule, ranking, explanation,
  API, and synthetic benchmark tests passed (121 tests).
- **Problems encountered:** Existing API tests expected failed candidates to be
  returned with a `not_eligible` status. The required behavior is to exclude
  mandatory failures, so tests now verify an empty recommendation set while a
  later corrected profile can still rematch successfully.
- **Scoring boundary:** The score combines metadata overlap, geographic scope,
  and the proportion of reviewed conditions satisfied. It is documented and
  tested as an ordering signal, never an approval probability. Preliminary
  ranking ignores eligibility prose entirely.
- **Commit reference:** This checkpoint's `feat(matching)` commit.
- **Next task:** DM-05 — Add explanations, missing facts, and preliminary labels.

## DM-05 — Explanations, missing information, and preliminary labels

- **Status:** COMPLETED
- **Files created or modified:** Matching response schema, verified repository
  metadata, matching/ranking services and API tests; frontend contract, both
  recommendation-card implementations, explanation panel, and English/Hindi/
  Kannada messages.
- **Tests executed:** Backend Ruff and focused mypy passed; API, ranking,
  explanation, and fixture-contract tests passed (32 tests). Frontend typecheck
  and ESLint passed; focused API/i18n tests passed (8 passed, 5 intentionally
  skipped by environment guards).
- **Problems encountered:** Preliminary records cannot satisfy the original
  response requirement for an official URL and verification date. The contract
  was extended additively with a verification discriminator, while a schema
  validator prevents preliminary results from carrying verified metadata and
  still requires verified results to have their date and source.
- **Safety result:** Draft eligibility text is used only to identify information
  that may need verification. It never produces pass/fail outcomes. Draft
  scheme pages are not linked through the verified public detail endpoint.
- **Commit reference:** This checkpoint's `feat(matching)` commit.
- **Next task:** DM-06 — Separate citizen matching routes from RAG/admin routes
  and complete targeted follow-up behavior.

## DM-06 — Route isolation and targeted follow-up questions

- **Status:** COMPLETED
- **Files created or modified:** Dedicated citizen matching router, AI/admin
  route cleanup, application router registration, deterministic question
  fallback, API test coverage, and route-isolation test.
- **Tests executed:** Ruff and focused mypy passed; matching API, question,
  answer-validation, route-isolation, and staging-search regression tests passed
  (96 passed, 2 environment-gated tests skipped).
- **Problems encountered:** An initial generic category fallback repeated after
  citizens had already answered a reviewed condition as unknown. It was removed;
  preliminary follow-ups now require an actual metadata-matched draft with a
  narrowly proposed, unanswered field.
- **Dependency result:** The citizen router imports deterministic matching and
  question services only. RAG, embeddings, and pgvector remain available solely
  to the existing admin staging routes.
- **Commit reference:** This checkpoint's `refactor(matching)` commit.
- **Next task:** DM-07 — Run labelled evaluation and full regression checks.

## DM-07 — Labelled evaluation and full regression

- **Status:** COMPLETED
- **Files created or modified:** Regenerated `services/api/openapi.json`, added
  `docs/direct-matching/EVALUATION.md`, and finalized this progress log.
- **Tests executed:** 420 backend tests passed with 2 PostgreSQL-only admin
  staging tests skipped; backend application mypy passed for 80 modules. The
  frontend passed typecheck, ESLint, 38 tests (5 environment-gated skips), and
  its production build. The OpenAPI artifact matches the application.
- **Synthetic evaluation:** 44 profiles, 164/164 provisional classification
  agreement, 0/149 unsafe passes, 38/38 missing-information recall, 781/781
  source linkage, 3/3 invalid-profile checks, and zero recorded failures.
- **Limitations:** No independent label-review receipt exists, so results remain
  provisional and official accuracy fields remain null. Repository-wide format
  checks expose pre-existing drift in unrelated files fetched from `origin/main`;
  full test mypy also exposes one unrelated annotation issue in
  `tests/ai/test_gemini.py:173`. These were recorded but not modified.
- **Commit reference:** This checkpoint's `test(matching)` commit.
- **Next task:** None — direct matching implementation is complete.
