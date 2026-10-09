# Saved schemes (stretch) — Backend specification

    **Priority:** P1 · **Parent:** [Overview](overview.md) · [API contract](../../api-contract.md) · [Backend architecture](../../backend.md)

    ## API and domain logic

    - `POST /saved`, `DELETE /saved/{scheme_id}`, `GET /saved` scoped to valid session.
- Unique `(session_id, scheme_id)`, expiry cascade and reasonable size limit.
- Avoid storing sensitive profile fields with bookmarks.
- Tests: duplicate save, cross-session isolation, expired session.

    ## Interface

    `GET/POST /api/v1/saved` and `DELETE /api/v1/saved/{scheme_id}` (stretch).

    ## Reliability and evidence

    Use Pydantic validation, fixed error payloads, redacted logs and appropriate source-version identifiers. Unknown rule values must stay unknown, and client-generated input cannot override reviewed official rules.

    ## Dependency

    Session model; after P0 core flow.

    ## Acceptance

    Save/unsave is reversible, duplicate free, and anonymous storage expires with session.

    **Ownership:** infrastructure/data in [Task Two](../../tasks/task-two.md); GenAI/rule logic and verification in [Task Three](../../tasks/task-three.md).
