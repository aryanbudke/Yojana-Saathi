# Saved schemes (stretch) — Feature overview

**Priority:** P1  
**Parent specs:** [BRD](../../brd.md) · [Architecture](../../architecture.md) · [Design](../../design.md)

## User problem and objective

Allow citizens to revisit a shortlist while preserving guest-session privacy.

## Example user journey

User bookmarks a scheme and later sees it in Saved within the same session.

## Inputs

Session ID and scheme ID.

## Outputs

Saved list with summary and last verified date.

## Acceptance / done criteria

Save/unsave is reversible, duplicate free, and anonymous storage expires with session.

## Interface and ownership

- API: `GET/POST /api/v1/saved` and `DELETE /api/v1/saved/{scheme_id}` (stretch).
- Dependency: Session model; after P0 core flow.
- Implementation tasks: [Frontend — Task One](../../tasks/task-one.md), [Backend/data — Task Two](../../tasks/task-two.md), [AI/QA — Task Three](../../tasks/task-three.md).
- Specs: [Frontend](frontend.md) · [Backend](backend.md).

## Important constraint

Eligibility results are preliminary, traceable and never official approval. Missing or conflicting information remains explicitly unresolved.
