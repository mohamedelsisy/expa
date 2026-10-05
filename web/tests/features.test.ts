import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { NuxtLinkStub } from './stubs/nuxt-link'
import { testLocale } from './stubs/imports'
import AskMessage from '../components/ask/Message.vue'
import MatchReasons from '../components/jobs/MatchReasons.vue'
import BookingBlock from '../components/gov/BookingBlock.vue'
import Combobox from '../components/search/Combobox.vue'
import { mapApiAction, mapApiRoute } from '../utils/routes'
import { parseMessage } from '../utils/aiMessage'
import { ANNOUNCE_AT, createExamClock, crossedThreshold, formatClock, remainingSeconds } from '../utils/exam'
import { MAX_UPLOAD_BYTES, validateUpload } from '../utils/documents'
import { isConsentRequired, ApiError } from '../utils/errors'
import type { AiMessage, Booking, JobMatch } from '../types/api'

const global = { stubs: { NuxtLink: NuxtLinkStub } }
beforeEach(() => { testLocale.value = 'en' })

const msg = (over: Partial<AiMessage> = {}): AiMessage => ({
  id: 1, role: 'assistant', content: 'Hello', label: 'official', label_text: 'Official information', sources: [], actions: [], degraded: false, created_at: null, ...over,
})
const src = (n: number, url: string | null = 'https://www.example.it/x', freshness: 'fresh' | 'stale' | 'outdated' = 'fresh') => ({
  n, title: `Source ${n}`, ref: { type: 'guide', slug: `g${n}`, route: `guides/g${n}` },
  source: { name: 'Agenzia X', url, type: 'official' as const, last_verified_at: '2026-01-01', freshness },
})

describe('AI message renderer', () => {
  it('turns [n] markers into links to the matching source and leaves unknown markers as text', () => {
    const w = mount(AskMessage, { props: { msgKey: 'k1', message: msg({ content: 'You need a form [1] and a stamp [2] but not [9].', sources: [src(1), src(2)] }) }, global })
    const cites = w.findAll('a[data-cite]')
    expect(cites.map(c => c.attributes('href'))).toEqual(['#src-k1-1', '#src-k1-2'])
    expect(w.find('#src-k1-1').exists()).toBe(true)
    expect(w.find('[data-testid=ai-text]').text()).toContain('[9]')
    expect(w.findAll('[data-testid=ai-source]')).toHaveLength(2)
  })
  it('renders text only: HTML in the answer is never parsed', () => {
    const w = mount(AskMessage, { props: { msgKey: 'k', message: msg({ content: '<img src=x onerror=alert(1)><script>alert(2)</script>\nline two [1]', sources: [src(1)] }) }, global })
    expect(w.find('img').exists()).toBe(false)
    expect(w.find('script').exists()).toBe(false)
    expect(w.find('[data-testid=ai-text]').text()).toContain('<img src=x onerror=alert(1)>')
    expect(w.find('[data-testid=ai-text] br').exists()).toBe(true)
  })
  it('shows the label badge from the API label with a distinct data attribute per label', () => {
    for (const label of ['official', 'general_guidance', 'ai_explanation', 'third_party'] as const) {
      const w = mount(AskMessage, { props: { msgKey: 'k', message: msg({ label, label_text: `T-${label}` }) }, global })
      expect(w.find('[data-testid=ai-label]').text()).toContain(`T-${label}`)
      expect(w.attributes('data-label')).toBe(label)
    }
    expect(mount(AskMessage, { props: { msgKey: 'k', message: msg({ label: null, label_text: null }) }, global }).find('[data-testid=ai-label]').exists()).toBe(false)
  })
  it('only links https sources and warns on stale/outdated freshness', () => {
    const w = mount(AskMessage, { props: { msgKey: 'k', message: msg({ sources: [src(1, 'http://insecure.it'), src(2, 'javascript:alert(1)'), src(3, 'https://ok.it', 'outdated')] }) }, global })
    const links = w.findAll('[data-testid=ai-source-link]')
    expect(links).toHaveLength(1)
    expect(links[0].attributes('href')).toBe('https://ok.it/')
    expect(links[0].attributes('rel')).toBe('noopener noreferrer')
    expect(w.findAll('[data-testid=freshness-warning]')).toHaveLength(1)
  })
  it('degraded answers show the friendly state and the search alternative', () => {
    const w = mount(AskMessage, { props: { msgKey: 'k', fallbackQuery: 'permesso', message: msg({ degraded: true, label: null, content: 'I could not process that.', actions: [{ type: 'route', target: 'search?q=permesso', label: 'Search' }] }) }, global })
    expect(w.find('[data-testid=ai-degraded]').exists()).toBe(true)
    expect(w.find('[data-testid=ai-degraded-search]').attributes('href')).toBe('/en/search?q=permesso')
  })
  it('maps actions through the safe route mapper (hostile targets are dropped)', () => {
    const w = mount(AskMessage, { props: { msgKey: 'k', message: msg({ actions: [
      { type: 'guide', target: 'residence', label: 'Guide' }, { type: 'route', target: 'appointments', label: 'Book' },
      { type: 'route', target: 'javascript:alert(1)', label: 'Bad' }, { type: 'route', target: '//evil.com', label: 'Bad2' },
    ] }) }, global })
    const acts = w.findAll('[data-testid=ai-action]')
    expect(acts.map(a => a.attributes('href'))).toEqual(['/en/guides/residence', '/en/appointments'])
  })
  it('renders the built-in disclaimer as a distinct note', () => {
    const w = mount(AskMessage, { props: { msgKey: 'k', message: msg({ content: 'Answer.\n\n⚠️ This is general information, not legal advice.' }) }, global })
    expect(w.find('[data-testid=ai-disclaimer]').text()).toContain('general information')
  })
  it('renders the separate disclaimer field as its own note, not inside the text', () => {
    const w = mount(AskMessage, { props: { msgKey: 'k', message: msg({ content: 'Answer.', disclaimer: 'Not legal advice.' }) }, global })
    expect(w.find('[data-testid=ai-disclaimer-field]').text()).toBe('Not legal advice.')
    expect(w.find('[data-testid=ai-text]').text()).not.toContain('Not legal advice')
    expect(mount(AskMessage, { props: { msgKey: 'k', message: msg({ content: 'A.' }) }, global }).find('[data-testid=ai-disclaimer-field]').exists()).toBe(false)
  })
  it('parseMessage splits paragraphs and lines', () => {
    const p = parseMessage('a [1]\nb\n\n\nc', [1])
    expect(p).toHaveLength(2)
    expect(p[0]).toHaveLength(2)
    expect(p[0][0]).toEqual([{ kind: 'text', text: 'a ' }, { kind: 'cite', n: 1 }])
  })
})

describe('exam timer and auto-submit', () => {
  afterEach(() => { vi.useRealTimers() })
  it('computes remaining time and formats the clock', () => {
    expect(remainingSeconds('2026-01-01T00:20:00Z', Date.parse('2026-01-01T00:00:00Z'))).toBe(1200)
    expect(remainingSeconds('2026-01-01T00:00:00Z', Date.parse('2026-01-01T00:05:00Z'))).toBe(0)
    expect(remainingSeconds(null, 0)).toBeNull()
    expect(formatClock(1200)).toBe('20:00')
    expect(formatClock(61)).toBe('01:01')
    expect(formatClock(-5)).toBe('00:00')
  })
  it('announces each threshold once when crossed', () => {
    expect(crossedThreshold(601, 600)).toBe(600)
    expect(crossedThreshold(700, 650)).toBeNull()
    expect(crossedThreshold(null, 10)).toBeNull()
    expect(ANNOUNCE_AT).toContain(60)
  })
  it('auto-submits exactly once at the deadline and announces thresholds', () => {
    vi.useFakeTimers()
    const start = Date.parse('2026-01-01T00:00:00Z')
    vi.setSystemTime(start)
    const onExpire = vi.fn()
    const onAnnounce = vi.fn()
    const ticks: number[] = []
    const clock = createExamClock('2026-01-01T00:01:05Z', { onExpire, onAnnounce, onTick: r => ticks.push(r) })
    clock.start()
    expect(ticks[0]).toBe(65)
    vi.advanceTimersByTime(5000) // 60 left
    expect(onAnnounce).toHaveBeenCalledWith(60)
    expect(onExpire).not.toHaveBeenCalled()
    vi.advanceTimersByTime(60_000)
    expect(onExpire).toHaveBeenCalledTimes(1)
    vi.advanceTimersByTime(30_000)
    expect(onExpire).toHaveBeenCalledTimes(1)
    expect(clock.expired).toBe(true)
  })
  it('expires immediately when the deadline already passed (reload after timeout)', () => {
    const onExpire = vi.fn()
    createExamClock('2000-01-01T00:00:00Z', { onExpire }).start()
    expect(onExpire).toHaveBeenCalledTimes(1)
  })
  it('stop() prevents any later expiry callback', () => {
    vi.useFakeTimers()
    vi.setSystemTime(Date.parse('2026-01-01T00:00:00Z'))
    const onExpire = vi.fn()
    const c = createExamClock('2026-01-01T00:00:10Z', { onExpire })
    c.start()
    c.stop()
    vi.advanceTimersByTime(20_000)
    expect(onExpire).not.toHaveBeenCalled()
  })
})

describe('match reasons list', () => {
  const match: JobMatch = { score: 72, confidence: 55, reasons: [
    { key: 'skills', status: 'match', label: 'Skills fit', detail: null }, { key: 'italian', status: 'partial', label: 'One level below', detail: null },
    { key: 'salary', status: 'mismatch', label: 'Below expectation', detail: null }, { key: 'english', status: 'unknown', label: 'English not specified', detail: null },
  ] }
  it('shows API labels with ✓ / △ / ✗ / ? icons and confidence', () => {
    const w = mount(MatchReasons, { props: { match }, global })
    const items = w.findAll('[data-testid=match-reason]')
    expect(items.map(i => i.attributes('data-status'))).toEqual(['match', 'partial', 'mismatch', 'unknown'])
    expect(items.map(i => i.find('[aria-hidden=true]').text())).toEqual(['✓', '△', '✗', '?'])
    expect(items[0].text()).toContain('Skills fit')
    expect(w.find('[data-testid=match-confidence]').text()).toContain('55')
    expect(w.find('[role=img]').attributes('aria-label')).toContain('72')
  })
  it('handles a null score without a ring', () => {
    const w = mount(MatchReasons, { props: { match: { score: null, confidence: 0, reasons: [] } }, global })
    expect(w.find('[role=img]').exists()).toBe(false)
    expect(w.find('[data-testid=match-none]').exists()).toBe(true)
  })
})

describe('booking block', () => {
  const b = (over: Partial<Booking> = {}): Booking => ({ method: 'online', method_label: 'Online', url: 'https://prenotazioni.example.it', booked_by_expa: false, notice: 'EXPA does not book for you.', ...over })
  it('always shows the notice, with or without a link', () => {
    for (const url of ['https://prenotazioni.example.it', null, 'http://insecure.it', 'javascript:alert(1)']) {
      const w = mount(BookingBlock, { props: { booking: b({ url }) }, global })
      expect(w.find('[data-testid=booking-notice]').text()).toContain('EXPA does not book for you.')
      expect(w.find('[data-testid=booking-method]').text()).toBe('Online')
    }
  })
  it('links only https URLs, opened safely', () => {
    const ok = mount(BookingBlock, { props: { booking: b() }, global }).find('[data-testid=booking-link]')
    expect(ok.attributes('rel')).toBe('noopener noreferrer')
    expect(ok.attributes('target')).toBe('_blank')
    expect(mount(BookingBlock, { props: { booking: b({ url: 'http://x.it' }) }, global }).find('[data-testid=booking-link]').exists()).toBe(false)
  })
})

describe('API route / action mapper', () => {
  it.each([
    ['my-documents', '/documents'], ['my-documents/12', '/documents/12'], ['learn-italian/daily', '/learn-italian'], ['appointments', '/appointments'],
    ['jobs', '/jobs'], ['jobs/7', '/jobs/7'], ['patente', '/patente'], ['guides', '/guides'], ['guides/permesso', '/guides/permesso'],
    ['government/services/spid', '/government/services/spid'], ['government/offices/q-roma', '/government/offices/q-roma'],
    ['appointments/guides/questura', '/appointments/questura'], ['learn-italian/lessons/ciao', '/learn-italian/lessons/ciao'],
    ['patente/topics/segnali', '/patente/topics/segnali'], ['patente/categories/b', '/patente'], ['study', '/guides'], ['privacy-settings', '/privacy-settings'],
    ['/guides/leading-slash', '/guides/leading-slash'], ['search?q=permesso%20di%20soggiorno', '/search?q=permesso%20di%20soggiorno'],
  ])('maps %s', (input, out) => expect(mapApiRoute(input)).toBe(out))
  it.each([
    'javascript:alert(1)', 'JaVaScRiPt:alert(1)', 'data:text/html,x', 'https://evil.com', '//evil.com', '///evil.com', '\\evil.com', '../etc', 'guides/../x', 'guides/%2e%2e',
    'guides//x', 'my-documents/abc', 'jobs/1x', 'unknown-module', 'guides/a b', 'guides?x=1', '', '   ', 'guides/slug\n', 'my-documents/1/extra',
  ])('rejects hostile or unknown target %j', (input) => expect(mapApiRoute(input)).toBeNull())
  it('rejects non-strings', () => { for (const v of [null, undefined, 5, {}, []]) expect(mapApiRoute(v)).toBeNull() })
  it('maps actions by type and rejects bad slugs/types', () => {
    expect(mapApiAction({ type: 'guide', target: 'residence' })).toBe('/guides/residence')
    expect(mapApiAction({ type: 'guide', target: '../x' })).toBeNull()
    expect(mapApiAction({ type: 'route', target: 'jobs' })).toBe('/jobs')
    expect(mapApiAction({ type: 'task', target: 'x' })).toBeNull()
    expect(mapApiAction(null)).toBeNull()
  })
})

describe('search combobox keyboard behaviour', () => {
  const suggestions = [{ title: 'Permesso di soggiorno', type: 'guide' }, { title: 'Permesso CE', type: 'government_service' }, { title: 'Patente', type: 'patente_topic' }]
  const make = () => mount(Combobox, { props: { modelValue: 'per', suggestions, label: 'Search' }, global, attachTo: document.body })
  it('has combobox ARIA wiring', async () => {
    const w = make()
    const input = w.find('input')
    expect(input.attributes('role')).toBe('combobox')
    expect(input.attributes('aria-expanded')).toBe('false')
    await input.trigger('focus')
    expect(input.attributes('aria-expanded')).toBe('true')
    expect(w.find(`#${input.attributes('aria-controls')}`).attributes('role')).toBe('listbox')
    expect(w.findAll('[role=option]')).toHaveLength(3)
    w.unmount()
  })
  it('ArrowDown/ArrowUp move the active option (wrapping) via aria-activedescendant', async () => {
    const w = make()
    const input = w.find('input')
    await input.trigger('keydown', { key: 'ArrowDown' })
    expect(input.attributes('aria-activedescendant')).toBe(w.findAll('[role=option]')[0].attributes('id'))
    await input.trigger('keydown', { key: 'ArrowUp' })
    expect(input.attributes('aria-activedescendant')).toBe(w.findAll('[role=option]')[2].attributes('id'))
    expect(w.findAll('[role=option]')[2].attributes('aria-selected')).toBe('true')
    await input.trigger('keydown', { key: 'ArrowDown' })
    expect(input.attributes('aria-activedescendant')).toBe(w.findAll('[role=option]')[0].attributes('id'))
    w.unmount()
  })
  it('Enter selects the active suggestion, otherwise submits the typed text', async () => {
    const w = make()
    const input = w.find('input')
    await input.trigger('keydown', { key: 'Enter' })
    expect(w.emitted('submit')![0]).toEqual(['per'])
    await input.trigger('keydown', { key: 'ArrowDown' })
    await input.trigger('keydown', { key: 'ArrowDown' })
    await input.trigger('keydown', { key: 'Enter' })
    expect(w.emitted('select')![0]).toEqual([suggestions[1]])
    expect(w.emitted('update:modelValue')!.at(-1)).toEqual(['Permesso CE'])
    w.unmount()
  })
  it('Escape closes the list first, then clears the text', async () => {
    const w = make()
    const input = w.find('input')
    await input.trigger('keydown', { key: 'ArrowDown' })
    expect(input.attributes('aria-expanded')).toBe('true')
    await input.trigger('keydown', { key: 'Escape' })
    expect(input.attributes('aria-expanded')).toBe('false')
    expect(input.attributes('aria-activedescendant')).toBeUndefined()
    await input.trigger('keydown', { key: 'Escape' })
    expect(w.emitted('update:modelValue')!.at(-1)).toEqual([''])
    w.unmount()
  })
  it('typing opens the list and emits the value; no suggestions means collapsed', async () => {
    const w = mount(Combobox, { props: { modelValue: '', suggestions: [], label: 'Search' }, global })
    await w.find('input').setValue('pa')
    expect(w.emitted('update:modelValue')![0]).toEqual(['pa'])
    expect(w.find('input').attributes('aria-expanded')).toBe('false')
    await nextTick()
  })
})

describe('document upload pre-validation', () => {
  const f = (name: string, size: number, type: string) => ({ name, size, type })
  it('accepts PDF/JPG/PNG/WEBP within 10 MB', () => {
    for (const [n, t] of [['a.pdf', 'application/pdf'], ['a.jpg', 'image/jpeg'], ['a.png', 'image/png'], ['a.webp', 'image/webp']]) expect(validateUpload(f(n, 1000, t))).toBeNull()
    expect(validateUpload(f('scan.JPEG', 1000, ''))).toBeNull() // empty MIME falls back to the extension
    expect(validateUpload(f('a.pdf', MAX_UPLOAD_BYTES, 'application/pdf'))).toBeNull()
  })
  it('rejects too large, empty and wrong types', () => {
    expect(validateUpload(f('a.pdf', MAX_UPLOAD_BYTES + 1, 'application/pdf'))).toBe('too_large')
    expect(validateUpload(f('a.pdf', 0, 'application/pdf'))).toBe('empty')
    expect(validateUpload(f('a.exe', 10, 'application/x-msdownload'))).toBe('type')
    expect(validateUpload(f('a.pdf', 10, 'application/x-msdownload'))).toBe('type')
    expect(validateUpload(f('a.gif', 10, 'image/gif'))).toBe('type')
    expect(validateUpload(f('noext', 10, ''))).toBe('type')
  })
})

describe('consent_required detection', () => {
  it('matches the API error shape and purpose', () => {
    const e = new ApiError(403, 'consent_required', 'x', { purpose: ['document_storage'] })
    expect(isConsentRequired(e)).toBe(true)
    expect(isConsentRequired(e, 'document_storage')).toBe(true)
    expect(isConsentRequired(e, 'profile_personalization')).toBe(false)
    expect(isConsentRequired(new ApiError(403, 'forbidden', 'x'))).toBe(false)
    expect(isConsentRequired(new Error('x'))).toBe(false)
  })
})
