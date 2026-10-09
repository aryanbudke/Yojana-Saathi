# Admin knowledge-base curation — Backend specification

    **Priority:** P0 minimal / P1 UI · **Parent:** [Overview](overview.md) · [API contract](../../api-contract.md) · [Backend architecture](../../backend.md)

    ## API and domain logic

    - Provide migration and seed workflow with field validation, stable `scheme_version_id` and source FK integrity.
- Review state transitions `draft -> verified -> published` and append-only version history.
- Prevent publish if required rule or official source lacks provenance.
- Restrict admin routes by role and write audit logs.
- Tests: draft invisible, illegal publish blocked, past versions preserved.

    ## Interface

    P0 CLI seed/migrations; P1 `/api/v1/admin/schemes`.

    ## Reliability and evidence

    Use Pydantic validation, fixed error payloads, redacted logs and appropriate source-version identifiers. Unknown rule values must stay unknown, and client-generated input cannot override reviewed official rules.

    ## Dependency

    Data model + source-review checklist; admin auth if UI built.

    ## Acceptance

    No unpublished/unsupported rule reaches public matching; changes are traceable; at least one reviewer signs off.

    **Ownership:** infrastructure/data in [Task Two](../../tasks/task-two.md); GenAI/rule logic and verification in [Task Three](../../tasks/task-three.md).
