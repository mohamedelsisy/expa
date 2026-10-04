import type { LocaleCode } from '~/types/api'

export const LOCALES: readonly LocaleCode[] = ['ar', 'en', 'it'] as const
export const DEFAULT_LOCALE: LocaleCode = 'ar'
const RTL: ReadonlySet<string> = new Set(['ar'])

export function isLocale(v: unknown): v is LocaleCode {
  return typeof v === 'string' && (LOCALES as readonly string[]).includes(v)
}
/** Text direction for a locale code (rtl for ar, ltr for en/it). */
export function localeDir(locale: string): 'rtl' | 'ltr' {
  return RTL.has(locale) ? 'rtl' : 'ltr'
}
/** Western digits by default, also for Arabic (product decision, see DESIGN_SYSTEM.md). */
export function intlLocale(locale: string): string {
  return locale === 'ar' ? 'ar-u-nu-latn' : locale
}
export function formatDate(iso: string | null | undefined, locale: string): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return new Intl.DateTimeFormat(intlLocale(locale), { dateStyle: 'long', timeZone: 'UTC' }).format(d)
}
