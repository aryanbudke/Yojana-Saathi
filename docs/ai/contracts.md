# AI and matching integration contract

The backend DTOs remain authoritative. Profile fields, yes/no/not_sure land registration, verdict values, source UUIDs and rule groups are unchanged. `ConfirmedFacts` tightens primitive validation at the AI and matching boundaries without adding wire fields. Extracted facts require human confirmation.

Rules support eq/in/lt/lte/gt/gte, all/any/not and manual_review_required. Trees are limited to depth 16, 256 nodes and 64 children per group. Null and not_sure are unknown; zero and false remain known. ALL precedence: fail, manual review, unknown, pass. ANY precedence: pass, manual review, unknown, fail. NOT preserves unknown and manual review. EXCLUSION rows invert known results, so a triggered exclusion fails the scheme. Unverified, future-dated, invalid or untraceable policy requires manual review.

The root eligibility JSON must have schema_version 1.0 and agree with the conjunction of REQUIRED rows, ignoring source annotations and redundant AND nesting. This prevents extra root criteria from disappearing during per-rule evaluation. Exclusions and manual-review rows are separately mandatory. A known exclusion can reject even when another rule needs manual review. No rules cannot produce a pass.

Each outcome carries the existing reviewed rule key and source ID. Missing fields are persisted through MatchResultWrite; the public DTO conveys them through unknown_rules.required_field and deterministic reasons, which include every missing field for compound rules. Question templates spanning multiple fields require an explicit reviewed per-field mapping; the selector does not repurpose them.

Gemini extraction output is restricted to existing ProfileFacts and exact original evidence snippets. This checks structure and traceability, not semantic truth: the citizen must still review every value. Generated explanations may only select exact prevalidated claims and citations. Unrestricted policy paraphrasing and invented instructions are not enabled.

Ranking is relevance, never approval probability. Real reviewed scheme ingestion remains Developer 2's responsibility. No fabricated policies or government URLs will be inserted into application data.
