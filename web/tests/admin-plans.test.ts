import { describe, expect, it } from 'vitest'
import { ADMIN_AREA_PERMISSIONS } from '../utils/permissions'
import { permsForPath, visibleNav } from '../utils/admin/nav'
import { canAny } from '../utils/permissions'
import { buildPlanPatch, isFreePlan, planToForm, validatePlanForm, type AdminPlan } from '../utils/admin/plans'

const plus: AdminPlan = {
  key: 'plus', active: true, sort_order: 2,
  price: { amount_minor: 599, currency: 'EUR', interval: 'month' },
  features: { ai_daily_limit: 100, reminders_advanced: true, document_ai: false, human_credits: 0 },
  translations: { ar: { name: 'بلس', description: 'المزيد' }, en: { name: 'Plus', description: 'More' } },
  active_subscriptions: 3, stripe_price_id_configured: false,
}
const free: AdminPlan = { ...plus, key: 'free', price: { amount_minor: 0, currency: 'EUR', interval: 'none' } }

describe('admin plan form', () => {
  it('shows the price in euros and keeps translations per locale', () => {
    const f = planToForm(plus)
    expect(f.price).toBe('5.99')
    expect(f.interval).toBe('month')
    expect(f.names).toEqual({ ar: 'بلس', en: 'Plus', it: '' })
    expect(isFreePlan(free)).toBe(true)
  })
  it('produces no patch when nothing changed', () => {
    expect(buildPlanPatch(plus, planToForm(plus))).toBeNull()
  })
  it('converts euros to cents and sends only the changed fields', () => {
    const f = planToForm(plus)
    f.price = '7,50'; f.ai_daily_limit = '200'; f.names.it = 'Plus IT'
    expect(buildPlanPatch(plus, f)).toEqual({ price_minor: 750, currency: 'EUR', features: { ai_daily_limit: 200 }, translations: { it: { name: 'Plus IT' } } })
  })
  it('never sends price, active or interval for the free plan', () => {
    const f = planToForm(free)
    f.price = '3'; f.active = false; f.interval = 'year'; f.document_ai = true
    expect(buildPlanPatch(free, f)).toEqual({ features: { document_ai: true } })
  })
  it('validates like the API', () => {
    const f = planToForm(plus)
    f.price = 'abc'
    expect(validatePlanForm(plus, f, 100000).price_minor?.key).toBe('admin.plans.errors.price')
    f.price = '1000.01'
    expect(validatePlanForm(plus, f, 100000).price_minor?.key).toBe('admin.plans.errors.priceMax')
    f.price = '0'
    expect(validatePlanForm(plus, f, 100000).active?.key).toBe('admin.plans.errors.activeNeedsPrice')
    f.active = false
    expect(validatePlanForm(plus, f, 100000)).toEqual({})
    f.ai_daily_limit = '-1'; f.descriptions.it = 'only description'
    const e = validatePlanForm(plus, f, 100000)
    expect(e['features.ai_daily_limit']).toBeTruthy()
    expect(e['translations.it.name']?.key).toBe('admin.plans.errors.nameRequired')
    expect(validatePlanForm(free, planToForm(free), 100000)).toEqual({})
  })
})

describe('admin plans navigation', () => {
  it('is gated by plans.view', () => {
    const nav = (perms: string[]) => visibleNav(p => canAny({ roles: ['x'], permissions: perms }, p)).flatMap(g => g.items.map(i => i.key))
    expect(nav(['plans.view'])).toContain('plans')
    expect(nav(['subscriptions.view'])).not.toContain('plans')
    expect(permsForPath('/en/admin/plans')).toEqual(['plans.view'])
    expect(ADMIN_AREA_PERMISSIONS).toContain('plans.view')
  })
})
