/**
 * Maps route targets returned by the API (`my-documents/12`, `learn-italian/daily`, `search?q=…`, notification and
 * AI-action `cta.target`s, search `route`s) to real web paths (without locale prefix; wrap in `localePath`).
 * Pure allow-list: anything unknown, absolute, protocol-relative, traversing or carrying a scheme returns `null`
 * so callers can fall back safely (no open redirects, no `javascript:`).
 */
const SEGMENT = /^[A-Za-z0-9][A-Za-z0-9._~-]*$/
const ID = /^\d{1,12}$/

/** Top-level destinations that exist in the web app as is. */
const SIMPLE = new Set([
  'dashboard', 'tasks', 'profile', 'onboarding', 'privacy-settings', 'notifications', 'ask', 'explore', 'guides',
  'government', 'appointments', 'documents', 'learn-italian', 'patente', 'jobs', 'search', 'pricing', 'cities', 'articles', 'housing',
  'healthcare', 'money', 'business', 'family', 'travel', 'daily-life', 'about',
])

export function mapApiRoute(target: unknown): string | null {
  if (typeof target !== 'string') return null
  const raw = target
  if (!raw || raw.length > 300 || /[\s\\\u0000-\u001f]/.test(raw)) return null
  const [pathPart, query = ''] = raw.replace(/^\/+/, '').split('?', 2) as [string, string?]
  if (raw.startsWith('//') || pathPart === '' ) return null
  const seg = pathPart.split('/')
  if (!seg.every(s => SEGMENT.test(s))) return null // blocks `:`, `..`, empty segments, encoded characters
  const [a, b, c] = seg
  const n = seg.length

  if (a === 'search' && n === 1) {
    const q = new URLSearchParams(query).get('q')
    return q && q.length <= 100 ? `/search?q=${encodeURIComponent(q)}` : '/search'
  }
  if (query) return null // only `search` may carry a query

  if (n === 1) {
    if (a === 'my-documents') return '/documents'
    if (a === 'study') return '/study'
    return SIMPLE.has(a!) ? `/${a}` : null
  }
  if (a === 'my-documents' && n === 2 && ID.test(b!)) return `/documents/${b}`
  if (a === 'guides' && n === 2) return `/guides/${b}`
  if (a === 'government' && b === 'services' && n === 3) return `/government/services/${c}`
  if (a === 'government' && b === 'offices' && n === 3) return `/government/offices/${c}`
  if (a === 'appointments' && b === 'guides' && n === 3) return `/appointments/${c}`
  if (a === 'learn-italian' && b === 'daily' && n === 2) return '/learn-italian'
  if (a === 'learn-italian' && b === 'lessons' && n === 3) return `/learn-italian/lessons/${c}`
  if (a === 'patente' && b === 'topics' && n === 3) return `/patente/topics/${c}`
  if (a === 'patente' && b === 'categories' && n === 3) return '/patente'
  if (a === 'study' && n === 2 && (b === 'finder' || b === 'programs' || b === 'universities' || b === 'scholarships')) return `/study/${b}`
  if (a === 'study' && n === 3 && (b === 'programs' || b === 'universities' || b === 'scholarships')) return `/study/${b}/${c}`
  if (a === 'jobs' && n === 2 && ID.test(b!)) return `/jobs/${b}`
  if (a === 'appointments' && b === 'hub' && n === 2) return '/appointments'
  if (a === 'housing' && b === 'check' && n === 2) return '/housing/check'
  if (a === 'documents' && b === 'explain' && n === 2) return '/documents/explain'
  if (a === 'articles' && n === 2) return `/articles/${b}`
  if (a === 'cities' && n === 2) return `/cities/${b}`
  if (a === 'providers' && n === 2) return `/services/${b}`
  if (a === 'patente' && n === 2 && (b === 'weak-topics')) return '/patente/weak'
  if (a === 'patente' && n === 2 && b === 'glossary') return '/patente/glossary'
  if (a === 'italian' && b === 'practice' && n === 2) return '/learn-italian/practice'
  return null
}

/** Action/CTA object from the API (`{type:'guide'|'route'|…, target}`) to a web path, or null. */
export function mapApiAction(a: { type?: string, target?: string } | null | undefined): string | null {
  if (!a || typeof a.target !== 'string') return null
  if (a.type === 'guide') return SEGMENT.test(a.target) ? `/guides/${a.target}` : null
  if (a.type === 'route') return mapApiRoute(a.target)
  return null
}
