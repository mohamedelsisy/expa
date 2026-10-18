import { eurosToMinor, minorToEuros } from '~/utils/billing'

export const PLAN_LOCALES = ['ar', 'en', 'it'] as const
export type PlanLocale = typeof PLAN_LOCALES[number]
export const PLAN_INTERVALS = ['month', 'year'] as const

export interface AdminPlan {
  key: string
  active: boolean
  sort_order: number
  price: { amount_minor: number, currency: string, interval: string | null }
  features: Record<string, unknown>
  translations: Partial<Record<PlanLocale, { name?: string | null, description?: string | null }>>
  active_subscriptions: number
  stripe_price_id_configured: boolean
}

export interface PlanForm {
  active: boolean
  price: string
  interval: string
  ai_daily_limit: string
  human_credits: string
  reminders_advanced: boolean
  document_ai: boolean
  names: Record<PlanLocale, string>
  descriptions: Record<PlanLocale, string>
}

const s = (v: unknown) => (v === null || v === undefined ? '' : String(v))

/** The free plan is fixed by the API (always active, price 0, no interval change); the UI locks those fields. */
export const isFreePlan = (p: Pick<AdminPlan, 'key'>) => p.key === 'free'

export function planToForm(p: AdminPlan): PlanForm {
  const tr = (l: PlanLocale) => p.translations?.[l] ?? {}
  return {
    active: p.active,
    price: minorToEuros(p.price.amount_minor),
    interval: p.price.interval === 'year' ? 'year' : 'month',
    ai_daily_limit: s(p.features.ai_daily_limit),
    human_credits: s(p.features.human_credits),
    reminders_advanced: p.features.reminders_advanced === true,
    document_ai: p.features.document_ai === true,
    names: { ar: s(tr('ar').name), en: s(tr('en').name), it: s(tr('it').name) },
    descriptions: { ar: s(tr('ar').description), en: s(tr('en').description), it: s(tr('it').description) },
  }
}

/** Client-side checks that mirror the API (the API stays the authority). Values are i18n keys (+ params). */
export type PlanErrors = Record<string, { key: string, params?: Record<string, unknown> }>
export function validatePlanForm(p: AdminPlan, f: PlanForm, maxPriceMinor: number | null): PlanErrors {
  const e: PlanErrors = {}
  if (!isFreePlan(p)) {
    const minor = eurosToMinor(f.price)
    if (minor === null) e.price_minor = { key: 'admin.plans.errors.price' }
    else if (maxPriceMinor !== null && minor > maxPriceMinor) e.price_minor = { key: 'admin.plans.errors.priceMax', params: { max: minorToEuros(maxPriceMinor) } }
    else if (f.active && minor === 0) e.active = { key: 'admin.plans.errors.activeNeedsPrice' }
  }
  for (const k of ['ai_daily_limit', 'human_credits'] as const) {
    if (f[k].trim() !== '' && !/^\d{1,6}$/.test(f[k].trim())) e[`features.${k}`] = { key: 'admin.plans.errors.integer' }
  }
  for (const l of PLAN_LOCALES) {
    const name = f.names[l].trim()
    if (name.length > 80) e[`translations.${l}.name`] = { key: 'admin.plans.errors.nameLength' }
    else if (!name && f.descriptions[l].trim()) e[`translations.${l}.name`] = { key: 'admin.plans.errors.nameRequired' }
  }
  return e
}

/** Only what changed (PATCH merges): null when nothing changed. Price is converted from euros to integer cents. */
export function buildPlanPatch(p: AdminPlan, f: PlanForm): Record<string, unknown> | null {
  const before = planToForm(p)
  const out: Record<string, unknown> = {}
  if (!isFreePlan(p)) {
    if (f.active !== before.active) out.active = f.active
    const minor = eurosToMinor(f.price)
    if (minor !== null && minor !== p.price.amount_minor) { out.price_minor = minor; out.currency = 'EUR' }
    if (f.interval !== before.interval) out.interval = f.interval
  }
  const features: Record<string, unknown> = {}
  for (const k of ['ai_daily_limit', 'human_credits'] as const) {
    if (f[k].trim() !== before[k].trim() && f[k].trim() !== '') features[k] = Number(f[k])
  }
  for (const k of ['reminders_advanced', 'document_ai'] as const) if (f[k] !== before[k]) features[k] = f[k]
  if (Object.keys(features).length) out.features = features
  const translations: Record<string, { name: string, description?: string }> = {}
  for (const l of PLAN_LOCALES) {
    const name = f.names[l].trim()
    const description = f.descriptions[l].trim()
    if (name && (name !== before.names[l].trim() || description !== before.descriptions[l].trim())) translations[l] = { name, ...(description ? { description } : {}) }
  }
  if (Object.keys(translations).length) out.translations = translations
  return Object.keys(out).length ? out : null
}
