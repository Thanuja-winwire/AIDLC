# Functional Design Plan — task-manager (single unit)

Scope: business logic, domain entities, business rules and frontend components for the Task Manager (FR-1..FR-7, US-1..US-7).

## Steps
- [ ] Step 1: Analyze unit context (unit definition, story map, app architecture)
- [ ] Step 2: Collect answers to the questions below
- [ ] Step 3: Generate `functional-design/domain-entities.md`
- [ ] Step 4: Generate `functional-design/business-rules.md`
- [ ] Step 5: Generate `functional-design/business-logic-model.md`
- [ ] Step 6: Generate `functional-design/frontend-components.md`

## Questions

## Question 1
How should the due date be handled on a task?

A) Optional (a task may have no due date)

B) Required on create and edit

C) Required, and must not be in the past when creating

D) Other (please describe after [Answer]: tag below)

[Answer]: A) Optional (a task may have no due date)

## Question 2
How should the task list be sorted by default?

A) Newest created first

B) Due date ascending (earliest first, tasks without a due date last)

C) Priority High to Low, then due date

D) Other (please describe after [Answer]: tag below)

[Answer]: A) Newest created first

## Question 3
How should overdue tasks (due date before today and not Completed) be shown?

A) Highlighted visually in the list only (no dashboard change)

B) No special treatment

C) Other (please describe after [Answer]: tag below)

[Answer]: B) No special treatment
