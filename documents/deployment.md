# Deployment, demonstration and handoff

## Proposed environments

| Component | Local | Demo deployment |
|---|---|---|
| Web | Next.js dev server | Vercel |
| API | FastAPI + uvicorn | Railway or compatible Python service |
| DB | local Postgres or Supabase dev project | Supabase project |
| AI | Gemini sandbox/dev key | Backend-only restricted key |

## Configuration and release checks

- Configure `NEXT_PUBLIC_API_BASE_URL` for web; only public values use `NEXT_PUBLIC_`.
- Configure `DATABASE_URL`, `GEMINI_API_KEY`, `ALLOWED_ORIGINS`, session TTL and logging on backend.
- Apply migrations and approved seed data; confirm source references aren't placeholders.
- Restrict CORS; use HTTPS; run smoke checks for `/health`, extract, match, next question, scheme detail and guidance.
- Validate desktop 1440px and mobile 375px (plus 320px overflow); check keyboard and reduced-motion behavior.
- Keep a local fallback demonstration with prerecorded *test profile values*, not fictitious app outcomes, if external API is down.

## 3–5 minute judge demo script

1. Open the official-looking but clearly **independent** yojana saathi landing page.
2. Enter: “I’m a 24-year-old farmer from Maharashtra helping my family farm 1.5 acres.”
3. Review extracted facts; note ownership is **unknown** and editable.
4. View candidate schemes; show pass/unknown/fail criteria and verified sources.
5. Answer “Is farmland recorded in your family’s name?” and show result recalculation.
6. Open one scheme's document checklist, source, official application link and verification date.
7. Show rule JSON, a test fixture, real evaluation metric table and architecture diagram.
8. Close with limitations: preliminary guidance, small curated dataset, no official approval/submission.

## Deliverables

Deployed URL; source repository; reviewed scheme dataset with source references; OpenAPI docs; sample test fixtures; measured evaluation table; screenshots; architecture illustration; technical report.

## Handoff and ownership

See exactly three workstreams: [Task One](tasks/task-one.md), [Task Two](tasks/task-two.md), [Task Three](tasks/task-three.md). For features, see [features/README.md](features/README.md).
