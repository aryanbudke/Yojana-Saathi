# Scheme details and verified sources — Backend specification

    **Priority:** P0 · **Parent:** [Overview](overview.md) · [API contract](../../api-contract.md) · [Backend architecture](../../backend.md)

    ## API and domain logic

    - `GET /schemes/{scheme_id}` loads latest published source-backed scheme version and related rules/documents/steps.
- Return a consistent source field for each eligibility item and official URL metadata.
- If no verified/current version, return stale/manual-review status; do not fabricate content.
- Validate HTTPS links and document same-source exceptions.
- Tests: missing scheme, stale version, missing URL, rule-source integrity.

    ## Interface

    `GET /api/v1/schemes/{scheme_id}`.

    ## Reliability and evidence

    Use Pydantic validation, fixed error payloads, redacted logs and appropriate source-version identifiers. Unknown rule values must stay unknown, and client-generated input cannot override reviewed official rules.

    ## Dependency

    Curated scheme, source, rule and document records.

    ## Acceptance

    Every eligibility statement points to current curated source metadata; links open in safe external tabs; no unapproved government branding.

    **Ownership:** infrastructure/data in [Task Two](../../tasks/task-two.md); GenAI/rule logic and verification in [Task Three](../../tasks/task-three.md).
