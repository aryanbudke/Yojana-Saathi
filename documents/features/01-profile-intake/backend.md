# Profile intake and extraction — Backend specification

    **Priority:** P0 · **Parent:** [Overview](overview.md) · [API contract](../../api-contract.md) · [Backend architecture](../../backend.md)

    ## API and domain logic

    - Implement `POST /profiles/extract` with Pydantic schema and typed nullable fields.
- Gemini returns JSON-only fields (no unrecognized keys); normalize state names to codes and income units explicitly.
- Verify numeric bounds; never convert missing values to zero or guess based on occupation.
- Store user-confirmed edits with origin `user`; don't allow model extraction to overwrite them.
- Limit prompt length and requests; return `503` with manual-entry fallback when model fails.
- Tests: ambiguous text, contradictory statements, unsupported language, field omission, correction priority.

    ## Interface

    `POST /api/v1/profiles/extract` and `POST /api/v1/profiles/answers`.

    ## Reliability and evidence

    Use Pydantic validation, fixed error payloads, redacted logs and appropriate source-version identifiers. Unknown rule values must stay unknown, and client-generated input cannot override reviewed official rules.

    ## Dependency

    Approved profile schema from Backend; Gemini integration from AI owner.

    ## Acceptance

    A wrong AI-extracted field can be edited before matching; age/state/occupation extract correctly in reviewed test cases; unstated caste/income/land ownership are null.

    **Ownership:** infrastructure/data in [Task Two](../../tasks/task-two.md); GenAI/rule logic and verification in [Task Three](../../tasks/task-three.md).
