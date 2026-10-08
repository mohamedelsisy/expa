import { describe, expect, it } from 'vitest'
import { needsFreshnessWarning, netBody, parseGrossAmount, validateNet } from '../utils/netSalary'
import { toOptions, travelQuery, validateTravel } from '../utils/travel'
import { explainBody, explainErrorHint } from '../utils/patenteExplain'
import { mapApiRoute } from '../utils/routes'
import { STATIC_PATHS } from '../server/utils/sitemap'

describe('net salary input', () => {
  it('parses plain, localized and Arabic-Indic amounts', () => {
    expect(parseGrossAmount('30000')).toBe(30000)
    expect(parseGrossAmount('30,000.50')).toBe(30000.5)
    expect(parseGrossAmount('30.000,50')).toBe(30000.5)
    expect(parseGrossAmount('30.000')).toBe(30000)
    expect(parseGrossAmount('٣٠٠٠٠')).toBe(30000)
    expect(parseGrossAmount('abc')).toBeNull()
    expect(parseGrossAmount('-5')).toBeNull()
    expect(parseGrossAmount('')).toBeNull()
  })
  it('validates and builds the request body', () => {
    expect(validateNet({ gross: '', months: '12', taxYear: '' })).toEqual({ gross: 'required' })
    expect(validateNet({ gross: 'x', months: '12', taxYear: '' })).toEqual({ gross: 'invalid' })
    expect(validateNet({ gross: '20000000', months: '12', taxYear: '' })).toEqual({ gross: 'tooLarge' })
    expect(validateNet({ gross: '30000', months: '13', taxYear: '26' })).toEqual({ taxYear: 'year' })
    expect(netBody({ gross: '30.000', months: '13', taxYear: '' })).toEqual({ gross_annual: 30000, months: 13 })
    expect(netBody({ gross: '30000', months: '14', taxYear: '2026' })).toEqual({ gross_annual: 30000, months: 14, tax_year: 2026 })
  })
  it('flags non-fresh sources', () => {
    expect(needsFreshnessWarning('fresh')).toBe(false)
    for (const f of ['stale', 'outdated', 'unverified']) expect(needsFreshnessWarning(f)).toBe(true)
  })
})

describe('travel lookup input', () => {
  it('needs two ISO codes and builds the query', () => {
    expect(validateTravel({ nationality: '', destination: 'FR' })).toEqual({ nationality: 'nationality' })
    expect(validateTravel({ nationality: 'EG', destination: 'fr' })).toEqual({ destination: 'destination' })
    expect(validateTravel({ nationality: 'EG', destination: 'FR' })).toEqual({})
    expect(travelQuery({ nationality: 'EG', destination: 'FR', status: '' })).toEqual({ nationality: 'EG', destination: 'FR' })
    expect(travelQuery({ nationality: 'EG', destination: 'FR', status: 'visa' })).toEqual({ nationality: 'EG', destination: 'FR', residence_status: 'visa' })
  })
  it('sorts API countries by label', () => {
    expect(toOptions([{ code: 'it', name: 'Italy' }, { code: 'EG', name: 'Egypt' }], 'en').map(o => o.value)).toEqual(['EG', 'IT'])
  })
})

describe('Patente Teacher request', () => {
  it('sends the slug under the right key and rejects bad input', () => {
    expect(explainBody('topic', 'segnali', 'Explain')).toEqual({ message: 'Explain', patente_topic: 'segnali' })
    expect(explainBody('question', 'q-1', 'Explain')).toEqual({ message: 'Explain', patente_question: 'q-1' })
    expect(explainBody('topic', 'Bad Slug', 'Explain')).toBeNull()
    expect(explainBody('topic', 'ok', ' ')).toBeNull()
    expect(explainBody('topic', 'ok', 'x'.repeat(400))!.message).toHaveLength(300)
  })
  it('maps quota and network errors to hints', () => {
    expect(explainErrorHint('ai_limit_reached')).toBe('limit')
    expect(explainErrorHint('too_many_requests')).toBe('slow')
    expect(explainErrorHint('timeout')).toBe('network')
    expect(explainErrorHint('other')).toBeNull()
  })
})

describe('routes and sitemap', () => {
  it('maps the new API targets', () => {
    expect(mapApiRoute('recommendations')).toBe('/recommendations')
    expect(mapApiRoute('money/net-salary')).toBe('/money/net-salary')
    expect(mapApiRoute('travel/requirements')).toBe('/travel/requirements')
    expect(mapApiRoute('providers/p-1')).toBe('/services/p-1')
  })
  it('lists the public tools in the sitemap but not the private page', () => {
    expect(STATIC_PATHS).toContain('/money/net-salary')
    expect(STATIC_PATHS).toContain('/travel/requirements')
    expect(STATIC_PATHS as readonly string[]).not.toContain('/recommendations')
  })
})
