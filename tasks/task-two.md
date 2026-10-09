# Task Two — Backend APIs, database and verified scheme knowledge base

**Owner:** Developer 2 (backend/data).  
**Focus:** Create durable verified scheme metadata, migrations, reliable typed APIs and safe runtime boundaries.  
**Do not use Gemini to automatically publish unreviewed eligibility conditions.**

## Dependencies / coordination

- Freeze JSON response fixtures early for Task One.
- Supply schema and candidate-query interface to Task Three before matching integration.
- Pair review with Task Three for source-to-rule traceability and rule schema tests.

## Phase A — API skeleton & schema (hours 0–8)

- [ ] Create `services/api` with FastAPI, Pydantic, environment config, `/health`, CORS allowlist and standard error payloads.
- [ ] Create Postgres schema/migrations from [database.md](../database.md): schemes, versions, sources, rules, documents, steps, profile sessions and match runs.
- [ ] Define stable typed DTOs from [api-contract.md](../api-contract.md); produce public example payloads for frontend.
- [ ] Add indexes, publish-state filters and test database seed mechanism.

## Phase B — source-backed data (hours 8–22)

- [ ] Choose 10–15 high-confidence schemes first, then expand toward 20–30 only when verified.
- [ ] Manually collect official source URL, policy date, reviewed eligibility and exclusions; document ambiguous rules.
- [ ] Normalize state codes, categories, income units, rule expression JSON and conditional documents.
- [ ] Ensure **every** rule is linked to a `source_id` and a published immutable scheme version.
- [ ] Peer-review records and supply synthetic fixture examples to Task Three.
- [ ] Implement F08 seed and review/publish controls (CLI is acceptable for MVP) — [spec](../features/08-admin-curation/backend.md).

## Phase C — domain-facing APIs (hours 22–38)

- [ ] **F02:** Implement `GET /schemes` search/filter/pagination — [spec](../features/02-scheme-discovery/backend.md).
- [ ] **F05:** Implement `GET /schemes/{id}` with version and source data — [spec](../features/05-scheme-details/backend.md).
- [ ] **F06:** Implement `GET /guidance/{id}` from verified documents and steps — [spec](../features/06-application-guidance/backend.md).
- [ ] **F01:** Implement ephemeral profile/session persistence + user-confirmed fact updates (AI extraction owned by Task Three).
- [ ] Provide service interfaces/repositories for `POST /matches` and `POST /questions/next` (decision algorithms owned by Task Three).
- [ ] Restrict admin paths; validate URLs and refuse unverified/placeholder official links.
- [ ] Optional F07 guest save endpoints after P0 — [spec](../features/07-saved-schemes/backend.md).

## Phase D — correctness & handoff (hours 38–48)

- [ ] Run DB migration/seed on Supabase and smoke query real seed records.
- [ ] Deploy backend to Railway (or selected equivalent) with secret env variables.
- [ ] Verify schema constraints, source foreign keys, audit paths, error responses, CORS and `/health`.
- [ ] Share verified dataset snapshot, API URL, OpenAPI docs, and runbook with Tasks One and Three.
- [ ] Contribute knowledge-base provenance and database design to final report.

## Definition of done

Published, independently reviewed scheme records can be retrieved with official sources, versioned rules and document steps; API endpoints are typed and deployed; anonymous sessions expire; unverified rules cannot appear as verified in results.

## Handoff to Task Three

Provide a `CandidateScheme` object with `scheme_version_id`, `eligibility_json`, rule sources and current publication status; accept deterministic `rule_results` and persist evaluated run data. Agree on enum names before merging.
