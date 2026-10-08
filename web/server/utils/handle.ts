import type { H3Event } from 'h3'
import { deleteCookie, getCookie, getHeader, getRequestHeader, setCookie, setHeader, setResponseStatus } from 'h3'
import { type BffResult, originAllowed, CHALLENGE_COOKIE, TOKEN_COOKIE, TOKEN_MAX_AGE, type CallOptions } from './bff'

/** First-party cookie set by the analytics consent banner (`granted` | `denied`). Readable by the BFF so SSR requests carry the consent header too. */
export const ANALYTICS_COOKIE = 'expa_analytics' // keep in sync with utils/analytics.ts

export function getChallengeToken(event: H3Event): string | null {
  return getCookie(event, CHALLENGE_COOKIE) || null
}

export function getToken(event: H3Event): string | null {
  return getCookie(event, TOKEN_COOKIE) || null
}

export function apiConfig(event: H3Event) {
  const cfg = useRuntimeConfig(event)
  return { base: cfg.apiBaseUrl as string, timeoutMs: cfg.apiTimeoutMs as number }
}

export function langOf(event: H3Event): string | null {
  return getHeader(event, 'accept-language') || null
}

export function baseOptions(event: H3Event): Pick<CallOptions, 'fetcher' | 'base' | 'timeoutMs' | 'lang' | 'token' | 'clientIp' | 'analyticsConsent'> {
  const { base, timeoutMs } = apiConfig(event)
  return { fetcher: fetch, base, timeoutMs, lang: langOf(event), token: getToken(event), clientIp: (event.context.clientIp as string | null | undefined) ?? null, analyticsConsent: getCookie(event, ANALYTICS_COOKIE) === 'granted' }
}

/** Same-origin check for mutating BFF calls (Host or X-Forwarded-Host must match Origin; cross-site fetches are refused). */
export function sameOrigin(event: H3Event): boolean {
  return originAllowed(getHeader(event, 'origin'), getHeader(event, 'host'), {
    forwardedHost: getRequestHeader(event, 'x-forwarded-host'),
    fetchSite: getRequestHeader(event, 'sec-fetch-site'),
  })
}

/** Secure cookie flag: explicit config wins; 'auto' means production builds or an https edge (X-Forwarded-Proto). */
export function cookieSecure(event: H3Event): boolean {
  const mode = String(useRuntimeConfig(event).cookieSecure ?? 'auto')
  if (mode === 'true') return true
  if (mode === 'false') return false
  return process.env.NODE_ENV === 'production' || getRequestHeader(event, 'x-forwarded-proto')?.split(',')[0]?.trim() === 'https'
}

/** Applies cookie side effects and writes the response. The token never reaches the body. */
export function respond(event: H3Event, result: BffResult) {
  if (result.setToken) {
    setCookie(event, TOKEN_COOKIE, result.setToken, {
      httpOnly: true,
      sameSite: 'lax',
      secure: cookieSecure(event),
      path: '/',
      maxAge: TOKEN_MAX_AGE,
    })
  }
  const challengeCookie = { httpOnly: true, sameSite: 'lax' as const, secure: cookieSecure(event), path: '/api/auth' }
  if (result.setChallenge) setCookie(event, CHALLENGE_COOKIE, result.setChallenge.token, { ...challengeCookie, maxAge: result.setChallenge.maxAge })
  if (result.clearChallenge) deleteCookie(event, CHALLENGE_COOKIE, challengeCookie)
  if (result.clearToken) {
    deleteCookie(event, TOKEN_COOKIE, { path: '/', httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production' })
  }
  for (const [k, v] of Object.entries(result.headers)) setHeader(event, k, v)
  setHeader(event, 'cache-control', 'no-store')
  setResponseStatus(event, result.status)
  return result.stream ?? result.body ?? ''
}
