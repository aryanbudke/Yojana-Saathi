# Grounded AI explanations and optional RAG — Backend specification

    **Priority:** Source grounding P0 / RAG P2 · **Parent:** [Overview](overview.md) · [API contract](../../api-contract.md) · [Backend architecture](../../backend.md)

    ## API and domain logic

    - Build `ExplanationService` fed only verified rule outcomes and source IDs.
- Optionally call Gemini to simplify language under a strict citations/claims output schema.
- Validate references against the returned scheme version; strip unsupported links and fall back to deterministic text.
- P2 pgvector/RAG may retrieve trusted excerpts filtered by scheme version; never modify evaluator results.
- Tests: fabricated citations, injected source instructions, model outage fallback, stale policy notices.

    ## Interface

    Embedded match explanation or future `POST /api/v1/explanations`.

    ## Reliability and evidence

    Use Pydantic validation, fixed error payloads, redacted logs and appropriate source-version identifiers. Unknown rule values must stay unknown, and client-generated input cannot override reviewed official rules.

    ## Dependency

    Working eligibility rule results and source mapping.

    ## Acceptance

    Every factual claim has an underlying reviewed source/rule; fake URLs or unsupported claims are rejected.

    **Ownership:** infrastructure/data in [Task Two](../../tasks/task-two.md); GenAI/rule logic and verification in [Task Three](../../tasks/task-three.md).
