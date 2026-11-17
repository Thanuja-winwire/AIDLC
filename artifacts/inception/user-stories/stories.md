# User Stories

Persona: Administrator (see `personas.md`). Organized by feature. Source: `specs.md` (FR-1 to FR-6).

### US-1: Add a student (FR-1)
As an administrator, I want to add a student record so that new enrollments are captured.

**Acceptance Criteria**
- Given the Add Student form, when I submit valid name, email, phone, course and enrollment date, then the student is saved and appears in the list and dashboard counts.
- Given a blank required field, when I submit, then an inline message appears beside that field and nothing is saved.
- Given a name or course over 100 characters, when I submit, then a length error is shown.
- Given an invalid email format, when I submit, then an email format error is shown.
- Given an email that already exists (case-insensitive), when I submit, then a duplicate email error (409) is shown.
- Given a phone that is not 7-15 digits (optional leading +, spaces and hyphens allowed), when I submit, then a phone format error is shown.
- Given an invalid or missing date, when I submit, then a date error is shown.
- Given the request is in progress, then the submit button shows a loading state and is disabled.
- Given a server failure, then a distinct error message is shown and the form keeps my input.

### US-2: View students (FR-2)
As an administrator, I want to view the student list and a single student's details so that I can review records.

**Acceptance Criteria**
- Given students exist, when I open the list, then each row shows name, email, phone, course and enrollment date.
- Given the list is loading, then a skeleton or spinner is shown.
- Given no students exist, then an empty state with "No students yet" and an Add Student action is shown.
- Given I select a student, then their full details are displayed.
- Given an unknown student id, then a not-found message (404) is shown.
- Given the list fails to load, then an error state with a retry action is shown.

### US-3: Update a student (FR-3)
As an administrator, I want to edit a student's details so that records stay accurate.

**Acceptance Criteria**
- Given I choose Edit, then the form is pre-filled with current values.
- Given valid changes, when I save, then the list and dashboard reflect them.
- Given any field breaks the add-student validation rules, when I save, then the same inline errors are shown and nothing changes.
- Given I change the email to one used by another student, then a duplicate email error is shown; keeping my own email is allowed.
- Given the student was deleted meanwhile, when I save, then a not-found error is shown.
- Given saving is in progress, then the save button is disabled with a loading indicator.

### US-4: Delete a student (FR-4)
As an administrator, I want to delete a student so that obsolete records are removed.

**Acceptance Criteria**
- Given I click Delete, then a confirmation prompt names the student.
- Given I confirm, then the student is removed and the list and dashboard counts update.
- Given I cancel, then nothing changes.
- Given the student no longer exists, then a not-found message is shown and the list refreshes.
- Given deletion fails, then an error message is shown and the record remains.

### US-5: See dashboard statistics (FR-5)
As an administrator, I want a dashboard with totals and course-wise counts so that I can see enrollment at a glance.

**Acceptance Criteria**
- Given students exist, then the dashboard shows the total student count.
- Given students exist, then course-wise counts are shown, grouped by trimmed, case-insensitive course name.
- Given "Math" and " math " are entered, then they count as one course.
- Given no students, then the total is 0 and the course section shows an empty state.
- Given statistics are loading or fail, then loading and error states are shown respectively.
- Given I add, edit or delete a student, then the statistics refresh.

### US-6: Search students (FR-5, FR-6)
As an administrator, I want to search the student list so that I can find a student quickly.

**Acceptance Criteria**
- Given I type in the search box, then the list filters by case-insensitive partial match on name, email, phone or course.
- Given the search box is cleared, then the full list is shown.
- Given no match, then a "no results" state is shown, distinct from the empty-list state.
- Given a search is active, then I can still edit and delete students from the results.
- Given I type quickly, then requests are debounced and the list responds in under 1 second for a few thousand records.

## INVEST Check
All stories are independent enough to build in order, negotiable, valuable to the administrator, estimable, small, and testable via the criteria above.
