# Functional Design Plan — student-management (single unit)

Scope: detailed business logic, domain entities, business rules and frontend component design for FR-1 to FR-6 (US-1 to US-6), building on the approved application architecture.

## Steps
- [x] Step 1: Analyze unit context (unit-of-work, story map, specs, architecture)
- [x] Step 2: Collect answers to the questions below
- [x] Step 3: Generate `functional-design/domain-entities.md`
- [x] Step 4: Generate `functional-design/business-rules.md`
- [x] Step 5: Generate `functional-design/business-logic-model.md`
- [x] Step 6: Generate `functional-design/frontend-components.md`

## Decisions (from answers)
1. Phone stored trimmed as typed.
2. Future enrollment dates allowed.
3. Dashboard shows the most frequent spelling per course group.
4. Default sort: newest first by created time.
5. Update uniqueness excludes the student's own record.
6. Close modal and show a toast after add/edit/delete.
7. Add/Edit in a modal dialog.
8. MUI for styling.
