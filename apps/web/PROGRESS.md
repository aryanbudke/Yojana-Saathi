# Developer 1 progress

Scope: `apps/web/`, branch `feat/frontend`. Documentation read before implementation: all 46 files in `documents/`, root README and backend/shared contract handoff. The assigned task is `documents/tasks/task-one.md`; no root `tasks/task-one.md` exists. Backend-owned root progress is preserved.

Strict order: no next task begins until the current implementation passes its checks and is committed. Mock verification and live verification are recorded separately.

| ID    | Task                                                                | Status    |
| ----- | ------------------------------------------------------------------- | --------- |
| T1-01 | Next.js foundation, design tokens, shared UI and accessible shell   | COMPLETED |
| T1-02 | Typed client, runtime contracts, mock fixtures and session boundary | COMPLETED |
| T1-03 | F01 composer and editable confirmed profile                         | COMPLETED |
| T1-04 | F02 discovery filters, URL state and result states                  | COMPLETED |
| T1-05 | F03 recommendations and rule checklists                             | COMPLETED |
| T1-06 | F04 follow-up, skip/edit and rematching                             | COMPLETED |
| T1-07 | F05 detail, exclusions and source provenance                        | COMPLETED |
| T1-08 | F06 application readiness and checklist                             | COMPLETED |
| T1-09 | F10 explanations and responsive/accessibility gate                  | COMPLETED |
| T1-10 | Screenshots, startup instructions and handoff                       | COMPLETED |
| T1-11 | Live integration verification                                       | BLOCKED   |
| T1-12 | Vercel deployment and live demo                                     | PENDING   |

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

## T1-07 — F05 detail, exclusions and source provenance

- Status: COMPLETED
- Files: `apps/web/e2e/details.spec.ts`, `apps/web/src/features/schemes/SchemeDetail.tsx`, `apps/web/e2e/discovery.spec.ts`, `apps/web/src/app/globals.css`, `apps/web/src/app/schemes/[schemeId]/page.tsx`, `apps/web/src/features/discovery/DetailPreview.tsx`, `apps/web/src/features/matching/Recommendations.tsx`, `apps/web/src/features/matching/hooks.tsx`
- Verification: Lint, strict typecheck and 17 unit/contract tests passed. Discovery regression and two detail browser tests passed: all disclosures, verification/source metadata, disabled placeholders and missing-scheme retry.
- Problems: Corrected a hook dependency warning. Error test initially selected the framework route announcer too; scoped it to main content. Initial matches now populate shared context so checked outcomes survive detail navigation only for the same scheme version.
- Commit reference: commit containing this entry; resolve with `git log --format="%h %s" --grep="T1-07"`.
- Next task: T1-08 application guidance

## T1-08 — F06 application readiness and checklist

- Status: COMPLETED
- Files: `apps/web/e2e/guidance.spec.ts`, `apps/web/src/app/schemes/[schemeId]/apply/page.tsx`, `apps/web/src/features/guidance/DocumentChecklist.tsx`, `apps/web/src/features/guidance/GuidancePage.tsx`, `apps/web/src/app/globals.css`, `apps/web/src/features/schemes/SchemeDetail.tsx`
- Verification: Lint, strict typecheck, 17 unit/contract tests and guidance browser journey passed. Checked/un-checked personal readiness, unresolved preconditions, print action and no placeholder apply CTA.
- Problems: Verified guidance and scheme versions are compared before an external application action. Requirement statuses remain server-provided and personal checkboxes do not assert official verification. Ensured the detail-to-checklist action is visible on mobile.
- Commit reference: commit containing this entry; resolve with `git log --format="%h %s" --grep="T1-08"`.
- Next task: T1-09 responsive/accessibility and explanation gate

The remaining dependency order is packaging/handoff → live API verification → deployment/live demo. Packaging does not require unavailable external services; deployment does. Pending task IDs were reordered before starting them to preserve strict sequential execution.

## T1-09 — F10 explanations and responsive/accessibility gate

- Status: COMPLETED
- Files: `apps/web/.prettierignore`, `apps/web/e2e/accessibility.spec.ts`, `apps/web/e2e/keyboard.spec.ts`, `apps/web/src/lib/urls.ts`, `apps/web/.env.example`, `apps/web/PROGRESS.md`, `apps/web/e2e/details.spec.ts`, `apps/web/e2e/discovery.spec.ts`, `apps/web/e2e/guidance.spec.ts`, `apps/web/e2e/matching.spec.ts`, `apps/web/e2e/profile.spec.ts`, `apps/web/e2e/questions.spec.ts`, `apps/web/eslint.config.mjs`, `apps/web/next.config.ts`, `apps/web/package-lock.json`, `apps/web/package.json`, `apps/web/playwright.config.ts`, `apps/web/postcss.config.mjs`, `apps/web/src/app/discover/page.tsx`, `apps/web/src/app/globals.css`, `apps/web/src/app/help/page.tsx`, `apps/web/src/app/layout.tsx`, `apps/web/src/app/page.tsx`, `apps/web/src/app/recommendations/page.tsx`, `apps/web/src/app/schemes/[schemeId]/apply/page.tsx`, `apps/web/src/app/schemes/[schemeId]/page.tsx`, `apps/web/src/components/ui/index.tsx`, `apps/web/src/features/discovery/Discovery.tsx`, `apps/web/src/features/discovery/SchemeCard.tsx`, `apps/web/src/features/discovery/query.test.ts`, `apps/web/src/features/discovery/types.ts`, `apps/web/src/features/guidance/DocumentChecklist.tsx`, `apps/web/src/features/guidance/GuidancePage.tsx`, `apps/web/src/features/matching/MatchCard.tsx`, `apps/web/src/features/matching/Recommendations.tsx`, `apps/web/src/features/matching/RuleChecklist.tsx`, `apps/web/src/features/matching/hooks.tsx`, `apps/web/src/features/matching/types.ts`, `apps/web/src/features/profile/ProfileComposer.tsx`, `apps/web/src/features/profile/hooks.tsx`, `apps/web/src/features/profile/model.test.ts`, `apps/web/src/features/profile/model.ts`, `apps/web/src/features/profile/types.ts`, `apps/web/src/features/questions/FollowUpCard.tsx`, `apps/web/src/features/questions/model.test.ts`, `apps/web/src/features/questions/model.ts`, `apps/web/src/features/schemes/SchemeDetail.tsx`, `apps/web/src/lib/api/client.test.ts`, `apps/web/src/lib/api/client.ts`, `apps/web/src/lib/api/contracts.ts`, `apps/web/src/lib/api/index.ts`, `apps/web/src/lib/api/mock.ts`, `apps/web/src/lib/api/use-resource.ts`, `apps/web/src/lib/format.ts`, `apps/web/tsconfig.json`, `apps/web/vitest.config.ts`
- Verification: 19 unit/contract tests passed; 14 browser regression tests passed plus one complete keyboard-only journey. Twenty axe scans across home/recommendations/detail/guidance at 320/375/768/1024/1440px found no WCAG A/AA violations. No horizontal overflow. Reduced motion checked. Lint, strict typecheck and production build passed. Production dependency audit: zero vulnerabilities.
- Problems: Next.js build TypeScript subprocess output was interrupted by the restricted sandbox; the build passed with subprocess access. Added placeholder rejection in live mode, citation membership validation, error visibility, focus management and input locking during confirmation. Five dev-only upstream ESLint findings remain; no compatible fix offered. Automated accessibility does not replace human screen-reader testing.
- Commit reference: commit containing this entry; resolve with `git log --format="%h %s" --grep="T1-09"`.
- Next task: T1-10 screenshots and handoff

## T1-10 — Screenshots, startup instructions and handoff

- Status: COMPLETED
- Files: `apps/web/HANDOFF.md`, `apps/web/README.md`, `apps/web/artifacts/screenshots/discover-1440.png`, `apps/web/artifacts/screenshots/discover-375.png`, `apps/web/artifacts/screenshots/guidance-1440.png`, `apps/web/artifacts/screenshots/profile-review-1440.png`, `apps/web/artifacts/screenshots/recommendations-1440.png`, `apps/web/artifacts/screenshots/recommendations-375.png`, `apps/web/artifacts/screenshots/scheme-detail-1440.png`, `apps/web/scripts/capture.mjs`, `apps/web/src/app/globals.css`
- Verification: Seven actual mock-mode PNG screenshots captured and visually inspected (desktop/mobile discovery, profile review, desktop/mobile recommendations, details, guidance). Corrected guidance citation layout and recaptured all screens. Lint, strict typecheck, formatting, git diff check and three relevant detail/guidance browser regressions passed.
- Problems: Initial capture script used URL.pathname and encoded workspace spaces in the filesystem path; replaced it with fileURLToPath, moved the seven generated images into apps/web and cleaned the empty mistaken directories. Preview-panel open did not return; localhost preview remains running. Startup, environment, Vercel-root and ownership/session handoff notes are provided.
- Commit reference: commit containing this entry; resolve with `git log --format="%h %s" --grep="T1-10"`.
- Next task: T1-11 live API verification

## T1-11 — Live integration verification

- Status: BLOCKED
- Files created/modified: `apps/web/scripts/check_backend.py`, `apps/web/artifacts/backend-readiness.json`, `apps/web/PROGRESS.md`, `apps/web/scripts/progress.py`, `apps/web/src/features/profile/ProfileComposer.tsx`, `apps/web/src/features/profile/hooks.tsx`, `apps/web/src/features/matching/hooks.tsx`, `apps/web/e2e/matching.spec.ts`, `apps/web/HANDOFF.md`.
- Verification: Fetched current backend main and inspected route decorators read-only. Available: sessions, answers, schemes, detail and guidance. Missing: `POST /api/v1/profiles/extract`, `POST /api/v1/matches`, `POST /api/v1/questions/next`. Documented local `/health` on port 8000 refused the connection. No deployed backend URL has been provided. The route audit explicitly records that it is not a live integration pass.
- Frontend checks: 19 unit/contract tests, lint, strict typecheck, formatting and final production build passed. Five relevant browser regressions passed; the improved client-history clearing test also passed after ensuring it retained the same browser context. Clearing now resets derived match data and invalidates in-flight cached results. Expired answer sessions preserve citizen facts and allow reconfirmation into a fresh session.
- Problems encountered: Cannot execute live extract-to-guidance journey without the missing routes, backend URL and reviewed records. App coordination tools did not return, so no cross-chat agreement or message is claimed. Markdown formatting aligned table cells and defeated the old progress helper's exact text replacement; column parsing now keeps the status table consistent with verified task entries.
- Commit reference: commit containing this audit; resolve with `git log --format="%h %s" --grep="T1-11"`.
- Next task: Resume T1-11 when the API is supplied. T1-12 is PENDING and has not started because live verification must pass first. Optional Saved and Hindi also remain unstarted behind that gate.

## Verified commit references

| Task  | Commit    |
| ----- | --------- |
| T1-01 | `94e630d` |
| T1-02 | `73a9cef` |
| T1-03 | `e0f3fe9` |
| T1-04 | `bf73b09` |
| T1-05 | `9d965e1` |
| T1-06 | `6dce7d1` |
| T1-07 | `e8443a4` |
| T1-08 | `e144f68` |
| T1-09 | `1f51b69` |
| T1-10 | `1689a1b` |

## UI-01 — UI audit and prioritized checklist

- Status: COMPLETED
- Files: UI-REDESIGN.md, artifacts/redesign/before, scripts/redesign-progress.py, PROGRESS.md
- Tests/verification: Read approved documentation, inspected components/routes/styles and actual seven-route baseline captures; audit order and integration boundary verified.
- Problems/dependencies: Browser launch required sandbox escalation; the authorized retry succeeded. Existing live backend gate remains blocked.
- Commit reference: resolve with `git log --oneline --grep="UI-01"`.
- Next task: UI-02

## UI-02 — Design foundation and accessible navigation

- Status: COMPLETED
- Files: src/app/globals.css, src/components/AppHeader.tsx, src/components/ui/index.tsx, e2e/redesign.spec.ts, PROGRESS.md
- Tests/verification: Lint, strict TypeScript and sticky/active/mobile-menu browser check passed; Escape returns focus and route selection closes menu.
- Problems/dependencies: English is the actual current language. Unimplemented optional navigation remains gated; no dead destinations added.
- Commit reference: resolve with `git log --oneline --grep="UI-02"`.
- Next task: UI-03

## UI-03 — Compact homepage and profile discovery input

- Status: COMPLETED
- Files: src/app/page.tsx, src/features/profile/ProfileComposer.tsx, src/app/globals.css, e2e/redesign.spec.ts, scripts/capture-redesign.mjs, PROGRESS.md
- Tests/verification: Lint/type checks and four browser checks passed. CTA bottoms: 665px at1024, 675px at1280, 681px at1440 in720px viewports. Six widths have no page overflow; captured and inspected laptop homepage. Extraction, override, confirmation, deletion and manual entry preserved.
- Problems/dependencies: First CTA check failed; combined example/counter row and moved extraction explanation below action, then reran successfully. Catalogue chips are refined in UI-04.
- Commit reference: resolve with `git log --oneline --grep="UI-03"`.
- Next task: UI-04
