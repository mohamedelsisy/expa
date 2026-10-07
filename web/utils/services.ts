import { intlLocale } from '~/utils/locale'

/** ISO 639-1 codes offered as language filter/preferences (providers store 2-letter codes). */
export const SERVICE_LANGUAGES = ['ar', 'en', 'it', 'fr', 'es', 'de', 'ro', 'sq', 'uk', 'ru', 'zh', 'hi', 'ur', 'bn', 'tl', 'pt'] as const
/** Mirrors backend config/moderation.php `report_reasons`. */
export const REPORT_REASONS = ['spam', 'abuse', 'misleading', 'illegal', 'personal_data', 'other'] as const
export const REVIEW_MAX = 5000
export const LEAD_MAX = 5000

export function languageName(code: string, locale: string): string {
  try { return new Intl.DisplayNames([intlLocale(locale)], { type: 'language' }).of(code) ?? code } catch { return code }
}

export interface LeadForm { message: string, request_type: 'contact' | 'booking', preferred_language: string, contact_name: string, contact_email: string, contact_phone: string, consent: boolean }
export type LeadProblem = 'message_required' | 'message_too_long' | 'consent_required' | 'email_invalid' | 'phone_invalid'
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const PHONE = /^\+?[0-9 ()-]{6,25}$/

/** The explicit consent to share contact details is never assumed: no tick, no request. */
export function validateLead(f: LeadForm): Partial<Record<'message' | 'consent' | 'contact_email' | 'contact_phone', LeadProblem>> {
  const out: Partial<Record<'message' | 'consent' | 'contact_email' | 'contact_phone', LeadProblem>> = {}
  const m = f.message.trim()
  if (!m) out.message = 'message_required'
  else if (m.length > LEAD_MAX) out.message = 'message_too_long'
  if (f.contact_email.trim() && !EMAIL.test(f.contact_email.trim())) out.contact_email = 'email_invalid'
  if (f.contact_phone.trim() && !PHONE.test(f.contact_phone.trim())) out.contact_phone = 'phone_invalid'
  if (!f.consent) out.consent = 'consent_required'
  return out
}

export function buildLeadBody(f: LeadForm): Record<string, unknown> {
  const opt = (v: string) => (v.trim() ? v.trim() : undefined)
  return {
    message: f.message.trim(),
    request_type: f.request_type,
    consent_share_contact: true,
    ...(opt(f.preferred_language) ? { preferred_language: f.preferred_language } : {}),
    ...(opt(f.contact_name) ? { contact_name: opt(f.contact_name) } : {}),
    ...(opt(f.contact_email) ? { contact_email: opt(f.contact_email) } : {}),
    ...(opt(f.contact_phone) ? { contact_phone: opt(f.contact_phone) } : {}),
  }
}

export function ratingLabel(average: number | null, count: number): { average: string | null, count: number } {
  return { average: average === null || !count ? null : (Math.round(average * 10) / 10).toFixed(1), count }
}

export const LEAD_STATUS_TONE: Record<string, 'info' | 'success' | 'neutral'> = { new: 'info', seen: 'success', closed: 'neutral' }
