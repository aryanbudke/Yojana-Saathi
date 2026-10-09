# Quality, matching accuracy and user guidance evaluation

## Evaluation objectives

Prove Yojana Saathi makes traceable, conservative decisions, asks for missing facts and explains application requirements from verified data. **Do not report invented accuracy.**

## Test fixture design

Target 30–50 synthetic citizen profiles and separately reviewed expected decisions; use no real personally identifying data. Include:

- Full eligibility pass with confirmed profile facts.
- Exact threshold boundary (income, age, land area) and units normalization.
- Mandatory exclusion despite other passing conditions.
- Wrong state / wrong category with clearly documented rules.
- Missing information, refusal or `not_sure` answer.
- Contradictory statements and citizen correction of an extraction error.
- Multiple possible schemes and incomplete application guidance.
- Unverified, outdated and conflicting policy versions.
- Prompt injection in copied source text (must be ignored).

## Metrics (formulas)

| Metric | Definition | Reporting guidance |
|---|---|---|
| Eligibility accuracy | Correct verdicts / independently labeled verdicts | Show denominator and confusion matrix |
| False-positive rate | Truly ineligible profiles marked all-conditions-met / truly ineligible profiles | Highest-risk error; keep visible |
| Missing-condition recall | Required unknown conditions surfaced / all labeled unknown conditions | Evaluate before follow-up |
| Precision@3 | Relevant schemes in top three / recommended count up to three | Define relevance separately from eligibility |
| Guidance completeness | Verified required steps correctly covered / total reviewed required steps | Also count unsupported steps |
| Provenance coverage | Decisions with accessible rule-linked official source / all displayed decisions | Spot-check sources |
| Latency | p50/p95 for search/evaluate and LLM extraction separately | Actual measured numbers |

## Test layers

- **Unit:** DSL operators (AND, OR, NOT, comparisons), unknown propagation, exclusions, ranking independence.
- **Contract:** API payload validity; error states; absent link and source fields.
- **Integration:** seeded source and profile → real rule engine → result → follow-up → rematch.
- **E2E:** responsive happy path, keyboard accessibility, source links, application checklist.
- **Human review:** at least two people cross-check a sampled set of scheme rules and explanations against official source snapshots.

## Guidance evaluation rubric

Score each scenario 0/1 for: accurate documents, accurate order of steps, correct official link, correct warning about uncertainties, clear next action, correct source/version link. Summarize per-case and average; record unsupported or fabricated instructions separately as severe failures.

## Release gates

1. No seeded published rule without a source and version.
2. All unit tests pass, including unknown + exclusion combinations.
3. No unsupported application URL or fake eligibility percentages.
4. Every 4xx/5xx error state has a human-readable UI response.
5. Demo metrics and limitations come from test artifacts, not screenshots or guesses.

## Final technical report outline

Problem statement → competitor assessment → requirements → architecture → data sourcing → rule DSL → GenAI prompts/safety → UX → evaluation methodology → actual metrics → observed failures → future scope. Attach schema, sample rules, test table, screenshots and 3-minute demo script.
