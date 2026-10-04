import { describe, expect, it, vi } from 'vitest'
import { forwardRequest, login, register, logout, verifyEmail, isAllowedVerifyUrl, safePath, originAllowed, isUploadPath, isDownloadPath, MAX_UPLOAD } from '../server/utils/bff'

const BASE = 'http://127.0.0.1:8001/api/v1'
const json = (status: number, body: unknown) => new Response(status === 204 ? null : JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } })

describe('login / register', () => {
  it('sets the cookie token and never returns it in the body', async () => {
    const fetcher = vi.fn().mockResolvedValue(json(200, { data: { user: { id: 1 }, token: '1|secrettoken' }, meta: { locale: 'ar' } }))
    const r = await login({ fetcher, base: BASE, method: 'POST', path: 'auth/login', body: JSON.stringify({ email: 'a@b.it', password: 'x' }), lang: 'ar' })
    expect(r.setToken).toBe('1|secrettoken')
    expect(JSON.stringify(r.body)).not.toContain('secrettoken')
    expect((r.body as { data: { user: { id: number } } }).data.user.id).toBe(1)
    const [url, init] = fetcher.mock.calls[0]
    expect(url).toBe(`${BASE}/auth/login`)
    expect(init.headers['Accept-Language']).toBe('ar')
    expect(JSON.parse(init.body).device_name).toBe('web')
    expect(init.headers.Authorization).toBeUndefined()
  })
  it('passes credential errors through without a cookie', async () => {
    const fetcher = vi.fn().mockResolvedValue(json(401, { error: { code: 'invalid_credentials', message: 'no' } }))
    const r = await login({ fetcher, base: BASE, method: 'POST', path: 'auth/login', body: '{"email":"a@b.it","password":"x"}' })
    expect(r.status).toBe(401)
    expect(r.setToken).toBeUndefined()
    expect(r.clearToken).toBeUndefined()
  })
  it('register strips the token too', async () => {
    const fetcher = vi.fn().mockResolvedValue(json(201, { data: { user: { id: 2 }, token: '2|abc' }, meta: {} }))
    const r = await register({ fetcher, base: BASE, method: 'POST', path: 'auth/register', body: '{}' })
    expect(r.status).toBe(201)
    expect(r.setToken).toBe('2|abc')
    expect(JSON.stringify(r.body)).not.toContain('2|abc')
  })
  it('maps network failure to 502 and timeout to 504', async () => {
    const net = await login({ fetcher: vi.fn().mockRejectedValue(new TypeError('fetch failed')), base: BASE, method: 'POST', path: 'x', body: '{}' })
    expect(net.status).toBe(502)
    const to = await login({ fetcher: vi.fn().mockRejectedValue(Object.assign(new Error('t'), { name: 'TimeoutError' })), base: BASE, method: 'POST', path: 'x', body: '{}' })
    expect(to.status).toBe(504)
  })
})

describe('proxy', () => {
  it('forwards bearer token, language and query', async () => {
    const fetcher = vi.fn().mockResolvedValue(json(200, { data: [] }))
    const r = await forwardRequest({ fetcher, base: BASE, method: 'GET', path: 'guides', search: '?q=a&filter[x]=1', token: 'tok', lang: 'it' })
    expect(r.status).toBe(200)
    const [url, init] = fetcher.mock.calls[0]
    expect(url).toBe(`${BASE}/guides?q=a&filter[x]=1`)
    expect(init.headers.Authorization).toBe('Bearer tok')
    expect(init.headers['Accept-Language']).toBe('it')
  })
  it('401 with a token clears the cookie; 401 without does not', async () => {
    const f = () => vi.fn().mockResolvedValue(json(401, { error: { code: 'unauthenticated', message: 'x' } }))
    expect((await forwardRequest({ fetcher: f(), base: BASE, method: 'GET', path: 'profile', token: 't' })).clearToken).toBe(true)
    expect((await forwardRequest({ fetcher: f(), base: BASE, method: 'GET', path: 'profile' })).clearToken).toBeUndefined()
  })
  it('handles 204 without a body', async () => {
    const r = await forwardRequest({ fetcher: vi.fn().mockResolvedValue(json(204, null)), base: BASE, method: 'POST', path: 'auth/logout-all', token: 't' })
    expect(r.status).toBe(204)
    expect(r.body).toBeNull()
  })
  it('blocks login/register/logout/verify via proxy and rejects traversal', async () => {
    const fetcher = vi.fn()
    for (const p of ['auth/login', 'auth/register', 'auth/logout', 'auth/verify-email/1/abc']) {
      expect((await forwardRequest({ fetcher, base: BASE, method: 'POST', path: p })).status).toBe(404)
    }
    for (const p of ['../admin', 'a/../b', 'a//b', '%2e%2e/x', 'a/%2Fb', '']) {
      expect((await forwardRequest({ fetcher, base: BASE, method: 'GET', path: p })).status).toBe(400)
    }
    expect((await forwardRequest({ fetcher, base: BASE, method: 'TRACE', path: 'guides' })).status).toBe(405)
    expect(fetcher).not.toHaveBeenCalled()
    expect(safePath('profile/consents')).toBe('profile/consents')
  })
  it('rate limit status and retry-after pass through', async () => {
    const res = new Response(JSON.stringify({ error: { code: 'too_many_requests', message: 'wait' } }), { status: 429, headers: { 'retry-after': '30' } })
    const r = await forwardRequest({ fetcher: vi.fn().mockResolvedValue(res), base: BASE, method: 'GET', path: 'guides' })
    expect(r.status).toBe(429)
    expect(r.headers['retry-after']).toBe('30')
  })
})

describe('logout', () => {
  it('always clears the cookie, even if upstream fails', async () => {
    const r = await logout({ fetcher: vi.fn().mockRejectedValue(new Error('down')), base: BASE, token: 't' })
    expect(r.clearToken).toBe(true)
    expect(r.status).toBe(204)
  })
})

describe('verify-email allow-list', () => {
  const hash = 'a'.repeat(40)
  const good = `${BASE}/auth/verify-email/12/${hash}?expires=1&signature=abc`
  it('accepts the configured API origin and path shape', () => expect(isAllowedVerifyUrl(good, BASE)).toBe(true))
  it.each([
    ['other host', `http://evil.com/api/v1/auth/verify-email/12/${'a'.repeat(40)}?s=1`],
    ['other port', `http://127.0.0.1:9999/api/v1/auth/verify-email/12/${'a'.repeat(40)}`],
    ['https downgrade/upgrade', `https://127.0.0.1:8001/api/v1/auth/verify-email/12/${'a'.repeat(40)}`],
    ['wrong path', 'http://127.0.0.1:8001/api/v1/auth/me'],
    ['path traversal', `http://127.0.0.1:8001/api/v1/auth/verify-email/12/${'a'.repeat(40)}/../../me`],
    ['userinfo trick', `http://127.0.0.1:8001@evil.com/api/v1/auth/verify-email/12/${'a'.repeat(40)}`],
    ['non-numeric id', `${BASE}/auth/verify-email/x/${'a'.repeat(40)}`],
    ['garbage', 'not a url'],
  ])('rejects %s', (_n, url) => expect(isAllowedVerifyUrl(url, BASE)).toBe(false))
  it('does not call upstream for a disallowed URL', async () => {
    const fetcher = vi.fn()
    const r = await verifyEmail({ fetcher, base: BASE, url: 'http://evil.com/x' })
    expect(r.status).toBe(400)
    expect(fetcher).not.toHaveBeenCalled()
  })
  it('calls the signed URL without following redirects', async () => {
    const fetcher = vi.fn().mockResolvedValue(json(200, { data: { verified: true } }))
    const r = await verifyEmail({ fetcher, base: BASE, url: good })
    expect(r.status).toBe(200)
    expect(fetcher.mock.calls[0][0]).toBe(good)
    expect(fetcher.mock.calls[0][1].redirect).toBe('manual')
  })
})

describe('origin check', () => {
  it('allows missing/same origin, rejects foreign', () => {
    expect(originAllowed(undefined, 'a.com')).toBe(true)
    expect(originAllowed('https://a.com', 'a.com')).toBe(true)
    expect(originAllowed('https://evil.com', 'a.com')).toBe(false)
  })
})

describe('proxy: multipart upload and binary download', () => {
  const BOUNDARY = 'multipart/form-data; boundary=----abc123'
  const bytes = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x00, 0xff, 0x10])

  it('forwards the upload bytes and the original content type (boundary) unchanged', async () => {
    const fetcher = vi.fn().mockResolvedValue(json(201, { data: { id: 1 } }))
    const r = await forwardRequest({ fetcher, base: BASE, method: 'POST', path: 'my-documents/12/attachments', rawBody: bytes, contentType: BOUNDARY, token: 'tok', lang: 'ar' })
    expect(r.status).toBe(201)
    const [url, init] = fetcher.mock.calls[0]
    expect(url).toBe(`${BASE}/my-documents/12/attachments`)
    expect(init.body).toBe(bytes)
    expect(init.headers['Content-Type']).toBe(BOUNDARY)
    expect(init.headers.Authorization).toBe('Bearer tok')
  })
  it('refuses multipart on any other path or method, and non-multipart raw bodies', async () => {
    const fetcher = vi.fn()
    for (const [method, path] of [['POST', 'profile'], ['POST', 'my-documents/12'], ['PUT', 'my-documents/12/attachments'], ['POST', 'my-documents/x/attachments']]) {
      expect((await forwardRequest({ fetcher, base: BASE, method, path, rawBody: bytes, contentType: BOUNDARY })).status, `${method} ${path}`).toBe(415)
    }
    expect((await forwardRequest({ fetcher, base: BASE, method: 'POST', path: 'my-documents/1/attachments', rawBody: bytes, contentType: 'application/json' })).status).toBe(415)
    expect(fetcher).not.toHaveBeenCalled()
  })
  it('rejects oversized uploads before contacting the API', async () => {
    const fetcher = vi.fn()
    const big = new Uint8Array(MAX_UPLOAD + 1)
    expect((await forwardRequest({ fetcher, base: BASE, method: 'POST', path: 'my-documents/1/attachments', rawBody: big, contentType: BOUNDARY })).status).toBe(413)
    expect(fetcher).not.toHaveBeenCalled()
  })
  it('still relays API errors for uploads (e.g. 422 file type) as JSON', async () => {
    const fetcher = vi.fn().mockResolvedValue(json(422, { error: { code: 'validation_failed', message: 'Bad file', details: { file: ['x'] } } }))
    const r = await forwardRequest({ fetcher, base: BASE, method: 'POST', path: 'my-documents/1/attachments', rawBody: bytes, contentType: BOUNDARY, token: 't' })
    expect(r.status).toBe(422)
    expect(r.stream).toBeUndefined()
    expect((r.body as { error: { code: string } }).error.code).toBe('validation_failed')
  })

  it('streams an attachment download through with the API safety headers', async () => {
    const res = new Response(bytes, { status: 200, headers: { 'content-type': 'application/pdf', 'content-disposition': 'attachment; filename="a.pdf"', 'x-content-type-options': 'nosniff', 'content-security-policy': "default-src 'none'; sandbox", 'set-cookie': 'x=1', 'x-secret': 'no' } })
    const r = await forwardRequest({ fetcher: vi.fn().mockResolvedValue(res), base: BASE, method: 'GET', path: 'my-documents/3/attachments/9', token: 't' })
    expect(r.status).toBe(200)
    expect(r.body).toBeNull()
    expect(r.headers['content-type']).toBe('application/pdf')
    expect(r.headers['content-disposition']).toContain('attachment')
    expect(r.headers['x-content-type-options']).toBe('nosniff')
    expect(r.headers['set-cookie']).toBeUndefined()
    expect(r.headers['x-secret']).toBeUndefined()
    const got = new Uint8Array(await new Response(r.stream!).arrayBuffer())
    expect([...got]).toEqual([...bytes])
  })
  it('does not stream non-download paths or JSON bodies', async () => {
    const pdf = () => new Response(bytes, { status: 200, headers: { 'content-type': 'application/pdf' } })
    const other = await forwardRequest({ fetcher: vi.fn().mockResolvedValue(pdf()), base: BASE, method: 'GET', path: 'guides/x', token: 't' })
    expect(other.stream).toBeUndefined()
    const err = await forwardRequest({ fetcher: vi.fn().mockResolvedValue(json(404, { error: { code: 'not_found', message: 'x' } })), base: BASE, method: 'GET', path: 'my-documents/3/attachments/9', token: 't' })
    expect(err.status).toBe(404)
    expect(err.stream).toBeUndefined()
    expect((err.body as { error: { code: string } }).error.code).toBe('not_found')
  })
  it('keeps 401 handling and the blocked paths for the new routes', async () => {
    const f = vi.fn().mockResolvedValue(json(401, { error: { code: 'unauthenticated', message: 'x' } }))
    const r = await forwardRequest({ fetcher: f, base: BASE, method: 'GET', path: 'my-documents/3/attachments/9', token: 't' })
    expect(r.clearToken).toBe(true)
    expect((await forwardRequest({ fetcher: f, base: BASE, method: 'POST', path: 'auth/login', rawBody: bytes, contentType: BOUNDARY })).status).toBe(404)
  })
  it('path helpers match exactly the two attachment routes', () => {
    expect(isUploadPath('my-documents/1/attachments')).toBe(true)
    expect(isUploadPath('my-documents/1/attachments/2')).toBe(false)
    expect(isDownloadPath('my-documents/1/attachments/2')).toBe(true)
    expect(isDownloadPath('my-documents/1/attachments/2/x')).toBe(false)
    expect(isDownloadPath('my-documents/a/attachments/2')).toBe(false)
  })
})
