import { describe, expect, it, vi } from 'vitest'
import { checkoutErrorKey, eurosToMinor, formatMinor, formatPlanPrice, minorToEuros, pollPlanChange } from '../utils/billing'

describe('money helpers', () => {
  it('converts typed euros to integer cents without float error', () => {
    expect(eurosToMinor('5.99')).toBe(599)
    expect(eurosToMinor('5,99')).toBe(599)
    expect(eurosToMinor('0.29')).toBe(29)
    expect(eurosToMinor('14')).toBe(1400)
    expect(eurosToMinor('0')).toBe(0)
    expect(eurosToMinor(' 7.5 ')).toBe(750)
    expect(eurosToMinor('٥٫٩٩')).toBe(599)
  })
  it('rejects invalid amounts', () => {
    for (const bad of ['', '-1', 'abc', '5.999', '1e3', '5.', '.5', '1 000', '12345678']) expect(eurosToMinor(bad), bad).toBeNull()
  })
  it('round-trips cents to the editable text', () => {
    expect(minorToEuros(599)).toBe('5.99')
    expect(minorToEuros(0)).toBe('0.00')
    expect(minorToEuros(1405)).toBe('14.05')
    for (const c of [0, 1, 9, 10, 599, 100000]) expect(eurosToMinor(minorToEuros(c))).toBe(c)
  })
  it('formats cents with Intl in each locale', () => {
    expect(formatMinor(599, 'EUR', 'en')).toContain('5.99')
    expect(formatMinor(599, 'EUR', 'it')).toContain('5,99')
    expect(formatMinor(599, 'EUR', 'en')).toContain('€')
    expect(formatMinor(1000, 'EUR', 'en')).toBe('€10')
    expect(formatMinor(750, 'EUR', 'en')).toBe('€7.50')
  })
  it('labels plan prices and the free plan', () => {
    const labels = { free: 'Free', interval: (i: string) => i }
    expect(formatPlanPrice({ amount_minor: 0, currency: 'EUR', interval: 'none' }, 'en', labels)).toBe('Free')
    expect(formatPlanPrice({ amount_minor: 599, currency: 'EUR', interval: 'month' }, 'en', labels)).toBe('€5.99 / month')
    expect(formatPlanPrice({ amount_minor: 599, currency: 'EUR', interval: null }, 'en', labels)).toBe('€5.99')
  })
})

describe('checkoutErrorKey', () => {
  it('maps documented API errors to our own messages', () => {
    expect(checkoutErrorKey({ status: 503, code: 'billing_unavailable' })).toBe('pricing.errors.unavailable')
    expect(checkoutErrorKey({ status: 429 })).toBe('pricing.errors.tooMany')
    expect(checkoutErrorKey({ status: 422, code: 'plan_not_purchasable' })).toBe('pricing.errors.notPurchasable')
    expect(checkoutErrorKey({ status: 409, code: 'already_subscribed' })).toBe('pricing.errors.alreadySubscribed')
    expect(checkoutErrorKey({ status: 500 })).toBe('errors.generic')
    expect(checkoutErrorKey(null)).toBe('errors.generic')
  })
})

describe('pollPlanChange', () => {
  const sleep = () => Promise.resolve()
  it('stops as soon as the plan changes', async () => {
    const keys = ['free', 'free', 'plus']
    const fetchKey = vi.fn(async () => keys.shift() ?? 'plus')
    expect(await pollPlanChange({ fetchKey, initialKey: 'free', sleep })).toBe('changed')
    expect(fetchKey).toHaveBeenCalledTimes(3)
  })
  it('gives up after the limited number of tries', async () => {
    const fetchKey = vi.fn(async () => 'free')
    expect(await pollPlanChange({ fetchKey, initialKey: 'free', sleep })).toBe('timeout')
    expect(fetchKey).toHaveBeenCalledTimes(10)
  })
  it('survives failed polls and counts them as tries', async () => {
    const fetchKey = vi.fn(async () => { throw new Error('network') })
    expect(await pollPlanChange({ fetchKey, initialKey: 'free', sleep, tries: 3 })).toBe('timeout')
    expect(fetchKey).toHaveBeenCalledTimes(3)
  })
  it('waits between tries and honours stop (page left)', async () => {
    const waits: number[] = []
    let stop = false
    const r = await pollPlanChange({ fetchKey: async () => 'free', initialKey: 'free', sleep: async (ms) => { waits.push(ms); if (waits.length === 2) stop = true }, stopped: () => stop })
    expect(r).toBe('stopped')
    expect(waits).toEqual([3000, 3000])
  })
})
