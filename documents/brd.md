# Business Requirements Document (BRD) — Yojana Saathi

## 1. Executive summary

Citizens struggle to identify relevant central/state government schemes because eligibility criteria are distributed across sites, use complex conditions, and often require details users do not initially know. **Yojana Saathi** will offer conversational discovery, verified rule-based matching, intelligent follow-up questions, and grounded application guidance.

**Differentiator:** Explain *why* a scheme is relevant, *which exact rules remain unverified*, and *what to do next*. A chatbot alone is not the product.

## 2. Objectives and expected outcomes

| Required outcome | Demonstrable deliverable | Acceptance evidence |
|---|---|---|
| Working AI scheme matching platform | Deployed responsive web flow | Live end-to-end interaction |
| Scheme and eligibility knowledge base | Curated relational records and versioned rule JSON | Query records with official sources |
| Personalized scheme matching module | SQL candidate retrieval + Python rules | Changing profile changes explained results |
| Application guidance interface | Document checklist + official steps and link | User can see verified next steps |
| Matching accuracy and guidance analysis | Reproducible synthetic fixture set | Measured accuracy, false positives, coverage |
| Final technical report and demonstration | Report, architecture, test outputs and script | Working demo, limitations discussed |

## 3. Primary personas

- **Citizen (mobile-first):** may know occupation and state but not exact income, land tenure or scheme terminology; needs simple wording.
- **Assisted-service volunteer:** helps citizens complete profiles and understand why details are required.
- **Content curator/admin:** maintains eligibility rules, documents and provenance. Minimal internal data-entry tooling is sufficient for the MVP.

## 4. User journeys

1. Describe situation in natural language or structured form.
2. Review/correct extracted attributes; unspecified data remains unknown.
3. See a short list of potentially relevant government schemes.
4. Understand passed, failed, and unanswered conditions per scheme.
5. Answer the most impactful follow-up question; watch results recalculate.
6. Open requirements checklist, procedure, and official government application link.

## 5. Functional requirements

| ID | Requirement | Priority | Acceptance criterion |
|---|---|---|---|
| FR-01 | Free-text profile collection | P0 | Age/state/occupation/income can be supplied and edited |
| FR-02 | Typed extraction from language | P0 | Model returns validated schema, not unbounded text |
| FR-03 | Search/filter scheme candidates | P0 | SQL query uses state, category, intent and active/verified status |
| FR-04 | Deterministic eligibility rules | P0 | Evaluator handles AND, OR, comparisons, missing facts, exclusions |
| FR-05 | Missing-information follow-ups | P0 | Asks question that can change a leading match status |
| FR-06 | Explainable result cards | P0 | Every reason maps to a rule and official source |
| FR-07 | Application guidance | P0 | Requirements, verified steps, and official link shown |
| FR-08 | Accessible mobile experience | P0 | Keyboard, labels, touch targets, responsive layout |
| FR-09 | Evaluation suite and report | P0 | Synthetic test dataset and honest metrics available |
| FR-10 | Admin content curation | P0 minimal | Authorized maintainers can safely seed/revise records; public users cannot |
| FR-11 | Saved schemes | P1 | Saved IDs persist with consent; guest-session version is acceptable |
| FR-12 | Multilingual UI | P1 | Hindi UI and extraction prompt verified on sample cases |
| FR-13 | Optional document-grounded RAG | P2 | Retrieval with citations, never replacing rule evaluation |

## 6. Non-functional requirements

- **Trust:** no invented thresholds or unsupported approval claims; visible verification timestamps and source links.
- **Privacy:** avoid Aadhaar numbers, sensitive uploads and long-lived raw conversations; support guest mode.
- **Performance:** aim for p95 deterministic match evaluation < 500 ms with seeded dataset, excluding LLM latency; measure rather than promise.
- **Availability:** graceful form-based fallback when Gemini is unavailable.
- **Security:** API secrets server-side, administrator authentication, input validation, DB access policies.
- **Accessibility:** WCAG 2.2 AA as design target; high contrast, focus rings, reduced motion support.

## 7. Scope decisions

**In scope:** Indian government schemes from official sources; precise eligibility with unknown status; real application links; transparent matching.

**Out of scope for MVP:** applying on behalf of a user, processing Aadhaar/KYC, predicting approval odds, scraping sites without permission, automatic submission, claims of legal/administrative authorization.

## 8. Success metrics

Report actual values after running tests: eligibility decision accuracy, false-positive ineligible-to-eligible rate, precision@3 for relevance, missing-condition recall, guidance completeness, source provenance coverage and p95 API duration. No fabricated percentages in demo materials.

## 9. Assumptions, risks and mitigations

- **Rule complexity:** legal exceptions may not fit MVP DSL. Mitigate using `manual_review_required` and flag ambiguous text.
- **Freshness:** scheme notices change. Mitigate with versioned source links and `last_verified_at` in UI.
- **Data availability:** no assumption of comprehensive public machine-readable scheme API; manually curate a scoped dataset.
- **Hallucination:** keep rule verdict deterministic and generation source-constrained.
- **Time:** prioritize a small, highly verifiable knowledge base, all six deliverables, and a reproducible test.

## 10. Definition of done

A judge can complete the whole user journey on mobile-sized viewport; rules have independent expected-test verdicts; every displayed recommendation includes source and uncertainty; the team can articulate actual system limitations.
