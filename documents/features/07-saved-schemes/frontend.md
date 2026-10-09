# Saved schemes (stretch) — Frontend specification

    **Priority:** P1 · **Parent:** [Overview](overview.md) · [Global design tokens](../../design.md) · [Frontend architecture](../../frontend.md)

    ## UI behavior

    - Only display Saved nav and bookmark action if feature is implemented.
- `SaveSchemeButton` with toggled pressed state and useful label.
- Saved page supports empty state, links to detail, and verification-date caution.
- Never promise account sync without authentication.

    ## API integration

    `GET/POST /api/v1/saved` and `DELETE /api/v1/saved/{scheme_id}` (stretch).

    Typed components should handle `loading`, `success`, `empty`, `validation-error`, `server-error`, `unverified` (where applicable), and keyboard navigation. Never represent scores as official eligibility probability.

    ## Acceptance

    Save/unsave is reversible, duplicate free, and anonymous storage expires with session.

    **Implementation owner:** [Task One — frontend](../../tasks/task-one.md). Data shape and service behavior are separately documented in [backend.md](backend.md).
