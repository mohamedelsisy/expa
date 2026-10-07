import { ANALYTICS_COOKIE, cleanSubject, createDeduper, mayReport, type AnalyticsConsent, type ClientEvent } from '~/utils/analytics'

const once = createDeduper()

/** Consent cookie (first-party, `granted`/`denied`) shared by the banner, the BFF (header) and this reporter. */
export function useAnalyticsConsent() {
  return useCookie<AnalyticsConsent>(ANALYTICS_COOKIE, { maxAge: 60 * 60 * 24 * 365, sameSite: 'lax', path: '/', default: () => null })
}

/** Fire-and-forget client event. Never throws, never blocks navigation. */
export function useAnalytics() {
  const auth = useAuthStore()
  const consent = useAnalyticsConsent()
  const { request } = useApi()
  async function track(name: ClientEvent, subject?: string | null) {
    if (!mayReport(auth.isAuthenticated, consent.value)) return
    const s = cleanSubject(subject)
    if (!once(`${name}:${s ?? ''}`)) return
    try {
      await request(`analytics/events`, { method: 'POST', body: { name, ...(s ? { subject: s } : {}) }, handle401: false, timeoutMs: 4000 })
    } catch { /* analytics must never affect the page */ }
  }
  return { track }
}
