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

The checked-in backend currently lacks the extract, match and next-question routers. Their live behavior, CORS, deployed URL and real reviewed dataset remain external integration dependencies. The proposed Markdown API examples are abridged; the implemented DTOs include `manual_review_rules`, richer sources, all profile fields and `may_be_required` document status. Frontend types retain those fields.

## Error and trust boundaries

- 20-second timeout and normalized network, 400/422 validation, 429 throttle and 5xx service messages; retry keeps citizen input intact.
- No silent switch from live failure to mocks.
- Model extraction can fail while manual entry remains available.
- Explicit unknown and Not sure do not become zero, false or assumed ownership.
- Citizen corrections override repeated extraction, including deliberately cleared fields.
- Confirmed fields are locked during saving; extraction/confirmation/answer loading is visible and announced.
- Match cache is keyed by session and exact facts. Detail checks are reused only for the matching scheme version.
- Source IDs are resolved through the scheme's source records; detail/guidance DTOs reject orphaned citations.
- Live transport rejects reserved placeholder source domains. Synthetic fixture links remain disabled in mock mode.
- Official-portal action requires active/reviewed scheme metadata, matching detail/guidance versions, supplied steps and a safe URL. Unresolved conditions remain visible and never imply approval.

## Verification evidence

- 19 unit/contract checks passed, including API errors, malformed responses, correction priority, unknowns, citations and source links.
- 14 browser regression checks passed, covering five full responsive journeys, plus one separate complete keyboard-only journey.
- 20 axe scans (four core screens × five widths) reported no WCAG A/AA violations; no horizontal overflow at requested widths. Reduced-motion mode was exercised.
- ESLint with zero warnings, strict TypeScript, formatting and production build passed.
- Production dependency audit reported zero vulnerabilities. Five dev-only findings remain in ESLint's `fast-glob`/`micromatch`/`braces` chain; the audit offers no compatible fix without downgrading the framework's lint configuration. The test runner's original findings were resolved by upgrading.

These are frontend/contract checks. They do not measure eligibility accuracy, certify official links or replace manual screen-reader/human policy review. No live end-to-end or deployment success is claimed.

## Release dependencies

1. Developer 3 implements and validates extract/matches/questions against the frozen DTOs.
2. Backend owner provides the deployed HTTPS origin, CORS allowlist, session retention job and reviewed published scheme records.
3. Run extract → review → confirm → match → question → answer → rematch → details → guidance against that real API, including failure/expiry paths.
4. Deploy the verified branch to Vercel with `apps/web` as project root and public live environment settings, then run the same live smoke demo.

Saved UI and reviewed Hindi copy remain optional after the real P0 flow passes. They are not advertised with inactive navigation or fake controls.

## Current backend readiness audit

`artifacts/backend-readiness.json` records the latest fetched backend main and its route decorators. On 9 October 2026, the three missing core routes were extract, matches and next-question; the documented local health endpoint was unavailable and no deployed API origin was supplied. T1-11 is BLOCKED; T1-12 has not started. Use `python3 scripts/check_backend.py` after fetching main to refresh the static audit, then run an actual live smoke test once the service exists. The static audit alone must never be treated as a live pass.
