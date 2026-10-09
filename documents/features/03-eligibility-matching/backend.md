# Deterministic eligibility matching — Backend specification

    **Priority:** P0 · **Parent:** [Overview](overview.md) · [API contract](../../api-contract.md) · [Backend architecture](../../backend.md)

    ## API and domain logic

    - Parse allowed DSL (`all`, `any`, `not`, `eq`, `in`, `lt`, `lte`, `gt`, `gte`) into validated AST.
- Evaluate four-valued outcomes with conservative manual review for policy ambiguity.
- Apply independently verified exclusion predicates before optimistic labels.
- Keep `relevance_score` separate from `verdict`; persist `rule_results` with source ID.
- `POST /matches` returns all required fields for auditable UI explanation.
- Unit tests: truth tables, boundary values, missing fields, exclusion overrides, contradictory inputs.

    ## Interface

    `POST /api/v1/matches`.

    ## Reliability and evidence

    Use Pydantic validation, fixed error payloads, redacted logs and appropriate source-version identifiers. Unknown rule values must stay unknown, and client-generated input cannot override reviewed official rules.

    ## Dependency

    Published rule versions, ProfileFacts schema, rule engine from Task Three.

    ## Acceptance

    Known exclusion results in not-eligible; unknown mandatory fact prevents final pass; rules are reproducible with zero model calls.

    **Ownership:** infrastructure/data in [Task Two](../../tasks/task-two.md); GenAI/rule logic and verification in [Task Three](../../tasks/task-three.md).
