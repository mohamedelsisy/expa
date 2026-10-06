import { ref, computed } from 'vue'
import en from '../../i18n/locales/en.json'

function flatten(o: Record<string, unknown>, prefix = '', out: Record<string, string> = {}): Record<string, string> {
  for (const [k, v] of Object.entries(o)) {
    const key = prefix ? `${prefix}.${k}` : k
    if (v && typeof v === 'object') flatten(v as Record<string, unknown>, key, out)
    else out[key] = String(v)
  }
  return out
}
/** Real English strings as a fallback so admin components render readable text in tests. */
const EN = flatten(en as Record<string, unknown>)

/** Test double for Nuxt's `#imports`: a tiny controllable i18n. */
export const testLocale = ref('ar')
const MSG: Record<string, string> = {
  'common.required': 'Required', 'common.optional': 'Optional',
  'common.showPassword': 'Show password', 'common.hidePassword': 'Hide password',
  'score.aria': '{label}: {value} percent', 'score.notEnoughData': 'Not enough data',
  'freshness.lastVerified': 'Last verified', 'freshness.neverVerified': 'Never verified',
  'freshness.state.fresh': 'Up to date', 'freshness.state.stale': 'May be outdated',
  'freshness.state.outdated': 'Outdated', 'freshness.state.unverified': 'Unverified',
  'freshness.warning.stale': 'stale warning', 'freshness.warning.outdated': 'outdated warning', 'freshness.warning.unverified': 'unverified warning',
  'source.types.official': 'Official', 'source.types.institutional': 'Institutional',
  'source.types.verified_partner': 'Verified partner', 'source.types.third_party': 'Third party',
  'source.title': 'Source', 'source.open': 'Open the source', 'source.unknown': 'Unknown', 'a11y.opensNewTab': 'new tab',
  'nav.language': 'Language',
  'jobs.match.confidence': 'Based on {value}% of criteria', 'jobs.match.label': 'Match',
}
export function useI18n() {
  return {
    locale: testLocale,
    locales: ref([{ code: 'ar', name: 'العربية' }, { code: 'en', name: 'English' }, { code: 'it', name: 'Italiano' }]),
    te: (k: string) => k in MSG || k in EN,
    t: (k: string, p?: Record<string, unknown>) => (MSG[k] ?? EN[k] ?? k).replace(/\{(\w+)\}/g, (_, n) => String(p?.[n] ?? '')),
  }
}
export const useSwitchLocalePath = () => (code: string) => `/${code}/x`
export const useLocalePath = () => (p: string) => `/${testLocale.value}${p === '/' ? '' : p}`
export const useToast = () => ({ items: computed(() => []), dismiss() {} })
export const useHead = (_: unknown) => {}
export const useRoute = () => ({ path: '/ar/x', fullPath: '/ar/x', query: {} })
export const useRuntimeConfig = () => ({ public: { siteUrl: 'https://expa.test' } })
