# Frontend specification (Next.js)

## Responsibilities

Build the approved **yojana saathi** glassmorphism-inspired, accessible user experience; display service-generated results without implementing eligibility criteria in React.

**Stack:** Next.js (App Router), TypeScript, Tailwind CSS, a small typed API client, React Hook Form + Zod (optional), Lucide icons. Prefer standard components over a large component library for MVP.

## Proposed implementation tree (future, not generated)

```text
apps/web/
├── app/
│   ├── layout.tsx
│   ├── page.tsx                   # landing + discovery
│   ├── discover/page.tsx
│   ├── recommendations/page.tsx
│   ├── schemes/[schemeId]/page.tsx
│   ├── schemes/[schemeId]/apply/page.tsx
│   ├── saved/page.tsx            # P1
│   └── admin/page.tsx            # internal / stretch
├── components/
│   ├── ui/                       # Button, GlassPanel, Input, Badge, Skeleton
│   ├── profile/                  # Composer, ReviewChips
│   ├── discovery/                # CategoryFilter, ResultList
│   ├── eligibility/              # RuleChecklist, MatchBadge, FollowUpCard
│   ├── schemes/                  # SchemeCard, SourceLink
│   └── guidance/                 # DocumentChecklist, ApplySteps
├── lib/{api,contracts,format,analytics}.ts
└── styles/globals.css
```

## Main pages

| Route | Purpose | Must-have UX |
|---|---|---|
| `/` / `/discover` | Search-first entry and profile input | Clear input, examples, edit details |
| `/recommendations` | Ranked scheme list and live questions | Criteria with pass/fail/unknown + sources |
| `/schemes/[schemeId]` | Scheme detail | Benefits, exclusion rules, verification date |
| `/schemes/[schemeId]/apply` | Application-readiness checklist | Required documents, official steps and link |
| `/saved` (P1) | Revisit schemes | Simple save/unsave with consent |

## State and API integration

- Form state stores each field with `value`, `origin` (user/AI), and ability to edit.
- `POST /api/v1/profiles/extract` must show extraction preview before using data.
- Call `POST /api/v1/matches` with approved profile values, not raw unvalidated model output.
- On answer updates, request a fresh match, show what changed, disable only the relevant action while loading.
- Normalize and display API error states: `400` validation, `429` throttled, `5xx` retry.

## Responsive and accessibility

- Desktop ~56/44 split for composer and snapshot; phone: one column, inputs before results.
- Maintain keyboard interaction, label associations, `aria-live` feedback and no reliance on green/red alone.
- Low-end devices: opaque fallback for blur; reduced-motion support; design token CSS vars from [design.md](design.md).

## Ownership and acceptance

Work assigned to [Task One](tasks/task-one.md). Each feature has separate UI notes under [features](features/README.md). Complete when a person can access all P0 flows at narrow and wide viewport using mocked API then real backend, with no dead links or faux functionality.
