# Local RAG website testing

The user authorized localhost website integration. Latest approved frontend2ce50aa is preserved in this isolated worktree; the other developer's checkout is untouched. No redesign, publication or full indexing.

| Task | Status | Scope |
| --- | --- | --- |
| WEB-01 Local sample API | COMPLETED | Backend worktree commit a5fa9ed; eight actual unverified records, normal auth |
| WEB-02 Website RAG page | COMPLETED | Existing components/tokens; explicit reviewer token; draft sources |
| WEB-03 Browser verification | COMPLETED | Real website→authenticated API→Gemini→pgvector→answer/citations |

WEB-01 evidence is in the backend worktree docs/rag/local-demo-verification.json. Five new unit checks and114 related tests passed; two PG checks had passed separately. Full3397 indexing remains incomplete.

## WEB-02 — Draft question and source reader

- Files: app/rag/page.tsx, features/rag/*; ignored local.env selects live localhost API, no secrets. Existing layout adds only a development-only test-page link; no upstream checkout edits.
- Design: preserve incumbent teal/cream palette, Inter and existing form/panel components. Operate/read layout: intro and explicit8-record scope → token/question form → answer → expandable actual records. No new visual system.
- Loading, empty, invalid credentials, unavailable provider and checked populated response required. Token is user-entered, memory-only, never logged or persisted; backend normal reviewer auth remains mandatory.
- Verification: lint, strict TypeScript,35 frontend tests (including4 new authentication/origin/citation/publication boundary checks), production build and formatting pass. Development route SSR HTTP200. The new page is hidden outside development; existing stylesheet/components preserved. Manual source review checks no storage/logging, fixed local recipient before sending credentials, checked draft provenance/citation references, safe React text rendering, loading/errors and input preservation. Impeccable detector reports no findings; rendered browser/keyboard review remains WEB-03.
- Commit: `feat(web): add authenticated localhost draft RAG tester` (resolve by title).
- Next task: WEB-03 after verification/commit.

## WEB-03 — Live browser verification and handoff

- Status: COMPLETED. Dependency: WEB-02 verified and committed as `321fa08`.
- Files modified: RagTester.tsx, model.ts, model.test.ts and this progress file. Files created: browser-verification.json, keyboard-polish-verification.json and four final desktop/mobile screenshots.
- Passing: actual browser POST returns200 through normal reviewer authentication, Gemini and PostgreSQL/pgvector. The answer cites apy; all three retrieved raw records equal the original export. Missing/wrong credentials remain403. Records remain unverified/draft with publication_allowed=false. Clear removes credentials and answer.
- Passing:36 frontend tests, ESLint, TypeScript, production build and Prettier. Backend WEB-01 previously passed114 related tests, including five new helper checks; the two conditional PostgreSQL tests were not repeated here and had passed AUTH-05 separately.
- UI verification: Impeccable polish preserves existing tokens/components; form border contrast strengthened using the house input classes.375/768/1280/1920px show no horizontal overflow; all form controls exceed44px. Keyboard-only submit, citation/source expansion and clearing pass; visible focus on RAG controls. Axe checks of main content report zero WCAG2/2.1/2.2 AA violations. Existing single theme checked; this is scoped verification, not a whole-site accessibility certification.
- Problems resolved: initial browser harness alert selector also matched Next.js's route announcer; narrowed the selector. Question bounds initially differed from the existing API; now2–500 characters with a regression test. A probe of the nonexistent /api/v1/health returned404; the existing health route is /health.
- Safety: private configuration remains ignored, backend.env mode0600. No credentials in tracked sources/evidence, no dependency changes, no edits to another developer's checkout. Manual code review checks fixed token recipient, safe text rendering, source/publication validation and recoverable errors.
- Commit: `test(web): verify live local RAG and keyboard source review` (resolve by title).
- Next task: none in this localhost handoff. Website and sample API remain running for manual testing at http://localhost:3000/rag and http://localhost:8000. Enter ADMIN_REVIEW_TOKEN from the private backend.env; normal authentication remains required.
- Blocked/unverified: full3397 indexing remains unfinished after the user-requested stop; no bulk run resumed. Only eight actual records are available here. No scheme publication, official eligibility verification, deployment or production-readiness claim.
