import type { ConsentsPayload } from '~/types/api'

/** Reads whether an optional consent purpose is granted (null = unknown, e.g. request failed). */
export function useConsent(purpose: string) {
  const { request } = useApi()
  const granted = ref<boolean | null>(null)
  async function load() {
    try {
      const res = await request<ConsentsPayload>('profile/consents', { handle401: false })
      granted.value = !!res.data.consents[purpose]?.granted
    } catch {
      granted.value = null
    }
  }
  return { granted, load }
}
