import { describe, expect, it, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h, nextTick } from 'vue'
import { NuxtLinkStub } from './stubs/nuxt-link'
import { testLocale } from './stubs/imports'
import FormField from '../components/ui/FormField.vue'
import TextInput from '../components/ui/TextInput.vue'
import SourceBadge from '../components/ui/SourceBadge.vue'
import FreshnessIndicator from '../components/ui/FreshnessIndicator.vue'
import LanguageSwitcher from '../components/ui/LanguageSwitcher.vue'
import ScoreRing from '../components/ui/ScoreRing.vue'
import GuideSource from '../components/guide/GuideSource.vue'
import AutoItalian, { splitItalian } from '../components/ui/AutoItalian.vue'
import Alert from '../components/ui/Alert.vue'
import { localeDir } from '../utils/locale'
import { safeHttpsUrl, safeRedirect, jsonLd } from '../utils/safe'
import { fieldErrors, toApiError, ApiError } from '../utils/errors'

const global = { stubs: { NuxtLink: NuxtLinkStub } }
beforeEach(() => { testLocale.value = 'ar' })

describe('FormField error wiring', () => {
  it('links label, hint, error and invalid state to the input', () => {
    const w = mount(FormField, { props: { label: 'Email', hint: 'We never share it', error: 'Invalid email', required: true }, slots: { default: () => h(TextInput, { modelValue: '' }) }, global })
    const input = w.find('input')
    const label = w.find('label')
    expect(label.attributes('for')).toBe(input.attributes('id'))
    expect(input.attributes('aria-invalid')).toBe('true')
    const ids = input.attributes('aria-describedby')!.split(' ')
    expect(ids).toHaveLength(2)
    expect(w.find(`#${ids[1]}`).text()).toContain('Invalid email')
    expect(w.find(`#${ids[1]}`).attributes('role')).toBe('alert')
    expect(w.find(`#${ids[0]}`).text()).toContain('never share')
  })
  it('has no aria-invalid without an error', () => {
    const w = mount(FormField, { props: { label: 'Name' }, slots: { default: () => h(TextInput, { modelValue: '' }) }, global })
    expect(w.find('input').attributes('aria-invalid')).toBeUndefined()
    expect(w.find('input').attributes('aria-describedby')).toBeUndefined()
  })
})

describe('SourceBadge', () => {
  it.each(['official', 'institutional', 'verified_partner', 'third_party'] as const)('renders %s', (t) => {
    const w = mount(SourceBadge, { props: { type: t } })
    expect(w.attributes('data-source-type')).toBe(t)
    expect(w.text().length).toBeGreaterThan(0)
  })
})

describe('FreshnessIndicator', () => {
  it('shows no warning when fresh', () => {
    const w = mount(FreshnessIndicator, { props: { lastVerifiedAt: '2026-09-01', freshness: 'fresh' } })
    expect(w.find('[data-testid=freshness-warning]').exists()).toBe(false)
    expect(w.find('time').attributes('datetime')).toBe('2026-09-01')
  })
  it.each(['stale', 'outdated', 'unverified'] as const)('shows a visible warning when %s', (f) => {
    const w = mount(FreshnessIndicator, { props: { lastVerifiedAt: f === 'unverified' ? null : '2025-01-01', freshness: f } })
    expect(w.find('[data-testid=freshness-warning]').text()).toContain(`${f} warning`)
  })
})

describe('GuideSource', () => {
  const base = { name: 'Agenzia X', type: 'official' as const, last_verified_at: '2026-01-01', freshness: 'fresh' as const }
  it('renders https link with noopener noreferrer in a new tab', () => {
    const w = mount(GuideSource, { props: { source: { ...base, url: 'https://www.example.it/p' } }, global })
    const a = w.find('[data-testid=source-link]')
    expect(a.attributes('href')).toBe('https://www.example.it/p')
    expect(a.attributes('target')).toBe('_blank')
    expect(a.attributes('rel')).toBe('noopener noreferrer')
  })
  it.each(['http://example.it', 'javascript:alert(1)', 'ftp://x', '', null])('never links %s', (url) => {
    const w = mount(GuideSource, { props: { source: { ...base, url: url as string | null } }, global })
    expect(w.find('[data-testid=source-link]').exists()).toBe(false)
    expect(w.find('[data-testid=source-name]').text()).toBe('Agenzia X')
  })
})

describe('LanguageSwitcher and direction', () => {
  it('lists all locales with lang/dir and marks the current one', () => {
    const w = mount(LanguageSwitcher, { global })
    const links = w.findAll('a')
    expect(links.map(l => l.attributes('lang'))).toEqual(['ar', 'en', 'it'])
    expect(links.map(l => l.attributes('dir'))).toEqual(['rtl', 'ltr', 'ltr'])
    expect(links[0].attributes('aria-current')).toBe('true')
  })
  it('updates the current marker when locale changes', async () => {
    const w = mount(LanguageSwitcher, { global })
    testLocale.value = 'en'
    await nextTick()
    expect(w.findAll('a')[1].attributes('aria-current')).toBe('true')
    expect(w.findAll('a')[0].attributes('aria-current')).toBeUndefined()
  })
  it('emits switch', async () => {
    const w = mount(LanguageSwitcher, { global })
    await w.findAll('a')[2].trigger('click')
    expect(w.emitted('switch')![0]).toEqual(['it'])
  })
  it('localeDir: rtl for ar, ltr for en/it', () => {
    expect(localeDir('ar')).toBe('rtl')
    expect(localeDir('en')).toBe('ltr')
    expect(localeDir('it')).toBe('ltr')
  })
})

describe('ScoreRing a11y', () => {
  it('exposes a text alternative with label and value', () => {
    const w = mount(ScoreRing, { props: { value: 64, label: 'Overall progress' } })
    expect(w.attributes('role')).toBe('img')
    expect(w.attributes('aria-label')).toBe('Overall progress: 64 percent')
  })
  it('handles null (not enough data) and clamps', () => {
    expect(mount(ScoreRing, { props: { value: null, label: 'x' } }).attributes('aria-label')).toBe('Not enough data')
    expect(mount(ScoreRing, { props: { value: 150, label: 'x' } }).attributes('aria-label')).toBe('x: 100 percent')
  })
})

describe('Italian terms', () => {
  it('splits Latin parentheticals', () => {
    expect(splitItalian('الرقم الضريبي (Codice Fiscale)')).toEqual([{ text: 'الرقم الضريبي ', term: false }, { text: '(Codice Fiscale)', term: true }])
  })
  it('wraps in lang=it dir=ltr in Arabic only', () => {
    const w = mount(AutoItalian, { props: { text: 'تصريح (Permesso di soggiorno)' } })
    const span = w.find('span[lang=it]')
    expect(span.attributes('dir')).toBe('ltr')
    testLocale.value = 'en'
    const w2 = mount(AutoItalian, { props: { text: 'Tax code (Codice Fiscale)' } })
    expect(w2.find('[lang=it]').exists()).toBe(false)
  })
})

describe('Alert roles', () => {
  it('danger is role=alert, info is status', () => {
    expect(mount(Alert, { props: { tone: 'danger' } }).attributes('role')).toBe('alert')
    expect(mount(Alert, { props: { tone: 'info' } }).attributes('role')).toBe('status')
  })
})

describe('utils', () => {
  it('safeHttpsUrl only accepts https', () => {
    expect(safeHttpsUrl('https://a.it/x')).toBe('https://a.it/x')
    expect(safeHttpsUrl('http://a.it')).toBeNull()
    expect(safeHttpsUrl('https://')).toBeNull()
  })
  it('safeRedirect rejects open redirects', () => {
    expect(safeRedirect('/ar/dashboard', '/x')).toBe('/ar/dashboard')
    expect(safeRedirect('//evil.com', '/x')).toBe('/x')
    expect(safeRedirect('https://evil.com', '/x')).toBe('/x')
    expect(safeRedirect('/\\evil.com', '/x')).toBe('/x')
  })
  it('jsonLd escapes < so it cannot close the script tag', () => {
    expect(jsonLd({ a: '</script><b>' })).not.toContain('<')
  })
  it('maps 422 details to fields and normalizes failures', () => {
    const e = new ApiError(422, 'validation_failed', 'bad', { email: ['Taken'], 'consents.terms': ['No'] })
    expect(fieldErrors(e)).toEqual({ email: 'Taken', 'consents.terms': 'No' })
    const m = { network: 'net', timeout: 'to', generic: 'gen' }
    expect(toApiError({ name: 'FetchError' }, m).code).toBe('network')
    expect(toApiError({ name: 'TimeoutError' }, m).code).toBe('timeout')
    expect(toApiError({ response: { status: 429 }, data: { error: { code: 'too_many_requests', message: 'Slow down' } } }, m)).toMatchObject({ status: 429, message: 'Slow down' })
    expect(toApiError({ response: { status: 502 }, data: { error: { code: 'upstream_unavailable', message: 'x' } } }, m).code).toBe('network')
  })
})
