import type { CommunityMeta } from '~/types/extra'

/**
 * Community is behind a backend feature flag: while off, every route answers 404. The navigation therefore only
 * shows community entries after `GET /community/meta` succeeded. Any failure (404, outage) hides them.
 */
export function useCommunityMeta() {
  const { request } = useApi()
  const state = useState<{ checked: boolean, meta: CommunityMeta | null }>('community-meta', () => ({ checked: false, meta: null }))
  async function load(force = false) {
    if (state.value.checked && !force) return state.value.meta
    try {
      const res = await request<CommunityMeta>('community/meta', { handle401: false })
      state.value = { checked: true, meta: res.data }
    } catch (e) {
      // 404 = feature off (stable answer); other errors may be transient, so they are not cached.
      state.value = { checked: isApiError(e) && e.status === 404, meta: null }
    }
    return state.value.meta
  }
  return { meta: computed(() => state.value.meta), enabled: computed(() => state.value.meta !== null), load }
}
