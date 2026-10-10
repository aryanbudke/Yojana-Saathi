# Frontend handoff

## Verified implementation

The English frontend supports profile entry/extraction preview, correction of all eleven fact fields, explicit confirmation, scheme discovery/filtering, explained matches, one follow-up question, answer/edit/skip/rematch, scheme details and personal application readiness. All verdicts, rule reasons, eligibility text, document requirements and application instructions are service responses. Raw relevance scores are never rendered.

Approved ivory/forest-green/sage/lime tokens, bundled Inter, restrained glass, opaque reading panels, safe external tabs, focus states and reduced motion are implemented. The help/footer state that the project is independent and provides preliminary guidance. There is no Aadhaar-number field or document upload.

## API ownership and session agreement

Contracts were read directly from Developer 2's `services/api/app/schemas` and frozen `packages/contracts/fixtures`. No other developer's files were changed and no message was sent to another chat. Session handling is confirmed against the implemented router, not an undocumented assumption:

| Operation         | Endpoint                                | Request/behavior                                                           |
| ----------------- | --------------------------------------- | -------------------------------------------------------------------------- |
| Anonymous session | `POST /api/v1/profiles/sessions`        | `{}` → `session_id`, `expires_at`, nullable `facts`                        |
| Extract preview   | `POST /api/v1/profiles/extract`         | `{text, locale:"en-IN"}`; never immediately matches unconfirmed facts      |
| Confirm/answer    | `POST /api/v1/profiles/answers`         | `{session_id, field, value}`; one field at a time, origin becomes user     |
| Match             | `POST /api/v1/matches`                  | `{session_id, facts, limit:5}`                                             |
| Next question     | `POST /api/v1/questions/next`           | `{session_id, run_id}`; supports single-choice, number or text             |
| Discovery         | `GET /api/v1/schemes`                   | `q`, `state_code`, `category`, `cursor`, `limit:20`; query persists in URL |
| Details           | `GET /api/v1/schemes/{id}`              | Current version and source-linked rule/document/step records               |
| Guidance          | `GET /api/v1/guidance/{id}`             | Optional `session_id` for a confirmed profile                              |
| Delete session    | `DELETE /api/v1/profiles/sessions/{id}` | Clear control; 204 and already-expired 404 both permit local clearing      |

The checked-in backend now includes extract, match and next-question routers, mounted in `app/main.py`. Their live behavior, CORS, deployed URL and real reviewed dataset remain external integration dependencies. The proposed Markdown API examples are abridged; the implemented DTOs include `manual_review_rules`, richer sources, all profile fields and `may_be_required` document status. Frontend types retain those fields.

## Error and trust boundaries

- 20-second timeout and normalized network, 400/422 validation, 429 throttle and 5xx service messages; retry keeps citizen input intact.
- No silent switch from live failure to mocks.
- Model extraction can fail while manual entry remains available.
- Explicit unknown and Not sure do not become zero, false or assumed ownership.
- Initial blank fields are not submitted as answers, so backend follow-up questions remain available. Clearing a previously saved field submits null; each successful write updates the session snapshot even if a later write fails.
- Citizen corrections override repeated extraction, including deliberately cleared fields.
- Confirmed fields are locked during saving; extraction/confirmation/answer loading is visible and announced.
- Match cache is keyed by session and exact facts. Detail checks are reused only for the matching scheme version.
- Source IDs are resolved through the scheme's source records; detail/guidance DTOs reject orphaned citations.
- Live transport rejects reserved placeholder source domains. Synthetic fixture links remain disabled in mock mode.
- Official-portal action requires active/reviewed scheme metadata, matching detail/guidance versions, supplied steps and a safe URL. Unresolved conditions remain visible and never imply approval.

## Verification evidence

- 21 unit/contract checks passed, including API errors, malformed responses, correction priority, unknowns, explicit-null answers, citations and source links.
- 28 browser checks verified: seven responsive journeys and profile, discovery, recommendations, follow-up, detail, guidance, keyboard, navigation, status filtering, empty-state, landing sections/footer and reduced-motion regressions.
- 35 axe scans (five core screens × seven widths) reported no WCAG A/AA violations after correcting glass-header contrast. No horizontal overflow at 320, 375, 390, 768, 1024, 1280 or 1440px. Reduced-motion mode was exercised.
- ESLint with zero warnings, strict TypeScript, formatting and production build passed.
- Production dependency audit reported zero vulnerabilities. Five dev-only findings remain in ESLint's `fast-glob`/`micromatch`/`braces` chain; the audit offers no compatible fix without downgrading the framework's lint configuration. The test runner's original findings were resolved by upgrading.

These are frontend/contract checks. They do not measure eligibility accuracy, certify official links or replace manual screen-reader/human policy review. No live end-to-end or deployment success is claimed.

## Release dependencies

1. Verify the implemented extract/matches/questions routes against the frozen DTOs on the running backend.
2. Backend owner provides the deployed HTTPS origin, CORS allowlist, session retention job and reviewed published scheme records.
3. Run extract → review → confirm → match → question → answer → rematch → details → guidance against that real API, including failure/expiry paths.
4. Deploy the verified branch to Vercel with `apps/web` as project root and public live environment settings, then run the same live smoke demo.

Saved UI and reviewed Hindi copy remain optional after the real P0 flow passes. They are not advertised with inactive navigation or fake controls.

## Current backend readiness audit

`artifacts/backend-readiness.json` records the fetched backend main and its route decorators. The 10 October 2026 static review includes Developer 3's mounted AI router and finds all core routes. A read-only health check still found no service on localhost:8000, and no deployed API origin was supplied. The historical T1-11 live gate remains BLOCKED; T1-12 has not started. Use `python3 scripts/check_backend.py` after fetching main to refresh the static audit, then run an actual live smoke test once the service exists. The static audit alone must never be treated as a live pass.

## UI redesign handoff

The home route now supplies the complete ten-section written brief: sticky navigation, explicit mock banner, layered scheme-example hero, four benefits, asymmetric three-step process, interactive finder/preview, six category destinations, four official-source destinations, application guidance and full footer. The existing catalogue workspace remains on `/discover`. Profile review, matching, questions, source-backed details and personal checklists reuse the existing hooks and API client. Glass is limited to navigation, hero examples and the composer; other surfaces stay opaque.

The hero finder action is inside the initial720px desktop viewport; the actual form sits below How it works. All verdicts come from the existing typed client or explicitly labeled fixtures. Example scheme cards link to official destinations and do not claim checked eligibility. No backend, session contract, eligibility algorithm or dependency changed. English is displayed as the current language; optional Saved, Hindi, authentication, Contact/Terms, subscriptions and an applications dashboard are not advertised. About/Privacy/Disclaimer and Help/FAQ are real routes.

The sequential SR-01–SR-10 work is tracked in `PROGRESS.md`. Current captures are under `artifacts/full-site/`; older workspace before/after captures remain under `artifacts/redesign/`. Run `node scripts/capture-redesign.mjs` against a running mock preview to reproduce current evidence. No reference image was supplied, so the final visual review uses the confirmed written direction. Live API verification and deployment remain external dependencies.

## Current dashboard integration (DASH-03)

The dashboard now runs within main's teal/warm-yellow shell, existing Auth/Profile/Matching/I18n providers and mobile dock. It uses shared GlassCard, Badge and button treatments and current routes. Dashboard text and metadata are translated into English, Hindi and Kannada. Guest and signed-in privacy messages distinguish tab memory, confirmed account facts and temporary matching sessions. The account provider is reused without changing authentication or session contracts.

Scheme counts remain service-derived and require confirmation, exact facts/session identity and unexpired sessions. Editing a fact suppresses old checks. Catalogue records carry source links and verification dates; they are explicitly distinct from personalized matches. The personal application guide is reached through the published match's existing route.

Saved schemes are browser-local bookmarks with actual save/remove actions, persistence on reload and no account/device-sync claim. The shared store uses a stable server snapshot for hydration, ignores corrupt saved entries and returns failure if browser storage is unavailable. No application tracking, government submission, approval probability or eligibility algorithm was introduced. Backend/AI changes in this branch are imported unchanged from main, not authored for this dashboard.

Verification uses an isolated mock production build and a fully intercepted Supabase account fixture. It checks account-fact restoration without registering users or contacting a live Supabase account. Live authentication/backend availability and translation review by native speakers remain separate from frontend verification.

DASH-03 verification: 35 unit/contract tests and 45 distinct browser checks verified; lint, strict TypeScript, targeted formatting and production builds passed. The account fixture confirms restoration and logout clearing, and the stable identity/facts dependencies prevent duplicate same-user auth notifications from cancelling restoration. The full suite's keyboard check was updated to wait for saving controls before Tab traversal and passed on rerun. Current dashboard captures were refreshed and visually inspected. Live services and native-speaker review were not certified by these checks.
