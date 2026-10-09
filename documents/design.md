# Design system — Yojana Saathi

**Design direction:** modern, human, warm, reliable, minimal; restrained **glassmorphism**, not a glowing AI dashboard. Based on the approved *saathi.* reference direction and renamed to **yojana saathi**.

## 1. Product personality

Calm, useful, credible. Short sentences, clear decisions, gentle encouragement. No political images, government seals implying endorsement, stock mascots, excessive gradients or glass over text-heavy content.

## 2. Brand and typography

- Wordmark: `yojana saathi` (lowercase); optional two-leaf abstract mark. Do **not** imply official government endorsement.
- Fonts: **Geist** or **Inter**, fallback `system-ui, sans-serif`.
- Display 52/60 semibold (desktop), 34/42 (mobile).
- H1 40/48, H2 28/36, H3 22/30, body 16/24, small 14/20, caption 12/18.
- Avoid headings below 20px on compact cards; avoid long centered paragraphs.

## 3. Tokens (proposed implementation values)

| Token | Value | Usage |
|---|---|---|
| `--bg` | `#F8F8F3` | Warm ivory app background |
| `--surface` | `#FFFFFF` | Solid fallback panels |
| `--ink` | `#101D19` | Main text |
| `--muted` | `#65716B` | Secondary description |
| `--primary` | `#1F5A3A` | Forest green primary actions |
| `--primary-hover` | `#17482E` | Hover and active |
| `--sage` | `#E6F1E8` | Soft status and chip fills |
| `--olive` | `#789532` | Highlights, never sole meaning |
| `--lime` | `#DFF2A2` | Subtle attention surface |
| `--line` | `#DCE5DE` | Borders |
| `--success` | `#147B55` | Verified state |
| `--warning` | `#9A6200` | Needs verification |
| `--danger` | `#B63739` | Failed rule |
| `--info` | `#225FC0` | Informational links |

Colors are **design proposals**, not extracted pixel-perfect from the reference image. Verify text contrast against backgrounds; never rely on color alone to communicate status.

## 4. Frosted glass usage

- Page backdrop: warm ivory with **one or two** faint sage/olive radial blurs; no busy landscape imagery.
- `.glass`: `background: rgba(255,255,255,.76); backdrop-filter: blur(16px) saturate(125%); border: 1px solid rgba(255,255,255,.82); box-shadow: 0 12px 40px rgba(19,43,29,.06)`.
- Major discovery/results shells can use glass. **Forms, legal criteria and long text** should have solid near-white reading surfaces.
- `@supports not (backdrop-filter: blur(1px))` fallback to opaque white.
- Respect `prefers-reduced-motion`; avoid parallax and incessant floating effects.

## 5. Spacing and radii

- Space scale: 4, 8, 12, 16, 24, 32, 48, 64px.
- Content max width: 1240px with 24–32px desktop gutters, 16px mobile gutters.
- Radius: chip 999px; input 12px; cards 20px; big shell 24px.
- Touch targets >= 44x44 CSS pixels where possible; visible keyboard focus rings.

## 6. Primary desktop layout

1. Thin navigation: logo, Discover, Saved, Applications (only functional pages), language choice, help.
2. Editorial headline: **“Support you didn’t know you had.”** and short clarifying text.
3. Two-column content (roughly 56/44): free-text profile input on the left and a live eligibility snapshot on the right.
4. Below input: category chips; below results: a compact “one important question” interaction.
5. Results never show a false “98% eligible” badge. Use: **All checked conditions met**, **Needs verification**, **Not eligible**, or **Manual review**.

**Mobile:** single column; prioritize input, then results; sticky bottom primary CTA only when it doesn't hide content; stack eligibility criterion rows.

## 7. Component inventory

| Component | States | Notes |
|---|---|---|
| `AppHeader` | desktop/mobile menu | No fake nav links |
| `GlassPanel` | default, elevated, opaque fallback | Use only for low-density areas |
| `ProfileComposer` | empty, typing, extracting, error | Shows editable extraction result |
| `ProfileChips` | known, unknown, edited | No inference of missing facts |
| `SchemeCard` | potential, pass, fail, manual review | Reasons + official source |
| `RuleChecklist` | pass, fail, unknown, ambiguous | Both icon and text labels |
| `FollowUpCard` | unanswered, answered, loading | Radio buttons and “not sure” |
| `DocumentChecklist` | required, available, missing, unknown | No actual upload in MVP |
| `SourceLink` | official link, stale/unverified | Show source provenance |
| `Toast/InlineAlert` | info, error, success | Never hide hard failures |
| `Skeleton/EmptyState` | loading, no data | Explain how to proceed |

## 8. Accessibility and content rules

- Screen reader labels for every form field, meaningful heading order, visible focus, Escape behavior for dialogs.
- Status plus text (“Needs verification”), not red/green icons only.
- Simple language: “We still need to know…” not “ineligible confidence 0.72”.
- Transparent disclaimer: “This is preliminary guidance; the government portal makes final decisions.”
- Provide direct editable alternatives when model extraction is wrong.

## 9. UI copy examples

- Search placeholder: “Tell us a little about yourself or what support you need…”
- Primary CTA: “Find my schemes”
- Missing data: “Is the farmland recorded in your family’s name?”
- Empty state: “Tell us your state and what kind of support you need.”
- Failure: “We couldn’t check the rules right now. Your answers are still here; try again.”
- Privacy microcopy: “Only share details needed to check scheme requirements. Don’t enter Aadhaar numbers.”

## 10. UX acceptance

At 320px and 1440px, key forms/cards remain legible; keyboard can finish flow; spinner is announced; no invented eligibility percentages; no unavailable buttons; sources open to appropriate official pages.
