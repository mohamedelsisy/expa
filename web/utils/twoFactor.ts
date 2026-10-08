/** Pure helpers for the staff two-factor UI (login step, settings, admin gate). */
import { encode } from 'uqr'
import { isApiError } from './errors'

export interface TwoFactorStatus {
  enabled: boolean
  confirmed_at: string | null
  setup_pending: boolean
  recovery_codes_remaining: number
  required: boolean
  setup_required: boolean
}
export interface TwoFactorSetup { secret: string, otpauth_uri: string, issuer: string, account: string }

/** TOTP codes are typed with spaces ("123 456") on many authenticator apps. */
export const normalizeTotp = (v: string) => v.replace(/[\s-]/g, '')
export const isTotp = (v: string) => /^\d{6}$/.test(normalizeTotp(v))
/** Recovery codes look like `xxxxx-xxxxx`; users may type them without the dash or in upper case. */
export function normalizeRecovery(v: string): string {
  const raw = v.replace(/\s/g, '').toLowerCase()
  if (!raw.includes('-') && raw.length === 10) return `${raw.slice(0, 5)}-${raw.slice(5)}`
  return raw
}
export const isRecovery = (v: string) => /^[a-z0-9]{5}-[a-z0-9]{5}$/.test(normalizeRecovery(v))

/** Builds the request body for the code-or-recovery-code forms; null when the input is empty. */
export function codePayload(mode: 'code' | 'recovery', value: string): Record<string, string> | null {
  if (mode === 'recovery') return value.trim() ? { recovery_code: normalizeRecovery(value) } : null
  return normalizeTotp(value) ? { code: normalizeTotp(value) } : null
}

export const formatCountdown = (seconds: number) => {
  const s = Math.max(0, Math.ceil(seconds))
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}

/** `Retry-After` seconds carried by a 429 ApiError (set by `toApiError` into details.retry_after). */
export function retryAfterOf(e: unknown): number | null {
  if (!isApiError(e)) return null
  const v = Number((e.details as { retry_after?: unknown })?.retry_after)
  return Number.isFinite(v) && v > 0 ? Math.min(Math.ceil(v), 3600) : null
}

/** 4-character groups so a key can be read aloud or typed. */
export const groupSecret = (s: string) => s.replace(/\s/g, '').replace(/(.{4})(?=.)/g, '$1 ')

/** SVG path for a QR code drawn locally (no network, no third party sees the secret). Returns null if encoding fails. */
export function qrPath(text: string): { path: string, size: number } | null {
  try {
    const { data, size } = encode(text, { ecc: 'M', border: 0 })
    let d = ''
    data.forEach((row, y) => row.forEach((on, x) => { if (on) d += `M${x} ${y}h1v1h-1z` }))
    return { path: d, size }
  } catch {
    return null
  }
}

export const recoveryFileText = (header: string, codes: string[]) => `${header}\n\n${codes.join('\n')}\n`
