# User Stories

Persona: Task Owner (see `personas.md`). Breakdown: feature-based. Acceptance criteria: bullet checklist.

### US-1: Create a task (FR-1)
As a task owner, I want to create a task with title, description, priority, due date and status so that I can capture work to be done.
- [ ] Title is required (max 200 chars); description is optional
- [ ] Priority is Low, Medium or High; status is Pending, In Progress or Completed (default Pending)
- [ ] Due date is a calendar date
- [ ] Invalid input shows a clear error message and nothing is saved
- [ ] New task appears in the list immediately

### US-2: Edit a task (FR-2)
As a task owner, I want to edit any field of a task so that I can keep it accurate.
- [ ] Form is pre-filled with current values
- [ ] Same validation as creation
- [ ] Saved changes appear in the list immediately
- [ ] Unknown task returns a clear not-found error

### US-3: Delete a task (FR-3)
As a task owner, I want to delete a task so that I can remove work no longer needed.
- [ ] A confirmation is shown before deletion
- [ ] Confirmed deletion removes the task from the list
- [ ] Cancelling leaves the task unchanged

### US-4: Change task status quickly (FR-4)
As a task owner, I want to change a task's status directly from the list so that I can update progress with minimal effort.
- [ ] Status can be changed without opening the edit form
- [ ] The list reflects the new status immediately

### US-5: Filter tasks by status and priority (FR-5)
As a task owner, I want to filter the task list by status and priority so that I can focus on what matters.
- [ ] Status and priority filters can be used alone or combined
- [ ] A clear-filters action restores the full list
- [ ] An empty result shows a helpful empty state

### US-6: View dashboard summary (FR-6)
As a task owner, I want a dashboard with task totals so that I can see progress at a glance.
- [ ] Shows total tasks
- [ ] Shows counts per status (Pending, In Progress, Completed)
- [ ] Shows counts per priority (Low, Medium, High)
- [ ] Has a designed empty state when there are no tasks

### US-7: Dashboard stays current (FR-7)
As a task owner, I want the dashboard to update after any change so that the numbers are always trustworthy.
- [ ] Counts update after create, edit, delete and status change
- [ ] No manual page refresh required
