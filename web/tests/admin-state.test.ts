import { describe, expect, it } from 'vitest'
import { nextSort, parseListQuery, sortDirection, toApiQuery, toRouteQuery, withFilter, withPage, withSort, type ListConfig } from '../utils/admin/listState'
import { formatChanges, isSensitiveKey } from '../utils/admin/changes'
import { buildPayload, emptyForm, fromItem, translationErrors, validateForm } from '../utils/admin/form'
import { moduleByKey } from '../utils/admin/modules'

const cfg: ListConfig = { filterKeys: ['q', 'status', 'stale'], defaultSort: '-updated_at', sortable: ['slug', 'status', 'updated_at'], defaultPerPage: 20 }

describe('URL-synced list state', () => {
  it('parses defaults and ignores junk', () => {
    expect(parseListQuery({}, cfg)).toEqual({ page: 1, sort: '-updated_at', filters: {} })
    expect(parseListQuery({ page: 'x', sort: 'password', q: '  ', foo: 'bar' }, cfg)).toEqual({ page: 1, sort: '-updated_at', filters: {} })
    expect(parseListQuery({ page: '3', sort: 'slug', q: ' visa ', status: ['draft', 'x'] }, cfg)).toEqual({ page: 3, sort: 'slug', filters: { q: 'visa', status: 'draft' } })
  })
  it('round-trips through the URL query without defaults', () => {
    const s = parseListQuery({ page: '2', sort: '-slug', status: 'review' }, cfg)
    expect(toRouteQuery(s, cfg)).toEqual({ status: 'review', sort: '-slug', page: '2' })
    expect(toRouteQuery({ page: 1, sort: '-updated_at', filters: {} }, cfg)).toEqual({})
  })
  it('maps to the API query with filter[...] keys', () => {
    expect(toApiQuery({ page: 2, sort: 'slug', filters: { q: 'a', stale: '1' } }, cfg)).toEqual({ page: 2, sort: 'slug', per_page: 20, 'filter[q]': 'a', 'filter[stale]': '1' })
  })
  it('changing a filter or sort resets to page 1; page never drops below 1', () => {
    const s = { page: 4, sort: 'slug', filters: { q: 'a' } }
    expect(withFilter(s, 'status', 'draft')).toEqual({ page: 1, sort: 'slug', filters: { q: 'a', status: 'draft' } })
    expect(withFilter(s, 'q', '')).toEqual({ page: 1, sort: 'slug', filters: {} })
    expect(withSort(s, 'slug').sort).toBe('-slug')
    expect(withSort(s, 'status')).toMatchObject({ sort: 'status', page: 1 })
    expect(withPage(s, 0).page).toBe(1)
  })
  it('sort toggling and aria-sort', () => {
    expect(nextSort('slug', 'slug')).toBe('-slug')
    expect(nextSort('-slug', 'slug')).toBe('slug')
    expect(sortDirection('slug', 'slug')).toBe('ascending')
    expect(sortDirection('-slug', 'slug')).toBe('descending')
    expect(sortDirection('slug', 'status')).toBe('none')
  })
})

describe('audit changes rendering', () => {
  it('renders old -> new diffs and flat values', () => {
    expect(formatChanges({ status: { old: 'draft', new: 'review' }, plan: 'plus', days: 30, active: true })).toEqual([
      { key: 'status', mode: 'diff', old: { type: 'text', text: 'draft' }, new: { type: 'text', text: 'review' } },
      { key: 'plan', mode: 'value', new: { type: 'text', text: 'plus' } },
      { key: 'days', mode: 'value', new: { type: 'text', text: '30' } },
      { key: 'active', mode: 'value', new: { type: 'bool', value: true } },
    ])
    expect(formatChanges({ roles: { old: ['user'], new: ['editor', 'translator'] } })[0]).toMatchObject({ old: { text: 'user' }, new: { text: 'editor, translator' } })
  })
  it('never prints sensitive-looking keys, including nested ones', () => {
    expect(isSensitiveKey('password')).toBe(true)
    expect(isSensitiveKey('api_key')).toBe(true)
    expect(isSensitiveKey('status')).toBe(false)
    const rows = formatChanges({ token: 'abc', config: { headers: { a: 'b' }, url: 'x' }, password: { old: 'a', new: 'b' } })
    expect(JSON.stringify(rows)).not.toContain('abc')
    expect(JSON.stringify(rows)).not.toContain('"b"')
    expect(rows.find(r => r.key === 'token')!.new).toEqual({ type: 'redacted' })
    expect(rows.find(r => r.key === 'password')).toMatchObject({ old: { type: 'redacted' }, new: { type: 'redacted' } })
  })
  it('tolerates null / odd input', () => {
    expect(formatChanges(null)).toEqual([])
    expect(formatChanges('x')).toEqual([])
    expect(formatChanges([1])).toEqual([])
  })
})

describe('content form <-> API payload', () => {
  const guides = moduleByKey('guides')!
  it('builds a create payload: only filled locales, trimmed, lists cleaned', () => {
    const s = emptyForm(guides)
    Object.assign(s.attrs, { slug: ' residence-permit ', category: 'immigration', source_url: 'https://www.poliziadistato.it/x' })
    s.translations.ar.title = 'تصريح الإقامة'
    s.translations.ar.required_documents = ['  passport ', '', 'photo']
    s.translations.ar.steps = [{ title: 'Book', text: '' }, { title: '', text: 'ignored' }]
    const p = buildPayload(guides, s, { creating: true }) as any
    expect(p.slug).toBe('residence-permit')
    expect(p.category).toBe('immigration')
    expect(p.italian_term).toBeUndefined()
    expect(Object.keys(p.translations)).toEqual(['ar'])
    expect(p.translations.ar.required_documents).toEqual(['passport', 'photo'])
    expect(p.translations.ar.steps).toEqual([{ title: 'Book', text: null }])
    expect(p.translations.ar.summary).toBeNull()
  })
  it('on update an emptied nullable field is sent as null', () => {
    const s = emptyForm(guides)
    s.attrs.source_name = ''
    expect((buildPayload(guides, s, { creating: false }) as any).source_name).toBeNull()
  })
  it('round-trips an API item', () => {
    const item = { id: 1, slug: 'a', category: 'work', italian_term: null, region_id: 3, city_id: null, source: { name: 'INPS', url: 'https://www.inps.it', type: 'official', last_verified_at: '2026-01-02' }, translations: { ar: { title: 'ع', required_documents: ['x'], steps: [{ title: 's', text: null }] } } }
    const s = fromItem(guides, item)
    expect(s.attrs).toMatchObject({ slug: 'a', category: 'work', region_id: '3', city_id: '', source_name: 'INPS', last_verified_at: '2026-01-02' })
    expect(s.translations.ar.steps).toEqual([{ title: 's', text: '' }])
    expect(fromItem(guides, { ...item, translations: [] }).translations.ar.title).toBe('')
  })
  it('validates required fields, slug, https and a primary title in every filled locale', () => {
    const s = emptyForm(guides)
    expect(Object.keys(validateForm(guides, s, { creating: true }))).toEqual(expect.arrayContaining(['slug', 'category', 'translations']))
    Object.assign(s.attrs, { slug: 'Bad Slug', category: 'work', source_url: 'http://x' })
    s.translations.en.summary = 'only summary'
    const e = validateForm(guides, s, { creating: true })
    expect(e.slug).toBe('admin.validation.slug')
    expect(e.source_url).toBe('admin.validation.https')
    expect(e['translations.en.title']).toBe('admin.validation.required')
  })
  it('patente questions need is_true and a rights note; booleans become booleans', () => {
    const q = moduleByKey('patente-questions')!
    const s = emptyForm(q)
    expect(Object.keys(validateForm(q, s, { creating: true }))).toEqual(expect.arrayContaining(['is_true', 'rights_note', 'patente_topic_id']))
    Object.assign(s.attrs, { slug: 'q1', is_true: 'false', patente_topic_id: '4', rights_note: 'Licensed by X' })
    s.translations.it.statement = 'Vero?'
    const p = buildPayload(q, s, { creating: true }) as any
    expect(p.is_true).toBe(false)
    expect(p.patente_topic_id).toBe(4)
  })
  it('maps nested server errors onto the translation field', () => {
    expect(translationErrors({ 'translations.ar.steps.0.title': 'Required', 'translations.en.title': 'Long', slug: 'x' })).toEqual({ ar: { steps: 'Required' }, en: { title: 'Long' } })
  })
})
