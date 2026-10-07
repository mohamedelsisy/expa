import type { ExplainResult } from '~/types/extra'
import { mapApiRoute } from '~/utils/routes'

/** The explainer accepts fewer types than the attachment store: jpg, png and pdf only. */
export const EXPLAIN_MIMES = ['application/pdf', 'image/jpeg', 'image/png'] as const
export const EXPLAIN_ACCEPT = '.pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png'
const EXT: Record<string, string> = { pdf: 'application/pdf', jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png' }
export const DEFAULT_MAX_FILE_KB = 8 * 1024
export const DEFAULT_MAX_TEXT = 15000
export const MIN_TEXT = 15

export type ExplainFileProblem = 'empty' | 'too_large' | 'type'
/** Convenience pre-check only: the server re-detects the real type and size and stays the authority. */
export function validateExplainFile(file: { name: string, size: number, type: string }, maxKb = DEFAULT_MAX_FILE_KB): ExplainFileProblem | null {
  if (!file.size) return 'empty'
  if (file.size > maxKb * 1024) return 'too_large'
  const ext = file.name.split('.').pop()?.toLowerCase() ?? ''
  const mime = (file.type || EXT[ext] || '').toLowerCase()
  return (EXPLAIN_MIMES as readonly string[]).includes(mime) ? null : 'type'
}

/** Error codes after which the client should offer pasting the text instead (details.fallback = ["text"]). */
export const OCR_FALLBACK_CODES = ['ocr_unavailable', 'ocr_failed', 'ocr_empty'] as const
export function wantsTextFallback(code: string | undefined, details: Record<string, unknown> | undefined): boolean {
  if (code && (OCR_FALLBACK_CODES as readonly string[]).includes(code)) return true
  const fb = details?.fallback
  return Array.isArray(fb) && fb.includes('text')
}
export const FILE_ERROR_CODES = ['attachment_type_not_allowed', 'image_too_large', 'pdf_too_many_pages', 'attachment_rejected'] as const

/** `0.82` -> `82%`, `82` -> `82%`, `"high"` -> `high` (caller localizes), null -> null. */
export function confidencePercent(c: number | string | null | undefined): number | null {
  if (typeof c !== 'number' || !Number.isFinite(c) || c < 0) return null
  return Math.round(c <= 1 ? c * 100 : Math.min(c, 100))
}

export interface KeyDateView { label: string, date: string | null, text: string | null, unclear: boolean, past: boolean, yearMissing: boolean }
/** A null date is never invented: it is shown as "date not clear" together with the quoted text. */
export function keyDateViews(dates: ExplainResult['key_dates']): KeyDateView[] {
  return dates.map(d => ({ label: d.label, date: d.date || null, text: d.text ?? null, unclear: !d.date, past: !!d.past, yearMissing: !!d.year_missing }))
}

/** Suggested actions go through the allow-listed route mapper; anything unmappable stays plain text (never an arbitrary link). */
export function actionViews(actions: ExplainResult['suggested_actions']) {
  return actions.map(a => ({ type: a.type, label: a.label, date: a.date ?? null, path: mapApiRoute(a.target) }))
}
