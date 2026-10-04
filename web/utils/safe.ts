/** Only https links from content are ever rendered as hyperlinks. */
export function safeHttpsUrl(url: string | null | undefined): string | null {
  if (!url || !url.startsWith('https://')) return null
  try {
    return new URL(url).toString()
  } catch {
    return null
  }
}

/** Post-login redirect must be an in-app absolute path (no scheme, no `//host`). */
export function safeRedirect(target: unknown, fallback = ''): string {
  if (typeof target !== 'string') return fallback
  if (!target.startsWith('/') || target.startsWith('//') || target.includes('\\')) return fallback
  return target
}

/** JSON for a <script type="application/ld+json"> body: `<` escaped so it can never close the tag. */
export function jsonLd(obj: unknown): string {
  return JSON.stringify(obj).replace(/</g, '\\u003c')
}
