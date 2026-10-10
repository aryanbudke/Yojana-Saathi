# yojana saathi — frontend

Next.js App Router, strict TypeScript, Tailwind CSS, Lucide icons, bundled Inter and runtime-validated REST contracts. All frontend work lives here; no backend or eligibility algorithm is implemented in the browser.

## Start locally

Use Node.js 22 LTS or later supported by Next.js 16 (minimum 20.9).

```bash
cd apps/web
npm ci
cp .env.example .env.local
npm run dev
```

Open `http://localhost:3000`. The example environment explicitly selects **mock mode**. A visible banner labels synthetic contract data on every workflow page. Mock extraction always returns the frozen sample farmer profile regardless of the input; use manual entry to edit your own facts. Mock matching selects predefined answer-response scenarios and does not evaluate real eligibility. `.invalid` source/application URLs are intentionally non-clickable.

## Live API configuration

```dotenv
NEXT_PUBLIC_API_MODE=live
NEXT_PUBLIC_API_BASE_URL=https://YOUR-DEPLOYED-API-ORIGIN
```

The base URL is an origin, **without `/api/v1`**. Restart development or rebuild after changing public environment variables. The client appends the contract prefix. There is no automatic fallback to mock recommendations when a live request fails.

Configure backend CORS to allow the exact frontend origin. HTTPS is required for deployed services. Set `NEXT_PUBLIC_REVIEWED_OFFICIAL_HOSTS` only for additional exact public source hosts independently approved by the curator; `gov.in` and `nic.in` links are accepted by the navigation filter by default, but domain acceptance alone does not certify policy correctness.

The current backend source implements sessions, answers, scheme discovery/details, guidance, extraction, matching and question selection. A running API origin, CORS and reviewed published records are still required for a live verification run. Do not describe mock-mode success as live integration.

## Verification

```bash
npm run lint
npm run typecheck
npm test
npm run format:check
npx playwright install chromium
npm run test:e2e
npm run build
npm audit --omit=dev
```

The browser suite starts a labeled mock-mode development server and verifies contract playback, not a live eligibility engine. The accessibility matrix covers 320, 375, 390, 768, 1024, 1280 and 1440px. It checks overflow and runs axe on home, profile review, recommendations, scheme details and guidance. Desktop CTA placement is verified inside a 720px-high viewport. A separate test completes the full flow with Tab, text entry, Enter and Space.

To capture screenshots while a mock development server is running:

```bash
node scripts/capture-redesign.mjs
```

Current desktop/mobile screenshots and overflow/CTA measurements are in `artifacts/full-site/`. The capture helper requires the visible mock banner and asserts no page overflow. Set `CAPTURE_URL` to target a production preview instead of port3000. Older before/after workspace screenshots remain in `artifacts/redesign/`. All workflow captures contain synthetic contract examples, not verified government scheme results. The requested reference image was not supplied; visual checks use the written brief.

## Deploy to Vercel

Import the repository's `main` branch into Vercel. Set **Root Directory** to `apps/web`, framework to Next.js, install command to `npm ci`, and build command to `npm run build`. Keep the default Next.js output directory. Set the live public environment variables above and configure backend CORS for the production origin before testing the live journey. No secret, database, Gemini key, or Sarvam key belongs in the frontend.

Sarvam voice input and read-aloud use the backend origin above. Configure
`SARVAM_API_KEY` only in `services/api/.env` locally and in the Render service
environment when deployed. Users can select English, Hindi, or Kannada beside
the profile microphone and read-aloud controls. Hindi/Kannada scheme audio is
AI-translated and the original source text remains visible for verification.

```bash
npm run build
npm start
```

Deployment/live demo require a backend URL, working extraction/matching/question routes and reviewed scheme records. These are recorded as external dependencies rather than falsely completed tasks.

## Routes and state

- `/`: full landing page with hero, benefits, three-step explanation, interactive finder/preview, categories, official sources, application guidance and footer.
- `/dashboard`: profile overview, current scheme checks, saved schemes on this browser, next steps and source-linked catalogue preview.
- `/discover`: composer, editable profile and searchable/filterable catalogue.
- `/profile`: natural-language intake and editable facts.
- `/saved`: bookmarks stored on this browser.
- `/signin` and `/signup`: optional Supabase account access.
- `/recommendations`: confirmed-profile matches and follow-up questions.
- `/schemes/[schemeId]`: benefit, eligibility, exclusions, document and source sections.
- `/schemes/[schemeId]/apply`: personal checklist, verified steps and safe official-portal action.
- `/help`: privacy-aware explanation of the workflow and expandable FAQ.
- `/about`, `/privacy`, `/disclaimer`: implemented informational pages linked from the footer.

Guest profile facts stay in React memory across navigation and clear on reload. For signed-in users, confirmed facts are saved by the existing Supabase Auth provider and restored into a new temporary matching session. Configure `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` to use accounts; service-role/database keys never belong in the browser. Clearing a profile uses the existing session deletion and account metadata flow.

Saved schemes use this browser's local storage; they do not sync between accounts or devices. The dashboard catalogue provides reversible bookmark controls and reports a storage failure. Saving a scheme does not create a match, application or eligibility verdict. Personal document checkboxes remain page-local notes.

The dashboard uses the same teal (`#035352`), warm yellow (`#F3E8BC`), cream, Inter, glass cards, shared navbar and mobile dock as the pushed UI. Dashboard navigation replaces the primary Profile destination; the profile editor remains linked throughout the dashboard and in the footer. English, Hindi and Kannada labels follow the existing language selector. All checks require the current confirmed facts and an unexpired matching session; edits suppress stale results.

## Dashboard verification and captures

`npx playwright test e2e/dashboard.spec.ts e2e/hydration.spec.ts` exercises responsive layouts, translations, bookmarks, profile corrections, stale-match suppression, keyboard navigation and hydration. Use `PLAYWRIGHT_PORT=3010` in a separate checkout/copy when another Next server holds this checkout's development lock. Screenshots in `artifacts/dashboard/` show explicitly labeled synthetic fixtures.

The account restoration test runs only with `DASHBOARD_TEST_AUTH=1` and an isolated build configured with `NEXT_PUBLIC_SUPABASE_URL=https://dashboard-ui-check.supabase.co` and a fixture publishable key. It intercepts every request to that fixture host and uses `citizen@example.invalid`; it creates no real account. For stable release verification, build that isolated copy with `NEXT_PUBLIC_API_MODE=mock` and point its Playwright webServer command to `npm run start -- --port 3010`. These tests do not prove live authentication, backend availability or policy accuracy.

## Recovering stale development output

After pulling route or shared-layout changes, restart the development server. If a hydration error persists, stop it, remove only its generated `.next` directory, restart and reload the browser. This also removes stale generated route types after route renames. Reloading clears guest profile details; signed-in profiles use the existing restore flow.

See `HANDOFF.md` for endpoint/session details and limitations, and `PROGRESS.md` for sequential task checks and commits.
