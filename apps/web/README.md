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

The current repository implements sessions, answers, scheme discovery/details and guidance. Extraction, matching and question selection still require Developer 3's routes. Do not describe mock-mode success as live integration.

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

Before/after redesign screenshots are in `artifacts/redesign/before/` and `artifacts/redesign/after/`. Viewport and CTA measurements are saved in `artifacts/redesign/after/metrics.json`. They contain synthetic contract examples, not verified government scheme results.

## Deploy to Vercel

Import the repository's `feat/frontend` branch into Vercel. Set **Root Directory** to `apps/web`, framework to Next.js, install command to `npm ci`, and build command to `npm run build`. Keep the default Next.js output directory. Set the live public environment variables above and configure backend CORS for the production origin before testing the live journey. No secret, database or Gemini key belongs in the frontend.

```bash
npm run build
npm start
```

Deployment/live demo require a backend URL, working extraction/matching/question routes and reviewed scheme records. These are recorded as external dependencies rather than falsely completed tasks.

## Routes and state

- `/dashboard`: guest workspace with actual profile details, current scheme-check counts, next-step actions, source-linked results and a published catalogue preview. Unknown or stale matches are not displayed as completed checks. Refreshing clears the in-memory profile. This page does not imply an authenticated account or application-status tracking.
- `/` and `/discover`: composer, editable profile and catalogue.
- `/recommendations`: confirmed-profile matches and follow-up questions.
- `/schemes/[schemeId]`: benefit, eligibility, exclusions, document and source sections.
- `/schemes/[schemeId]/apply`: personal checklist, verified steps and safe official-portal action.
- `/help`: privacy-aware explanation of the workflow.

Profile facts and origins stay in React memory across client navigation. Confirmation creates an anonymous expiring server session and saves reviewed fields through `/profiles/answers`. Clear deletes that session before clearing memory. A refresh intentionally clears local profile state; there is no local storage, persistent profile, account sync, ID upload or backend submission flow. Personal document checkbox state is page-local and never claims official verification.

Optional Saved, Hindi, RAG and public admin UI are not exposed. Saved and Hindi depend on the complete core live gate; admin curation remains the backend owner's responsibility.

The header links to Dashboard, and profile confirmation links back to it. Browser verification can use an alternate port with `PLAYWRIGHT_PORT=3010 npm run test:e2e`; a separate checkout/copy is needed when another Next development server already holds this checkout's lock. Dashboard screenshots use explicitly labeled synthetic fixtures and are saved under `artifacts/dashboard/`.

See `HANDOFF.md` for endpoint/session details and limitations, and `PROGRESS.md` for sequential task checks and commits.

## Recovering stale development output

If a hydration error shows old navigation text on the server and new links in the browser after a code update, stop the running development server and restart it. If the mismatch persists, remove only the generated `.next/dev` directory while the server is stopped, then run `npm run dev` again. Reload the browser after the server is ready. Guest profile details are held in memory and are cleared by a reload.

`npx playwright test e2e/hydration.spec.ts` verifies server-rendered navigation and checks direct dashboard loads, reloads and client navigation for hydration errors on both `localhost` and `127.0.0.1`. It can reuse the running development server and does not depend on live API responses.
