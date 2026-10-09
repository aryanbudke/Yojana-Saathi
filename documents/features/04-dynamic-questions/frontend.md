# Dynamic follow-up questions — Frontend specification

    **Priority:** P0 · **Parent:** [Overview](overview.md) · [Global design tokens](../../design.md) · [Frontend architecture](../../frontend.md)

    ## UI behavior

    - `FollowUpCard` placed near recommendation snapshot with one concise question and progress/status text.
- Use radio options including `Not sure`, explicit Update and visible pending state.
- When answered, show updated rule status and which scheme result changed.
- Provide skip, back/edit answer and explanation “Why we ask this”.
- Don't ask for bank account numbers or sensitive IDs.

    ## API integration

    `POST /api/v1/questions/next`, `POST /api/v1/profiles/answers`.

    Typed components should handle `loading`, `success`, `empty`, `validation-error`, `server-error`, `unverified` (where applicable), and keyboard navigation. Never represent scores as official eligibility probability.

    ## Acceptance

    No repeated questions, no assumptions from “not sure”, and a submitted answer changes only source-backed outcomes.

    **Implementation owner:** [Task One — frontend](../../tasks/task-one.md). Data shape and service behavior are separately documented in [backend.md](backend.md).
