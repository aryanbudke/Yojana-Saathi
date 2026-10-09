# Yojana Saathi — Project documentation

> **Status: Planning specification, not an implementation.** An AI-assisted Indian government-scheme discovery, explainable eligibility matching, and application-guidance web app.

## Read this first

1. [Business requirements](brd.md): problem, users, acceptance criteria and scope.
2. [Design system](design.md): approved warm ivory/sage-green, restrained glassmorphism visual language.
3. [System architecture](architecture.md): data and decision flow, deployment and safety boundaries.
4. [Frontend engineering](frontend.md) and [Backend engineering](backend.md).
5. [Database and rules](database.md), [API contract](api-contract.md), [AI and matching](ai-matching.md).
6. [Evaluation](testing.md), [Privacy and security](security.md), [Deployment and demo](deployment.md).
7. [Feature-specific specifications](features/README.md).

## Exactly three workstreams

| Task file | Owner / workstream | Primary responsibility |
|---|---|---|
| [task-one.md](tasks/task-one.md) | Frontend / UX | Next.js design system, routes, components and accessibility |
| [task-two.md](tasks/task-two.md) | Backend / data | FastAPI, PostgreSQL, curated scheme knowledge base, CRUD and source provenance |
| [task-three.md](tasks/task-three.md) | AI / decisions / QA / integration | Gemini extraction, deterministic evaluator, follow-up questions, tests, deployment demo |

**All actionable implementation work is assigned to exactly one of these three files.** Other Markdown files are specifications/reference material, not additional task lists.

## MVP commitment (48-hour reference plan)

- English-language web app with responsive landing/search, profile intake, results and scheme guidance.
- 20–30 manually verified, versioned scheme records **if research capacity permits**; prioritize 10–15 fully verified records over 30 unreliable ones.
- Gemini-assisted profile extraction and plain-language explanation; server-side key only.
- SQL candidate filtering and a deterministic, three-valued (pass/fail/unknown) rule engine.
- Dynamic missing-information questions, reasoned results, document checklist and official links.
- Synthetic test cases and honest published evaluation; live demo plus technical report.

**Stretch, not MVP:** embeddings/RAG, Hindi language support, voice, OCR, full admin console, reminders, actual application submission.

## Important product boundaries

- Never present a match as official government eligibility approval.
- Don't interpret unknown inputs as `false` or `true`.
- Don't fabricate rule thresholds, document requirements or official links.
- Do not scrape sources without permission or collect Aadhaar numbers/documents for the MVP.
- Mark each scheme's `source_url`, `last_verified_at`, `rule_version`, and verification state.

## Proposed repository after implementation

```text
yojana-saathi/
├── README.md
├── brd.md  design.md  architecture.md  frontend.md  backend.md
├── database.md  api-contract.md  ai-matching.md  testing.md
├── security.md  deployment.md
├── features/
│   ├── 01-profile-intake/{overview,frontend,backend}.md
│   ├── 02-scheme-discovery/{overview,frontend,backend}.md
│   ├── ...
│   └── 10-grounded-explanations/{overview,frontend,backend}.md
├── tasks/{task-one,task-two,task-three}.md
├── apps/web/                       # planned Next.js app (not created here)
├── services/api/                   # planned FastAPI app (not created here)
├── packages/contracts/            # planned shared API schemas
├── data/schemes/                  # planned curated sources
└── tests/                         # planned test suite
```

See [architecture.md](architecture.md) for the actual proposed runtime component diagram.
