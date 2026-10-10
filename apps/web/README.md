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

Import the repository's `feat/web-redesign` branch into Vercel. Set **Root Directory** to `apps/web`, framework to Next.js, install command to `npm ci`, and build command to `npm run build`. Keep the default Next.js output directory. Set the live public environment variables above and configure backend CORS for the production origin before testing the live journey. No secret, database or Gemini key belongs in the frontend.

```bash
npm run build
npm start
```

Deployment/live demo require a backend URL, working extraction/matching/question routes and reviewed scheme records. These are recorded as external dependencies rather than falsely completed tasks.

## Routes and state

- `/`: full landing page with hero, benefits, three-step explanation, interactive finder/preview, categories, official sources, application guidance and footer.
- `/discover`: composer, editable profile and searchable/filterable catalogue.
- `/recommendations`: confirmed-profile matches and follow-up questions.
- `/schemes/[schemeId]`: benefit, eligibility, exclusions, document and source sections.
- `/schemes/[schemeId]/apply`: personal checklist, verified steps and safe official-portal action.
- `/help`: privacy-aware explanation of the workflow and expandable FAQ.
- `/about`, `/privacy`, `/disclaimer`: implemented informational pages linked from the footer.

Profile facts and origins stay in React memory across client navigation. Confirmation creates an anonymous expiring server session and saves provided fields through `/profiles/answers`, leaving new blanks unanswered for follow-up. Clearing a saved field sends null. Clear deletes that session before clearing memory. A refresh intentionally clears local profile state; there is no local storage, persistent profile, account sync, ID upload or backend submission flow. Personal document checkbox state is page-local and never claims official verification.

Optional Saved, Hindi, RAG and public admin UI are not exposed. Saved and Hindi depend on the complete core live gate; admin curation remains the backend owner's responsibility.

See `HANDOFF.md` for endpoint/session details and limitations, and `PROGRESS.md` for sequential task checks and commits.
