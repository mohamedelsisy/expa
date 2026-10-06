import { intlLocale } from '~/utils/locale'

const PERIODS = ['year', 'month', 'week', 'day', 'hour'] as const
const ISO = /^[A-Z]{3}$/

/** Currency amount with `Intl` (locale-correct separators and symbol placement). Falls back to the plain number + code. */
export function formatMoney(amount: number, currency: string | null | undefined, locale: string, maxFraction = 0): string {
  const code = (currency ?? '').toUpperCase()
  try {
    if (ISO.test(code)) return new Intl.NumberFormat(intlLocale(locale), { style: 'currency', currency: code, maximumFractionDigits: maxFraction, minimumFractionDigits: 0 }).format(amount)
  } catch { /* unknown code */ }
  return `${new Intl.NumberFormat(intlLocale(locale), { maximumFractionDigits: maxFraction }).format(amount)}${code ? ` ${code}` : ''}`
}

export interface Salary { min: number | null, max: number | null, currency: string | null, period: string | null }

/**
 * "€30,000–€40,000 / year" with a translated period. Render inside `<bdi>` so the digits and symbol stay isolated in
 * right-to-left text without forcing the whole block to LTR.
 */
export function formatSalary(s: Salary | null | undefined, locale: string, periodLabel: (p: string) => string): string | null {
  if (!s || (s.min == null && s.max == null)) return null
  const f = (n: number) => formatMoney(n, s.currency, locale)
  const range = s.min != null && s.max != null && s.min !== s.max ? `${f(s.min)}–${f(s.max)}` : f((s.min ?? s.max) as number)
  const period = s.period && (PERIODS as readonly string[]).includes(s.period) ? ` / ${periodLabel(s.period)}` : ''
  return `${range}${period}`
}
