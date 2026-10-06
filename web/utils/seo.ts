/** Query parameters that legitimately change page content and therefore belong in the canonical URL. */
const CANONICAL_PARAMS = ['page']

/**
 * Canonical path: strips the query string and hash except for the content-defining `page` parameter (page 1 is the bare
 * path). Filter/search/utm variants therefore all canonicalise to the same URL.
 */
export function canonicalPath(path: string): string {
  const [base = '', rest = ''] = path.split('#')[0]!.split('?', 2) as [string, string?]
  const params = new URLSearchParams(rest)
  const keep = new URLSearchParams()
  for (const k of CANONICAL_PARAMS) {
    const v = params.get(k)
    if (v && !(k === 'page' && (v === '1' || !/^\d+$/.test(v)))) keep.set(k, v)
  }
  const q = keep.toString()
  const clean = base.length > 1 ? base.replace(/\/+$/, '') : base
  return q ? `${clean}?${q}` : clean
}

/** Does the URL carry query parameters that make it a filtered/search variant (to be `noindex,follow`)? */
export function isFilteredVariant(path: string): boolean {
  const [, rest = ''] = path.split('?', 2) as [string, string?]
  const params = new URLSearchParams(rest)
  for (const k of params.keys()) if (!CANONICAL_PARAMS.includes(k) && !k.startsWith('utm_')) return true
  return false
}

const OG_LOCALE: Record<string, string> = { ar: 'ar_AR', en: 'en_GB', it: 'it_IT' }
export const ogLocale = (code: string): string => OG_LOCALE[code] ?? code
export const ogLocaleAlternates = (code: string): string[] => Object.keys(OG_LOCALE).filter(c => c !== code).map(ogLocale)

export interface Crumb { name: string, url?: string }
/** schema.org BreadcrumbList; the last crumb may omit `url` (current page). */
export function breadcrumbLd(items: Crumb[], currentUrl: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((c, i) => ({ '@type': 'ListItem', position: i + 1, name: c.name, item: c.url ?? currentUrl })),
  }
}

export const DEFAULT_OG_IMAGE = '/og-image.png'
export const ogImageFor = (image?: string): string => image ?? DEFAULT_OG_IMAGE
