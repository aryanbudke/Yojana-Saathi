# Multilingual access and accessibility — Frontend specification

    **Priority:** Accessibility P0 / Hindi P1 · **Parent:** [Overview](overview.md) · [Global design tokens](../../design.md) · [Frontend architecture](../../frontend.md)

    ## UI behavior

    - P0 keyboard traversal, visible focus, logical headings, labels, error announcements and reduced motion.
- Good contrast and opaque backdrop-filter fallback; do not convey rule status by color only.
- P1 locale switcher uses translation dictionaries; Hindi copy reviewed by speaker.
- Avoid floating language menu that steals focus; use compact responsive controls.

    ## API integration

    `locale` request field on extract/guidance endpoints.

    Typed components should handle `loading`, `success`, `empty`, `validation-error`, `server-error`, `unverified` (where applicable), and keyboard navigation. Never represent scores as official eligibility probability.

    ## Acceptance

    Keyboard-only flow works, labels are read correctly, language choice never changes numeric threshold checks.

    **Implementation owner:** [Task One — frontend](../../tasks/task-one.md). Data shape and service behavior are separately documented in [backend.md](backend.md).
