// Stateful staff 2FA stub (docs/API_SPEC.md "Staff two-factor authentication"). Account tfa@example.test, token `stub-tfa`.
// Reset/configure through POST /__tfa_setup {enabled?, stale?, expires_in?, dead_challenge?}. Returns {status, body, headers?} or null.
export const TFA_EMAIL = 'tfa@example.test'
export const TFA_PASSWORD = 'Tfa-Passw0rd!'
const TOKEN = 'stub-tfa'
const SECRET = 'JBSWY3DPEHPK3PXP'
const meta = { locale: 'en' }
const ok = (data, status = 200) => ({ status, body: { data, meta } })
const fail = (status, code, message, details, headers) => ({ status, body: { error: { code, message, ...(details ? { details } : {}) } }, ...(headers ? { headers } : {}) })
const mkCodes = () => Array.from({ length: 10 }, (_, i) => `abcd${i}-efgh${i}`)

function fresh() {
  return { enabled: false, pending: false, codes: [], stale: false, expiresIn: 300, deadChallenge: false, failures: 0, challenge: null, lastBody: null }
}
let S = fresh()
const user = () => ({ id: 21, name: 'Tfa Staff', email: TFA_EMAIL, locale: 'en', email_verified: true, created_at: '2026-09-01T00:00:00Z', roles: ['super_admin'], is_super_admin: true, permissions: [], two_factor_enabled: S.enabled, two_factor_setup_required: !S.enabled && !S.stale })
const codeOk = (b) => b?.code === '123456' || (typeof b?.recovery_code === 'string' && S.codes.includes(b.recovery_code))
const burn = (b) => { if (b?.recovery_code) S.codes = S.codes.filter(c => c !== b.recovery_code) }

export function twoFactor(method, path, json, auth) {
  if (path === '__tfa_setup') { S = { ...fresh(), ...(json?.enabled ? { enabled: true, codes: mkCodes() } : {}), stale: !!json?.stale, expiresIn: json?.expires_in ?? 300, deadChallenge: !!json?.dead_challenge }; return ok({}) }
  if (path === '__tfa_state') return ok({ enabled: S.enabled, codes: S.codes.length, lastBody: S.lastBody })
  if (method === 'POST' && path === 'auth/login' && json?.email === TFA_EMAIL) {
    if (json.password !== TFA_PASSWORD) return fail(401, 'invalid_credentials', 'These credentials do not match our records.')
    if (!S.enabled) return ok({ user: user(), token: TOKEN })
    S.challenge = 'tfc_stub'
    return ok({ two_factor_required: true, challenge_token: S.deadChallenge ? 'tfc_dead' : S.challenge, expires_in: S.expiresIn })
  }
  if (method === 'POST' && path === 'auth/2fa/challenge') {
    S.lastBody = json
    if (json?.challenge_token !== 'tfc_stub') return fail(401, 'invalid_challenge', 'The sign-in attempt expired.')
    if (S.failures >= 5) return fail(429, 'too_many_requests', 'Too many attempts.', undefined, { 'retry-after': '3' })
    if (!json.code && !json.recovery_code) return fail(422, 'validation_failed', 'Invalid.', { code: ['Required.'] })
    if (!codeOk(json)) { S.failures++; return fail(422, 'invalid_two_factor_code', 'The code is invalid.') }
    burn(json)
    S.failures = 0
    return ok({ user: user(), token: TOKEN, recovery_codes_remaining: S.codes.length })
  }
  if (auth !== `Bearer ${TOKEN}`) return null
  if (method === 'GET' && path === 'auth/me') return ok(user())
  if (path.startsWith('admin/') && !S.enabled) return fail(403, 'two_factor_setup_required', 'Set up two-factor authentication to use the admin area.')
  if (!path.startsWith('auth/2fa/')) return null
  if (method === 'GET' && path === 'auth/2fa/status') return ok({ enabled: S.enabled, confirmed_at: S.enabled ? '2026-10-08T09:00:00Z' : null, setup_pending: S.pending, recovery_codes_remaining: S.codes.length, required: true, setup_required: !S.enabled })
  if (method === 'POST' && path === 'auth/2fa/setup') {
    if (S.enabled) return fail(409, 'two_factor_already_enabled', 'Already enabled.')
    S.pending = true
    return ok({ secret: SECRET, otpauth_uri: `otpauth://totp/EXPA:${encodeURIComponent(TFA_EMAIL)}?secret=${SECRET}&issuer=EXPA`, issuer: 'EXPA', account: TFA_EMAIL })
  }
  if (method === 'POST' && path === 'auth/2fa/confirm') {
    if (S.enabled) return fail(409, 'two_factor_already_enabled', 'Already enabled.')
    if (json?.code !== '123456') return fail(422, 'invalid_two_factor_code', 'The code is invalid.')
    S.enabled = true; S.pending = false; S.codes = mkCodes()
    return ok({ enabled: true, recovery_codes: S.codes })
  }
  if (method === 'POST' && (path === 'auth/2fa/disable' || path === 'auth/2fa/recovery-codes')) {
    if (!S.enabled) return fail(409, 'two_factor_not_enabled', 'Not enabled.')
    if (json?.password !== TFA_PASSWORD) return fail(422, 'validation_failed', 'Invalid.', { password: ['The password is incorrect.'] })
    if (!codeOk(json)) return fail(422, 'invalid_two_factor_code', 'The code is invalid.')
    burn(json)
    if (path === 'auth/2fa/disable') { S.enabled = false; S.codes = []; return { status: 204, body: null } }
    S.codes = mkCodes().map(c => c.replace('abcd', 'wxyz'))
    return ok({ recovery_codes: S.codes })
  }
  return null
}
