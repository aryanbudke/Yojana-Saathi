# Grounded AI explanations and optional RAG — Frontend specification

    **Priority:** Source grounding P0 / RAG P2 · **Parent:** [Overview](overview.md) · [Global design tokens](../../design.md) · [Frontend architecture](../../frontend.md)

    ## UI behavior

    - “Why this match?” disclosure accessible on each card/detail page.
- Show stable, deterministic bullet reasons immediately; AI-paraphrased text is optional enhancement.
- Add source link with verification date and warning if source is stale.
- No anthropomorphic advisor claims or guaranteed-approval copy.

    ## API integration

    Embedded match explanation or future `POST /api/v1/explanations`.

    Typed components should handle `loading`, `success`, `empty`, `validation-error`, `server-error`, `unverified` (where applicable), and keyboard navigation. Never represent scores as official eligibility probability.

    ## Acceptance

    Every factual claim has an underlying reviewed source/rule; fake URLs or unsupported claims are rejected.

    **Implementation owner:** [Task One — frontend](../../tasks/task-one.md). Data shape and service behavior are separately documented in [backend.md](backend.md).
