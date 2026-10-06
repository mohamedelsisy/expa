import { describe, expect, it, vi } from 'vitest'
import { runtimeConfigProblems } from '../server/utils/runtimeCheck'
import { resolveClientIp } from '../server/utils/clientIp'
import { buildCsp, inlineScriptHashes, securityHeaders } from '../server/utils/security'
import { buildSitemap, buildSitemapIndex, collectEntries } from '../server/utils/sitemap'
import { forwardRequest, originAllowed } from '../server/utils/bff'
import { breadcrumbLd, canonicalPath, isFilteredVariant, ogLocale } from '../utils/seo'
import { normalizeLegal, parseInline, parseMarkdown } from '../utils/legal'
import { formatMoney, formatSalary } from '../utils/money'
import { formatBytes } from '../utils/documents'

describe('WEB-1 runtime config check', () => {
  const ok = { apiBaseUrl: 'http://nginx/api/v1', siteUrl: 'https://expa.example', production: true, allowLocal: false }
  it('accepts real origins', () => expect(runtimeConfigProblems(ok)).toEqual([]))
  it('rejects empty values and names the NUXT_ variable', () => {
    const p = runtimeConfigProblems({ ...ok, apiBaseUrl: '', siteUrl: '' })
    expect(p.join(' ')).toContain('NUXT_API_BASE_URL')
    expect(p.join(' ')).toContain('NUXT_PUBLIC_SITE_URL')
  })
  it('rejects localhost unless explicitly allowed', () => {
    expect(runtimeConfigProblems({ ...ok, siteUrl: 'http://localhost:3000' })).toHaveLength(1)
    expect(runtimeConfigProblems({ ...ok, siteUrl: 'http://127.0.0.1:3000' })).toHaveLength(1)
    expect(runtimeConfigProblems({ ...ok, siteUrl: 'http://localhost:3000', allowLocal: true })).toEqual([])
  })
  it('does nothing outside production', () => expect(runtimeConfigProblems({ ...ok, apiBaseUrl: '', production: false })).toEqual([]))
})

describe('WEB-3 client IP', () => {
  it('ignores X-Forwarded-For without trusted hops (spoofable)', () => expect(resolveClientIp('10.0.0.9', '6.6.6.6', 0)).toBe('10.0.0.9'))
  it('takes the entry added by the trusted proxy, not what the client prepended', () => expect(resolveClientIp('10.0.0.1', '6.6.6.6, 203.0.113.7', 1)).toBe('203.0.113.7'))
  it('supports two proxies', () => expect(resolveClientIp('10.0.0.1', '203.0.113.7, 172.16.0.2', 2)).toBe('203.0.113.7'))
  it('strips the ipv4-mapped prefix and rejects garbage', () => {
    expect(resolveClientIp('::ffff:192.0.2.1', null, 0)).toBe('192.0.2.1')
    expect(resolveClientIp('x y', '<script>', 1)).toBeNull()
  })
  it('forwards the client IP upstream as X-Forwarded-For (two clients, two values)', async () => {
    const seen: string[] = []
    const fetcher = vi.fn(async (_u: string, init: RequestInit) => { seen.push((init.headers as Record<string, string>)['X-Forwarded-For'] ?? ''); return new Response('{}', { status: 200 }) })
    await forwardRequest({ fetcher, base: 'http://api/v1', method: 'GET', path: 'guides', clientIp: '198.51.100.1' })
    await forwardRequest({ fetcher, base: 'http://api/v1', method: 'GET', path: 'guides', clientIp: '198.51.100.2' })
    expect(seen).toEqual(['198.51.100.1', '198.51.100.2'])
  })
})

describe('WEB-2 security headers and CSP', () => {
  const html = '<script>window.__NUXT__={}</script><script type="application/json" id="__NUXT_DATA__">[1]</script><script type="application/ld+json">{}</script><script src="/_nuxt/a.js"></script>'
  it('hashes only executable inline scripts', () => expect(inlineScriptHashes(html)).toHaveLength(1))
  it('builds a strict policy', () => {
    const csp = buildCsp(html)
    expect(csp).toContain("frame-ancestors 'none'")
    expect(csp).toContain("object-src 'none'")
    expect(csp).toMatch(/script-src 'self' 'sha256-[A-Za-z0-9+/=]+'/)
    expect(csp).not.toContain("'unsafe-eval'")
    expect(csp).not.toMatch(/script-src[^;]*unsafe-inline/)
    expect(csp).not.toContain('upgrade-insecure-requests')
    expect(buildCsp(html, true)).toContain('upgrade-insecure-requests')
  })
  it('sets HSTS only when configured', () => {
    expect(securityHeaders({ hsts: false })['strict-transport-security']).toBeUndefined()
    expect(securityHeaders({ hsts: true })['strict-transport-security']).toContain('max-age=')
    expect(securityHeaders({ hsts: false })['x-content-type-options']).toBe('nosniff')
  })
})

describe('WEB-17 origin check behind a proxy', () => {
  it('accepts a rewritten Host when X-Forwarded-Host matches', () => expect(originAllowed('https://expa.example', 'web:3000', { forwardedHost: 'expa.example' })).toBe(true))
  it('rejects other origins and cross-site fetches', () => {
    expect(originAllowed('https://evil.example', 'expa.example')).toBe(false)
    expect(originAllowed('https://expa.example', 'expa.example', { fetchSite: 'cross-site' })).toBe(false)
  })
})

describe('WEB-4 sitemap', () => {
  it('lists three locales with alternates and escapes', () => {
    const xml = buildSitemap('https://x.test', 'it', [{ path: '/', lastmod: '2026-01-02T00:00:00Z' }, { path: '/guides/a&b' }])
    expect(xml).toContain('<loc>https://x.test/it</loc>')
    expect(xml).toContain('hreflang="ar" href="https://x.test/ar"')
    expect(xml).toContain('hreflang="x-default"')
    expect(xml).toContain('<lastmod>2026-01-02</lastmod>')
    expect(xml).toContain('a&amp;b')
    expect(buildSitemapIndex('https://x.test')).toContain('https://x.test/sitemap-en.xml')
  })
  it('collects dynamic slugs, skips bad ones, includes legal pages only when published', async () => {
    const fetchJson = vi.fn(async (path: string) => {
      if (path.startsWith('legal/privacy')) return { status: 200, json: { data: { published_at: '2026-01-01' } } }
      if (path.startsWith('legal/')) return { status: 404, json: null }
      if (path.startsWith('guides?')) return { status: 200, json: { data: [{ slug: 'permesso' }, { slug: '../x' }], meta: { last_page: 1 } } }
      return { status: 500, json: null }
    })
    const e = await collectEntries(fetchJson)
    const paths = e.map(x => x.path)
    expect(paths).toContain('/guides/permesso')
    expect(paths).not.toContain('/guides/../x')
    expect(paths).toContain('/privacy')
    expect(paths).not.toContain('/terms')
    expect(paths).toContain('/study/finder')
  })
})

describe('WEB-6/9/23 SEO helpers', () => {
  it('canonical drops query strings except page > 1', () => {
    expect(canonicalPath('/ar/guides?q=abc&utm_x=1')).toBe('/ar/guides')
    expect(canonicalPath('/en/jobs?page=2&category=x')).toBe('/en/jobs?page=2')
    expect(canonicalPath('/en/jobs?page=1')).toBe('/en/jobs')
    expect(canonicalPath('/en/guides/')).toBe('/en/guides')
  })
  it('flags filtered variants but not utm or page', () => {
    expect(isFilteredVariant('/ar/guides?q=a')).toBe(true)
    expect(isFilteredVariant('/ar/guides?page=2&utm_source=x')).toBe(false)
  })
  it('uses proper og locales and builds breadcrumb JSON-LD', () => {
    expect(ogLocale('ar')).toBe('ar_AR')
    const ld = breadcrumbLd([{ name: 'Home', url: 'https://x/ar' }, { name: 'Guides' }], 'https://x/ar/guides')
    expect(ld.itemListElement[1]).toMatchObject({ position: 2, item: 'https://x/ar/guides' })
  })
})

describe('WEB-5 legal documents', () => {
  it('returns null for missing/empty documents (honest unpublished state)', () => {
    expect(normalizeLegal(null)).toBeNull()
    expect(normalizeLegal({ title: 'x', body: '' })).toBeNull()
  })
  it('parses markdown into safe blocks', () => {
    const d = normalizeLegal({ slug: 'privacy', title: 'P', version: '2', published_at: '2026-01-01', body: '# A\n\ntext **b** [l](https://e.it)\n\n- one\n- two' })!
    expect(d.version).toBe('2')
    expect(d.blocks.map(b => b.type)).toEqual(['h', 'p', 'ul'])
    expect(parseMarkdown('# T')[0]).toMatchObject({ level: 2 })
  })
  it('only allows https/mailto links', () => {
    expect(parseInline('[x](javascript:alert(1))').every(n => n.t === 'text')).toBe(true)
    expect(parseInline('[x](https://a.it)')[0]).toMatchObject({ t: 'link' })
  })
  it('accepts structured blocks', () => {
    expect(normalizeLegal({ title: 'T', body: [{ type: 'heading', level: 2, text: 'H' }, { type: 'list', items: ['a'] }] })!.blocks).toHaveLength(2)
  })
})

describe('WEB-27/28 formatting', () => {
  it('formats salary with currency and translated period', () => {
    const s = formatSalary({ min: 30000, max: 40000, currency: 'EUR', period: 'year' }, 'en', p => `per-${p}`)!
    expect(s).toContain('€30,000')
    expect(s).toContain('per-year')
    expect(formatSalary(null, 'en', p => p)).toBeNull()
  })
  it('falls back for unknown currency codes', () => expect(formatMoney(5, 'XYZ1', 'en')).toContain('5'))
  it('formats bytes per locale', () => {
    expect(formatBytes(1536 * 1024, 'it')).toContain('1,5')
    expect(formatBytes(10, 'en')).toMatch(/10/)
  })
})
