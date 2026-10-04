import { describe, expect, it } from 'vitest'
import ar from '../i18n/locales/ar.json'
import en from '../i18n/locales/en.json'
import it_ from '../i18n/locales/it.json'

function flat(o: Record<string, unknown>, prefix = ''): Record<string, unknown> {
  return Object.entries(o).reduce<Record<string, unknown>>((acc, [k, v]) => {
    const key = prefix ? `${prefix}.${k}` : k
    if (v && typeof v === 'object') Object.assign(acc, flat(v as Record<string, unknown>, key))
    else acc[key] = v
    return acc
  }, {})
}
const files = { ar: flat(ar), en: flat(en), it: flat(it_) }

describe('i18n message files', () => {
  it('have identical key sets', () => {
    const base = Object.keys(files.en).sort()
    expect(Object.keys(files.ar).sort()).toEqual(base)
    expect(Object.keys(files.it).sort()).toEqual(base)
  })
  for (const [loc, f] of Object.entries(files)) {
    it(`${loc} has no empty values`, () => {
      const empty = Object.entries(f).filter(([, v]) => typeof v !== 'string' || v.trim() === '').map(([k]) => k)
      expect(empty).toEqual([])
    })
  }
  it('keeps placeholders identical across locales', () => {
    const ph = (s: unknown) => (String(s).match(/\{\w+\}/g) ?? []).sort().join()
    for (const k of Object.keys(files.en)) {
      expect(ph(files.ar[k]), k).toBe(ph(files.en[k]))
      expect(ph(files.it[k]), k).toBe(ph(files.en[k]))
    }
  })
})
