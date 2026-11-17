import React, { useState } from 'react'
import { PRIORITY_STYLES, STATUSES, STATUS_STYLES } from '../constants.js'

function formatDate(iso) {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}

export default function TaskCard({ task, onEdit, onDelete, onStatusChange }) {
  const [busy, setBusy] = useState(false)
  const pr = PRIORITY_STYLES[task.priority]
  const st = STATUS_STYLES[task.status]

  const changeStatus = async (e) => {
    setBusy(true)
    try {
      await onStatusChange(task, e.target.value)
    } finally {
      setBusy(false)
    }
  }

  return (
    <li className="group rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-indigo-200 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className={`truncate text-base font-semibold ${task.status === 'Completed' ? 'text-slate-400 line-through' : 'text-slate-900'}`}>
            {task.title}
          </h3>
          {task.description && <p className="mt-1 line-clamp-2 text-sm text-slate-500">{task.description}</p>}
        </div>
        <div className="flex shrink-0 gap-1">
          <button type="button" aria-label={`Edit ${task.title}`} onClick={() => onEdit(task)}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-indigo-50 hover:text-indigo-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
            </svg>
          </button>
          <button type="button" aria-label={`Delete ${task.title}`} onClick={() => onDelete(task)}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
            </svg>
          </button>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${pr.bg} ${pr.text} ${pr.ring}`}>
          {task.priority} priority
        </span>
        <span className="inline-flex items-center gap-1.5 text-sm text-slate-500">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
          </svg>
          {task.due_date ? formatDate(task.due_date) : 'No due date'}
        </span>
        <div className="ml-auto">
          <label className="sr-only" htmlFor={`status-${task.id}`}>Status for {task.title}</label>
          <select
            id={`status-${task.id}`}
            value={task.status}
            disabled={busy}
            onChange={changeStatus}
            className={`cursor-pointer rounded-full border-0 py-1 pl-3 pr-8 text-xs font-semibold ring-1 ring-inset focus:outline-none focus:ring-2 disabled:opacity-60 ${st.bg} ${st.text} ${st.ring}`}
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>
    </li>
  )
}
