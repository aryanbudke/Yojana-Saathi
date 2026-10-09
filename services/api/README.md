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
