import { adsenseSrc, fundingChoicesSrc, tcfAllowsAds, type TcData } from '~/utils/ads'

type TcfApi = (cmd: string, version: number, cb: (data: TcData, ok: boolean) => void, param?: unknown) => void

const CMP_WAIT_MS = 10_000

function addScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) return resolve()
    const s = document.createElement('script')
    s.async = true
    s.src = src
    s.crossOrigin = 'anonymous'
    s.onload = () => resolve()
    s.onerror = () => reject(new Error(`failed to load ${src}`))
    document.head.appendChild(s)
  })
}

/** Resolves true when the consent platform (TCF API) reports a decision that allows ads; false on timeout. */
function waitForConsent(): Promise<boolean> {
  return new Promise((resolve) => {
    const started = Date.now()
    const attach = () => {
      const api = (window as unknown as { __tcfapi?: TcfApi }).__tcfapi
      if (!api) {
        if (Date.now() - started > CMP_WAIT_MS) return resolve(false)
        return void setTimeout(attach, 200)
      }
      api('addEventListener', 2, (data, ok) => {
        if (ok && tcfAllowsAds(data)) resolve(true)
      })
      setTimeout(() => resolve(false), CMP_WAIT_MS * 6) // never wait forever for a user who ignores the message
    }
    attach()
  })
}

/**
 * Loads Google's consent message (Funding Choices) and, only after the visitor's TCF decision allows it, the AdSense
 * script. Nothing is requested from an ad domain before that. Paid-plan users and unknown plans get no ad script.
 */
export default defineNuxtPlugin((nuxtApp) => {
  const { config, configured, ready, planKey, adFree } = useAds()
  if (!configured.value) return

  nuxtApp.hook('app:mounted', async () => {
    // Composables need the Nuxt context, which an async hook does not guarantee: resolve them before any await.
    const auth = nuxtApp.runWithContext(() => useAuthStore()) as ReturnType<typeof useAuthStore>
    const api = nuxtApp.runWithContext(() => useApi()) as ReturnType<typeof useApi>
    // Signed-in visitors: learn the plan first; failing to learn it means no ads (never ads for a paying customer).
    if (auth.isAuthenticated) {
      try {
        const res = await api.request<{ plan: { key: string } }>('billing/subscription', { handle401: false })
        planKey.value = res.data.plan?.key ?? 'free'
      } catch {
        return
      }
    }
    if (adFree.value) return

    try {
      await addScript(fundingChoicesSrc(config.value.clientId))
      if (!(await waitForConsent())) return
      await addScript(adsenseSrc(config.value.clientId))
      ready.value = true
    } catch {
      // Ad or consent script blocked (ad blocker, network): the page simply has no ads.
    }
  })
})
