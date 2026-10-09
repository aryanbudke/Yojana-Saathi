# Profile intake and extraction — Frontend specification

    **Priority:** P0 · **Parent:** [Overview](overview.md) · [Global design tokens](../../design.md) · [Frontend architecture](../../frontend.md)

    ## UI behavior

    - Build `ProfileComposer` with 500–1000 character counter, example prompt and high-contrast primary CTA.
- Show extracting/error/manual-mode states; do not lock the form while model calls fail.
- Render `EditableProfileChips` for age, state, occupation, family income and other extracted fields; use clear unknown labels.
- Ask user to confirm machine-extracted values before first `/matches` call.
- Don't include sensitive-upload or Aadhaar-number fields.
- Mobile: multiline input first; review chips wrap; keyboard accessible edit dialog.

    ## API integration

    `POST /api/v1/profiles/extract` and `POST /api/v1/profiles/answers`.

    Typed components should handle `loading`, `success`, `empty`, `validation-error`, `server-error`, `unverified` (where applicable), and keyboard navigation. Never represent scores as official eligibility probability.

    ## Acceptance

    A wrong AI-extracted field can be edited before matching; age/state/occupation extract correctly in reviewed test cases; unstated caste/income/land ownership are null.

    **Implementation owner:** [Task One — frontend](../../tasks/task-one.md). Data shape and service behavior are separately documented in [backend.md](backend.md).
