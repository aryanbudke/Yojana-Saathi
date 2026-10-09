# Feature documentation index

Every feature lives in **its own folder** and has **three separate Markdown specs**:

- `overview.md` — user-facing behavior, expected inputs/outputs and definition of done.
- `frontend.md` — screens, components, UI states and accessibility.
- `backend.md` — APIs, storage/business logic, failure cases and tests.

Feature specs intentionally **do not contain separate task boards**. Tasks are centralized in exactly [task-one.md](../tasks/task-one.md), [task-two.md](../tasks/task-two.md), and [task-three.md](../tasks/task-three.md).

| Feature | Priority | Specs |
|---|---|---|
| Profile intake and extraction | P0 | [01-profile-intake](01-profile-intake/overview.md) · [UI](01-profile-intake/frontend.md) · [API](01-profile-intake/backend.md) |
| Scheme discovery and filtering | P0 | [02-scheme-discovery](02-scheme-discovery/overview.md) · [UI](02-scheme-discovery/frontend.md) · [API](02-scheme-discovery/backend.md) |
| Deterministic eligibility matching | P0 | [03-eligibility-matching](03-eligibility-matching/overview.md) · [UI](03-eligibility-matching/frontend.md) · [API](03-eligibility-matching/backend.md) |
| Dynamic follow-up questions | P0 | [04-dynamic-questions](04-dynamic-questions/overview.md) · [UI](04-dynamic-questions/frontend.md) · [API](04-dynamic-questions/backend.md) |
| Scheme details and verified sources | P0 | [05-scheme-details](05-scheme-details/overview.md) · [UI](05-scheme-details/frontend.md) · [API](05-scheme-details/backend.md) |
| Application guidance and document readiness | P0 | [06-application-guidance](06-application-guidance/overview.md) · [UI](06-application-guidance/frontend.md) · [API](06-application-guidance/backend.md) |
| Saved schemes (stretch) | P1 | [07-saved-schemes](07-saved-schemes/overview.md) · [UI](07-saved-schemes/frontend.md) · [API](07-saved-schemes/backend.md) |
| Admin knowledge-base curation | P0 minimal / P1 UI | [08-admin-curation](08-admin-curation/overview.md) · [UI](08-admin-curation/frontend.md) · [API](08-admin-curation/backend.md) |
| Multilingual access and accessibility | Accessibility P0 / Hindi P1 | [09-multilingual-accessibility](09-multilingual-accessibility/overview.md) · [UI](09-multilingual-accessibility/frontend.md) · [API](09-multilingual-accessibility/backend.md) |
| Grounded AI explanations and optional RAG | Source grounding P0 / RAG P2 | [10-grounded-explanations](10-grounded-explanations/overview.md) · [UI](10-grounded-explanations/frontend.md) · [API](10-grounded-explanations/backend.md) |
