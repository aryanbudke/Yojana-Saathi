# Direct matching implementation progress

Tasks are executed in dependency order. A task is marked complete only after its
tests and acceptance checks pass.

| ID | Task | Status |
|---|---|---|
| DM-01 | Inspect dataset and matching/RAG dependency boundary | COMPLETED |
| DM-02 | Add structured support-needs profile input | PENDING |
| DM-03 | Normalize safe rules and query dataset directly with SQL | PENDING |
| DM-04 | Filter mandatory failures and rank deterministic matches | PENDING |
| DM-05 | Explain matches, missing facts, and preliminary status | PENDING |
| DM-06 | Separate citizen matching routes from RAG/admin routes | PENDING |
| DM-07 | Evaluate labelled profiles and run full regression checks | PENDING |

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
