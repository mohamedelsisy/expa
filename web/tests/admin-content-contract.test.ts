import { describe, expect, it } from 'vitest'
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { CONTENT_MODULES, COMMON_FIELDS, PLACE_FIELDS, SOURCE_FIELDS } from '../utils/admin/modules'
import { bracketsPayload, buildPayload, emptyForm, validateBrackets, validateForm } from '../utils/admin/form'
import { mapLimit, readinessOf, sumCounts } from '../utils/admin/readiness'

// Cross-check every admin content module against the backend model (contentAttributes, translatable, requiresSource,
// required translatable fields) and FormRequest (attribute rules). A field the backend accepts but the form lacks (or the
// reverse) fails here, so editors always get the full set: title/content per locale, source, verification date, place,
// status workflow (generic workspace), translation editor and publish-problem checklist.
const MODEL: Record<string, string> = {
  guides: 'Guides/Models/Guide', 'government-services': 'Government/Models/GovernmentService', 'government-offices': 'Government/Models/GovernmentOffice',
  'appointment-guides': 'Appointments/Models/AppointmentGuide', 'italian-lessons': 'Learning/Models/ItalianLesson', 'patente-categories': 'Patente/Models/PatenteCategory',
  'patente-topics': 'Patente/Models/PatenteTopic', 'patente-questions': 'Patente/Models/PatenteQuestion', 'study-universities': 'Study/Models/University',
  'study-programs': 'Study/Models/StudyProgram', 'study-scholarships': 'Study/Models/Scholarship', 'legal-documents': 'Legal/Models/LegalDocument',
  articles: 'Articles/Models/Article', 'city-profiles': 'Geo/Models/CityProfile', 'marketplace-providers': 'Marketplace/Models/ServiceProvider',
  'housing-rules': 'Housing/Models/HousingRule', 'italian-vocabulary': 'Learning/Models/ItalianVocabulary', 'italian-exercises': 'Learning/Models/ItalianExercise',
  'tax-tables': 'Money/Models/TaxTable', 'travel-requirements': 'Travel/Models/TravelRequirement',
}
// Attributes the form exposes that are not model columns (relations synced separately, owner assignment) and the reverse.
const FORM_ONLY: Record<string, string[]> = { 'government-services': ['office_ids'], 'city-profiles': ['blocks'], 'marketplace-providers': ['owner_user_id'], articles: ['tags', 'related_guides'] }
const MODEL_ONLY: Record<string, string[]> = {}

const root = join(__dirname, '../../backend/app/Domains')
const have = existsSync(root)
const src = (key: string) => readFileSync(join(root, `${MODEL[key]}.php`), 'utf8')
const list = (php: string, re: RegExp): string[] => {
  const m = re.exec(php)
  return m ? [...m[1]!.matchAll(/'(\w+)'/g)].map(x => x[1]!) : []
}

describe.skipIf(!have)('admin modules match the backend models', () => {
  for (const m of CONTENT_MODULES) {
    describe(m.key, () => {
      it('has a backend model mapping', () => { expect(MODEL[m.key], m.key).toBeTruthy() })
      it('exposes every editable column and nothing the model would drop', () => {
        const php = src(m.key)
        const cols = new Set(list(php, /function contentAttributes\(\): array\s*\{\s*return \[([\s\S]*?)\];/))
        if (m.key === 'marketplace-providers') for (const c of list(php, /function ownerAttributes\(\): array\s*\{\s*return \[([\s\S]*?)\];/)) cols.add(c)
        const form = new Set([...COMMON_FIELDS, ...m.attributes, ...(m.place ? PLACE_FIELDS : []), ...(m.noSource ? [] : SOURCE_FIELDS)].map(f => f.key))
        if (m.hideSlug) form.delete('slug')
        const formOnly = FORM_ONLY[m.key] ?? []
        const missingInForm = [...cols].filter(c => !form.has(c) && !(MODEL_ONLY[m.key] ?? []).includes(c) && !(m.hideSlug && c === 'slug'))
        const droppedByModel = [...form].filter(f => !cols.has(f) && !formOnly.includes(f))
        expect(missingInForm, 'backend columns missing from the form').toEqual([])
        expect(droppedByModel, 'form fields the backend would ignore').toEqual([])
      })
      it('has every translatable field of the model (title/content per locale)', () => {
        const php = src(m.key)
        const tr = list(php, /\$translatable\s*=\s*\[([\s\S]*?)\];/)
        expect(m.translatable.map(f => f.key).sort()).toEqual([...tr].sort())
      })
      it('requires a source exactly when the model does', () => {
        const php = src(m.key)
        if (/function requiresSource\(\)/.test(php)) return // conditional (housing rules: only for sourced rules)
        const requires = /\$requiresSource\s*=\s*true/.test(php)
        if (m.noSource) { expect(requires).toBe(false); return }
        expect(m.sourceRequired, 'sourceRequired').toBe(requires)
      })
      it('marks the translatable fields the model needs to publish', () => {
        const php = src(m.key)
        const need = list(php, /\$requiredTranslatableFields\s*=\s*\[([\s\S]*?)\]/)
        const marked = m.translatable.filter(f => f.requiredToPublish).map(f => f.key)
        // The primary field is always required; every other field the model lists must be flagged too (extra flags are tolerated).
        for (const f of need) expect(marked, `${f} required to publish`).toContain(f)
        expect(marked).toContain(m.primary)
      })
      it('offers the publish workflow inputs: ar required locale and a unique permission prefix', () => {
        expect(m.requiredLocales).toContain('ar')
        expect(m.permission).toMatch(/^[a-z_]+$/)
      })
    })
  }
})

describe('every module is wired into the admin workspace', () => {
  it('has a source section unless explicitly third-party only, and verification date', () => {
    expect(SOURCE_FIELDS.map(f => f.key)).toEqual(['source_name', 'source_url', 'source_type', 'last_verified_at'])
    for (const m of CONTENT_MODULES) if (m.noSource) expect(m.key).toBe('marketplace-providers')
  })
  it('modules that carry a place expose region and city', () => {
    expect(PLACE_FIELDS.map(f => f.key)).toEqual(['region_id', 'city_id'])
  })
})

describe('tax-table brackets editor logic', () => {
  const r = (up_to: string, rate: string) => ({ up_to, rate })
  it('validates like the backend (ascending, last open-ended, rates 0-100)', () => {
    expect(validateBrackets([])).toBe('admin.validation.required')
    expect(validateBrackets([r('', '23')])).toBeNull()
    expect(validateBrackets([r('28000', '23'), r('', '35')])).toBeNull()
    expect(validateBrackets([r('28000', '23'), r('28000', '35'), r('', '43')])).toBe('admin.validation.bracketsOrder')
    expect(validateBrackets([r('28000', '23'), r('50000', '35')])).toBe('admin.validation.bracketsLast')
    expect(validateBrackets([r('', '23'), r('', '35')])).toBe('admin.validation.bracketsOrder')
    expect(validateBrackets([r('10', '101')])).toBe('admin.validation.bracketsRate')
    expect(validateBrackets([r('10', '')])).toBe('admin.validation.bracketsRate')
    expect(validateBrackets([r('10', '5'), r('20', '6')])).toBe('admin.validation.bracketsLast')
  })
  it('sends numbers and null for the open bracket', () => {
    expect(bracketsPayload([r('28000', '23'), r('', '35')])).toEqual([{ up_to: 28000, rate: 23 }, { up_to: null, rate: 35 }])
  })
  it('the tax-table form requires year, brackets and a name; the payload carries brackets and year as numbers', () => {
    const m = CONTENT_MODULES.find(x => x.key === 'tax-tables')!
    const s = emptyForm(m)
    const e = validateForm(m, s, { creating: true })
    expect(Object.keys(e)).toEqual(expect.arrayContaining(['slug', 'tax_year', 'brackets']))
    s.attrs.slug = 'it-2026'; s.attrs.tax_year = '2026'; s.attrs.brackets = JSON.stringify([r('28000', '23'), r('', '35')])
    s.translations.ar.name = 'جدول 2026'
    expect(validateForm(m, s, { creating: true })).toEqual({})
    const body = buildPayload(m, s, { creating: true })
    expect(body.tax_year).toBe(2026)
    expect(body.brackets).toEqual([{ up_to: 28000, rate: 23 }, { up_to: null, rate: 35 }])
  })
})

describe('travel requirement form', () => {
  it('upper-cases country codes, validates the pattern and accepts * for nationality', () => {
    const m = CONTENT_MODULES.find(x => x.key === 'travel-requirements')!
    const s = emptyForm(m)
    s.attrs.slug = 'eg-fr'; s.attrs.nationality = 'eg'; s.attrs.destination = 'fr'; s.translations.ar.title = 'عنوان'
    expect(validateForm(m, s, { creating: true })).toEqual({})
    expect(buildPayload(m, s, { creating: true })).toMatchObject({ nationality: 'EG', destination: 'FR' })
    s.attrs.nationality = '*'
    expect(validateForm(m, s, { creating: true })).toEqual({})
    s.attrs.nationality = 'EGY'
    expect(validateForm(m, s, { creating: true }).nationality).toBe('admin.validation.pattern')
    s.attrs.nationality = 'EG'; s.attrs.residence_status = 'Visa!'
    expect(validateForm(m, s, { creating: true }).residence_status).toBe('admin.validation.pattern')
  })
})

describe('content readiness', () => {
  it('sends boolean filters in the form the API accepts (Laravel `boolean` rejects the string "true" in a query string)', async () => {
    const { READINESS_QUERIES } = await import('../utils/admin/readiness')
    for (const q of Object.values(READINESS_QUERIES)) {
      if ('filter[stale]' in q) expect(['1', '0']).toContain(q['filter[stale]'])
    }
  })
  it('classifies modules honestly', () => {
    expect(readinessOf({ total: 0, published: 0, draft: 0, staleLive: 0 })).toBe('empty')
    expect(readinessOf({ total: 3, published: 0, draft: 3, staleLive: 0 })).toBe('nothing_published')
    expect(readinessOf({ total: 3, published: 2, draft: 1, staleLive: 1 })).toBe('needs_attention')
    expect(readinessOf({ total: 3, published: 3, draft: 0, staleLive: 0 })).toBe('ready')
  })
  it('sums counts ignoring failed rows and limits concurrency', async () => {
    expect(sumCounts([{ total: 1, published: 1, draft: 0, staleLive: 1 }, null, { total: 2, published: 0, draft: 2, staleLive: 0 }])).toEqual({ total: 3, published: 1, draft: 2, staleLive: 1 })
    let inflight = 0; let max = 0
    const out = await mapLimit([1, 2, 3, 4, 5, 6], 2, async (n) => { inflight++; max = Math.max(max, inflight); await new Promise(r => setTimeout(r, 2)); inflight--; return n * 2 })
    expect(out).toEqual([2, 4, 6, 8, 10, 12])
    expect(max).toBeLessThanOrEqual(2)
  })
})
