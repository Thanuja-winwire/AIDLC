import { useCallback, useEffect, useState } from 'react'
import { api } from '../api/client.js'

export function useTasks(filters, onMutated) {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { status, priority } = filters

  const refetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setTasks(await api.listTasks({ status, priority }))
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [status, priority])

  useEffect(() => {
    refetch()
  }, [refetch])

  const afterMutation = useCallback(async () => {
    await refetch()
    if (onMutated) onMutated()
  }, [refetch, onMutated])

  const createTask = useCallback(async (task) => {
    await api.createTask(task)
    await afterMutation()
  }, [afterMutation])

  const updateTask = useCallback(async (id, task) => {
    await api.updateTask(id, task)
    await afterMutation()
  }, [afterMutation])

  const deleteTask = useCallback(async (id) => {
    await api.deleteTask(id)
    await afterMutation()
  }, [afterMutation])

  return { tasks, loading, error, refetch, createTask, updateTask, deleteTask }
}
