# Developer 1 progress

Scope: `apps/web/`, branch `feat/frontend`. Documentation read before implementation: all 46 files in `documents/`, root README and backend/shared contract handoff. The assigned task is `documents/tasks/task-one.md`; no root `tasks/task-one.md` exists. Backend-owned root progress is preserved.

Strict order: no next task begins until the current implementation passes its checks and is committed. Mock verification and live verification are recorded separately.

| ID | Task | Status |
|---|---|---|
| T1-01 | Next.js foundation, design tokens, shared UI and accessible shell | COMPLETED |
| T1-02 | Typed client, runtime contracts, mock fixtures and session boundary | COMPLETED |
| T1-03 | F01 composer and editable confirmed profile | COMPLETED |
| T1-04 | F02 discovery filters, URL state and result states | COMPLETED |
| T1-05 | F03 recommendations and rule checklists | COMPLETED |
| T1-06 | F04 follow-up, skip/edit and rematching | COMPLETED |
| T1-07 | F05 detail, exclusions and source provenance | PENDING |
| T1-08 | F06 application readiness and checklist | PENDING |
| T1-09 | F10 explanations and responsive/accessibility gate | PENDING |
| T1-10 | Live integration verification | PENDING |
| T1-11 | Vercel deployment and live demo | PENDING |
| T1-12 | Screenshots, startup instructions and handoff | PENDING |

Optional saved and Hindi features depend on the complete P0 live flow and are not started before that gate. No citizen-facing admin UI is required.

## T1-01 — Next.js foundation, design tokens, shared UI and accessible shell

- Status: COMPLETED
- Files: `apps/web/.env.example`, `apps/web/.gitignore`, `apps/web/PROGRESS.md`, `apps/web/eslint.config.mjs`, `apps/web/next-env.d.ts`, `apps/web/package-lock.json`, `apps/web/package.json`, `apps/web/postcss.config.mjs`, `apps/web/scripts/progress.py`, `apps/web/src/app/discover/page.tsx`, `apps/web/src/app/globals.css`, `apps/web/src/app/help/page.tsx`, `apps/web/src/app/layout.tsx`, `apps/web/src/app/page.tsx`, `apps/web/src/components/ui/index.tsx`, `apps/web/tsconfig.json`
- Verification: npm run lint, npm run typecheck, npm run build: passed; all three initial routes prerendered.
- Problems: Corrected one lint warning. Patched test runner audit findings. Five upstream ESLint dev-tool findings remain without a compatible fix; production dependency audit is checked at release.
- Commit reference: commit containing this entry; resolve with `git log --format="%h %s" --grep="T1-01"`.
- Next task: T1-02 typed client

## T1-02 — Typed client, runtime contracts, mock fixtures and session boundary

- Status: COMPLETED
- Files: `apps/web/src/lib/api/client.test.ts`, `apps/web/src/lib/api/client.ts`, `apps/web/src/lib/api/contracts.ts`, `apps/web/src/lib/api/fixtures/error.response.json`, `apps/web/src/lib/api/fixtures/guidance.response.json`, `apps/web/src/lib/api/fixtures/matches.response.json`, `apps/web/src/lib/api/fixtures/profile-extract.response.json`, `apps/web/src/lib/api/fixtures/question-next.response.json`, `apps/web/src/lib/api/fixtures/scheme-detail.response.json`, `apps/web/src/lib/api/fixtures/schemes-list.response.json`, `apps/web/src/lib/api/index.ts`, `apps/web/src/lib/api/mock.ts`, `apps/web/vitest.config.ts`, `apps/web/PROGRESS.md`
- Verification: Lint and strict typecheck passed; 10 contract/client tests passed, covering frozen fixtures, malformed responses, offline and 400/422/429/503 errors, session/answer body, unknown and safe links.
- Problems: JSON inference narrowed empty arrays incorrectly; parsing fixtures through the DTO schema fixed typing. Session contract confirmed from Developer 2 implementation; no cross-chat message sent.
- Commit reference: commit containing this entry; resolve with `git log --format="%h %s" --grep="T1-02"`.
- Next task: T1-03 profile intake

## T1-03 — F01 composer and editable confirmed profile

- Status: COMPLETED
- Files: `apps/web/AGENTS.md`, `apps/web/e2e/profile.spec.ts`, `apps/web/next.config.ts`, `apps/web/playwright.config.ts`, `apps/web/src/features/profile/ProfileComposer.tsx`, `apps/web/src/features/profile/hooks.tsx`, `apps/web/src/features/profile/model.test.ts`, `apps/web/src/features/profile/model.ts`, `apps/web/src/features/profile/types.ts`, `apps/web/next-env.d.ts`, `apps/web/src/app/globals.css`, `apps/web/src/app/layout.tsx`, `apps/web/src/app/page.tsx`
- Verification: Lint, strict typecheck and 13 unit/contract tests passed. Two browser journeys passed: extraction/correction/re-extraction/confirmation/deletion and manual entry.
- Problems: Next.js 16 development-origin protection prevented hydration in first browser run; explicitly allowed localhost/127.0.0.1 and both tests passed after restart. Profile stays in memory and server session; no long-term local storage.
- Commit reference: commit containing this entry; resolve with `git log --format="%h %s" --grep="T1-03"`.
- Next task: T1-04 scheme discovery

## T1-04 — F02 discovery filters, URL state and result states

- Status: COMPLETED
- Files: `apps/web/e2e/discovery.spec.ts`, `apps/web/src/app/schemes/[schemeId]/page.tsx`, `apps/web/src/features/discovery/DetailPreview.tsx`, `apps/web/src/features/discovery/Discovery.tsx`, `apps/web/src/features/discovery/SchemeCard.tsx`, `apps/web/src/features/discovery/query.test.ts`, `apps/web/src/features/discovery/types.ts`, `apps/web/src/lib/api/use-resource.ts`, `apps/web/src/lib/format.ts`, `apps/web/src/app/globals.css`, `apps/web/src/app/page.tsx`
- Verification: Lint, strict typecheck, 15 unit/contract tests and discovery browser test passed. Browser verified filter URL updates, back history, clearing and functional detail navigation.
- Problems: Created a working basic detail route as a discovery dependency; full F05 sections are sequential task T1-07. National fixtures remain included regardless of state; production filtering belongs to API.
- Commit reference: commit containing this entry; resolve with `git log --format="%h %s" --grep="T1-04"`.
- Next task: T1-05 recommendations

## T1-05 — F03 recommendations and rule checklists

- Status: COMPLETED
- Files: `apps/web/e2e/matching.spec.ts`, `apps/web/src/app/recommendations/page.tsx`, `apps/web/src/features/matching/MatchCard.tsx`, `apps/web/src/features/matching/Recommendations.tsx`, `apps/web/src/features/matching/RuleChecklist.tsx`, `apps/web/src/features/matching/hooks.tsx`, `apps/web/src/features/matching/types.ts`, `apps/web/src/app/globals.css`, `apps/web/src/app/layout.tsx`, `apps/web/src/features/profile/ProfileComposer.tsx`
- Verification: Lint, strict typecheck, 15 unit/contract tests and recommendation browser journey passed. Guarded matching behind explicit confirmation; unknown/source/version rendered and scores hidden.
- Problems: Source IDs are joined against the matching detail version, never assumed to map by array position. Missing detail metadata remains unavailable rather than guessed. Match cache keyed by session and facts to avoid stale profile results.
- Commit reference: commit containing this entry; resolve with `git log --format="%h %s" --grep="T1-05"`.
- Next task: T1-06 follow-up and rematch

## T1-06 — F04 follow-up, skip/edit and rematching

- Status: COMPLETED
- Files: `apps/web/e2e/questions.spec.ts`, `apps/web/src/features/questions/FollowUpCard.tsx`, `apps/web/src/features/questions/model.test.ts`, `apps/web/src/features/questions/model.ts`, `apps/web/src/app/globals.css`, `apps/web/src/features/matching/Recommendations.tsx`, `apps/web/src/features/profile/hooks.tsx`, `apps/web/src/lib/api/mock.ts`, `apps/web/src/lib/api/use-resource.ts`
- Verification: Lint, strict typecheck, 17 unit/contract tests and two question browser tests passed: yes-to-pass, edit-to-fail, status-change announcements, not-sure remains unknown, no repeated questions.
- Problems: First browser pass found rematch loading unmounted the follow-up panel and lost the change notice. Preserving the previous resource while loading keeps state and retry intact; both scenarios passed after repair. Null confirmation no longer counts as a question answer in mock playback.
- Commit reference: commit containing this entry; resolve with `git log --format="%h %s" --grep="T1-06"`.
- Next task: T1-07 full scheme detail
