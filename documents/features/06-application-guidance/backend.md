# Application guidance and document readiness — Backend specification

    **Priority:** P0 · **Parent:** [Overview](overview.md) · [API contract](../../api-contract.md) · [Backend architecture](../../backend.md)

    ## API and domain logic

    - `GET /guidance/{scheme_id}` joins versioned `required_documents` and `application_steps`.
- Evaluate conditional applicability from confirmed facts where schema supports it; otherwise label `may_be_required`.
- If Gemini rephrases instructions, pass only verified step text/source IDs and validate produced references.
- No application submission, OTP handling, Aadhaar verification or financial account processing.
- Tests: missing docs, conditional docs, ordering, malformed links, stale application window.

    ## Interface

    `GET /api/v1/guidance/{scheme_id}`.

    ## Reliability and evidence

    Use Pydantic validation, fixed error payloads, redacted logs and appropriate source-version identifiers. Unknown rule values must stay unknown, and client-generated input cannot override reviewed official rules.

    ## Dependency

    Reviewed documentary rules and application steps from source curation.

    ## Acceptance

    No invented documents/links, links point to official application pathway, not homepage when a verified deep link exists.

    **Ownership:** infrastructure/data in [Task Two](../../tasks/task-two.md); GenAI/rule logic and verification in [Task Three](../../tasks/task-three.md).
