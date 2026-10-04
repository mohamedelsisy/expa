import type { SetupTask, TaskStatus } from '~/types/api'

/** Task checklist with optimistic updates and rollback. The API returns the full list on every PUT. */
export function useTasks() {
  const { request } = useApi()
  const { t } = useI18n()
  const toast = useToast()
  const tasks = ref<SetupTask[]>([])
  const pendingKeys = ref<Set<string>>(new Set())

  async function setStatus(key: string, status: TaskStatus): Promise<boolean> {
    const before = tasks.value
    if (pendingKeys.value.has(key)) return false
    pendingKeys.value = new Set(pendingKeys.value).add(key)
    tasks.value = before.map(x => (x.key === key ? { ...x, status } : x))
    try {
      const res = await request<SetupTask[]>(`dashboard/tasks/${encodeURIComponent(key)}`, { method: 'PUT', body: { status } })
      tasks.value = res.data
      return true
    } catch (e) {
      tasks.value = before // rollback
      toast.error(isApiError(e) ? e.message : t('errors.generic'))
      return false
    } finally {
      const next = new Set(pendingKeys.value)
      next.delete(key)
      pendingKeys.value = next
    }
  }

  return { tasks, pendingKeys, setStatus }
}
