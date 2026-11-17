# Functional Design Plan — student-management (single unit)

Scope: detailed business logic, domain entities, business rules and frontend component design for FR-1 to FR-6 (US-1 to US-6), building on the approved application architecture.

## Steps
- [ ] Step 1: Analyze unit context (unit-of-work, story map, specs, architecture)
- [ ] Step 2: Collect answers to the questions below
- [ ] Step 3: Generate `functional-design/domain-entities.md`
- [ ] Step 4: Generate `functional-design/business-rules.md`
- [ ] Step 5: Generate `functional-design/business-logic-model.md`
- [ ] Step 6: Generate `functional-design/frontend-components.md`

## Questions

## Question 1
How should the phone number be stored?

A) Trimmed, exactly as the user typed it (spaces and hyphens kept)

B) Normalized: spaces and hyphens removed, optional leading +

C) Other (please describe after [Answer]: tag below)

[Answer]: A) Trimmed, exactly as the user typed it (spaces and hyphens kept)

## Question 2
Should the enrollment date allow future dates?

A) Yes, any valid date is allowed

B) No, it cannot be later than today

C) Other (please describe after [Answer]: tag below)

[Answer]: A) Yes, any valid date is allowed

## Question 3
How should the dashboard display a course name whose spellings differ in case (e.g. "Math" and "math")?

A) Show the most frequent spelling

B) Show the first-created spelling

C) Show the lowercase-normalized name in title case

D) Other (please describe after [Answer]: tag below)

[Answer]: A) Show the most frequent spelling

## Question 4
What default sort order should the student list use?

A) Newest first (by created time)

B) Name A-Z

C) Enrollment date, newest first

D) Other (please describe after [Answer]: tag below)

[Answer]: A) Newest first (by created time)

## Question 5
When a student is updated and the email is unchanged, how should uniqueness be checked?

A) Exclude the student's own record from the duplicate check (standard)

B) Other (please describe after [Answer]: tag below)

[Answer]: A) Exclude the student's own record from the duplicate check (standard)

## Question 6
After a successful add, edit or delete, what feedback should the UI give?

A) Close the modal and show a brief toast message

B) Close the modal and silently refresh the list

C) Other (please describe after [Answer]: tag below)

[Answer]: A) Close the modal and show a brief toast message

## Question 7
How should the Add/Edit form be presented?

A) Modal dialog over the dashboard

B) Separate page

C) Other (please describe after [Answer]: tag below)

[Answer]: A) Modal dialog over the dashboard

## Question 8
Which styling approach should the React frontend use?

A) Tailwind CSS with lucide-react icons

B) Material UI (MUI)

C) Plain CSS modules with a custom design system

D) Other (please describe after [Answer]: tag below)

[Answer]: B) Material UI (MUI)
