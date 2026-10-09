# Task Three — GenAI, eligibility engine, question selection, integration and QA

**Owner:** Developer 3 (AI/algorithms/QA) with support from teammates for testing.  
**Focus:** The project's technical differentiator: conservative, source-backed, reproducible personalized matching; use Gemini only where generation helps.

## Dependencies / coordination

- Task Two supplies verified rule JSON and typed endpoints.
- Task One renders statuses and unknown questions; share mock responses on day one.
- Do not claim matching accuracy until synthetic fixtures have independent expected labels.

## Phase A — evaluator contracts (hours 0–8)

- [ ] Specify canonical `ProfileFacts`, allowed rule AST, stable verdict enums and response data shape — [ai-matching.md](../ai-matching.md).
- [ ] Implement three-valued Pass/Fail/Unknown evaluation plus conservative Manual Review state.
- [ ] Add comparator operators (`eq`, `in`, `lt/lte`, `gt/gte`) and `all/any/not` recursion.
- [ ] Write truth-table unit tests; include exclusion override and boundary tests.
- [ ] Draft Gemini structured extraction and grounded explanation prompts with strict output validation.

## Phase B — model + matching (hours 8–22)

- [ ] **F01:** Build `POST /profiles/extract` service using Gemini; validate strict structured output, keep unknown fields null — [spec](../features/01-profile-intake/backend.md).
- [ ] **F03:** Use Task Two repository candidates and evaluate verified rules; produce stable reasons, sources, missing fields and verdicts — [spec](../features/03-eligibility-matching/backend.md).
- [ ] Rank results by relevance only, **not** predicted approval probability.
- [ ] **F04:** Implement `POST /questions/next` picking one high-impact unresolved rule field; accept “not sure” — [spec](../features/04-dynamic-questions/backend.md).
- [ ] **F10:** Produce deterministic explanations; optional bounded Gemini paraphrasing from verified evidence — [spec](../features/10-grounded-explanations/backend.md).
- [ ] Provide fallback typed/profile manual flow when Gemini errors.

## Phase C — evaluation & integration (hours 22–38)

- [ ] Build ~30–50 **synthetic**, independently labeled test profiles with pass, fail, unknown and ambiguous cases.
- [ ] Compare evaluator output to labels and measure accuracy, false positives, unknown detection, top-3 precision and source coverage — [testing.md](../testing.md).
- [ ] Evaluate guidance for missing steps, unsupported claims and official links (review from Task Two).
- [ ] Integration test: extract → human confirm → candidate retrieval → rule matching → next question → answer → re-match → guidance.
- [ ] Security/adversarial tests: prompt injection in source text, bogus source IDs, stale rules, no Gemini key, model timeout.
- [ ] Review UI with Task One: no percent-eligible badges, verdicts are labeled, unknowns visible.
- [ ] Optional Hindi normalization (F09) and optional RAG retrieval (F10) only after passing all core gates.

## Phase D — measured results & demo (hours 38–48)

- [ ] Prepare evaluation table with **actual** denominators, confusion matrix, observed failures and limitations.
- [ ] Contribute architecture, prompts and evaluator pseudocode to the technical report.
- [ ] Run one complete live demo jointly with Tasks One and Two.
- [ ] Produce a 3–5 minute presentation explaining why deterministic rules protect users from AI errors.
- [ ] Confirm no invented government approval claims or sensitive data collection.

## Definition of done

Matching is deterministic on verified source-backed rules, absent information remains unknown, an impactful follow-up changes results appropriately, source-grounded explanations are available, and test metrics are reproducible and honestly reported.

## Final integration gate

Don't mark project complete until all six BRD outcomes have visible demonstration evidence and all P0 scenarios execute using real APIs and reviewed seed records.
