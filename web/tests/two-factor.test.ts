import { describe, expect, it } from 'vitest'
import { ApiError, isTwoFactorSetupRequired, toApiError } from '../utils/errors'
import { codePayload, formatCountdown, groupSecret, isRecovery, isTotp, normalizeRecovery, normalizeTotp, qrPath, recoveryFileText, retryAfterOf } from '../utils/twoFactor'
import ar from '../i18n/locales/ar.json'
import it_ from '../i18n/locales/it.json'
import en from '../i18n/locales/en.json'

describe('two-factor helpers', () => {
  it('normalizes and validates authenticator codes', () => {
    expect(normalizeTotp('123 456')).toBe('123456')
    expect(isTotp('123 456')).toBe(true)
    expect(isTotp('12345')).toBe(false)
    expect(isTotp('12345a')).toBe(false)
  })
  it('normalizes recovery codes (case, spaces, missing dash)', () => {
    expect(normalizeRecovery(' ABCDE-FGHIJ ')).toBe('abcde-fghij')
    expect(normalizeRecovery('abcdefghij')).toBe('abcde-fghij')
    expect(isRecovery('ABCDEFGHIJ')).toBe(true)
    expect(isRecovery('abc-def')).toBe(false)
  })
  it('builds the request body for either mode and rejects empty input', () => {
    expect(codePayload('code', '123 456')).toEqual({ code: '123456' })
    expect(codePayload('recovery', 'ABCDE-FGHIJ')).toEqual({ recovery_code: 'abcde-fghij' })
    expect(codePayload('code', '  ')).toBeNull()
    expect(codePayload('recovery', '')).toBeNull()
  })
  it('formats the countdown', () => {
    expect(formatCountdown(272)).toBe('4:32')
    expect(formatCountdown(5)).toBe('0:05')
    expect(formatCountdown(-3)).toBe('0:00')
  })
  it('reads Retry-After from a 429 and caps it', () => {
    expect(retryAfterOf(new ApiError(429, 'too_many_requests', 'x', { retry_after: 42 }))).toBe(42)
    expect(retryAfterOf(new ApiError(429, 'too_many_requests', 'x', { retry_after: 999999 }))).toBe(3600)
    expect(retryAfterOf(new ApiError(429, 'too_many_requests', 'x'))).toBeNull()
    expect(retryAfterOf(new Error('x'))).toBeNull()
  })
  it('toApiError keeps Retry-After on 429', () => {
    const e = toApiError({ response: { status: 429, headers: new Headers({ 'retry-after': '30' }) }, data: { error: { code: 'too_many_requests', message: 'wait' } } }, { network: 'n', timeout: 't', generic: 'g' })
    expect(e.status).toBe(429)
    expect(retryAfterOf(e)).toBe(30)
  })
  it('detects the admin 2FA gate error', () => {
    expect(isTwoFactorSetupRequired(new ApiError(403, 'two_factor_setup_required', 'x'))).toBe(true)
    expect(isTwoFactorSetupRequired(new ApiError(403, 'forbidden', 'x'))).toBe(false)
    expect(isTwoFactorSetupRequired(new ApiError(401, 'two_factor_setup_required', 'x'))).toBe(false)
  })
  it('groups the setup key and draws a QR path locally', () => {
    expect(groupSecret('JBSWY3DPEHPK3PXP')).toBe('JBSW Y3DP EHPK 3PXP')
    const qr = qrPath('otpauth://totp/EXPA:a%40b.it?secret=JBSWY3DPEHPK3PXP&issuer=EXPA')
    expect(qr).not.toBeNull()
    expect(qr!.size).toBeGreaterThan(20)
    expect(qr!.path.startsWith('M')).toBe(true)
  })
  it('writes the recovery-code download', () => {
    expect(recoveryFileText('H', ['a', 'b'])).toBe('H\n\na\nb\n')
  })
})

describe('two-factor copy', () => {
  it('has the same keys in ar/en/it', () => {
    const k = (o: Record<string, unknown>, p = ''): string[] => Object.entries(o).flatMap(([a, v]) => (v && typeof v === 'object' ? k(v as Record<string, unknown>, `${p}${a}.`) : [`${p}${a}`]))
    expect(k(ar.twoFactor).sort()).toEqual(k(en.twoFactor).sort())
    expect(k(it_.twoFactor).sort()).toEqual(k(en.twoFactor).sort())
  })
})
