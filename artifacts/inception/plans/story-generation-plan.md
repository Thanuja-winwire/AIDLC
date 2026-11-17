# Story Generation Plan

## Context
Task Management app (FastAPI + React, single user, SQLite). Requirements FR-1..FR-7 in `specs.md`. Depth: minimal (Simple workflow).

## Story Breakdown Options
- **Feature-Based**: one story per capability (create, edit, delete, status change, filter, dashboard). Direct mapping to FRs; simple to test.
- **User Journey-Based**: stories follow flows (plan my day, review progress). Richer narrative, more overlap.
- **Persona-Based**: not useful with one persona.
- **Epic-Based**: unnecessary overhead for ~6 stories.

## Questions

## Question 1
Which breakdown approach should the stories follow?

A) Feature-Based (one story per capability) (Recommended)

B) User Journey-Based

C) Epic-Based with sub-stories

D) Other (please describe after [Answer]: tag below)

[Answer]: A) Feature-Based (one story per capability) (Recommended)

## Question 2
What format should acceptance criteria use?

A) Given/When/Then scenarios

B) Simple bullet checklist (Recommended)

C) Other (please describe after [Answer]: tag below)

[Answer]: B) Simple bullet checklist (Recommended)

## Question 3
How many personas should be documented?

A) One persona: the single task-owner user (Recommended)

B) Two personas (e.g. busy professional and student)

C) Other (please describe after [Answer]: tag below)

[Answer]: A) One persona: the single task-owner user (Recommended)

## Execution Checklist
- [x] Generate `personas.md` with the agreed persona(s)
- [x] Generate `stories.md` using heading format `### US-<n>: <title> (<FR ids>)` (no persona names in titles)
- [x] Ensure stories meet INVEST criteria
- [x] Add acceptance criteria to each story in the agreed format
- [x] Map personas to stories and cover FR-1..FR-7
