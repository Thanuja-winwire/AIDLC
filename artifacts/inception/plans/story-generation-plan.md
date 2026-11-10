# Story Generation Plan

Please fill in each `[Answer]:` tag with a letter choice.

## Story Breakdown Options (for reference)
- **User Journey-Based**: follows workflows (browse, buy, track); natural for shoppers, weaker for admin tasks.
- **Feature-Based**: one story per feature (maps directly to FR-1..FR-9); simple to trace and test.
- **Persona-Based**: grouped by customer/admin; clear roles, may split a feature across groups.
- **Epic-Based**: epics with sub-stories; more structure than a Simple project needs.

## Questions

## Question 1
Which breakdown approach should the stories use?

A) Feature-based, mapped to FR-1..FR-9 (Recommended)

B) User journey-based

C) Persona-based (customer vs admin)

D) Other (please describe after [Answer]: tag below)

[Answer]: A) Feature-based, mapped to FR-1..FR-9 (Recommended)

## Question 2
How granular should the stories be?

A) One story per feature or sub-feature, about 12-16 stories in total (Recommended)

B) Coarse, one story per FR, about 9 stories

C) Fine-grained, 20+ stories

D) Other (please describe after [Answer]: tag below)

[Answer]: A) One story per feature or sub-feature, about 12-16 stories in total (Recommended)

## Question 3
Which personas should be defined?

A) Customer and Admin (Recommended)

B) Customer, Admin, and Guest (unauthenticated visitor)

C) Other (please describe after [Answer]: tag below)

[Answer]: A) Customer and Admin (Recommended)

## Question 4
Can guests browse and search products without logging in?

A) Yes, browsing and search are public; cart and checkout require login (Recommended)

B) No, login is required for everything

C) Other (please describe after [Answer]: tag below)

[Answer]: A) Yes, browsing and search are public; cart and checkout require login (Recommended)

## Question 5
What format should acceptance criteria use?

A) Given/When/Then scenarios

B) Concise bullet checklist (Recommended)

C) Other (please describe after [Answer]: tag below)

[Answer]: B) Concise bullet checklist (Recommended)

## Story Generation Steps
- [ ] Generate personas.md (customer, admin, plus any extra persona chosen)
- [ ] Generate stories.md in the chosen breakdown, each titled `US-<n>: <title> (<FR ids>)`
- [ ] Add acceptance criteria to each story, including validation, empty and error states
- [ ] Map personas to stories
- [ ] Check INVEST criteria and that every FR-1..FR-9 is covered
