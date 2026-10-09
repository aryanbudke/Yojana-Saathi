# Scheme discovery and filtering — Backend specification

    **Priority:** P0 · **Parent:** [Overview](overview.md) · [API contract](../../api-contract.md) · [Backend architecture](../../backend.md)

    ## API and domain logic

    - Implement `GET /schemes` with parameter validation, pagination, curated publish states and source metadata.
- Use indexed PostgreSQL filters on category, state and status; OR in central schemes where relevant.
- Search scheme summary/keywords with full-text search or simple normalized matching for MVP.
- Query only latest published, verified version; hide or visibly flag stale/closed schemes.
- Tests: national + regional inclusion, no publication of drafts, empty search, pagination.

    ## Interface

    `GET /api/v1/schemes`.

    ## Reliability and evidence

    Use Pydantic validation, fixed error payloads, redacted logs and appropriate source-version identifiers. Unknown rule values must stay unknown, and client-generated input cannot override reviewed official rules.

    ## Dependency

    Scheme/version tables, official source record review.

    ## Acceptance

    Filtering by state/intent narrows results; unknown state does not silently exclude national schemes; no draft/closed scheme is promoted as open.

    **Ownership:** infrastructure/data in [Task Two](../../tasks/task-two.md); GenAI/rule logic and verification in [Task Three](../../tasks/task-three.md).
