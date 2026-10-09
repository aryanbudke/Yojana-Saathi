# Profile intake and extraction — Feature overview

**Priority:** P0  
**Parent specs:** [BRD](../../brd.md) · [Architecture](../../architecture.md) · [Design](../../design.md)

## User problem and objective

Turn a free-text description into a clear, editable, minimally collected citizen profile without inferring missing facts.

## Example user journey

User writes: “I am 24 and help with farming in Maharashtra.” The system extracts only stated facts, leaves land ownership unknown, then lets the user confirm/correct the profile.

## Inputs

Free-text message (<= 1000 chars), optional locale, user-confirmed structured edits.

## Outputs

Typed `ProfileFacts` with nullable fields, origins, `needs_review` and unknown-field list.

## Acceptance / done criteria

A wrong AI-extracted field can be edited before matching; age/state/occupation extract correctly in reviewed test cases; unstated caste/income/land ownership are null.

## Interface and ownership

- API: `POST /api/v1/profiles/extract` and `POST /api/v1/profiles/answers`.
- Dependency: Approved profile schema from Backend; Gemini integration from AI owner.
- Implementation tasks: [Frontend — Task One](../../tasks/task-one.md), [Backend/data — Task Two](../../tasks/task-two.md), [AI/QA — Task Three](../../tasks/task-three.md).
- Specs: [Frontend](frontend.md) · [Backend](backend.md).

## Important constraint

Eligibility results are preliminary, traceable and never official approval. Missing or conflicting information remains explicitly unresolved.
