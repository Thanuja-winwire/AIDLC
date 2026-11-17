import React from 'react'
import { PRIORITIES, STATUSES } from '../constants.js'

export default function FilterBar({ filters, onChange }) {
  const active = Boolean(filters.status || filters.priority)
  return (
    <div className="flex flex-wrap items-end gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="min-w-[150px] flex-1 sm:flex-none">
        <label htmlFor="filter-status" className="label">Status</label>
        <select
          id="filter-status"
          className="field"
          value={filters.status}
          onChange={(e) => onChange({ ...filters, status: e.target.value })}
        >
          <option value="">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>
      <div className="min-w-[150px] flex-1 sm:flex-none">
        <label htmlFor="filter-priority" className="label">Priority</label>
        <select
          id="filter-priority"
          className="field"
          value={filters.priority}
          onChange={(e) => onChange({ ...filters, priority: e.target.value })}
        >
          <option value="">All priorities</option>
          {PRIORITIES.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
      </div>
      {active && (
        <button type="button" className="btn-secondary" onClick={() => onChange({ status: '', priority: '' })}>
          Clear filters
        </button>
      )}
    </div>
  )
}
