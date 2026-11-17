import { describe, it, expect, vi, afterEach } from 'vitest'
import { api, buildQuery, ApiError } from './client.js'

afterEach(() => vi.restoreAllMocks())

describe('buildQuery', () => {
  it('returns empty string with no filters', () => {
    expect(buildQuery({})).toBe('')
  })
  it('combines status and priority', () => {
    expect(buildQuery({ status: 'In Progress', priority: 'High' })).toBe('?status=In+Progress&priority=High')
  })
})

describe('api', () => {
  it('posts a new task', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 201, json: async () => ({ id: 1 }) })
    vi.stubGlobal('fetch', fetchMock)
    const out = await api.createTask({ title: 'x' })
    expect(out).toEqual({ id: 1 })
    expect(fetchMock.mock.calls[0][0]).toBe('/api/tasks')
    expect(fetchMock.mock.calls[0][1].method).toBe('POST')
  })

  it('maps 422 details to field errors', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 422,
        json: async () => ({ detail: [{ loc: ['body', 'title'], msg: 'Value error, Title is required' }] }),
      }),
    )
    await expect(api.createTask({ title: '' })).rejects.toMatchObject({
      status: 422,
      fieldErrors: { title: 'Title is required' },
    })
  })

  it('returns null on 204', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, status: 204 }))
    expect(await api.deleteTask(1)).toBeNull()
  })

  it('wraps network failures', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('down')))
    await expect(api.getSummary()).rejects.toBeInstanceOf(ApiError)
  })
})
