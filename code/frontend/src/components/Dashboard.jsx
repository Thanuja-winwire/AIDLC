import React from 'react'
import { PRIORITIES, PRIORITY_STYLES, STATUSES, STATUS_STYLES } from '../constants.js'
import { ErrorBanner, Skeleton } from './States.jsx'

function StatCard({ label, value, dotClass }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md">
      <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
        {dotClass && <span className={`h-2.5 w-2.5 rounded-full ${dotClass}`} />}
        {label}
      </div>
      <div className="mt-2 text-3xl font-bold tracking-tight text-slate-900">{value}</div>
    </div>
  )
}

function Breakdown({ title, items, total, styles }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-700">{title}</h3>
      <ul className="mt-4 space-y-3">
        {items.map(([name, count]) => (
          <li key={name}>
            <div className="mb-1 flex justify-between text-sm">
              <span className="text-slate-600">{name}</span>
              <span className="font-semibold text-slate-900">{count}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-100">
              <div
                className={`h-full rounded-full transition-all duration-500 ${styles[name].bar}`}
                style={{ width: total ? `${(count / total) * 100}%` : '0%' }}
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function Dashboard({ summary, loading, error, onRetry }) {
  if (error) return <ErrorBanner message={error} onRetry={onRetry} />
  if (loading && !summary) {
    return (
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
    )
  }
  if (!summary) return null

  return (
    <section aria-label="Dashboard" className="space-y-4">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total tasks" value={summary.total} />
        {STATUSES.map((s) => (
          <StatCard key={s} label={s} value={summary.by_status[s] ?? 0} dotClass={STATUS_STYLES[s].dot} />
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Breakdown
          title="By status"
          total={summary.total}
          styles={STATUS_STYLES}
          items={STATUSES.map((s) => [s, summary.by_status[s] ?? 0])}
        />
        <Breakdown
          title="By priority"
          total={summary.total}
          styles={PRIORITY_STYLES}
          items={PRIORITIES.map((p) => [p, summary.by_priority[p] ?? 0])}
        />
      </div>
    </section>
  )
}
