# Admin knowledge-base curation — Feature overview

**Priority:** P0 minimal / P1 UI  
**Parent specs:** [BRD](../../brd.md) · [Architecture](../../architecture.md) · [Design](../../design.md)

## User problem and objective

Ensure government rules, official links and documents are reviewed before being exposed as verified.

## Example user journey

Researcher enters a rule with source excerpt and verification date; reviewer approves it; published version is immutable.

## Inputs

Scheme metadata, source URL, citation locator, rule predicates, reviewer status.

## Outputs

Versioned verified source-backed scheme rows and audit records.

## Acceptance / done criteria

No unpublished/unsupported rule reaches public matching; changes are traceable; at least one reviewer signs off.

## Interface and ownership

- API: P0 CLI seed/migrations; P1 `/api/v1/admin/schemes`.
- Dependency: Data model + source-review checklist; admin auth if UI built.
- Implementation tasks: [Frontend — Task One](../../tasks/task-one.md), [Backend/data — Task Two](../../tasks/task-two.md), [AI/QA — Task Three](../../tasks/task-three.md).
- Specs: [Frontend](frontend.md) · [Backend](backend.md).

## Important constraint

Eligibility results are preliminary, traceable and never official approval. Missing or conflicting information remains explicitly unresolved.
