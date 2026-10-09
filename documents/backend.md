# Backend specification (FastAPI)

## Responsibilities

Expose typed APIs; securely call Gemini; manage profiles and official-source knowledge base; perform deterministic matching; generate *grounded* application guidance. Keep schema/business logic independent of UI.

**Stack:** Python 3.12, FastAPI, Pydantic v2, SQLAlchemy or Supabase server SDK, PostgreSQL, pytest, httpx. Choose one database access pattern consistently.

## Proposed implementation tree (future, not generated)

```text
services/api/
├── app/
│   ├── main.py                    # CORS, error middleware, /health
│   ├── api/v1/{profiles,schemes,matches,questions,guidance,admin}.py
│   ├── schemas/{profile,scheme,matching,guidance}.py
│   ├── services/{extract_profile,candidate_search,match_schemes,next_question,guidance}.py
│   ├── domain/{rule_ast,evaluator,ranking,provenance}.py
│   ├── repositories/{schemes,profiles,versions}.py
│   ├── clients/gemini.py
│   ├── core/{config,auth,logging}.py
│   └── prompts/{extract,guidance}.md
├── migrations/
├── tests/{unit,integration,fixtures}/
└── pyproject.toml
```

## Critical business rules

1. Evaluate published versioned rule JSON, not LLM-generated rule decisions.
2. Treat missing facts as unknown; do not default to zero, false or unrestricted.
3. Support AND/OR/NOT plus equals/in/range comparisons and explicit exclusions.
4. Preserve each rule outcome, official source, rule version, missing fields and reason.
5. Avoid exposing government-site login credentials, API keys or user secrets in frontend payloads.
6. Return stable error codes and correlation IDs with redacted logs.

## Service contracts

Canonical HTTP endpoints live in [api-contract.md](api-contract.md). Schema and provenance conventions live in [database.md](database.md). Matching pseudocode and LLM constraints live in [ai-matching.md](ai-matching.md).

## Environment configuration

`DATABASE_URL`, `GEMINI_API_KEY`, `ALLOWED_ORIGINS`, `APP_ENV`, `LOG_LEVEL`; use `SUPABASE_SERVICE_ROLE_KEY` only when strictly required and only server side. Never commit `.env`.

## Performance/observability

Cache read-only published scheme data per version; index common state/category/status fields; time candidate and rule phases independently from AI request. Avoid logging raw personal queries by default. Add `/health` and versioned `/api/v1/` prefix.

## Ownership and acceptance

Data/API infrastructure is [Task Two](tasks/task-two.md); Gemini/rules/questions and QA are [Task Three](tasks/task-three.md). Ensure tests cover unknown input, conflicting data, exclusions and stale sources before considering the backend usable.
