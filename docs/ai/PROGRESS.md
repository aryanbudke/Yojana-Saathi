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
- Status: PENDING
- Files: none yet.
- Tests/results: not started.
- Problems: independently reviewed labels, real official dataset, PostgreSQL deployment and frontend review are unavailable. Proposed labels must not be reported as independently reviewed accuracy.
- Commit: none.
- Next: D only after C acceptance, including review evidence.

## D — Report, presentation and live demo
- Status: PENDING
- Files: none yet.
- Tests/results: not started.
- Problems: live joint demo and all six BRD outcomes require the earlier gates and production data.
- Commit: none.
- Next: final integration gate.
