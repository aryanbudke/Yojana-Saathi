# Dynamic follow-up questions — Feature overview

**Priority:** P0  
**Parent specs:** [BRD](../../brd.md) · [Architecture](../../architecture.md) · [Design](../../design.md)

## User problem and objective

Ask the smallest useful question that can resolve eligibility ambiguity for a leading match.

## Example user journey

A candidate farmer scheme requires ownership proof; system asks whether land is recorded in the family’s name; “not sure” remains unknown and guidance explains verification.

## Inputs

Latest match results, ordered unresolved rule fields, profile facts, question templates.

## Outputs

One question at a time with field key, answer options, rationale; answer causes re-evaluation.

## Acceptance / done criteria

No repeated questions, no assumptions from “not sure”, and a submitted answer changes only source-backed outcomes.

## Interface and ownership

- API: `POST /api/v1/questions/next`, `POST /api/v1/profiles/answers`.
- Dependency: Eligibility outcome structure and reviewed rule question templates.
- Implementation tasks: [Frontend — Task One](../../tasks/task-one.md), [Backend/data — Task Two](../../tasks/task-two.md), [AI/QA — Task Three](../../tasks/task-three.md).
- Specs: [Frontend](frontend.md) · [Backend](backend.md).

## Important constraint

Eligibility results are preliminary, traceable and never official approval. Missing or conflicting information remains explicitly unresolved.
