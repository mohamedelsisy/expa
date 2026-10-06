/**
 * Resolves the real client IP behind N trusted reverse proxies, each of which appends the address it saw to
 * X-Forwarded-For (nginx `$proxy_add_x_forwarded_for`, Traefik, most CDNs). With `hops = 0` the header is ignored
 * (it is client-controlled) and the socket address is used. With `hops = n` the n-th entry from the right is the
 * client as seen by the outermost trusted proxy; anything the client prepended is ignored.
 */
export function resolveClientIp(socketIp: string | null | undefined, xForwardedFor: string | null | undefined, hops: number): string | null {
  const clean = (v: string | null | undefined) => {
    const t = (v ?? '').trim().replace(/^::ffff:/i, '')
    return /^[0-9A-Fa-f:.]{2,45}$/.test(t) ? t : null
  }
  if (hops > 0 && xForwardedFor) {
    const parts = xForwardedFor.split(',').map(s => s.trim()).filter(Boolean)
    // Fewer entries than trusted hops means the chain is shorter than configured: use the left-most we have.
    const picked = clean(parts[Math.max(0, parts.length - hops)])
    if (picked) return picked
  }
  return clean(socketIp)
}
