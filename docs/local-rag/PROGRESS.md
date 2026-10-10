# Local RAG website testing

The user authorized localhost website integration. Latest approved frontend2ce50aa is preserved in this isolated worktree; the other developer's checkout is untouched. No redesign, publication or full indexing.

| Task | Status | Scope |
| --- | --- | --- |
| WEB-01 Local sample API | COMPLETED | Backend worktree commit a5fa9ed; eight actual unverified records, normal auth |
| WEB-02 Website RAG page | COMPLETED | Existing components/tokens; explicit reviewer token; draft sources |
| WEB-03 Browser verification | PENDING | Real website→authenticated API→Gemini→pgvector→answer/citations |

WEB-01 evidence is in the backend worktree docs/rag/local-demo-verification.json. Five new unit checks and114 related tests passed; two PG checks had passed separately. Full3397 indexing remains incomplete.

## WEB-02 — Draft question and source reader

- Files: app/rag/page.tsx, features/rag/*; ignored local.env selects live localhost API, no secrets. Existing layout adds only a development-only test-page link; no upstream checkout edits.
- Design: preserve incumbent teal/cream palette, Inter and existing form/panel components. Operate/read layout: intro and explicit8-record scope → token/question form → answer → expandable actual records. No new visual system.
- Loading, empty, invalid credentials, unavailable provider and checked populated response required. Token is user-entered, memory-only, never logged or persisted; backend normal reviewer auth remains mandatory.
- Verification: lint, strict TypeScript,35 frontend tests (including4 new authentication/origin/citation/publication boundary checks), production build and formatting pass. Development route SSR HTTP200. The new page is hidden outside development; existing stylesheet/components preserved. Manual source review checks no storage/logging, fixed local recipient before sending credentials, checked draft provenance/citation references, safe React text rendering, loading/errors and input preservation. Impeccable detector reports no findings; rendered browser/keyboard review remains WEB-03.
- Commit: `feat(web): add authenticated localhost draft RAG tester` (resolve by title).
- Next task: WEB-03 after verification/commit.
