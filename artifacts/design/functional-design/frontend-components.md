# Frontend Components — task-manager

- **App**: layout (header, dashboard, filter bar, list), owns the hooks and the modal state.
- **Dashboard**: stat cards for Total, per-status and per-priority counts, with colour-coded semantic accents.
- **FilterBar**: status and priority selects, plus a Clear filters button shown when filters are active.
- **TaskList / TaskCard**: card showing title, description excerpt, priority badge, status select, due date (or "No due date"), and edit and delete icon buttons. No overdue styling (BR-16).
- **TaskFormModal**: create/edit form with title, description, priority, due date (optional), status. Shows inline validation errors; the primary submit button is disabled while saving.
- **ConfirmDialog**: delete confirmation with a destructive primary button.
- **EmptyState / ErrorBanner / Skeleton**: designed non-happy-path states.
- **Hooks**: `useTasks(filters)` and `useDashboard()` expose data, loading, error, and mutation functions that trigger refetch.

Styling: one consistent approach across all components (Tailwind), with a type scale, a neutral palette with an indigo accent, semantic status colours, and responsive layout.
