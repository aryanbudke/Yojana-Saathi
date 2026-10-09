# Scheme discovery and filtering — Feature overview

**Priority:** P0  
**Parent specs:** [BRD](../../brd.md) · [Architecture](../../architecture.md) · [Design](../../design.md)

## User problem and objective

Retrieve a compact, source-backed shortlist based on stated intent and known location without hiding schemes due to missing facts.

## Example user journey

A farmer searches “financial help for farm”; result list shows relevant active, verified schemes and a source date.

## Inputs

Search text, normalized state code, category, government level, optional page cursor.

## Outputs

Paginated scheme summaries with IDs, verified status, categories, source/verification metadata.

## Acceptance / done criteria

Filtering by state/intent narrows results; unknown state does not silently exclude national schemes; no draft/closed scheme is promoted as open.

## Interface and ownership

- API: `GET /api/v1/schemes`.
- Dependency: Scheme/version tables, official source record review.
- Implementation tasks: [Frontend — Task One](../../tasks/task-one.md), [Backend/data — Task Two](../../tasks/task-two.md), [AI/QA — Task Three](../../tasks/task-three.md).
- Specs: [Frontend](frontend.md) · [Backend](backend.md).

## Important constraint

Eligibility results are preliminary, traceable and never official approval. Missing or conflicting information remains explicitly unresolved.
