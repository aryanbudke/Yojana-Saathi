# Grounded AI explanations and optional RAG — Feature overview

**Priority:** Source grounding P0 / RAG P2  
**Parent specs:** [BRD](../../brd.md) · [Architecture](../../architecture.md) · [Design](../../design.md)

## User problem and objective

Explain decisions in straightforward language without adding policy claims outside reviewed evidence.

## Example user journey

Citizen asks “Why am I seeing this scheme?” and reads an explanation referencing specific matched rules and official sources.

## Inputs

Reviewed summary, rule results, source IDs and guidance records; optionally verified document excerpts.

## Outputs

Plain-language why-match, unresolved issues, citation links, bounded next steps.

## Acceptance / done criteria

Every factual claim has an underlying reviewed source/rule; fake URLs or unsupported claims are rejected.

## Interface and ownership

- API: Embedded match explanation or future `POST /api/v1/explanations`.
- Dependency: Working eligibility rule results and source mapping.
- Implementation tasks: [Frontend — Task One](../../tasks/task-one.md), [Backend/data — Task Two](../../tasks/task-two.md), [AI/QA — Task Three](../../tasks/task-three.md).
- Specs: [Frontend](frontend.md) · [Backend](backend.md).

## Important constraint

Eligibility results are preliminary, traceable and never official approval. Missing or conflicting information remains explicitly unresolved.
