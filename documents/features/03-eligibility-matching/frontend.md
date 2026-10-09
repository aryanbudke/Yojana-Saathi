# Deterministic eligibility matching — Frontend specification

    **Priority:** P0 · **Parent:** [Overview](overview.md) · [Global design tokens](../../design.md) · [Frontend architecture](../../frontend.md)

    ## UI behavior

    - `MatchBadge`: All checked conditions met, Needs verification, Not eligible, Manual review.
- `RuleChecklist` groups passes, fails and unknown requirements with short readable labels.
- Add “Why this match?” expandable section with official source and verification date.
- Don't show “90% eligible”; if relevance ordering used, keep raw score invisible.
- On answers, animate only changed labels and announce updates accessibly.

    ## API integration

    `POST /api/v1/matches`.

    Typed components should handle `loading`, `success`, `empty`, `validation-error`, `server-error`, `unverified` (where applicable), and keyboard navigation. Never represent scores as official eligibility probability.

    ## Acceptance

    Known exclusion results in not-eligible; unknown mandatory fact prevents final pass; rules are reproducible with zero model calls.

    **Implementation owner:** [Task One — frontend](../../tasks/task-one.md). Data shape and service behavior are separately documented in [backend.md](backend.md).
