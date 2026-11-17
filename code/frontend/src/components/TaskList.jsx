import React from 'react'
import TaskCard from './TaskCard.jsx'
import { EmptyState, ErrorBanner, Skeleton } from './States.jsx'

export default function TaskList({ tasks, loading, error, filtersActive, onRetry, onCreate, onClearFilters, onEdit, onDelete, onStatusChange }) {
  if (error) return <ErrorBanner message={error} onRetry={onRetry} />

  if (loading && tasks.length === 0) {
    return (
      <div className="space-y-3" aria-busy="true">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-28" />
        ))}
      </div>
    )
  }

  if (tasks.length === 0) {
    return filtersActive ? (
      <EmptyState
        title="No matching tasks"
        message="No tasks match the current filters. Try a different combination."
        action={<button type="button" className="btn-secondary" onClick={onClearFilters}>Clear filters</button>}
      />
    ) : (
      <EmptyState
        title="No tasks yet"
        message="Create your first task to start organising your work."
        action={<button type="button" className="btn-primary" onClick={onCreate}>Create a task</button>}
      />
    )
  }

  return (
    <ul className={`space-y-3 transition-opacity ${loading ? 'opacity-60' : ''}`}>
      {tasks.map((t) => (
        <TaskCard key={t.id} task={t} onEdit={onEdit} onDelete={onDelete} onStatusChange={onStatusChange} />
      ))}
    </ul>
  )
}
