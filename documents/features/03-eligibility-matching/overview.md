# Deterministic eligibility matching — Feature overview

**Priority:** P0  
**Parent specs:** [BRD](../../brd.md) · [Architecture](../../architecture.md) · [Design](../../design.md)

## User problem and objective

Evaluate real source-backed eligibility rules with pass/fail/unknown/manual-review outcomes, not LLM guesses.

## Example user journey

A user meets a hypothetical age and residency condition, but has unknown income; engine returns needs information and the specific unresolved predicate.

## Inputs

Confirmed profile facts, candidate scheme/version IDs, immutable rule DSL JSON.

## Outputs

Verdict per scheme, each rule outcome, reasons, missing fields, version IDs, ordered matches.

## Acceptance / done criteria

Known exclusion results in not-eligible; unknown mandatory fact prevents final pass; rules are reproducible with zero model calls.

## Interface and ownership

- API: `POST /api/v1/matches`.
- Dependency: Published rule versions, ProfileFacts schema, rule engine from Task Three.
- Implementation tasks: [Frontend — Task One](../../tasks/task-one.md), [Backend/data — Task Two](../../tasks/task-two.md), [AI/QA — Task Three](../../tasks/task-three.md).
- Specs: [Frontend](frontend.md) · [Backend](backend.md).

## Important constraint

Eligibility results are preliminary, traceable and never official approval. Missing or conflicting information remains explicitly unresolved.
