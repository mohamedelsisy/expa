import { createHash } from 'node:crypto'

/** Inline, executable `<script>` bodies (no src, not a JSON data block): these need a CSP hash. */
export function inlineScriptHashes(html: string): string[] {
  const out = new Set<string>()
  const re = /<script([^>]*)>([\s\S]*?)<\/script>/gi
  let m: RegExpExecArray | null
  while ((m = re.exec(html))) {
    const attrs = m[1] ?? ''
    const body = m[2] ?? ''
    if (/\bsrc\s*=/.test(attrs) || !body.trim()) continue
    const type = /\btype\s*=\s*["']?([^"'\s>]+)/i.exec(attrs)?.[1]?.toLowerCase()
    if (type && type !== 'text/javascript' && type !== 'module') continue // JSON / ld+json blocks are data, never executed
    out.add(`'sha256-${createHash('sha256').update(body).digest('base64')}'`)
  }
  return [...out]
}

/**
 * Content-Security-Policy for server-rendered HTML. Scripts: same origin plus the hashes of the inline bootstrap
 * Nuxt emits (no 'unsafe-inline', no eval). Styles allow inline because Vue renders `style` attributes.
 */
export function buildCsp(html: string, upgradeInsecure = false): string {
  const scripts = ["'self'", ...inlineScriptHashes(html)].join(' ')
  return [
    "default-src 'self'",
    `script-src ${scripts}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data:",
    "font-src 'self'",
    "connect-src 'self'",
    "media-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    ...(upgradeInsecure ? ['upgrade-insecure-requests'] : []),
  ].join('; ')
}

export interface StaticHeaderOptions { hsts: boolean }

export function securityHeaders(o: StaticHeaderOptions): Record<string, string> {
  const h: Record<string, string> = {
    'x-content-type-options': 'nosniff',
    'x-frame-options': 'DENY',
    'referrer-policy': 'strict-origin-when-cross-origin',
    'permissions-policy': 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()',
    'cross-origin-opener-policy': 'same-origin',
  }
  if (o.hsts) h['strict-transport-security'] = 'max-age=31536000; includeSubDomains'
  return h
}
