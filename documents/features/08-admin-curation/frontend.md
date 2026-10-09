# Admin knowledge-base curation — Frontend specification

    **Priority:** P0 minimal / P1 UI · **Parent:** [Overview](overview.md) · [Global design tokens](../../design.md) · [Frontend architecture](../../frontend.md)

    ## UI behavior

    - P0: no public-facing admin page required; maintain curated seed files with peer review.
- P1: protected internal page with scheme list, source URL, rule editor and Draft/Publish control.
- Show validation errors for missing source, conflicting thresholds and unknown application links.
- Do not expose admin navigation to citizen roles.

    ## API integration

    P0 CLI seed/migrations; P1 `/api/v1/admin/schemes`.

    Typed components should handle `loading`, `success`, `empty`, `validation-error`, `server-error`, `unverified` (where applicable), and keyboard navigation. Never represent scores as official eligibility probability.

    ## Acceptance

    No unpublished/unsupported rule reaches public matching; changes are traceable; at least one reviewer signs off.

    **Implementation owner:** [Task One — frontend](../../tasks/task-one.md). Data shape and service behavior are separately documented in [backend.md](backend.md).
