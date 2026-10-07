import type { PortalProfile } from '~/types/extra'

/** The provider's own listing (`GET /provider/profile`). 403 `provider_account_required` means "no listing yet". */
export function useProviderPortal() {
  const { request } = useApi()
  const state = useState<'idle' | 'loading' | 'ready' | 'none' | 'error'>('provider-state', () => 'idle')
  const profile = useState<PortalProfile | null>('provider-profile', () => null)
  const error = ref<string | null>(null)
  async function load() {
    state.value = 'loading'
    error.value = null
    try {
      profile.value = (await request<PortalProfile>('provider/profile')).data
      state.value = 'ready'
    } catch (e) {
      profile.value = null
      if (isApiError(e) && (e.code === 'provider_account_required' || (e.status === 403 && e.code === 'forbidden') || e.status === 404)) state.value = 'none'
      else { state.value = 'error'; error.value = isApiError(e) ? e.message : null }
    }
  }
  return { state, profile, error, load, set: (p: PortalProfile | null) => { profile.value = p; state.value = p ? 'ready' : 'none' } }
}
