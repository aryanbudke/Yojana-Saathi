# Application guidance and document readiness — Feature overview

**Priority:** P0  
**Parent specs:** [BRD](../../brd.md) · [Architecture](../../architecture.md) · [Design](../../design.md)

## User problem and objective

Provide verifiable application steps, a condition-aware document checklist, and a real official application link.

## Example user journey

User opens an eligible-looking scheme; sees official steps, required paperwork, a checklist, still-unverified conditions and link to apply.

## Inputs

Scheme/version, confirmed profile facts, published application steps and required documents.

## Outputs

Ordered instructions, conditional document list, missing/unknown status, official link and disclaimer.

## Acceptance / done criteria

No invented documents/links, links point to official application pathway, not homepage when a verified deep link exists.

## Interface and ownership

- API: `GET /api/v1/guidance/{scheme_id}`.
- Dependency: Reviewed documentary rules and application steps from source curation.
- Implementation tasks: [Frontend — Task One](../../tasks/task-one.md), [Backend/data — Task Two](../../tasks/task-two.md), [AI/QA — Task Three](../../tasks/task-three.md).
- Specs: [Frontend](frontend.md) · [Backend](backend.md).

## Important constraint

Eligibility results are preliminary, traceable and never official approval. Missing or conflicting information remains explicitly unresolved.
