# Scheme details and verified sources — Feature overview

**Priority:** P0  
**Parent specs:** [BRD](../../brd.md) · [Architecture](../../architecture.md) · [Design](../../design.md)

## User problem and objective

Give a comprehensible, factual single-scheme summary, qualification breakdown and a clear official citation trail.

## Example user journey

User opens PM-KISAN and sees benefits, eligibility/exclusions, verified policy date, known unknowns and a direct source link.

## Inputs

Published scheme ID and optional match run/session context.

## Outputs

Verified summary, benefits, source links, eligibility rules, review date and application state.

## Acceptance / done criteria

Every eligibility statement points to current curated source metadata; links open in safe external tabs; no unapproved government branding.

## Interface and ownership

- API: `GET /api/v1/schemes/{scheme_id}`.
- Dependency: Curated scheme, source, rule and document records.
- Implementation tasks: [Frontend — Task One](../../tasks/task-one.md), [Backend/data — Task Two](../../tasks/task-two.md), [AI/QA — Task Three](../../tasks/task-three.md).
- Specs: [Frontend](frontend.md) · [Backend](backend.md).

## Important constraint

Eligibility results are preliminary, traceable and never official approval. Missing or conflicting information remains explicitly unresolved.
