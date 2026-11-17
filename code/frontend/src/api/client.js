const BASE = '/api'

export function buildQuery(filters = {}) {
  const params = new URLSearchParams()
  if (filters.status) params.set('status', filters.status)
  if (filters.priority) params.set('priority', filters.priority)
  const qs = params.toString()
  return qs ? `?${qs}` : ''
}

export class ApiError extends Error {
  constructor(message, status, fieldErrors = {}) {
    super(message)
    this.status = status
    this.fieldErrors = fieldErrors
  }
}

async function request(path, options = {}) {
  let res
  try {
    res = await fetch(`${BASE}${path}`, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    })
  } catch {
    throw new ApiError('Cannot reach the server. Is the backend running?', 0)
  }
  if (res.status === 204) return null
  let data = null
  try {
    data = await res.json()
  } catch {
    /* non-JSON body */
  }
  if (!res.ok) {
    const fieldErrors = {}
    let message = 'Something went wrong'
    if (Array.isArray(data?.detail)) {
      for (const d of data.detail) {
        const field = d.loc?.[d.loc.length - 1]
        fieldErrors[field] = (d.msg || '').replace(/^Value error, /, '')
      }
      message = 'Please fix the highlighted fields'
    } else if (typeof data?.detail === 'string') {
      message = data.detail
    }
    throw new ApiError(message, res.status, fieldErrors)
  }
  return data
}

export const api = {
  listTasks: (filters) => request(`/tasks${buildQuery(filters)}`),
  createTask: (task) => request('/tasks', { method: 'POST', body: JSON.stringify(task) }),
  updateTask: (id, task) => request(`/tasks/${id}`, { method: 'PUT', body: JSON.stringify(task) }),
  deleteTask: (id) => request(`/tasks/${id}`, { method: 'DELETE' }),
  getSummary: () => request('/dashboard/summary'),
}
