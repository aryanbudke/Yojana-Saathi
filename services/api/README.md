# Yojana Saathi API

## Local setup

```bash
python3.12 -m venv .venv
.venv/bin/pip install -e '.[dev]'
.venv/bin/alembic upgrade head
.venv/bin/uvicorn app.main:app --reload
```

Runtime configuration is documented in `.env.example`. Keep database and API
credentials out of Git.

## Curated data workflow

Seed files are strict, versioned JSON contracts. Validate before accessing the
database:

```bash
.venv/bin/python -m app.cli.curation validate path/to/seed.json
```

Load an approved bundle inside one transaction:

```bash
.venv/bin/python -m app.cli.curation seed path/to/seed.json
```

For draft versions created by a curation workflow, a reviewer must first verify
the version and a publisher must then publish it:

```bash
.venv/bin/python -m app.cli.curation review VERSION_UUID --actor REVIEWER_ID
.venv/bin/python -m app.cli.curation publish VERSION_UUID --actor PUBLISHER_ID
```

Review is rejected unless the version contains at least one official source and
one source-backed rule. Publication is rejected unless review provenance is
present. Each transition writes an audit record. Once published, the version
and all of its sources, rules, document requirements, and steps are immutable;
create a new version for any correction.

The fixture under `tests/fixtures` is synthetic and uses the reserved `.invalid`
domain. It must never be presented as government guidance or loaded into a
production environment.

## Anonymous-session retention

Profile sessions expire after `SESSION_TTL_HOURS` (24 hours by default, bounded
to 1–168 hours). Expired sessions are rejected by profile and guidance APIs.
Run the following command from a scheduled job to physically remove expired
sessions; PostgreSQL cascades removal to their facts, match runs/results, and
guest saves:

```bash
.venv/bin/python -m app.cli.sessions purge-expired
```

## Matching-engine integration boundary

Developer 3 should depend on the protocols and DTOs in
`app.repositories.matching`, not query publication tables directly:

- `CandidateRepository.list_candidates()` returns only active schemes with the
  latest verified, published version, including `scheme_version_id`, reviewed
  rule expressions, rule-source IDs, question templates, and official sources.
- `MatchRunRepository.record_run(...)` accepts deterministic outcomes, validates
  each rule/source pair against the reviewed candidate, and persists the engine
  version and caller-provided profile digest for reproducibility.
- `MatchRunRepository.question_candidates(...)` returns deduplicated unknown
  fields with reviewed question templates for the requested session-owned run.

The AI/rule module owns extraction, evaluation, ranking, and question selection;
the repository owns publication filtering, provenance checks, and persistence.
