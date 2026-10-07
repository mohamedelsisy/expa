import type { HousingFlag } from '~/types/extra'

export const EXTRA_FIELDS = ['rent_monthly', 'utilities_monthly', 'condo_fees_monthly', 'internet_monthly'] as const
export type ExtraField = typeof EXTRA_FIELDS[number]
/** Fallback only: the real limits come from GET /housing/usage. */
export const DEFAULT_MIN_CHARS = 20
export const DEFAULT_MAX_CHARS = 12000
export const MAX_AMOUNT = 100000

/** Parses a user amount (`1.250,50`, `1250.5`, `€ 800`). Returns null for empty, NaN where invalid is signalled by `undefined`. */
export function parseAmount(raw: string): number | null | undefined {
  const s = raw.trim().replace(/[€\s]/g, '')
  if (!s) return null
  let n: string
  if (/^\d{1,3}(\.\d{3})+(,\d+)?$/.test(s)) n = s.replace(/\./g, '').replace(',', '.')
  else if (/^\d+(,\d+)$/.test(s)) n = s.replace(',', '.')
  else n = s
  if (!/^\d+(\.\d+)?$/.test(n)) return undefined
  const v = Number(n)
  return Number.isFinite(v) && v >= 0 && v <= MAX_AMOUNT ? v : undefined
}

export interface HousingForm { text: string, extra: Record<ExtraField, string>, explain: boolean, save: boolean, label: string }
export type HousingProblem = { field: 'text', code: 'too_short' | 'too_long' } | { field: ExtraField, code: 'invalid_amount' }

export function validateHousing(f: HousingForm, limits: { min: number, max: number } = { min: DEFAULT_MIN_CHARS, max: DEFAULT_MAX_CHARS }): HousingProblem[] {
  const out: HousingProblem[] = []
  const len = f.text.trim().length
  if (len < limits.min) out.push({ field: 'text', code: 'too_short' })
  else if (len > limits.max) out.push({ field: 'text', code: 'too_long' })
  for (const k of EXTRA_FIELDS) if (parseAmount(f.extra[k]) === undefined) out.push({ field: k, code: 'invalid_amount' })
  return out
}

/** Request body for POST /housing/check. Empty optional fields are omitted; the label is only sent when saving. */
export function buildHousingBody(f: HousingForm): Record<string, unknown> {
  const extra: Record<string, number> = {}
  for (const k of EXTRA_FIELDS) {
    const v = parseAmount(f.extra[k])
    if (typeof v === 'number') extra[k] = v
  }
  return {
    text: f.text.trim(),
    ...(Object.keys(extra).length ? { extra } : {}),
    explain: f.explain,
    save: f.save,
    ...(f.save && f.label.trim() ? { label: f.label.trim().slice(0, 100) } : {}),
  }
}

export const SEVERITY_TONE: Record<HousingFlag['severity'], 'info' | 'warning' | 'danger'> = { info: 'info', caution: 'warning', warning: 'danger' }
export const SEVERITY_ORDER: Record<HousingFlag['severity'], number> = { warning: 0, caution: 1, info: 2 }
export const sortFlags = <T extends HousingFlag>(flags: T[]): T[] => [...flags].sort((a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity])
