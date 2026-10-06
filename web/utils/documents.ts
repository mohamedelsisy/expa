/** Client-side pre-check for attachment uploads. Convenience only: the server remains the authority. */
export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024
export const ALLOWED_MIMES = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'] as const
const EXT_TO_MIME: Record<string, string> = { pdf: 'application/pdf', jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp' }
export const ACCEPT = '.pdf,.jpg,.jpeg,.png,.webp,application/pdf,image/jpeg,image/png,image/webp'

export type UploadProblem = 'empty' | 'too_large' | 'type'

export function validateUpload(file: { name: string, size: number, type: string }): UploadProblem | null {
  if (!file.size) return 'empty'
  if (file.size > MAX_UPLOAD_BYTES) return 'too_large'
  const ext = file.name.split('.').pop()?.toLowerCase() ?? ''
  const mime = (file.type || EXT_TO_MIME[ext] || '').toLowerCase()
  if (!(ALLOWED_MIMES as readonly string[]).includes(mime)) return 'type'
  return null
}

/** File size with locale-aware numbers and unit names (Intl unit style); `locale` defaults to English. */
export function formatBytes(n: number, locale = 'en'): string {
  const [value, unit] = n < 1024 ? [n, 'byte'] : n < 1024 * 1024 ? [n / 1024, 'kilobyte'] : [n / 1024 / 1024, 'megabyte']
  return new Intl.NumberFormat(locale === 'ar' ? 'ar-u-nu-latn' : locale, { style: 'unit', unit, unitDisplay: 'short', maximumFractionDigits: unit === 'megabyte' ? 1 : 0 }).format(value)
}

export type DocStatus = 'valid' | 'expiring_soon' | 'expired' | 'no_expiry'
export const STATUS_TONE: Record<DocStatus, 'success' | 'warning' | 'danger' | 'neutral'> = {
  valid: 'success', expiring_soon: 'warning', expired: 'danger', no_expiry: 'neutral',
}
export const STATUS_ICON: Record<DocStatus, string> = { valid: 'check', expiring_soon: 'clock', expired: 'alert', no_expiry: 'info' }
