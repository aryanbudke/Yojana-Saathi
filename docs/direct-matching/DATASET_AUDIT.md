# Direct matching dataset and dependency audit

This audit is the implementation baseline for replacing retrieval-assisted scheme
matching with deterministic profile-to-dataset matching. It records facts about
the supplied data; it does not upgrade any record's verification status.

## Supplied scheme bundle

The inspected archive is `SarkarSeva_Project.zip`. The direct matcher will use
`sarkarseva_processed/schemes_clean.csv` (or its equivalent JSON export), not the
archive's embedding or index artifacts.

| Property | Observed value |
|---|---|
| Rows | 3,397 |
| Central schemes | 541 |
| State schemes | 2,856 |
| Verification status | 3,397 `unverified` |
| Missing official URL | 3,397 |
| Missing verification date | 3,397 |
| Missing application text | 4 |
| Missing document text | 13 |
| Missing tags | 29 |

The actual CSV columns, in source order, are:

1. `scheme_name`
2. `slug`
3. `details`
4. `benefits`
5. `eligibility`
6. `application`
7. `documents`
8. `level`
9. `schemeCategory`
10. `tags`
11. `official_url`
12. `last_verified`
13. `verification_status`

`services/api/app/db/draft_import.py` already accepts this exact shape and
preserves the raw eligibility, benefits, documents, application instructions,
categories, and tags in unpublished draft versions.

## Curated records

The repository contains ten selected and source-audited candidate schemes in
`data/curation`. Their normalized records remain unpublished because the
independent review packet has not been signed. Some normalized rules also use
facts that the current public profile contract does not yet collect. Those rules
must be mapped or explicitly marked for manual review; they must not be guessed.

## Current matching path

The citizen endpoint `POST /api/v1/matches` calls the deterministic rules engine
in `app.modules.matching.service`. The evaluator uses reviewed rule JSON and
confirmed profile facts. It does not perform semantic search or call an LLM.

The endpoint currently lives in `app.modules.ai.routes`, which also imports the
admin-only staging search implementation. That module-level coupling will be
removed by moving the citizen matching routes to a dedicated router. The
admin-only RAG implementation and its data will remain intact.

The current matcher has three gaps relevant to this change:

- relevance is based only on scheme-name overlap with occupation/category;
- definitely ineligible candidates remain in the returned list; and
- candidate objects do not expose category, geography, benefits, documents, or
  application metadata needed for useful direct ranking and explanations.

## Safety boundary

Verified, source-backed rules may produce deterministic `pass`, `fail`, or
`unknown` results. A mandatory `fail` excludes that scheme.

The 3,397 imported records cannot be presented as verified government guidance:
their official URLs and verification dates are blank. They may only appear as
clearly labelled preliminary matches. Free-text parsing may propose structured
rules, but uncertain or unreviewed rules remain `manual_review` and cannot be
used to claim eligibility.

Ranking scores represent ordering relevance only. They are never approval
probabilities or guarantees of benefit eligibility.

## Planned dependency order

1. Audit the dataset and matching/RAG dependency boundary.
2. Add the requested structured support-needs profile field without breaking
   existing requests.
3. Add conservative free-text normalization and direct SQL candidate retrieval.
4. Filter mandatory failures and rank by metadata relevance plus satisfied
   verified conditions.
5. Add explanations, missing facts, preliminary labels, and targeted questions.
6. Move citizen matching routes out of the RAG/admin route module and preserve
   existing endpoint paths and response compatibility.
7. Run unit, API, frontend-contract, and labelled synthetic-profile evaluation.

