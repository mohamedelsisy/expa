/** Input handling for the net-salary estimator (pure, unit-tested). Nothing here knows any tax rule: the API does the maths. */
export const MONTHS = [12, 13, 14] as const
export const MAX_GROSS = 10_000_000

export type NetField = 'gross' | 'taxYear'
export interface NetInput { gross: string, months: string, taxYear: string }

/** Accepts "30000", "30,000.50", "30.000,50" (it/ar locales), "٣٠٠٠٠" (Arabic-Indic digits). Returns null when not a plain amount. */
export function parseGrossAmount(raw: string): number | null {
  let s = raw.trim().replace(/[٠-٩]/g, d => String(d.charCodeAt(0) - 0x660)).replace(/[۰-۹]/g, d => String(d.charCodeAt(0) - 0x6F0)).replace(/[\s  ']/g, '')
  if (!s) return null
  const lastDot = s.lastIndexOf('.')
  const lastComma = s.lastIndexOf(',')
  if (lastDot >= 0 && lastComma >= 0) {
    // the later separator is the decimal one
    s = lastComma > lastDot ? s.replace(/\./g, '').replace(',', '.') : s.replace(/,/g, '')
  } else if (lastComma >= 0) {
    // "1,234" (thousands) vs "12,5" (decimal)
    s = /^\d{1,3}(,\d{3})+$/.test(s) ? s.replace(/,/g, '') : s.replace(',', '.')
  } else if ((s.match(/\./g) ?? []).length > 1 || /^\d{1,3}(\.\d{3})+$/.test(s)) {
    s = s.replace(/\./g, '')
  }
  if (!/^\d+(\.\d{1,2})?$/.test(s)) return null
  const n = Number(s)
  return Number.isFinite(n) ? n : null
}

export function validateNet(input: NetInput): Partial<Record<NetField, 'required' | 'invalid' | 'tooLarge' | 'year'>> {
  const e: Partial<Record<NetField, 'required' | 'invalid' | 'tooLarge' | 'year'>> = {}
  if (!input.gross.trim()) e.gross = 'required'
  else {
    const n = parseGrossAmount(input.gross)
    if (n === null || n < 0) e.gross = 'invalid'
    else if (n > MAX_GROSS) e.gross = 'tooLarge'
  }
  if (input.taxYear.trim() !== '' && !(/^\d{4}$/.test(input.taxYear.trim()) && Number(input.taxYear) >= 2000 && Number(input.taxYear) <= 2100)) e.taxYear = 'year'
  return e
}

export function netBody(input: NetInput): { gross_annual: number, months: number, tax_year?: number } {
  const body: { gross_annual: number, months: number, tax_year?: number } = { gross_annual: parseGrossAmount(input.gross) ?? 0, months: Number(input.months) || 12 }
  if (input.taxYear.trim()) body.tax_year = Number(input.taxYear.trim())
  return body
}

/** A table older than the API's freshness window (or never verified) must be flagged next to the numbers. */
export const needsFreshnessWarning = (f: string | null | undefined): boolean => f === 'stale' || f === 'outdated' || f === 'unverified'
