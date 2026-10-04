import type { AppNotification } from '~/types/api'

const MIN_GAP_MS = 60_000
const POLL_MS = 90_000

/** Shared unread counter. `startPolling` (header bell) refreshes politely: >= 60 s apart, on a slow timer and on focus. */
export function useNotifications() {
  const unread = useState<number>('notif-unread', () => 0)
  const lastFetch = useState<number>('notif-last', () => 0)
  const { request } = useApi()

  async function refreshCount(force = false) {
    const now = Date.now()
    if (!force && now - lastFetch.value < MIN_GAP_MS) return
    lastFetch.value = now
    try {
      const res = await request<AppNotification[]>('notifications', { query: { per_page: 1 }, handle401: false })
      unread.value = res.meta.unread ?? 0
    } catch {
      /* keep the last known count; the bell must never raise errors */
    }
  }
  function setUnread(n: number) {
    unread.value = Math.max(0, n)
    lastFetch.value = Date.now()
  }

  function startPolling(): () => void {
    if (!import.meta.client) return () => {}
    void refreshCount(true)
    const timer = setInterval(() => { if (document.visibilityState === 'visible') void refreshCount() }, POLL_MS)
    const onFocus = () => { void refreshCount() }
    const onVisible = () => { if (document.visibilityState === 'visible') void refreshCount() }
    window.addEventListener('focus', onFocus)
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      clearInterval(timer)
      window.removeEventListener('focus', onFocus)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }
  return { unread, refreshCount, setUnread, startPolling }
}
