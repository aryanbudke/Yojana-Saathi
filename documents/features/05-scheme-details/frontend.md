# Scheme details and verified sources — Frontend specification

    **Priority:** P0 · **Parent:** [Overview](overview.md) · [Global design tokens](../../design.md) · [Frontend architecture](../../frontend.md)

    ## UI behavior

    - Detail header with scheme name, government level, status, saved action only if functional.
- Tabs or sections: Overview, Eligibility, Documents, How to Apply, Official Sources.
- Rule explanations show pass/unknown/fail and direct source links where available.
- Display explicit “Last verified on …” and independent-project disclaimer.
- Mobile collapsed accordions with accessible `aria-expanded`.

    ## API integration

    `GET /api/v1/schemes/{scheme_id}`.

    Typed components should handle `loading`, `success`, `empty`, `validation-error`, `server-error`, `unverified` (where applicable), and keyboard navigation. Never represent scores as official eligibility probability.

    ## Acceptance

    Every eligibility statement points to current curated source metadata; links open in safe external tabs; no unapproved government branding.

    **Implementation owner:** [Task One — frontend](../../tasks/task-one.md). Data shape and service behavior are separately documented in [backend.md](backend.md).
