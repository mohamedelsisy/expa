import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import {
  ADS_DENY_PREFIXES, adsAllowedOnPath, adsConfigured, adsCspSources, adsTxt, adsenseSrc, fundingChoicesSrc,
  isAdFreePlan, isValidClientId, stripLocale, tcfAllowsAds,
} from '../utils/ads'
import { buildCsp } from '../server/utils/security'

describe('ads configuration', () => {
  it('accepts only a well-formed publisher id', () => {
    expect(isValidClientId('ca-pub-1234567890123456')).toBe(true)
    for (const bad of ['', 'pub-1234567890123456', 'ca-pub-12', 'ca-pub-abc', 'ca-pub-1234567890123456"><script>'] as const) expect(isValidClientId(bad)).toBe(false)
  })
  it('is configured only when enabled AND the id is valid', () => {
    expect(adsConfigured({ enabled: true, clientId: 'ca-pub-1234567890123456' })).toBe(true)
    expect(adsConfigured({ enabled: false, clientId: 'ca-pub-1234567890123456' })).toBe(false)
    expect(adsConfigured({ enabled: true, clientId: '' })).toBe(false)
  })
  it('builds ads.txt and refuses an invalid id', () => {
    expect(adsTxt('ca-pub-1234567890123456')).toBe('google.com, pub-1234567890123456, DIRECT, f08c47fec0942fa0\n')
    expect(adsTxt('nope')).toBeNull()
  })
  it('builds script URLs for the publisher', () => {
    expect(adsenseSrc('ca-pub-1234567890123456')).toBe('https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1234567890123456')
    expect(fundingChoicesSrc('ca-pub-1234567890123456')).toBe('https://fundingchoicesmessages.google.com/i/pub-1234567890123456?ers=1')
  })
})

describe('ad-free plans', () => {
  it('paid plans never see ads, free and unknown do not count as ad-free', () => {
    expect(isAdFreePlan('plus', 'plus,pro')).toBe(true)
    expect(isAdFreePlan('PRO', ' plus , pro ')).toBe(true)
    expect(isAdFreePlan('free', 'plus,pro')).toBe(false)
    expect(isAdFreePlan(null, 'plus,pro')).toBe(false)
    expect(isAdFreePlan('plus', '')).toBe(false)
  })
})

describe('where ads may appear', () => {
  it('strips the locale prefix, query and trailing slash', () => {
    expect(stripLocale('/ar/articles/x/?a=1')).toBe('articles/x')
    expect(stripLocale('/it')).toBe('')
    expect(stripLocale('/guides/abc')).toBe('guides/abc')
  })
  it('allows public content pages', () => {
    for (const p of ['/ar/articles/how-to', '/en/guides/permesso', '/it/cities/roma', '/ar/government/questura', '/ar/jobs', '/en/patente/theory']) expect(adsAllowedOnPath(p), p).toBe(true)
  })
  it('never allows account, tool, document, admin or exam pages in any locale', () => {
    for (const d of ADS_DENY_PREFIXES) for (const l of ['ar', 'en', 'it']) {
      expect(adsAllowedOnPath(`/${l}/${d}`), `${l}/${d}`).toBe(false)
      expect(adsAllowedOnPath(`/${l}/${d}/anything`), `${l}/${d}/x`).toBe(false)
    }
  })
  it('does not confuse a prefix with a longer public path', () => {
    expect(adsAllowedOnPath('/en/documentation-guide')).toBe(true)
    expect(adsAllowedOnPath('/en/asking-for-help')).toBe(true)
  })
})

describe('consent signal (TCF)', () => {
  const ok = { eventStatus: 'tcloaded', gdprApplies: true, purpose: { consents: { '1': true } } }
  it('allows ads when purpose 1 is consented', () => expect(tcfAllowsAds(ok)).toBe(true))
  it('allows ads when GDPR does not apply', () => expect(tcfAllowsAds({ eventStatus: 'tcloaded', gdprApplies: false })).toBe(true))
  it('waits for a decision: the message being shown is not consent', () => {
    expect(tcfAllowsAds({ ...ok, eventStatus: 'cmpuishown' })).toBe(false)
    expect(tcfAllowsAds({ ...ok, eventStatus: 'useractioncomplete' })).toBe(true)
  })
  it('refuses on denial, missing purpose or no data', () => {
    expect(tcfAllowsAds({ eventStatus: 'tcloaded', gdprApplies: true, purpose: { consents: { '1': false } } })).toBe(false)
    expect(tcfAllowsAds({ eventStatus: 'tcloaded', gdprApplies: true })).toBe(false)
    expect(tcfAllowsAds(null)).toBe(false)
    expect(tcfAllowsAds(undefined)).toBe(false)
  })
})

describe('content security policy', () => {
  const html = '<html><body><script>window.__NUXT__={}</script></body></html>'
  it('is unchanged (no ad hosts, no frames) when ads are off', () => {
    const csp = buildCsp(html)
    expect(csp).not.toMatch(/googlesyndication|doubleclick|fundingchoices/)
    expect(csp).not.toContain('frame-src')
    expect(csp).toContain("img-src 'self' data:")
  })
  it('allows the ad hosts, and nothing unsafe, when ads are on', () => {
    const csp = buildCsp(html, false, true)
    expect(csp).toMatch(/script-src [^;]*https:\/\/pagead2\.googlesyndication\.com/)
    expect(csp).toMatch(/frame-src [^;]*https:\/\/googleads\.g\.doubleclick\.net/)
    expect(csp).toMatch(/connect-src 'self' [^;]*fundingchoicesmessages/)
    expect(csp).not.toContain("'unsafe-eval'")
    expect(csp).not.toMatch(/script-src[^;]*unsafe-inline/)
    expect(csp).toContain("frame-ancestors 'none'")
    expect(adsCspSources(false).script).toEqual([])
  })
})

describe('placement', () => {
  const read = (p: string) => readFileSync(join(__dirname, '..', p), 'utf8')
  it('ad slots exist only on the public article and guide pages', () => {
    expect(read('pages/articles/[slug].vue')).toContain('<AdsSlot name="article" />')
    expect(read('pages/guides/[slug].vue')).toContain('<AdsSlot name="guide" />')
    for (const p of ['pages/dashboard.vue', 'pages/ask.vue', 'pages/profile.vue', 'pages/pricing.vue', 'layouts/default.vue']) expect(read(p), p).not.toContain('AdsSlot')
  })
  it('the loader never touches an ad domain outside the consent-gated path', () => {
    const plugin = read('plugins/ads.client.ts')
    expect(plugin.indexOf('waitForConsent())')).toBeGreaterThan(-1)
    expect(plugin.indexOf('adsenseSrc(config.value.clientId)')).toBeGreaterThan(plugin.indexOf('await waitForConsent()'))
  })
})
