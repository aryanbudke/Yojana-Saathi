# Data model and eligibility knowledge base

## Design principles

Source-backed facts, immutable published versions, explicit missing values, minimal PII, and traceable rule-to-source provenance. PostgreSQL via Supabase; optional pgvector later.

## Tables (proposed MVP schema)

| Table | Important fields | Purpose |
|---|---|---|
| `schemes` | `id uuid pk`, `slug unique`, `name`, `government_level`, `state_code nullable`, `category`, `status` | Identity/index for scheme |
| `scheme_versions` | `id`, `scheme_id fk`, `version int`, `summary`, `benefit_text`, `eligibility_json jsonb`, `verified_at`, `review_status`, `published_at` | Immutable reviewed policy snapshot |
| `sources` | `id`, `scheme_version_id fk`, `official_url`, `title`, `document_date`, `checked_at`, `excerpt_locator` | Official provenance |
| `eligibility_rules` | `id`, `scheme_version_id fk`, `rule_key`, `expression jsonb`, `severity`, `source_id fk`, `question_template` | Explainable individual rules |
| `required_documents` | `id`, `scheme_version_id fk`, `name`, `when_required`, `source_id fk` | Verified document requirements |
| `application_steps` | `id`, `scheme_version_id fk`, `step_number`, `instruction`, `official_url`, `source_id fk` | Guided steps |
| `profile_sessions` | `id uuid pk`, `expires_at`, `consent_version nullable`, `created_at` | Ephemeral anonymous session |
| `profile_facts` | `session_id fk`, `field_name`, `value_json jsonb`, `origin`, `updated_at` | Edited facts and explicit unknowns |
| `match_runs` | `id`, `session_id fk`, `run_at`, `engine_version`, `profile_hash` | Reproducible matching context |
| `match_results` | `run_id fk`, `scheme_version_id fk`, `verdict`, `relevance_score`, `rule_results jsonb`, `missing_fields jsonb` | Evidence-rich matching results |
| `saved_schemes` | `session_id fk`, `scheme_id fk`, `saved_at` | Optional P1 guest saved list |
| `admin_audit_log` | `actor_id`, `entity`, `entity_id`, `action`, `at` | Source/rule change trace |

## Example eligibility JSON (illustrative, NOT an actual government rule)

```json
{
  "schema_version": "1.0",
  "all": [
    {"field": "age", "op": "gte", "value": 18, "source_id": "SOURCE_UUID"},
    {"field": "age", "op": "lte", "value": 25, "source_id": "SOURCE_UUID"},
    {"field": "state_code", "op": "eq", "value": "KA", "source_id": "SOURCE_UUID"},
    {"field": "family_income_inr", "op": "lt", "value": 200000, "source_id": "SOURCE_UUID"}
  ]
}
```

**Important:** This scholarship and its thresholds are hypothetical test data, not official scheme guidance. Real records must be independently reviewed and linked to actual sources.

## Schema rules

- `review_status`: `draft | verified | stale | rejected`; only verified published versions enter normal matching.
- `status`: `active | closed | unknown`; don't advertise closed or status-unknown schemes as open for applications.
- `origin`: `user | model_extracted | imported`; never overwrite user-confirmed values with AI extraction.
- Dates stored UTC; display dates in local user timezone where relevant.
- Income in integer INR per year, area in normalized units with original value retained; never silently assume land ownership from farming occupation.
- `rule_key` stable across revisions; every decision references `scheme_version_id`.

## Indexes and access

- `schemes(status, state_code, category)`, `scheme_versions(scheme_id, review_status, published_at desc)`, `eligibility_rules(scheme_version_id)`, `profile_sessions(expires_at)`.
- Public client must not have SQL write access; write through validated API; enable RLS when using Supabase client access.
- Version updates are append-only published records; retain history for audit/reproduction.

## Seed procedure

1. Select high-value official schemes across education/agriculture/entrepreneurship/social welfare.
2. Save canonical official URL, policy date, eligibility details and documentary requirements.
3. Record explicit inclusions/exclusions; ambiguous text gets `manual_review_required`.
4. Second person reviews and approves each record; attach synthetic unit test cases.
5. Publish verified version and log verification date.
