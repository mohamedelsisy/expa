import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { describeProblem, extractProblems } from '../utils/admin/problems'
import { ApiError } from '../utils/errors'
import ProblemsChecklist from '../components/admin/ProblemsChecklist.vue'
import en from '../i18n/locales/en.json'
import ar from '../i18n/locales/ar.json'
import it_ from '../i18n/locales/it.json'

const t = (k: string, p?: Record<string, unknown>) => `${k}|${JSON.stringify(p ?? {})}`
const ctx = { fieldLabel: (f: string) => `F:${f}`, localeLabel: (l: string) => `L:${l}`, firstRequiredField: 'title' }
const CODES = ['missing_translation', 'missing_source_field', 'source_domain_not_official', 'invalid_source_url', 'invalid_url', 'university_not_published', 'missing_rights_note', 'verified_in_future']

describe('describeProblem', () => {
  it('missing translation jumps to the locale tab and first required field', () => {
    const v = describeProblem({ code: 'missing_translation', locale: 'ar' }, t, ctx)
    expect(v.message).toContain('admin.problems.missing_translation')
    expect(v.target).toEqual({ kind: 'translation', locale: 'ar', field: 'title' })
  })
  it.each([
    ['missing_source_field', 'source_name'], ['source_domain_not_official', 'source_url'], ['invalid_source_url', 'source_url'],
    ['invalid_url', 'official_url'], ['university_not_published', 'university_id'], ['missing_rights_note', 'rights_note'], ['verified_in_future', 'last_verified_at'],
  ])('%s targets field %s', (code, field) => {
    const v = describeProblem({ code, field }, t, ctx)
    expect(v.known).toBe(true)
    expect(v.target).toEqual({ kind: 'field', field })
    expect(v.message).toContain(`admin.problems.${code}`)
  })
  it('unknown codes degrade safely', () => {
    const v = describeProblem({ code: 'brand_new_rule' }, t, ctx)
    expect(v.known).toBe(false)
    expect(v.target).toEqual({ kind: 'none' })
    expect(v.message).toContain('brand_new_rule')
    expect(describeProblem({ code: 'brand_new_rule', field: 'x' }, t, ctx).target).toEqual({ kind: 'field', field: 'x' })
  })
  it('every known code has a message in all locales', () => {
    for (const f of [en, ar, it_]) for (const c of [...CODES, 'unknown']) expect((f as any).admin.problems[c], c).toBeTruthy()
  })
})

describe('extractProblems', () => {
  it('reads details.problems and ignores malformed entries', () => {
    const e = new ApiError(422, 'content_not_publishable', 'no', { problems: [{ code: 'missing_translation', locale: 'ar' }, 'x', { nocode: 1 }, { code: 'invalid_url', field: 'official_url', extra: 1 }] })
    expect(extractProblems(e)).toEqual([{ code: 'missing_translation', locale: 'ar' }, { code: 'invalid_url', field: 'official_url' }])
    expect(extractProblems(new Error('x'))).toEqual([])
    expect(extractProblems(new ApiError(422, 'x', 'm', { problems: 'nope' }))).toEqual([])
  })
})

describe('ProblemsChecklist', () => {
  it('renders readable messages and emits jump with the target', async () => {
    const w = mount(ProblemsChecklist, { props: { problems: [{ code: 'missing_translation', locale: 'ar' }, { code: 'missing_source_field', field: 'source_url' }, { code: 'weird' }], firstRequiredField: 'summary' } })
    expect(w.attributes('role')).toBe('alert')
    const items = w.findAll('li')
    expect(items).toHaveLength(3)
    expect(items[0]!.text()).toContain('translation is missing')
    expect(items[1]!.text()).toContain('Source URL')
    expect(items[2]!.text()).toContain('weird')
    expect(items[2]!.find('button').exists()).toBe(false)
    await items[0]!.find('button').trigger('click')
    expect(w.emitted('jump')![0]).toEqual([{ kind: 'translation', locale: 'ar', field: 'summary' }])
  })
})
