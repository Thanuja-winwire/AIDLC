import React, { useEffect, useState } from 'react'
import { PRIORITIES, STATUSES } from '../constants.js'

const EMPTY = { title: '', description: '', priority: 'Medium', due_date: '', status: 'Pending' }

function FieldError({ message }) {
  return message ? <p className="mt-1 text-xs text-rose-600">{message}</p> : null
}

export default function TaskFormModal({ task, onClose, onSubmit }) {
  const editing = Boolean(task)
  const [form, setForm] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setForm(
      task
        ? {
            title: task.title,
            description: task.description || '',
            priority: task.priority,
            due_date: task.due_date || '',
            status: task.status,
          }
        : EMPTY,
    )
    setErrors({})
    setFormError(null)
  }, [task])

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    if (!form.title.trim()) {
      setErrors({ title: 'Title is required' })
      return
    }
    setSaving(true)
    setErrors({})
    setFormError(null)
    try {
      await onSubmit({ ...form, title: form.title.trim(), due_date: form.due_date || null })
    } catch (err) {
      setErrors(err.fieldErrors || {})
      setFormError(err.message)
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-slate-900/50 p-4 backdrop-blur-sm sm:items-center" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <form
        role="dialog"
        aria-modal="true"
        aria-labelledby="task-form-title"
        onSubmit={submit}
        noValidate
        className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl"
      >
        <h2 id="task-form-title" className="text-xl font-semibold text-slate-900">
          {editing ? 'Edit task' : 'New task'}
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          {editing ? 'Update the details of this task.' : 'Add a task to your list.'}
        </p>

        {formError && !Object.keys(errors).length && (
          <div role="alert" className="mt-4 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{formError}</div>
        )}

        <div className="mt-5 space-y-4">
          <div>
            <label htmlFor="f-title" className="label">Title</label>
            <input id="f-title" autoFocus className={`field ${errors.title ? '!border-rose-400' : ''}`} value={form.title} onChange={set('title')} placeholder="e.g. Prepare quarterly report" maxLength={200} />
            <FieldError message={errors.title} />
          </div>
          <div>
            <label htmlFor="f-desc" className="label">Description</label>
            <textarea id="f-desc" rows={3} className="field" value={form.description} onChange={set('description')} placeholder="Optional details" />
            <FieldError message={errors.description} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="f-priority" className="label">Priority</label>
              <select id="f-priority" className="field" value={form.priority} onChange={set('priority')}>
                {PRIORITIES.map((p) => <option key={p}>{p}</option>)}
              </select>
              <FieldError message={errors.priority} />
            </div>
            <div>
              <label htmlFor="f-status" className="label">Status</label>
              <select id="f-status" className="field" value={form.status} onChange={set('status')}>
                {STATUSES.map((s) => <option key={s}>{s}</option>)}
              </select>
              <FieldError message={errors.status} />
            </div>
          </div>
          <div>
            <label htmlFor="f-due" className="label">Due date <span className="font-normal normal-case text-slate-400">(optional)</span></label>
            <input id="f-due" type="date" className="field" value={form.due_date} onChange={set('due_date')} />
            <FieldError message={errors.due_date} />
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button type="button" className="btn-secondary" onClick={onClose} disabled={saving}>Cancel</button>
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? 'Saving…' : editing ? 'Save changes' : 'Create task'}
          </button>
        </div>
      </form>
    </div>
  )
}
