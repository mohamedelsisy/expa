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
/**
 * Attributes for content the API served in another language than the UI (`fallback: true`): a screen reader must switch
 * voice and the text must follow its own direction. Empty when the content already matches the page language.
 */
export function contentLang(item: { fallback?: boolean, locale?: string } | null | undefined): { lang?: string, dir?: 'rtl' | 'ltr' } {
  return item?.fallback && item.locale ? { lang: item.locale, dir: localeDir(item.locale) } : {}
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
export function formatDateTime(iso: string | null | undefined, locale: string): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return new Intl.DateTimeFormat(intlLocale(locale), { dateStyle: 'medium', timeStyle: 'short' }).format(d)
}
/** Plain calendar day (`YYYY-MM-DD` from the API) without timezone shifts. */
export function formatDay(day: string | null | undefined, locale: string): string {
  return formatDate(day ? `${day.slice(0, 10)}T00:00:00Z` : null, locale)
}
export function formatNumber(n: number, locale: string, opts?: Intl.NumberFormatOptions): string {
  return new Intl.NumberFormat(intlLocale(locale), opts).format(n)
}
