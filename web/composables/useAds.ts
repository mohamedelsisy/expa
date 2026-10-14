import { adsAllowedOnPath, adsConfigured, isAdFreePlan, type AdsConfig } from '~/utils/ads'

/**
 * Advertising state shared by the loader plugin and the <AdsSlot> component.
 * `ready` becomes true only on the client, only after the visitor's consent signal allows ads, and only for visitors
 * who are not on an ad-free plan. It is false during SSR, so server and first client render always agree.
 */
export function useAds() {
  const cfg = useRuntimeConfig().public.ads as unknown as AdsConfig & { enabled: boolean | string }
  const config = computed<AdsConfig>(() => ({
    enabled: cfg.enabled === true || String(cfg.enabled) === 'true',
    clientId: String(cfg.clientId ?? ''),
    adFreePlans: String(cfg.adFreePlans ?? ''),
    slots: (cfg.slots ?? {}) as Record<string, string>,
  }))
  const ready = useState('ads-ready', () => false)
  const planKey = useState<string | null>('ads-plan', () => null)
  const configured = computed(() => adsConfigured(config.value))
  const adFree = computed(() => isAdFreePlan(planKey.value, config.value.adFreePlans))
  const slotId = (name: string) => config.value.slots[name] ?? ''
  const canShow = (name: string, path: string) => ready.value && configured.value && !adFree.value && !!slotId(name) && adsAllowedOnPath(path)
  return { config, ready, planKey, configured, adFree, slotId, canShow }
}
