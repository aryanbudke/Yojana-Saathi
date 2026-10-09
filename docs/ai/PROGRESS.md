# Developer 3 progress — feat/ai-matching

Assigned request: pasted senior AI/eligibility role; specifications in `documents/` were checked against the previously read full specification and are identical. The current backend handoff, schemas, repositories, services, tests and configuration were read before editing.

Workspace: `workspaces/upstream`; branch: `feat/ai-matching`. Developer 2's root progress log and frontend files are not changed. Sequence: A → B → C → D; complete checks and commit before starting the next phase.

## A — Adapt evaluator and prompt contracts
- Status: COMPLETED
- Files: new `app/modules/matching/{facts,rules,evaluator}.py`, AI prompt templates/validation, focused `tests/matching` and `tests/ai`, this log and interface notes.
- Tests/results: baseline 79 tests passed; tests were written before implementation. Final: 140 pytest tests passed, ruff check . passed, mypy app tests passed (77 files). Self-review checked unknown propagation, exclusion precedence, provenance and root/row agreement.
- Problems: existing land_registration is yes/no/not_sure (not boolean); preserve existing DTOs. CandidateRule owns source provenance and severity; root JSON must not hide unsupported extra policy.
- Commit: `ai-phase-a` (Git tag pointing to the verified phase commit).
- Next: B, only after A passes and commits.

## B — Gemini, matching and follow-up APIs
- Status: COMPLETED
- Files: owned Gemini/settings/routes, matching/questions/explanations services; AI environment template; API/transport/question tests; docs/ai/README.md. Shared wiring: two lines in main.py and generated openapi.json only.
- Tests/results: 178 pytest tests passed, 97% new-module statement coverage, ruff lint/format passed, mypy passed (86 files). Existing OpenAPI paths and component schemas byte-for-byte equivalent after JSON loading; new routes/components only.
- Problems: wiring requires minimal registration in `app/main.py`; use existing profiles, candidate/run repositories, error handlers and guidance. No schema or persistence rewrite. Draft null fields initially suppressed follow-ups; fixed and regression-tested. Unknown answers use existing null/registration not_sure values. Live Gemini/real PostgreSQL are still unverified; transport and SQLite tests are explicitly labeled.
- Commit: `ai-phase-b` (Git tag pointing to the verified phase commit).
- Next: C after local API integration verification; real dataset/live model checks remain explicit release dependencies.

## C — Synthetic evaluation, integration and security
- Status: BLOCKED
- Files: matching benchmark module/CLI, 44-profile synthetic fixture, regression/review-manifest/CLI tests, evaluation.json, LABEL_REVIEW.md, review.example.json. Reused production ranking key; hardened identifier rejection and membership-policy equivalence during security review.
- Tests/results: initial checkpoint: 236 pytest tests passed; 96% module coverage measured before the final membership-equivalence regression; lint/format and mypy app tests scripts/evaluate_matching.py passed (89 files). Wheel build passed. Evaluation byte-for-byte reproduced: 164/164 proposed classification agreement, 0/149 proposed unsafe passes, 38/38 missing checks, 32/123 top-three relevance hits, 781/781 synthetic source links, 3/3 invalid inputs rejected. These are unreviewed comparisons, not independently reviewed accuracy. Accuracy/FPR/recall/precision fields remain null; real guidance completeness is unmeasured.
- Problems: independently reviewed labels, real official dataset, PostgreSQL deployment and frontend review are unavailable. Proposed labels must not be reported as independently reviewed accuracy. A concrete review pack is open and an independent reviewer/corrections have been requested. Local database/API wiring and adversarial tests pass; the real-data/UI/live checks are not claimed complete.
- Continuation: checked origin/main (no new upstream commits or real dataset/UI). Added one complete extract → confirm → question → answer → rematch → guidance test and portable TypeAdapter typing; 237 tests passed at that commit. Found six boolean-to-number answer bugs in Developer 2's service and prepared a tested review patch. The user then approved applying the backend fix. Applied the three-line guard in `app/services/profiles.py` and added `tests/matching/test_answer_validation.py`; all 243 tests, lint/format and clean-cache types pass in the shared checkout. Reproduced evaluation.json byte-for-byte. Existing confirmed numerical values survive rejected boolean answers. Updated PROFILE_ANSWER_REVIEW.md and README.md; retained the patch as a historical review artifact. No new independently reviewed accuracy claim.
- Commit: `ai-phase-c-checkpoint`, `ai-phase-c-followup` and `ai-phase-c-answer-guard` (verified work and approved fix, not a completed Phase C).
- Next: obtain independent review, real guidance checklist and frontend/live integration evidence; rerun evaluation. D only after C acceptance, including review evidence.

### C continuation — connect notebook data for curation
- Status: COMPLETED (staging adapter only; Phase C remains BLOCKED)
- Files: `app/modules/ai/notebook_import.py`, `scripts/import_notebook_dataset.py`, `tests/ai/test_notebook_import.py`, NOTEBOOK_INTEGRATION.md, README.md and this log. No backend-owned service, database schema, public DTO, frontend file or original notebook was modified.
- Scope: the user requested connecting the SarkarSeva preprocessing notebook. Its cleaned JSON now imports into a local unpublished review artifact. Original fields and input hash are preserved; every record remains a draft regardless of claimed verification. Missing policy/source fields are recorded; malformed records and duplicate slugs are rejected. Existing outputs cannot be overwritten. Staging cannot validate as a published SeedBundle.
- Tests/results: first test run failed because the adapter did not exist; after implementation all 10 adapter/CLI tests passed, and the full backend suite passed (253 tests, one existing Starlette deprecation warning). Clean-cache mypy passed (93 files). Initial lint/format failures were formatting only and were fixed; final lint/format passed (100 files). Self-review checked the ingestion boundary, duplicate handling, error messages, preservation of policy text, false verification claims and output overwrite protection.
- Problems: `updated_data.csv`, `schemes_clean.json` and the notebook's index/export artifacts are not present locally, so no real dataset import is claimed. Notebook saved counts are not independently reproduced. Reviewed official URLs, rule ASTs, source-linked guidance and publication evidence still require Developer 2 curation. FAISS/OpenAI runtime integration is deferred under the core-gate rule.
- Commit: `ai-phase-c-notebook-staging` (verified staging adapter tag).
- Next: supply the actual cleaned JSON and run the import; curate a reviewed subset through Developer 2's existing contract. Obtain independent labels and frontend/live evidence before Phase D.

## D — Report, presentation and live demo
- Status: PENDING
- Files: none yet.
- Tests/results: not started.
- Problems: live joint demo and all six BRD outcomes require the earlier gates and production data.
- Commit: none.
- Next: final integration gate.
