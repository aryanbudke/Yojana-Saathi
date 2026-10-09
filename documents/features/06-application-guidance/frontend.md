# Application guidance and document readiness — Frontend specification

    **Priority:** P0 · **Parent:** [Overview](overview.md) · [Global design tokens](../../design.md) · [Frontend architecture](../../frontend.md)

    ## UI behavior

    - `ApplicationReadiness` progress summary derived from documents and unresolved conditions, without approval predictions.
- `DocumentChecklist` supports local “I have it” checkboxes but never claims government verified a document.
- Ordered `ApplicationSteps` show official sources, cautions and external `Apply on official portal` CTA.
- Empty/stale guidance shows verification warning and avoids fake apply buttons.
- Make printing/saving checklist optional; no ID uploads in MVP.

    ## API integration

    `GET /api/v1/guidance/{scheme_id}`.

    Typed components should handle `loading`, `success`, `empty`, `validation-error`, `server-error`, `unverified` (where applicable), and keyboard navigation. Never represent scores as official eligibility probability.

    ## Acceptance

    No invented documents/links, links point to official application pathway, not homepage when a verified deep link exists.

    **Implementation owner:** [Task One — frontend](../../tasks/task-one.md). Data shape and service behavior are separately documented in [backend.md](backend.md).
