# Security, privacy, and trustworthy government guidance

## Risks to address

- Wrong eligibility claim can waste time or cause costly application attempts.
- Leakage of citizen circumstances, queries or documents.
- Malicious instructions embedded in retrieved government website text.
- Admin edits that silently change requirements.
- Stale application links and outdated policy versions.

## MVP security requirements

- Default to anonymous/ephemeral session; no identity verification, Aadhaar-number collection, Aadhaar image upload, or bank account details.
- Ask permission before saving a profile beyond the live session; set expiry and a clear/delete control.
- HTTPS; rate-limit AI extraction/matching; input validation and size limits (e.g. 1000 characters for free text).
- Put Gemini key, database credentials and admin tokens only on the backend; keep `.env` excluded from git.
- Admin curation must have role-based access control and audit records; public user cannot publish rules.
- Avoid logging unredacted prompts, names, income information or raw session transcripts.
- Validate external URLs as HTTPS and official government-domain sources where possible, but verify case-by-case; do not blindly trust domain suffix alone.
- Escape rendered text and treat source documents as untrusted input; prevent prompt injection from authorizing tool calls.
- Explain model extraction uncertainty; allow corrections; final government portal decides application outcomes.

## Retention proposal

Guest facts expire within 24 hours (configurable). Matching audit may retain only anonymized rule version, test profile IDs and aggregate counters. Never retain raw PII simply for analytics.

## Trust language

**Approved UI disclaimer:** “Yojana Saathi provides preliminary guidance based on reviewed public sources. Eligibility and approval are determined by the relevant government authority.”

**Prohibited UI claims:** “Government approved”, “100% eligible”, “Application submitted”, “Guaranteed benefit”, or any unsupported official endorsement.

## Safe failure behavior

If official source can’t be verified: show `Manual verification required`, verification timestamp and a safe message to consult the official portal. If the AI is unavailable: fall back to typed fields and deterministic matching.
