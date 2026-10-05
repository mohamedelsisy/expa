/** Human-readable rendering of audit-log `changes` (old -> new). Sensitive-looking keys are never displayed. */
const SENSITIVE = /pass(word)?|token|secret|authorization|api[_-]?key|cookie|otp|signature|credential|header|\bcode\b|hash/i
export type Disp = { type: 'text', text: string } | { type: 'null' } | { type: 'bool', value: boolean } | { type: 'redacted' }
export interface ChangeRow { key: string, mode: 'diff' | 'value', old?: Disp, new: Disp }

export const isSensitiveKey = (key: string): boolean => SENSITIVE.test(key)

function disp(v: unknown, key: string): Disp {
  if (isSensitiveKey(key)) return { type: 'redacted' }
  if (v === null || v === undefined || v === '') return { type: 'null' }
  if (typeof v === 'boolean') return { type: 'bool', value: v }
  if (typeof v === 'number') return { type: 'text', text: String(v) }
  if (typeof v === 'string') return { type: 'text', text: v.length > 200 ? `${v.slice(0, 200)}…` : v }
  if (Array.isArray(v)) {
    const parts = v.filter(x => ['string', 'number'].includes(typeof x)).map(String)
    return parts.length === v.length ? { type: 'text', text: parts.join(', ') || '' } : { type: 'text', text: `[${v.length}]` }
  }
  return { type: 'text', text: '{…}' }
}

const isDiff = (v: unknown): v is { old?: unknown, new?: unknown } =>
  typeof v === 'object' && v !== null && !Array.isArray(v) && ('old' in v || 'new' in v) && Object.keys(v).every(k => k === 'old' || k === 'new')

export function formatChanges(changes: unknown, depth = 0, prefix = ''): ChangeRow[] {
  if (changes === null || typeof changes !== 'object' || Array.isArray(changes)) return []
  const rows: ChangeRow[] = []
  for (const [k, v] of Object.entries(changes as Record<string, unknown>)) {
    const key = prefix ? `${prefix}.${k}` : k
    if (isDiff(v)) rows.push({ key, mode: 'diff', old: disp(v.old, k), new: disp(v.new, k) })
    else if (v && typeof v === 'object' && !Array.isArray(v) && depth < 2 && !isSensitiveKey(k)) rows.push(...formatChanges(v, depth + 1, key))
    else rows.push({ key, mode: 'value', new: disp(v, k) })
  }
  return rows
}
