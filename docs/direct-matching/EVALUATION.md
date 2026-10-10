# Direct matching evaluation

## Synthetic regression result

The checked-in benchmark contains 44 synthetic profiles, four synthetic policy
families, and 164 labelled eligibility comparisons. The reproducible report
matches `docs/ai/evaluation.json` exactly.

| Measure | Result |
|---|---:|
| Provisional classification agreement | 164 / 164 (100%) |
| Unsafe checked passes | 0 / 149 non-pass labels (0%) |
| Missing-information recall | 38 / 38 (100%) |
| Provisional precision@3 | 32 / 123 (26.02%) |
| Rule-source UUID coverage | 781 / 781 (100%) |
| Invalid-profile checks | 3 / 3 (100%) |
| Recorded failures | 0 |

These are synthetic regression results, not evidence of real-world approval
accuracy. The label author has not been independently reviewed, so the benchmark
correctly reports them under `provisional_unreviewed_label_comparison` and leaves
the official accuracy fields null. Precision@3 is also constrained by sparse
relevance labels: it divides relevant hits across three slots for every profile.

## Full verification gate

- Backend Ruff lint: passed.
- Backend changed-file formatting: passed.
- Backend application mypy: 80 source files passed.
- Backend pytest: 420 passed, 2 PostgreSQL-only admin staging tests skipped
  because `STAGING_SEARCH_PG_URL` was not configured.
- OpenAPI artifact: regenerated and contract test passed.
- Frontend TypeScript and ESLint: passed.
- Frontend Vitest: 38 passed, 5 environment-gated tests skipped.
- Frontend production build: passed; all 16 routes generated.

## Existing repository hygiene outside this change

The repository-wide formatting check reports three backend and 39 frontend files
that were already unformatted on the newly fetched `origin/main`; none are part
of this direct-matching change. Full test type-checking also reports one existing
typing issue in `tests/ai/test_gemini.py:173`. Application code type-checks
cleanly. These unrelated files were not rewritten.

