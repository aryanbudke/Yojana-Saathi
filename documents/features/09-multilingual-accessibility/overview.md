# Multilingual access and accessibility — Feature overview

**Priority:** Accessibility P0 / Hindi P1  
**Parent specs:** [BRD](../../brd.md) · [Architecture](../../architecture.md) · [Design](../../design.md)

## User problem and objective

Ensure the interface is usable for mobile, keyboard/screen-reader users and later Hindi speakers.

## Example user journey

Citizen uses the app at phone width, navigates by keyboard, and (stretch) switches interface language to Hindi without changing eligibility logic.

## Inputs

Locale and typed/spoken statements; accessible interaction preferences.

## Outputs

Readable interface and controlled localized explanation with invariant matching decisions.

## Acceptance / done criteria

Keyboard-only flow works, labels are read correctly, language choice never changes numeric threshold checks.

## Interface and ownership

- API: `locale` request field on extract/guidance endpoints.
- Dependency: Approved bilingual glossary after English P0 functionality.
- Implementation tasks: [Frontend — Task One](../../tasks/task-one.md), [Backend/data — Task Two](../../tasks/task-two.md), [AI/QA — Task Three](../../tasks/task-three.md).
- Specs: [Frontend](frontend.md) · [Backend](backend.md).

## Important constraint

Eligibility results are preliminary, traceable and never official approval. Missing or conflicting information remains explicitly unresolved.
