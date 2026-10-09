# Frontend redesign audit

Verified against the current source, the supplied request, documentation (`documents/design.md`, `frontend.md`, `brd.md` and feature frontend specifications), and actual mock-mode screenshots captured before changes. The existing contract/session flow is the integration boundary. Inspiration references reviewed: [Linear](https://linear.app), [Raycast](https://raycast.com), [Vercel](https://vercel.com), [Apple](https://apple.com).

## Prioritized dependency order

1. **UI-01 Audit:** The tall hero and large explanation panel push the primary action below a typical laptop viewport. Browse/categories come after another marketing strip. Card and heading sizes vary; desktop width is underused. Existing profile correction, URL filtering, question answers, source/version checks and guidance are working and must remain intact.
2. **UI-02 Foundation:** Centralize colors, spacing, typography and surfaces; sticky header with active links and accessible mobile menu. Keep navigation limited to implemented destinations. Saved, authentication, Hindi and an applications dashboard remain unavailable under the existing live-flow gate; do not present dead links or a fake language selector.
3. **UI-03 Home:** Compact editorial heading; profile input and real catalogue in adjacent columns. Remove the competing promotional panel, retain a compact three-step explanation. Verify CTA inside 1280×720 and responsive layout.
4. **UI-04 Results:** Align discovery controls and cards, consistent result hierarchy and eligibility badges, preserve official source validation and explicit unknown conditions. Verify URL filter and recommendation flow with clearly labeled fixtures.
5. **UI-05 Workflow:** Structured editable profile, focused question panel, readable detail/guidance surfaces and checklist. Preserve clear/edit/skip/print interactions and official application safeguards.
6. **UI-06 Feedback:** Purposeful hover/press/focus feedback, useful skeletons and empty/error presentation. Verify keyboard-only flow and reduced motion.
7. **UI-07 Release:** Inspect screenshots and test overflow at 320, 390, 768, 1024, 1280 and 1440. Run all browser, contract, lint, type and production build checks. Live API verification remains an external dependency, separate from mock regression results.

## Evidence and acceptance

Before screenshots: `artifacts/redesign/before/`. Baseline homepage has generous hero margins, a 160px textarea, a large right explanation panel and additional trust strip before categories. The first desktop CTA is below the initial 720px viewport. Mobile results and source/version disclosures must remain readable. After screenshots will include all essential routes and both desktop/mobile sizes.

No backend or contract changes, new dependencies, invented eligibility scores or government approval claims are needed.

## Final verified result

The compact discovery workspace replaces the competing promotional panel. All six categories are visible, filtering persists in the URL, and recommendations have a working status filter. Profile review, follow-up answers, provenance disclosures and personal document checklists retain their existing contracts and safeguards.

Before/after screenshots were compared and inspected across desktop and mobile routes. Six homepage sizes are captured, with desktop/mobile profile, recommendation, scheme, guidance and help views (16 screenshots). `artifacts/redesign/after/metrics.json` records no page overflow and desktop CTA bottoms below 720px.

Release checks: 19 unit/contract tests, 21 distinct browser checks, 35 axe scans over seven widths, lint, strict TypeScript, formatting and production build passed. The first final suite caught header contrast at 1024/1280 when scrolling over a green button. The text color was corrected and the entire responsive/accessibility matrix plus discovery/navigation/filter regressions reran successfully. Production routes include home, discover, help, recommendations, scheme detail and guidance.

The backend/live deployment gate remains separate and unverified: extract, matching and next-question routes plus a deployed API origin are still needed. Saved/Hindi/authentication/application tracking remain outside the approved current integration gate.
