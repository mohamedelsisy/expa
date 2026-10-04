import type { H3Event } from 'h3'
import { deleteCookie, getCookie, getHeader, setCookie, setHeader, setResponseStatus } from 'h3'
import { type BffResult, TOKEN_COOKIE, TOKEN_MAX_AGE, type CallOptions } from './bff'

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

export function baseOptions(event: H3Event): Pick<CallOptions, 'fetcher' | 'base' | 'timeoutMs' | 'lang' | 'token'> {
  const { base, timeoutMs } = apiConfig(event)
  return { fetcher: fetch, base, timeoutMs, lang: langOf(event), token: getToken(event) }
}

/** Applies cookie side effects and writes the response. The token never reaches the body. */
export function respond(event: H3Event, result: BffResult) {
  if (result.setToken) {
    setCookie(event, TOKEN_COOKIE, result.setToken, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: TOKEN_MAX_AGE,
    })
  }
  if (result.clearToken) {
    deleteCookie(event, TOKEN_COOKIE, { path: '/', httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production' })
  }
  for (const [k, v] of Object.entries(result.headers)) setHeader(event, k, v)
  setHeader(event, 'cache-control', 'no-store')
  setResponseStatus(event, result.status)
  return result.body ?? ''
}
