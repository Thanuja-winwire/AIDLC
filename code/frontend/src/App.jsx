import React, { useCallback, useState } from 'react'
import Dashboard from './components/Dashboard.jsx'
import FilterBar from './components/FilterBar.jsx'
import TaskList from './components/TaskList.jsx'
import TaskFormModal from './components/TaskFormModal.jsx'
import ConfirmDialog from './components/ConfirmDialog.jsx'
import { useDashboard } from './hooks/useDashboard.js'
import { useTasks } from './hooks/useTasks.js'

export default function App() {
  const [filters, setFilters] = useState({ status: '', priority: '' })
  const [formTask, setFormTask] = useState(undefined) // undefined=closed, null=create, object=edit
  const [deleting, setDeleting] = useState(null)
  const [actionError, setActionError] = useState(null)

  const dashboard = useDashboard()
  const { refetch: refetchSummary } = dashboard
  const onMutated = useCallback(() => refetchSummary(), [refetchSummary])
  const { tasks, loading, error, refetch, createTask, updateTask, deleteTask } = useTasks(filters, onMutated)

  const closeForm = useCallback(() => setFormTask(undefined), [])
  const cancelDelete = useCallback(() => setDeleting(null), [])

  const submitForm = async (data) => {
    if (formTask) await updateTask(formTask.id, data)
    else await createTask(data)
    setFormTask(undefined)
  }

  const changeStatus = async (task, status) => {
    setActionError(null)
    try {
      await updateTask(task.id, {
        title: task.title,
        description: task.description,
        priority: task.priority,
        due_date: task.due_date,
        status,
      })
    } catch (e) {
      setActionError(e.message)
    }
  }

  const confirmDelete = async () => {
    await deleteTask(deleting.id)
    setDeleting(null)
  }

  const filtersActive = Boolean(filters.status || filters.priority)

  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-5 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900">Task Manager</h1>
              <p className="text-xs text-slate-500">Stay on top of what matters</p>
            </div>
          </div>
          <button type="button" className="btn-primary" onClick={() => setFormTask(null)}>
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            New task
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-8 px-4 py-8 sm:px-6">
        <Dashboard summary={dashboard.summary} loading={dashboard.loading} error={dashboard.error} onRetry={dashboard.refetch} />

        <section aria-label="Tasks" className="space-y-4">
          <div className="flex items-baseline justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Tasks</h2>
            <span className="text-sm text-slate-500">{tasks.length} shown</span>
          </div>
          <FilterBar filters={filters} onChange={setFilters} />
          {actionError && (
            <div role="alert" className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{actionError}</div>
          )}
          <TaskList
            tasks={tasks}
            loading={loading}
            error={error}
            filtersActive={filtersActive}
            onRetry={refetch}
            onCreate={() => setFormTask(null)}
            onClearFilters={() => setFilters({ status: '', priority: '' })}
            onEdit={(t) => setFormTask(t)}
            onDelete={(t) => setDeleting(t)}
            onStatusChange={changeStatus}
          />
        </section>
      </main>

      {formTask !== undefined && <TaskFormModal task={formTask} onClose={closeForm} onSubmit={submitForm} />}
      {deleting && <ConfirmDialog task={deleting} onCancel={cancelDelete} onConfirm={confirmDelete} />}
    </div>
  )
}
