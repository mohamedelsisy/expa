/**
 * BFF core: framework-free so it can be unit-tested with a mocked fetch.
 * The Sanctum token only ever exists here and in an httpOnly cookie, never in a response body.
 */
export type Fetcher = (url: string, init: RequestInit) => Promise<Response>

export const TOKEN_COOKIE = 'expa_token'
export const TOKEN_MAX_AGE = 60 * 60 * 24 * 30

export interface BffResult {
  status: number
  body: unknown
  headers: Record<string, string>
  /** Set the auth cookie to this token. */
  setToken?: string
  /** Clear the auth cookie. */
  clearToken?: boolean
  /** Binary upstream body (attachment download), streamed through untouched. Only set for allow-listed paths. */
  stream?: ReadableStream<Uint8Array> | null
}

export interface CallOptions {
  fetcher: Fetcher
  base: string
  method: string
  /** Path below the API base, e.g. `profile/consents`. */
  path: string
  search?: string
  body?: string | null
  /** Multipart upload bytes, forwarded unchanged. Only accepted on the attachment upload path. */
  rawBody?: Uint8Array | null
  /** Original Content-Type of `rawBody` (carries the multipart boundary). */
  contentType?: string | null
  token?: string | null
  lang?: string | null
  /** Real client IP (resolved from the trusted proxy chain); forwarded as X-Forwarded-For so API rate limits are per client. */
  clientIp?: string | null
  /** The visitor accepted anonymous usage statistics (first-party cookie). Forwarded as `X-Analytics-Consent: granted`. */
  analyticsConsent?: boolean
  timeoutMs?: number
}

const ALLOWED_METHODS = new Set(['GET', 'POST', 'PUT', 'PATCH', 'DELETE'])
const SEGMENT = /^[A-Za-z0-9._~-]+$/
/** Handled by dedicated routes (they set/clear the cookie and never return a token). */
const BLOCKED_PREFIXES = ['auth/login', 'auth/register', 'auth/logout', 'auth/verify-email']
const MAX_BODY = 1_000_000
/** 10 MB file limit (the API stays the authority) plus multipart framing. */
export const MAX_UPLOAD = 11 * 1024 * 1024
/** Multipart is accepted on exactly these POST paths: tracked-document attachments, the document explainer and provider verification evidence. */
const UPLOAD_PATH = /^(?:my-documents\/\d+\/attachments|documents\/explain|provider\/verification\/documents)$/
/** GET paths whose binary response is streamed through: own attachments and (admin) provider verification evidence. */
const DOWNLOAD_PATH = /^(?:my-documents\/\d+\/attachments\/\d+|admin\/marketplace\/providers\/\d+\/evidence\/\d+)$/
const BINARY_HEADERS = ['content-type', 'content-disposition', 'content-length', 'x-content-type-options', 'content-security-policy']

export const isUploadPath = (path: string) => UPLOAD_PATH.test(path)
export const isDownloadPath = (path: string) => DOWNLOAD_PATH.test(path)

export function errorResult(status: number, code: string, message: string): BffResult {
  return { status, body: { error: { code, message } }, headers: {} }
}

export function normalizeBase(base: string): string {
  return base.replace(/\/+$/, '')
}

/** Validates a proxied path: plain segments only (no traversal, no encoded slashes, no empty parts). */
export function safePath(path: string): string | null {
  const segs = path.split('/')
  if (!segs.length || segs.some(s => s === '' || s === '.' || s === '..' || !SEGMENT.test(s))) return null
  return segs.join('/')
}

export function isBlockedPath(path: string): boolean {
  return BLOCKED_PREFIXES.some(p => path === p || path.startsWith(`${p}/`))
}

/** CSRF defence in depth on top of SameSite=Lax: a present Origin must match the Host. */
export function originAllowed(origin: string | null | undefined, host: string | null | undefined, opts: { forwardedHost?: string | null, fetchSite?: string | null } = {}): boolean {
  if (opts.fetchSite === 'cross-site') return false
  if (!origin) return true
  try {
    const o = new URL(origin).host
    // Behind a proxy the Host header may be rewritten; X-Forwarded-Host (first value) is accepted as well.
    const fwd = opts.forwardedHost?.split(',')[0]?.trim()
    return (!!host && o === host) || (!!fwd && o === fwd)
  } catch {
    return false
  }
}

/** Login/register bodies are tiny; refuse anything bigger before parsing. */
export const MAX_AUTH_BODY = 16_000

async function readBody(res: Response): Promise<unknown> {
  if (res.status === 204) return null
  const text = await res.text()
  if (!text) return null
  try {
    return JSON.parse(text)
  } catch {
    return null
  }
}

function passthroughHeaders(res: Response): Record<string, string> {
  const out: Record<string, string> = {}
  const retry = res.headers.get('retry-after')
  if (retry) out['retry-after'] = retry
  return out
}

async function send(opts: CallOptions, url: string, extra: RequestInit = {}): Promise<{ res: Response } | { fail: BffResult }> {
  const headers: Record<string, string> = { Accept: 'application/json', 'X-Client': 'web' }
  if (opts.analyticsConsent) headers['X-Analytics-Consent'] = 'granted'
  if (opts.lang) headers['Accept-Language'] = opts.lang
  if (opts.token) headers.Authorization = `Bearer ${opts.token}`
  if (opts.clientIp) headers['X-Forwarded-For'] = opts.clientIp
  if (opts.rawBody && opts.contentType) headers['Content-Type'] = opts.contentType
  else if (opts.body) headers['Content-Type'] = 'application/json'
  try {
    const res = await opts.fetcher(url, {
      method: opts.method,
      headers,
      body: (opts.rawBody ?? (opts.body || undefined)) as BodyInit | undefined,
      redirect: 'manual',
      signal: AbortSignal.timeout(opts.rawBody ? Math.max(opts.timeoutMs ?? 10000, 30000) : (opts.timeoutMs ?? 10000)),
      ...extra,
    })
    return { res }
  } catch (e) {
    const name = (e as { name?: string })?.name
    if (name === 'TimeoutError' || name === 'AbortError') return { fail: errorResult(504, 'upstream_timeout', 'The service took too long to respond.') }
    return { fail: errorResult(502, 'upstream_unavailable', 'The service is unreachable.') }
  }
}

/** Generic authenticated forward. 401 with a token clears the cookie. */
export async function forwardRequest(opts: CallOptions): Promise<BffResult> {
  const method = opts.method.toUpperCase()
  if (!ALLOWED_METHODS.has(method)) return errorResult(405, 'method_not_allowed', 'Method not allowed.')
  const path = safePath(opts.path)
  if (!path) return errorResult(400, 'bad_request', 'Invalid path.')
  if (isBlockedPath(path)) return errorResult(404, 'not_found', 'Not found.')
  if (opts.body && opts.body.length > MAX_BODY) return errorResult(413, 'payload_too_large', 'Payload too large.')
  if (opts.rawBody) {
    // Multipart is accepted on exactly one route; everything else must be JSON.
    if (method !== 'POST' || !isUploadPath(path) || !/^multipart\/form-data;\s*boundary=/i.test(opts.contentType ?? '')) {
      return errorResult(415, 'unsupported_media_type', 'Unsupported content type.')
    }
    if (opts.rawBody.byteLength > MAX_UPLOAD) return errorResult(413, 'payload_too_large', 'Payload too large.')
  }

  const url = `${normalizeBase(opts.base)}/${path}${opts.search ? (opts.search.startsWith('?') ? opts.search : `?${opts.search}`) : ''}`
  const sent = await send({ ...opts, method }, url)
  if ('fail' in sent) return sent.fail
  const { res } = sent
  // Attachment download: stream the (non-JSON) bytes through with the safety headers the API set.
  const type = res.headers.get('content-type') ?? ''
  if (method === 'GET' && isDownloadPath(path) && res.ok && res.body && !/json/i.test(type)) {
    const headers: Record<string, string> = {}
    for (const h of BINARY_HEADERS) {
      const v = res.headers.get(h)
      if (v) headers[h] = v
    }
    return { status: res.status, body: null, headers, stream: res.body }
  }
  const body = await readBody(res)
  const result: BffResult = { status: res.status, body, headers: passthroughHeaders(res) }
  if (res.status === 401 && opts.token) result.clearToken = true
  return result
}

async function authenticate(opts: CallOptions, path: 'auth/login' | 'auth/register'): Promise<BffResult> {
  let payload: Record<string, unknown>
  try {
    payload = JSON.parse(opts.body || '{}')
  } catch {
    return errorResult(400, 'bad_request', 'Invalid JSON.')
  }
  const body = JSON.stringify({ ...payload, device_name: 'web' })
  const sent = await send({ ...opts, method: 'POST', body, token: null }, `${normalizeBase(opts.base)}/${path}`)
  if ('fail' in sent) return sent.fail
  const { res } = sent
  const json = (await readBody(res)) as { data?: { user?: unknown, token?: string }, meta?: unknown } | null
  const token = json?.data?.token
  if (res.ok && typeof token === 'string' && token) {
    // The raw token is deliberately dropped from the response; it travels only in the httpOnly cookie.
    return { status: res.status, body: { data: { user: json?.data?.user }, meta: json?.meta ?? {} }, headers: {}, setToken: token }
  }
  if (res.ok) return errorResult(502, 'upstream_unavailable', 'Unexpected response from the service.')
  return { status: res.status, body: json, headers: passthroughHeaders(res) }
}
export const login = (o: CallOptions) => authenticate(o, 'auth/login')
export const register = (o: CallOptions) => authenticate(o, 'auth/register')

/** Revokes the token upstream (best effort) and always clears the cookie. */
export async function logout(opts: Omit<CallOptions, 'path' | 'method' | 'body'>): Promise<BffResult> {
  if (opts.token) {
    await send({ ...opts, method: 'POST', path: 'auth/logout', body: null }, `${normalizeBase(opts.base)}/auth/logout`)
  }
  return { status: 204, body: null, headers: {}, clearToken: true }
}

/**
 * The verification link in the email is a full signed API URL. We only follow it if it points at the
 * configured API (same origin, exact path shape), which prevents SSRF and open redirects.
 */
export function isAllowedVerifyUrl(candidate: string, base: string): boolean {
  let u: URL
  let b: URL
  try {
    u = new URL(candidate)
    b = new URL(normalizeBase(base))
  } catch {
    return false
  }
  if (u.protocol !== b.protocol || u.host !== b.host || u.username || u.password) return false
  const basePath = b.pathname.replace(/\/+$/, '')
  const re = new RegExp(`^${basePath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}/auth/verify-email/\\d+/[A-Fa-f0-9]{40}$`)
  return re.test(u.pathname)
}

export async function verifyEmail(opts: Omit<CallOptions, 'path' | 'method' | 'body' | 'token'> & { url: string }): Promise<BffResult> {
  if (!isAllowedVerifyUrl(opts.url, opts.base)) {
    return errorResult(400, 'invalid_verification_link', 'The verification link is invalid.')
  }
  const sent = await send({ ...opts, method: 'GET', path: '', body: null, token: null }, new URL(opts.url).toString())
  if ('fail' in sent) return sent.fail
  const { res } = sent
  return { status: res.status, body: await readBody(res), headers: passthroughHeaders(res) }
}
