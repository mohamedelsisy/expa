import { formatMoney } from '~/utils/money'
import { intlLocale } from '~/utils/locale'

export interface PlanPrice { amount_minor: number, currency: string, interval: string | null }

export const POLL_TRIES = 10
export const POLL_DELAY_MS = 3000

/** Euro cents (integer, as the API sends them) -> localized currency text. Amounts always come from the API, never from code. */
export function formatMinor(minor: number, currency: string, locale: string): string {
  const code = currency.toUpperCase()
  // Prices keep both decimals when there are cents ("€7.50", never "€7.5"); whole amounts stay "€6".
  const digits = minor % 100 === 0 ? 0 : 2
  try {
    if (/^[A-Z]{3}$/.test(code)) return new Intl.NumberFormat(intlLocale(locale), { style: 'currency', currency: code, minimumFractionDigits: digits, maximumFractionDigits: 2 }).format(minor / 100)
  } catch { /* unknown code */ }
  return formatMoney(minor / 100, currency, locale, 2)
}

/** "€5.99 / month", or the translated "Free" label for a zero price. */
export function formatPlanPrice(price: PlanPrice, locale: string, labels: { free: string, interval: (i: string) => string }): string {
  if (!price.amount_minor) return labels.free
  const amount = formatMinor(price.amount_minor, price.currency, locale)
  return price.interval && price.interval !== 'none' ? `${amount} / ${labels.interval(price.interval)}` : amount
}

const ARABIC_DIGITS = '٠١٢٣٤٥٦٧٨٩'
/**
 * Euros typed by an admin ("5.99", "5,99", Arabic-Indic digits allowed) -> integer cents, or null when it is not a valid
 * non-negative amount with at most 2 decimals. Integer string arithmetic, so 0.29 never becomes 28 cents.
 */
export function eurosToMinor(input: string): number | null {
  const s = input.trim()
    .replace(/[٠-٩]/g, d => String(ARABIC_DIGITS.indexOf(d)))
    .replace(/[٫,]/g, '.')
  const m = /^(\d{1,7})(?:\.(\d{1,2}))?$/.exec(s)
  if (!m) return null
  return Number(m[1]) * 100 + Number((m[2] ?? '').padEnd(2, '0') || '0')
}

/** Integer cents -> the editable euro text ("599" -> "5.99", "0" -> "0.00"). */
export function minorToEuros(minor: number): string {
  const whole = Math.trunc(minor / 100)
  const cents = String(Math.abs(minor % 100)).padStart(2, '0')
  return `${whole}.${cents}`
}

interface ErrLike { status?: number, code?: string }
/** i18n key for a failed checkout call (every message is ours; server text is never shown). */
export function checkoutErrorKey(e: ErrLike | null | undefined): string {
  if (e?.status === 503) return 'pricing.errors.unavailable'
  if (e?.status === 429) return 'pricing.errors.tooMany'
  if (e?.status === 409 && e.code === 'already_subscribed') return 'pricing.errors.alreadySubscribed'
  if (e?.status === 422 && e.code === 'plan_not_purchasable') return 'pricing.errors.notPurchasable'
  return 'errors.generic'
}

export type PollResult = 'changed' | 'timeout' | 'stopped'
/**
 * After a successful checkout redirect the plan is only changed by a verified webhook. Poll the subscription (limited)
 * until the plan key differs from the one we started with. A failed poll counts as a try and never throws.
 */
export async function pollPlanChange(o: {
  fetchKey: () => Promise<string | null>
  initialKey: string
  tries?: number
  delayMs?: number
  sleep?: (ms: number) => Promise<void>
  stopped?: () => boolean
}): Promise<PollResult> {
  const tries = o.tries ?? POLL_TRIES
  const delay = o.delayMs ?? POLL_DELAY_MS
  const sleep = o.sleep ?? ((ms: number) => new Promise<void>(r => setTimeout(r, ms)))
  for (let i = 0; i < tries; i++) {
    await sleep(delay)
    if (o.stopped?.()) return 'stopped'
    let key: string | null = null
    try { key = await o.fetchKey() } catch { key = null }
    if (o.stopped?.()) return 'stopped'
    if (key && key !== o.initialKey) return 'changed'
  }
  return 'timeout'
}
