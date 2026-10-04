import { ref, computed } from 'vue'

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
}
export function useI18n() {
  return {
    locale: testLocale,
    locales: ref([{ code: 'ar', name: 'العربية' }, { code: 'en', name: 'English' }, { code: 'it', name: 'Italiano' }]),
    t: (k: string, p?: Record<string, unknown>) => (MSG[k] ?? k).replace(/\{(\w+)\}/g, (_, n) => String(p?.[n] ?? '')),
  }
}
export const useSwitchLocalePath = () => (code: string) => `/${code}/x`
export const useLocalePath = () => (p: string) => `/${testLocale.value}${p === '/' ? '' : p}`
export const useToast = () => ({ items: computed(() => []), dismiss() {} })
