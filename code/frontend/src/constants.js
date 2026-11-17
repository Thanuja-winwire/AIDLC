export const STATUSES = ['Pending', 'In Progress', 'Completed']
export const PRIORITIES = ['Low', 'Medium', 'High']

export const STATUS_STYLES = {
  Pending: { dot: 'bg-amber-400', text: 'text-amber-700', bg: 'bg-amber-50', ring: 'ring-amber-200', bar: 'bg-amber-400' },
  'In Progress': { dot: 'bg-sky-500', text: 'text-sky-700', bg: 'bg-sky-50', ring: 'ring-sky-200', bar: 'bg-sky-500' },
  Completed: { dot: 'bg-emerald-500', text: 'text-emerald-700', bg: 'bg-emerald-50', ring: 'ring-emerald-200', bar: 'bg-emerald-500' },
}

export const PRIORITY_STYLES = {
  Low: { text: 'text-slate-600', bg: 'bg-slate-100', ring: 'ring-slate-200', bar: 'bg-slate-400' },
  Medium: { text: 'text-indigo-700', bg: 'bg-indigo-50', ring: 'ring-indigo-200', bar: 'bg-indigo-500' },
  High: { text: 'text-rose-700', bg: 'bg-rose-50', ring: 'ring-rose-200', bar: 'bg-rose-500' },
}
