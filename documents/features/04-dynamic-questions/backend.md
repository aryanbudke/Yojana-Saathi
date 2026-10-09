# Dynamic follow-up questions — Backend specification

    **Priority:** P0 · **Parent:** [Overview](overview.md) · [API contract](../../api-contract.md) · [Backend architecture](../../backend.md)

    ## API and domain logic

    - `POST /questions/next` inspects `unknown_rules` for top candidates, deduplicates fields and prioritizes decision impact.
- Prefer configured `question_template` from reviewed rules; Gemini may only simplify wording, not change conditions.
- `POST /profiles/answers` validates field/value types, writes origin `user`, and flags rematch.
- Questions for sensitive unsupported policy clauses return manual review instead of collecting PII.
- Tests: deduplication, `not_sure`, no available question, answer/rematch behavior.

    ## Interface

    `POST /api/v1/questions/next`, `POST /api/v1/profiles/answers`.

    ## Reliability and evidence

    Use Pydantic validation, fixed error payloads, redacted logs and appropriate source-version identifiers. Unknown rule values must stay unknown, and client-generated input cannot override reviewed official rules.

    ## Dependency

    Eligibility outcome structure and reviewed rule question templates.

    ## Acceptance

    No repeated questions, no assumptions from “not sure”, and a submitted answer changes only source-backed outcomes.

    **Ownership:** infrastructure/data in [Task Two](../../tasks/task-two.md); GenAI/rule logic and verification in [Task Three](../../tasks/task-three.md).
