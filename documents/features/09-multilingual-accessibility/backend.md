# Multilingual access and accessibility — Backend specification

    **Priority:** Accessibility P0 / Hindi P1 · **Parent:** [Overview](overview.md) · [API contract](../../api-contract.md) · [Backend architecture](../../backend.md)

    ## API and domain logic

    - Locale is a hint for extraction/explanation, never a change to stored eligibility rules.
- Normalize multilingual mentions of states, income and occupations into stable canonical values.
- Preserve original text only briefly; confirmed numeric values are locale-independent.
- Tests: different language same profile yields same deterministic verdict; injection/number parsing safeguards.

    ## Interface

    `locale` request field on extract/guidance endpoints.

    ## Reliability and evidence

    Use Pydantic validation, fixed error payloads, redacted logs and appropriate source-version identifiers. Unknown rule values must stay unknown, and client-generated input cannot override reviewed official rules.

    ## Dependency

    Approved bilingual glossary after English P0 functionality.

    ## Acceptance

    Keyboard-only flow works, labels are read correctly, language choice never changes numeric threshold checks.

    **Ownership:** infrastructure/data in [Task Two](../../tasks/task-two.md); GenAI/rule logic and verification in [Task Three](../../tasks/task-three.md).
