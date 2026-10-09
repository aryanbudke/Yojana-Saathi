# Scheme discovery and filtering — Frontend specification

    **Priority:** P0 · **Parent:** [Overview](overview.md) · [Global design tokens](../../design.md) · [Frontend architecture](../../frontend.md)

    ## UI behavior

    - `CategoryFilter` with Farmer, Student, Women, Senior citizen, Small business, Housing.
- Search with explicit submit and clear filters; maintain query in URL for share/back navigation.
- `SchemeCard` must show scheme name, reason for relevance, source verified date and link to details.
- Loading skeleton, empty state and network retry; don't display fabricated matches.
- Mobile uses scrollable filter chips rather than cramped sidebars.

    ## API integration

    `GET /api/v1/schemes`.

    Typed components should handle `loading`, `success`, `empty`, `validation-error`, `server-error`, `unverified` (where applicable), and keyboard navigation. Never represent scores as official eligibility probability.

    ## Acceptance

    Filtering by state/intent narrows results; unknown state does not silently exclude national schemes; no draft/closed scheme is promoted as open.

    **Implementation owner:** [Task One — frontend](../../tasks/task-one.md). Data shape and service behavior are separately documented in [backend.md](backend.md).
