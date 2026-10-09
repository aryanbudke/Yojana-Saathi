# Backend, database, and provenance contribution

## Scope and architecture

The backend workstream implemented a typed FastAPI service backed by SQLAlchemy
and an Alembic-managed PostgreSQL schema. HTTP routers validate public inputs
and responses; application services enforce session, publication, and guidance
rules; repositories isolate database queries and expose a stable integration
surface to the separate deterministic matching workstream.

The data model contains scheme identities and immutable scheme versions,
official sources, source-linked eligibility rules, required documents,
application steps, ephemeral profile sessions and facts, reproducible match
runs/results, guest saved schemes, and administrative audit records. Three
ordered migrations create the schema, add query/retention indexes, and install
PostgreSQL triggers that prevent updates or deletion of published versions and
their source-backed children.

## Knowledge provenance and publication safety

Every eligibility rule, document requirement, and application step references
a source belonging to the same scheme version through composite foreign keys.
Public discovery, detail, guidance, and matching candidate queries share one
publication boundary. A record is visible only when:

- the scheme is active;
- the selected version is the latest verified and published version;
- reviewer identity and verification timestamp are present; and
- at least one official source exists.

Draft changes follow an audited `draft -> verified -> published` workflow.
Reviewer and publisher API roles use separate server-configured tokens and actor
identities. Publication revalidates provenance and external URLs. Links must be
HTTPS URLs with reviewed named hosts; placeholders, embedded credentials,
localhost/private destinations, and raw IP hosts are rejected. Published data
is append-only: corrections require a new version rather than silently changing
the evidence behind an earlier result.

The checked-in scheme seed is synthetic, uses reserved `.invalid` domains, and
requires an explicit test-only override. Production CLI and admin workflows do
not enable this override. No real government rule, threshold, benefit, policy
date, or official URL was invented during implementation.

## Citizen privacy and runtime boundaries

Profile sessions are anonymous and expire after a configurable 1–168 hour TTL
(24 hours by default). Only normalized eligibility facts are stored; the MVP
does not collect Aadhaar numbers, document images, bank details, or raw identity
records. User-confirmed facts have precedence and cannot be overwritten by model
extraction. Expired sessions are rejected, users can delete sessions directly,
and an operational purge command removes expired rows and cascading transient
data. Guest bookmarks are session-scoped, duplicate-free, and capped at 50.

Application guidance is assembled only from the latest public scheme version.
Conditional document requirements remain `unknown` or `may_be_required` when
facts are missing; the service does not infer eligibility from occupation or
silently turn unknowns into booleans. Official application links are mandatory
for actionable guidance, and every response carries the approved preliminary-
guidance disclaimer.

## Matching-workstream integration

The backend does not duplicate the AI developer's extraction, rule-evaluation,
ranking, or question-selection algorithms. Instead it provides typed repository
protocols:

- `CandidateRepository.list_candidates()` returns verified scheme versions,
  rule expressions, severities, source IDs, question templates, and sources.
- `MatchRunRepository.record_run()` accepts deterministic outcomes only after
  validating every rule/source pair, then stores engine version, profile digest,
  verdict, relevance score, rule evidence, and missing fields.
- `MatchRunRepository.question_candidates()` returns deduplicated unknown fields
  and human-reviewed question templates for a session-owned run.

This boundary keeps relevance ranking separate from eligibility verdicts and
supports reproducible explanations without model calls.

## Reliability and deployment evidence

The latest verification gate produced these results:

- 82 pytest tests passed with 91% line coverage;
- Ruff lint and format checks passed across 73 Python files;
- strict mypy passed across 65 application/test source files;
- Alembic reported one head (`20261009_0004`) and rendered the complete
  PostgreSQL upgrade chain;
- Supabase runs that head with all 12 application tables present and protected
  by row-level security;
- the deterministic OpenAPI artifact contains 11 paths and has a drift test;
- production-mode startup bound to an injected platform `PORT`;
- `/health` returned HTTP 200 and production `/docs` returned HTTP 404; and
- the deployed Render API returned typed Supabase-backed responses at
  `https://yojana-saathi-api.onrender.com`;
- CORS, fixed error envelopes, source integrity, publication hiding,
  immutability, role denial, session expiry, and duplicate bookmark behavior
  have automated tests.

The Render Blueprint uses a migration-gated Uvicorn start command and a
deploy-time `/health` check. Secrets are configured through environment
variables rather than committed files.

## Honest limitations and remaining integration

The implementation has been migrated to Supabase through revision
`20261009_0004` and deployed to Render at
`https://yojana-saathi-api.onrender.com`. The free service can sleep after
inactivity, so its first request can experience a cold-start delay.

The user retained ownership of manual scheme collection. Consequently, no real
verified production dataset snapshot exists yet. The backend is designed to
reject its synthetic fixture in production. Real-data research, independent
review and Supabase real-data seeding must be completed before claiming an
end-to-end production dataset.
