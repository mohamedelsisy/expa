/** Sitemap generation (framework-free; the Nitro routes pass a fetcher). One sitemap per locale plus an index. */
export const SITEMAP_LOCALES = ['ar', 'en', 'it'] as const
export type SitemapLocale = typeof SITEMAP_LOCALES[number]

export interface SitemapEntry { path: string, lastmod?: string | null }

/** Public, indexable pages without data dependencies. Account/admin/auth pages are deliberately absent. */
export const STATIC_PATHS = [
  '/', '/explore', '/guides', '/government', '/appointments', '/learn-italian', '/patente', '/jobs',
  '/study', '/study/universities', '/study/programs', '/study/scholarships', '/study/finder', '/cities', '/pricing',
  '/housing', '/articles', '/services',
  '/healthcare', '/money', '/money/net-salary', '/business', '/family', '/travel', '/travel/requirements', '/daily-life', '/about',
] as const

/** Legal pages join the sitemap only while the API reports them as published. */
export const LEGAL_SLUGS = ['privacy', 'terms', 'cookies'] as const

/** API list endpoint -> public page path. Lists are paged; items carry a `slug`. */
export const DYNAMIC_SOURCES: { api: string, path: (slug: string) => string }[] = [
  { api: 'guides', path: s => `/guides/${s}` },
  { api: 'government/services', path: s => `/government/services/${s}` },
  { api: 'government/offices', path: s => `/government/offices/${s}` },
  { api: 'appointments/guides', path: s => `/appointments/${s}` },
  { api: 'italian/lessons', path: s => `/learn-italian/lessons/${s}` },
  { api: 'patente/topics', path: s => `/patente/topics/${s}` },
  { api: 'study/universities', path: s => `/study/universities/${s}` },
  { api: 'study/programs', path: s => `/study/programs/${s}` },
  { api: 'study/scholarships', path: s => `/study/scholarships/${s}` },
  { api: 'articles', path: s => `/articles/${s}` },
  { api: 'city-profiles', path: s => `/cities/${s}` },
  { api: 'providers', path: s => `/services/${s}` },
]

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;')
const url = (site: string, locale: string, path: string) => `${site}/${locale}${path === '/' ? '' : path}`
const SLUG = /^[A-Za-z0-9._~-]+$/

export function buildSitemap(site: string, locale: SitemapLocale, entries: SitemapEntry[]): string {
  const body = entries.map((e) => {
    const alt = [...SITEMAP_LOCALES.map(l => `<xhtml:link rel="alternate" hreflang="${l}" href="${esc(url(site, l, e.path))}"/>`), `<xhtml:link rel="alternate" hreflang="x-default" href="${esc(url(site, 'ar', e.path))}"/>`].join('')
    const lastmod = e.lastmod && !Number.isNaN(Date.parse(e.lastmod)) ? `<lastmod>${new Date(e.lastmod).toISOString().slice(0, 10)}</lastmod>` : ''
    return `<url><loc>${esc(url(site, locale, e.path))}</loc>${lastmod}${alt}</url>`
  }).join('')
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">${body}</urlset>`
}

export function buildSitemapIndex(site: string): string {
  const body = SITEMAP_LOCALES.map(l => `<sitemap><loc>${esc(`${site}/sitemap-${l}.xml`)}</loc></sitemap>`).join('')
  return `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${body}</sitemapindex>`
}

export type JsonFetcher = (path: string) => Promise<{ status: number, json: unknown } | null>

/** Collects dynamic URLs from the public API. Failures of one source never break the sitemap. */
export async function collectEntries(fetchJson: JsonFetcher, maxPages = 20): Promise<SitemapEntry[]> {
  const entries: SitemapEntry[] = STATIC_PATHS.map(path => ({ path }))
  for (const slug of LEGAL_SLUGS) {
    const r = await fetchJson(`legal/${slug}`).catch(() => null)
    const d = (r?.json as { data?: { published_at?: string } } | null)?.data
    if (r?.status === 200 && d) entries.push({ path: `/${slug}`, lastmod: d.published_at })
  }
  for (const src of DYNAMIC_SOURCES) {
    for (let page = 1; page <= maxPages; page++) {
      const r = await fetchJson(`${src.api}?per_page=50&page=${page}`).catch(() => null)
      const j = r?.json as { data?: { slug?: unknown, updated_at?: string | null }[], meta?: { last_page?: number } } | null
      if (!r || r.status !== 200 || !Array.isArray(j?.data)) break
      for (const item of j.data) if (typeof item.slug === 'string' && SLUG.test(item.slug)) entries.push({ path: src.path(item.slug), lastmod: item.updated_at })
      if (page >= (j.meta?.last_page ?? 1)) break
    }
  }
  return entries
}
