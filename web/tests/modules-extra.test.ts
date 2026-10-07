import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import './stubs/nuxt-globals'
import { NuxtLinkStub } from './stubs/nuxt-link'
import { testLocale } from './stubs/imports'
import { forwardRequest, isDownloadPath, isUploadPath } from '../server/utils/bff'
import { collectEntries } from '../server/utils/sitemap'
import { buildHousingBody, parseAmount, sortFlags, validateHousing, EXTRA_FIELDS } from '../utils/housing'
import { actionViews, confidencePercent, keyDateViews, validateExplainFile, wantsTextFallback } from '../utils/explain'
import { REPORT_REASONS, buildLeadBody, ratingLabel, validateLead } from '../utils/services'
import { formToBody, profileToForm, validateProfile, newServiceRow } from '../utils/provider'
import { buildMatchAnswer, correctAnswerText, sessionSummary, splitSentence } from '../utils/practice'
import { cleanSubject, createDeduper, mayReport } from '../utils/analytics'
import { officialGuidePath, parseTags } from '../utils/community'
import { mapApiRoute } from '../utils/routes'
import { buildPayload, emptyForm, fromItem, validateForm } from '../utils/admin/form'
import { moduleByKey } from '../utils/admin/modules'
import UiBadge from '../components/ui/Badge.vue'
import UiAlert from '../components/ui/Alert.vue'
import UiIcon from '../components/ui/Icon.vue'
import UiCard from '../components/ui/Card.vue'
import UiSourceBadge from '../components/ui/SourceBadge.vue'
import GuideSource from '../components/guide/GuideSource.vue'
import GuideFallbackNotice from '../components/guide/FallbackNotice.vue'
import ContentProse from '../components/content/Prose.vue'
import LegalInline from '../components/legal/Inline.vue'
import ResultView from '../components/housing/ResultView.vue'
import ExplainResult from '../components/explain/Result.vue'
import ContentInfoBlock from '../components/content/InfoBlock.vue'
import LearnReviewedNotice from '../components/learn/ReviewedNotice.vue'
import ServicesVerification from '../components/services/Verification.vue'
import type { ExplainResult as ExplainData, HousingResult } from '../types/extra'

const global = {
  stubs: { NuxtLink: NuxtLinkStub },
  components: { UiBadge, UiAlert, UiIcon, UiCard, UiSourceBadge, GuideSource, GuideFallbackNotice, ContentProse, LegalInline },
}
beforeEach(() => { testLocale.value = 'en' })
const BASE = 'http://api/v1'
const json = (s: number, b: unknown) => new Response(JSON.stringify(b), { status: s, headers: { 'content-type': 'application/json' } })

describe('BFF allow-list and headers', () => {
  it('accepts multipart on the explainer and provider evidence uploads only', async () => {
    expect(isUploadPath('documents/explain')).toBe(true)
    expect(isUploadPath('provider/verification/documents')).toBe(true)
    expect(isUploadPath('documents/explain/x')).toBe(false)
    expect(isUploadPath('housing/check')).toBe(false)
    expect(isDownloadPath('admin/marketplace/providers/3/evidence/9')).toBe(true)
    expect(isDownloadPath('admin/marketplace/providers/3/evidence')).toBe(false)
    const fetcher = vi.fn()
    const r = await forwardRequest({ fetcher, base: BASE, method: 'POST', path: 'housing/check', rawBody: new Uint8Array([1]), contentType: 'multipart/form-data; boundary=x' })
    expect(r.status).toBe(415)
    expect(fetcher).not.toHaveBeenCalled()
  })
  it('forwards the analytics consent header only when the visitor accepted, and always X-Client', async () => {
    const fetcher = vi.fn().mockImplementation(async () => json(200, { data: {} }))
    await forwardRequest({ fetcher, base: BASE, method: 'GET', path: 'guides/x', analyticsConsent: true })
    expect(fetcher.mock.calls[0][1].headers['X-Analytics-Consent']).toBe('granted')
    expect(fetcher.mock.calls[0][1].headers['X-Client']).toBe('web')
    await forwardRequest({ fetcher, base: BASE, method: 'GET', path: 'guides/x' })
    expect(fetcher.mock.calls[1][1].headers['X-Analytics-Consent']).toBeUndefined()
  })
})

describe('sitemap additions', () => {
  it('includes articles, city profiles and providers', async () => {
    const fetchJson = vi.fn(async (path: string) => {
      const list = (slug: string) => ({ status: 200, json: { data: [{ slug }], meta: { last_page: 1 } } })
      if (path.startsWith('articles?')) return list('a-1')
      if (path.startsWith('city-profiles?')) return list('milano')
      if (path.startsWith('providers?')) return list('p-1')
      return { status: 404, json: null }
    })
    const paths = (await collectEntries(fetchJson)).map(e => e.path)
    expect(paths).toEqual(expect.arrayContaining(['/articles/a-1', '/cities/milano', '/services/p-1', '/housing', '/articles', '/services']))
    expect(paths).not.toContain('/community')
  })
})

describe('housing checker logic', () => {
  const form = () => ({ text: 'x'.repeat(40), extra: Object.fromEntries(EXTRA_FIELDS.map(k => [k, ''])) as never, explain: false, save: false, label: 'ignored' })
  it('parses Italian and plain amounts and rejects garbage', () => {
    expect(parseAmount('1.250,50')).toBe(1250.5)
    expect(parseAmount('850')).toBe(850)
    expect(parseAmount('€ 800,5')).toBe(800.5)
    expect(parseAmount('')).toBeNull()
    expect(parseAmount('abc')).toBeUndefined()
    expect(parseAmount('-5')).toBeUndefined()
    expect(parseAmount('999999999')).toBeUndefined()
  })
  it('validates length limits and builds a minimal body', () => {
    expect(validateHousing({ ...form(), text: 'short' })).toEqual([{ field: 'text', code: 'too_short' }])
    expect(validateHousing({ ...form(), text: 'x'.repeat(50) }, { min: 20, max: 30 })).toEqual([{ field: 'text', code: 'too_long' }])
    const f = form(); (f.extra as Record<string, string>).rent_monthly = '700,00'
    expect(validateHousing(f)).toEqual([])
    expect(buildHousingBody(f)).toEqual({ text: 'x'.repeat(40), extra: { rent_monthly: 700 }, explain: false, save: false })
    expect(buildHousingBody({ ...f, save: true, label: ' Casa ' })).toMatchObject({ save: true, label: 'Casa' })
  })
  it('orders flags by severity', () => {
    const f = (id: string, severity: 'info' | 'caution' | 'warning') => ({ id, severity, title: id, explanation: null, basis: 'general_guidance' as const })
    expect(sortFlags([f('a', 'info'), f('b', 'warning'), f('c', 'caution')]).map(x => x.id)).toEqual(['b', 'c', 'a'])
  })
  const result = (over: Partial<HousingResult> = {}): HousingResult => ({
    language: 'it', facts: { rent_monthly: 700, utilities: 'excluded', contract_keywords: [], cash_payment_mentioned: false }, red_flags: [{ id: 'cash', severity: 'warning', title: 'Cash only', explanation: 'Ask for traceable payment', basis: 'general_guidance' }],
    questions: [{ id: 'q', severity: 'info', title: 'Reg', explanation: null, basis: 'general_guidance', question: 'Is it registered?' }], could_not_detect: [{ key: 'notice_period_mentioned', label: 'Notice period' }],
    cost: { currency: 'EUR', monthly_total: 700, components: [{ key: 'rent', amount: 700, source: 'text' }], one_time: [], assumptions: [{ code: 'utilities_not_counted_excluded', text: 'Utilities are not counted.' }] },
    confidence: 'medium', explanation: null, disclaimer: 'Not legal advice.', persisted: false, saved_id: null, ...over,
  })
  it('renders terms, flags, cost with assumptions, could-not-detect and a separate disclaimer', () => {
    const w = mount(ResultView, { props: { result: result() }, global })
    expect(w.text()).toContain('Cash only')
    expect(w.find('[data-testid=monthly-total]').text()).toContain('700')
    expect(w.find('[data-testid=assumptions]').text()).toContain('Utilities are not counted.')
    expect(w.find('[data-testid=could-not-detect]').text()).toContain('Notice period')
    expect(w.find('[data-testid=housing-disclaimer]').text()).toContain('Not legal advice.')
    expect(w.find('[data-testid=housing-saved-note]').text()).toContain('Nothing was saved')
    expect(w.find('[data-testid=housing-confidence]').exists()).toBe(true)
  })
  it('says so when no total could be computed and when nothing is flagged', () => {
    const w = mount(ResultView, { props: { result: result({ red_flags: [], cost: { currency: 'EUR', monthly_total: null, components: [], one_time: [], assumptions: [] } }) }, global })
    expect(w.find('[data-testid=no-total]').exists()).toBe(true)
    expect(w.find('[data-testid=no-flags]').exists()).toBe(true)
    expect(w.find('[data-testid=monthly-total]').exists()).toBe(false)
  })
})

describe('document explainer logic', () => {
  it('pre-checks type and size (jpg/png/pdf only)', () => {
    expect(validateExplainFile({ name: 'a.pdf', size: 10, type: 'application/pdf' })).toBeNull()
    expect(validateExplainFile({ name: 'a.webp', size: 10, type: 'image/webp' })).toBe('type')
    expect(validateExplainFile({ name: 'a.png', size: 0, type: 'image/png' })).toBe('empty')
    expect(validateExplainFile({ name: 'a.png', size: 3 * 1024, type: 'image/png' }, 2)).toBe('too_large')
    expect(validateExplainFile({ name: 'scan.JPG', size: 5, type: '' })).toBeNull()
  })
  it('switches to paste mode for OCR failures', () => {
    for (const c of ['ocr_unavailable', 'ocr_failed', 'ocr_empty']) expect(wantsTextFallback(c, {})).toBe(true)
    expect(wantsTextFallback('x', { fallback: ['text'] })).toBe(true)
    expect(wantsTextFallback('image_too_large', {})).toBe(false)
  })
  it('handles confidence, unclear dates and unsafe action targets', () => {
    expect(confidencePercent(0.82)).toBe(82)
    expect(confidencePercent(91)).toBe(91)
    expect(confidencePercent('high')).toBeNull()
    expect(keyDateViews([{ label: 'Deadline', date: null, text: 'entro il 18' }, { label: 'Hearing', date: '2026-11-18' }]).map(d => d.unclear)).toEqual([true, false])
    const a = actionViews([{ type: 'reminder', label: 'R', target: 'my-documents' }, { type: 'appointment', label: 'A', target: 'appointments/hub' }, { type: 'guide', label: 'G', target: 'javascript:alert(1)' }, { type: 'guide', label: 'S', target: 'search?q=permesso' }])
    expect(a.map(x => x.path)).toEqual(['/documents', '/appointments', null, '/search?q=permesso'])
  })
  const data = (over: Partial<ExplainData> = {}): ExplainData => ({ classification: { type: 'comune', type_label: 'Letter from the Comune', confidence: 0.7 }, summary: 'You must pay.', label: 'ai_explanation', label_text: 'AI explanation', key_dates: [{ label: 'Pay by', date: null, text: '18 novembre' }], suggested_actions: [{ type: 'reminder', label: 'Add a reminder', target: 'my-documents' }], language: 'it', disclaimer: 'Check with the office.', sources: [], degraded: false, persisted: false, ...over })
  it('renders the classification object, "date not clear", mapped links, disclaimer and the not-stored note', () => {
    const w = mount(ExplainResult, { props: { result: data() }, global })
    expect(w.find('[data-testid=explain-type]').text()).toBe('Letter from the Comune')
    expect(w.find('[data-testid=date-unclear]').text()).toBe('Date not clear')
    expect(w.find('[data-testid=explain-actions] a').attributes('href')).toBe('/en/documents')
    expect(w.find('[data-testid=explain-disclaimer]').text()).toContain('Check with the office.')
    expect(w.find('[data-testid=explain-stored]').text()).toContain('Nothing')
  })
})

describe('marketplace logic', () => {
  const lead = { message: 'Hi', request_type: 'contact' as const, preferred_language: '', contact_name: '', contact_email: '', contact_phone: '', consent: false }
  it('refuses a request without the explicit consent, and sends consent_share_contact when given', () => {
    expect(validateLead(lead).consent).toBe('consent_required')
    expect(validateLead({ ...lead, message: ' ', consent: true }).message).toBe('message_required')
    expect(validateLead({ ...lead, consent: true, contact_email: 'bad' }).contact_email).toBe('email_invalid')
    expect(validateLead({ ...lead, consent: true })).toEqual({})
    expect(buildLeadBody({ ...lead, consent: true, contact_name: ' Ali ' })).toEqual({ message: 'Hi', request_type: 'contact', consent_share_contact: true, contact_name: 'Ali' })
  })
  it('shows "no reviews" instead of a zero rating', () => {
    expect(ratingLabel(null, 0)).toEqual({ average: null, count: 0 })
    expect(ratingLabel(4.46, 12)).toEqual({ average: '4.5', count: 12 })
    expect(REPORT_REASONS).toContain('personal_data')
  })
  it('renders the verification label exactly as given', () => {
    const w = mount(ServicesVerification, { props: { verification: { status: 'pending', label: 'Verification pending (custom)', verified_at: null, valid_until: null } }, global })
    expect(w.text()).toContain('Verification pending (custom)')
    expect(w.attributes('data-verification')).toBe('pending')
  })
  it('builds the provider payload from the form and validates it', () => {
    const f = profileToForm({ category: 'translator', display_name: 'Ali', translations: { ar: { headline: 'مترجم' } }, languages: ['ar'], city_id: 4 })
    expect(f.city_id).toBe('4')
    f.translations.en.description = 'Only a description'
    expect(validateProfile(f).translations).toBe('headline_required_with_text')
    f.translations.en.description = ''
    const row = newServiceRow(); row.price = '50'; row.translations.ar.name = 'ترجمة'
    f.services.push(row, newServiceRow())
    expect(validateProfile(f)).toEqual({})
    const body = formToBody(f)
    expect(body.translations).toEqual({ ar: { headline: 'مترجم' } })
    expect(body.services).toEqual([{ price_from_eur: 50, translations: { ar: { name: 'ترجمة' } } }])
    expect(body.city_id).toBe(4)
    f.website = 'http://x.it'
    expect(validateProfile(f).website).toBe('website_https')
  })
})

describe('Italian practice logic', () => {
  it('splits fill-in sentences with exactly one blank', () => {
    expect(splitSentence('Io ___ a casa.')).toEqual({ before: 'Io', after: 'a casa.' })
    expect(splitSentence('no blank')).toBeNull()
    expect(splitSentence('a ___ b ___ c')).toBeNull()
  })
  it('builds the match answer from opaque ids, refusing incomplete or duplicate picks', () => {
    expect(buildMatchAnswer([2, 0, 1])).toEqual([2, 0, 1])
    expect(buildMatchAnswer([2, null, 1])).toBeNull()
    expect(buildMatchAnswer([1, 1])).toBeNull()
    expect(buildMatchAnswer([])).toBeNull()
  })
  it('turns the revealed correct answer into text', () => {
    const mc = { type: 'multiple_choice' as const, form: { choices: [{ index: 0, text: 'A' }, { index: 1, text: 'B' }] } }
    expect(correctAnswerText(mc, { index: 1 })).toBe('B')
    expect(correctAnswerText({ type: 'fill_blank', form: {} }, { answers: ['vado', 'andiamo'] })).toBe('vado / andiamo')
    const match = { type: 'match' as const, form: { left: [{ index: 0, text: 'ciao' }, { index: 1, text: 'grazie' }], right: [{ id: 0, text: 'thanks' }, { id: 1, text: 'hi' }] } }
    expect(correctAnswerText(match, { right_ids: [1, 0] })).toBe('ciao = hi; grazie = thanks')
    expect(sessionSummary([true, false, true])).toEqual({ total: 3, correct: 2, percent: 67 })
    expect(sessionSummary([]).percent).toBeNull()
  })
  it('shows the API notice for content that is not reviewed', () => {
    const w = mount(LearnReviewedNotice, { props: { item: { reviewed: false, reviewed_at: null, review_notice: 'Not checked by a teacher yet.' } }, global })
    expect(w.find('[data-testid=not-reviewed]').text()).toContain('Not checked by a teacher yet.')
    expect(mount(LearnReviewedNotice, { props: { item: { reviewed: true, reviewed_at: 'x', review_notice: null } }, global }).find('[data-testid=reviewed]').exists()).toBe(true)
  })
})

describe('analytics reporting', () => {
  it('only reports with consent and never repeats the same event within the window', () => {
    expect(mayReport(false, null)).toBe(false)
    expect(mayReport(false, 'denied')).toBe(false)
    expect(mayReport(false, 'granted')).toBe(true)
    expect(mayReport(true, null)).toBe(true)
    expect(mayReport(true, 'denied')).toBe(false)
    let now = 0
    const once = createDeduper(1000, () => now)
    expect(once('a')).toBe(true)
    expect(once('a')).toBe(false)
    expect(once('b')).toBe(true)
    now = 1500
    expect(once('a')).toBe(true)
  })
  it('drops subjects that are not slugs', () => {
    expect(cleanSubject('questura-milano')).toBe('questura-milano')
    expect(cleanSubject('x y')).toBeUndefined()
    expect(cleanSubject('a'.repeat(121))).toBeUndefined()
    expect(cleanSubject(null)).toBeUndefined()
  })
})

describe('community helpers', () => {
  it('only follows /guides/<slug> for the pinned official guide', () => {
    expect(officialGuidePath('/guides/permesso')).toBe('/guides/permesso')
    expect(officialGuidePath('https://evil.com')).toBeNull()
    expect(officialGuidePath('/guides/../x')).toBeNull()
  })
  it('parses tags into API slugs', () => {
    expect(parseTags('Visa, permesso di soggiorno,, VISA, bad!tag')).toEqual(['visa', 'permesso-di-soggiorno'])
    expect(parseTags('a,b,c,d,e,f,g', 3)).toEqual(['a', 'b', 'c'])
  })
})

describe('route mapper additions', () => {
  it.each([
    ['housing/check', '/housing/check'], ['documents/explain', '/documents/explain'], ['articles/x', '/articles/x'], ['cities/milano', '/cities/milano'],
    ['providers/p-1', '/services/p-1'], ['appointments/hub', '/appointments'], ['patente/glossary', '/patente/glossary'],
  ])('maps %s', (i, o) => expect(mapApiRoute(i)).toBe(o))
  it('still refuses hostile input', () => { expect(mapApiRoute('providers/../x')).toBeNull(); expect(mapApiRoute('//evil.com')).toBeNull() })
})

describe('content info labelling', () => {
  const block = (over = {}) => ({ key: 'transport', label: 'Transport', title: 'Metro', body: 'Buy a ticket.', locale: 'en' as const, fallback: false, info_type: 'general_guidance' as const, info_label: 'General guidance', source: null, ...over })
  it('labels general guidance as not official and official info with its source', () => {
    const g = mount(ContentInfoBlock, { props: { block: block() }, global })
    expect(g.find('[data-testid=info-label]').text()).toContain('General guidance')
    expect(g.text()).toContain('not an official source')
    const o = mount(ContentInfoBlock, { props: { block: block({ info_type: 'official_info', info_label: 'Official information', source: { name: 'ATM', url: 'https://www.atm.it', type: 'official', last_verified_at: '2026-09-01', freshness: 'fresh' } }) }, global })
    expect(o.attributes('data-info-type')).toBe('official_info')
    expect(o.find('[data-testid=source-name]').text()).toBe('ATM')
  })
})

describe('admin schema extensions', () => {
  it('round-trips tags, JSON content and city blocks', () => {
    const m = moduleByKey('articles')!
    const s = fromItem(m, { slug: 'a', category: 'work', tags: ['visa', 'work'], related_guides: ['g1'], translations: { ar: { title: 'ت', excerpt: 'ex', body: '', seo_title: '', seo_description: '' } } })
    expect(s.attrs.tags).toBe('visa, work')
    const body = buildPayload(m, s, { creating: false })
    expect(body.tags).toEqual(['visa', 'work'])
    expect(body.related_guides).toEqual(['g1'])
    const ex = moduleByKey('italian-exercises')!
    const e = emptyForm(ex)
    e.attrs.content = '{"sentence":"Io ___ qui","answers":["sono"]}'
    expect(buildPayload(ex, e, { creating: true }).content).toEqual({ sentence: 'Io ___ qui', answers: ['sono'] })
    e.attrs.content = '[1]'
    expect(validateForm(ex, e, { creating: true }).content).toBe('admin.validation.json')
    const cp = moduleByKey('city-profiles')!
    const c = fromItem(cp, { city_id: 3, blocks: [{ key: 'transport', info_type: 'official_info', sort_order: 1, source: { name: 'ATM', url: 'https://www.atm.it', type: 'official', last_verified_at: '2026-09-01T00:00:00Z' }, translations: { ar: { title: 'ت', body: 'ب' } } }], translations: {} })
    const p = buildPayload(cp, c, { creating: false }) as { blocks: Record<string, unknown>[] }
    expect(p.blocks[0]).toMatchObject({ key: 'transport', info_type: 'official_info', source_url: 'https://www.atm.it', last_verified_at: '2026-09-01', translations: { ar: { title: 'ت', body: 'ب' } } })
    expect(Object.keys(validateForm(cp, { ...c, attrs: { ...c.attrs, blocks: JSON.stringify([{ key: '', info_type: 'general_guidance', sort_order: '0', source_name: '', source_url: '', source_type: '', last_verified_at: '', translations: { ar: { title: '', body: '' }, en: { title: '', body: '' }, it: { title: '', body: '' } } }]) } }, { creating: false }))).toContain('blocks')
  })
  it('does not ask for a slug on city profiles and accepts a licence instead of a rights note', () => {
    const cp = moduleByKey('city-profiles')!
    expect(Object.keys(validateForm(cp, emptyForm(cp), { creating: true }))).not.toContain('slug')
    const q = moduleByKey('patente-questions')!
    const s = emptyForm(q)
    Object.assign(s.attrs, { slug: 'q1', is_true: 'true', patente_topic_id: '1', license_type: 'licensed' })
    expect(Object.keys(validateForm(q, s, { creating: true }))).not.toContain('rights_note')
  })
})
