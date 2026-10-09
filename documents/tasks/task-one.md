# Task One — Frontend, UI/UX and accessibility

**Owner:** Developer 1 (frontend).  
**Focus:** A polished, real, mobile-first Next.js web experience implementing the approved warm-ivory + forest-green restrained-glass design.  
**Do not implement eligibility rules in the browser.** Consume typed API contracts.

## Dependencies / coordination

- Contract owner (Task Two) supplies endpoint paths and typed sample JSON before integration.
- AI/rule owner (Task Three) supplies verdict enum, source-linked explanation and question payload.
- Develop against mock JSON fixtures until the backend endpoints work.

## Phase A — foundations (hours 0–8)

- [ ] Create `apps/web` using Next.js + TypeScript + Tailwind.
- [ ] Define CSS design tokens from [design.md](../design.md) and fonts (Geist/Inter).
- [ ] Implement shared components: `AppHeader`, `GlassPanel`, `Button`, `Input`, `TextArea`, `Badge`, `SourceLink`, `Skeleton`, `InlineAlert`.
- [ ] Create clear responsive shell with accessible nav; no inactive fake links.
- [ ] Build typed HTTP client, error handling, mock fixture responses from [api-contract.md](../api-contract.md).

## Phase B — feature pages (hours 8–22)

- [ ] **F01:** Profile composer, examples, extraction preview and editable facts — [spec](../features/01-profile-intake/frontend.md).
- [ ] **F02:** Scheme discovery filters, results list, empty/loading states — [spec](../features/02-scheme-discovery/frontend.md).
- [ ] **F03:** Scheme match card and rule checklist with Pass/Fail/Unknown — [spec](../features/03-eligibility-matching/frontend.md).
- [ ] **F04:** Dynamic question card with Yes/No/Not sure and edit feedback — [spec](../features/04-dynamic-questions/frontend.md).
- [ ] **F05:** Full scheme details and official source links — [spec](../features/05-scheme-details/frontend.md).
- [ ] **F06:** Document checklist and official application steps — [spec](../features/06-application-guidance/frontend.md).
- [ ] **F10:** Explainability disclosure and citation layout — [spec](../features/10-grounded-explanations/frontend.md).

## Phase C — integration & polish (hours 22–38)

- [ ] Connect real extract, match, next-question, scheme and guidance endpoints.
- [ ] Preserve citizen-edited fields; show update effect and loading/error states.
- [ ] Test 320, 375, 768, 1024 and 1440px viewports; no overflow or tiny touch controls.
- [ ] Keyboard testing, focus outlines, semantic status text, screen reader labels, reduced motion.
- [ ] Add independent-project disclaimer and warnings against entering Aadhaar numbers.
- [ ] Add optional Saved UI (F07) only after all P0 flows work.
- [ ] Add Hindi UI (F09) only after English accessibility and backend language checks work.

## Phase D — demo & handoff (hours 38–48)

- [ ] Deploy frontend to Vercel; configure public API URL, CORS and environment.
- [ ] Run end-to-end smoke demo with real results, not hard-coded recommendation text.
- [ ] Capture accurate app screenshots for technical report.
- [ ] Write frontend implementation notes and known UX limitations.

## Definition of done

A user can input a profile, correct extraction, inspect a shortlist, answer questions and open official guidance with clear source links. UI works with keyboard and on mobile; no false approval claims and no broken CTAs.

## Handoff to Task Two / Three

Share API requirements early, record missing enum/field types, and flag any rule result that lacks human-readable label/source references. Never change contract fields unilaterally.
