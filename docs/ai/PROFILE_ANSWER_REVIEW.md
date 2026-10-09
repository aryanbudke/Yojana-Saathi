# Backend answer validation — approved and applied

Owner: Developer 2 (`app/services/profiles.py`). The user approved applying this fix. The patch is applied to the shared checkout and verified; `docs/ai/profile-answer-validation.patch` is retained as the original review artifact, not an outstanding patch to apply.

## Reproduced problem

The existing answer endpoint accepts boolean values for numerical fields. Pydantic converts true/false to age 1/0, annual family income 1/0, and land area 1.0/0.0. These are persisted as USER-confirmed numerical facts. Strict validation in `/matches` cannot recover the original input type after storage. Incorrect numerical facts can affect eligibility decisions.

The six regression cases call the actual API and database: first confirm zero, then submit true or false for each of age, income and land area. Every unpatched case returns 200 rather than the required 422. A successful update can replace a confirmed zero with one.

## Applied fix

The existing Pydantic StrictInt/TypeAdapter imports reject boolean values before the shared profile validator normalizes numerical fields. The existing route catches the resulting ValidationError and returns its established 422 envelope. Ordinary numerical input, confirmed zero, boolean disability/student facts, registration yes/no/not_sure, null answers, schemas, routes and dependencies are unchanged.

The patch includes six regression tests. It changes one shared service and adds one Developer 3 test file. All callers were checked: the backend answer route and the matching confirmation service both use update_confirmed_fact.

## Verification

The regression was first reproduced and tested in a disposable copy, then verified in the shared checkout after approval:

- Before the fix: six regression failures, each with actual 200 instead of expected 422.
- After the fix in both copies: 243 tests passed; ruff lint/format passed; clean-cache mypy passed (90 files).
- The synthetic evaluation output reproduced byte-for-byte after the fix.
- Commit reference: `ai-phase-c-answer-guard` (verified fix tag).

The owned TypeAdapter typing workaround was made portable so clean-cache type checks also work in the isolated copy. Runtime policy validation is unchanged. The full-flow test replaces only Gemini HTTP transport; it runs extraction → human correction/confirmation → SQL candidate retrieval → unknown match → reviewed registration question → answer → rematch → source-linked guidance, with exactly one model call.

To verify the applied fix from the repository root:

```bash
cd services/api
.venv/bin/ruff check .
.venv/bin/ruff format --check .
.venv/bin/mypy --no-incremental app tests scripts/evaluate_matching.py
.venv/bin/pytest
```

Previously coerced stored answers cannot be distinguished from genuine numerical values. Do not rewrite or delete them automatically; the citizen can correct their profile. Phase C also still needs independent label review, reviewed real guidance and frontend/live evidence. Phase D remains pending.
