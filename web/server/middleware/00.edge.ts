import { getCookie, getRequestHeader, getRequestURL, sendRedirect, setResponseHeader, setResponseHeaders } from 'h3'
import { TOKEN_COOKIE } from '../utils/bff'
import { resolveClientIp } from '../utils/clientIp'
import { securityHeaders } from '../utils/security'

/**
 * Edge concerns for every response: client IP resolution (WEB-3), security headers (WEB-2) and cache safety for
 * signed-in HTML (WEB-16). Runs for SSR-internal sub-requests too, which keep the context of the original request.
 */
export default defineEventHandler((event) => {
  const cfg = useRuntimeConfig(event)
  // URL hygiene (WEB-24): /en/guides/ -> /en/guides (308), GET/HEAD only.
  const url = getRequestURL(event)
  if ((event.method === 'GET' || event.method === 'HEAD') && url.pathname.length > 1 && url.pathname.endsWith('/') && !url.pathname.startsWith('/api/')) {
    return sendRedirect(event, url.pathname.replace(/\/+$/, '') + url.search, 308)
  }
  if (!event.context.clientIp) {
    const socket = event.node.req.socket?.remoteAddress
    event.context.clientIp = resolveClientIp(socket, getRequestHeader(event, 'x-forwarded-for'), Number(cfg.trustedProxyHops) || 0)
  }
  setResponseHeaders(event, securityHeaders({ hsts: cfg.security.hsts === true || String(cfg.security.hsts) === 'true' }))
  // Anything that depends on the session must never be stored by a shared cache.
  if (getCookie(event, TOKEN_COOKIE)) {
    setResponseHeader(event, 'cache-control', 'private, no-store')
    setResponseHeader(event, 'vary', 'Cookie, Accept-Language')
  }
})
