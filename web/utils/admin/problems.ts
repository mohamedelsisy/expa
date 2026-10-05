import { isApiError } from '~/utils/errors'

/** One reason an item cannot be published (`error.details.problems[]` of `content_not_publishable`). */
export interface PublishProblem { code: string, field?: string, locale?: string }
export type ProblemTarget =
  | { kind: 'translation', locale: string, field?: string }
  | { kind: 'field', field: string }
  | { kind: 'none' }
export interface ProblemView { code: string, message: string, target: ProblemTarget, known: boolean }

const KNOWN = new Set([
  'missing_translation', 'missing_source_field', 'source_domain_not_official', 'invalid_source_url',
  'invalid_url', 'university_not_published', 'missing_rights_note', 'verified_in_future',
])

type Translate = (key: string, params?: Record<string, unknown>) => string

export interface DescribeContext {
  fieldLabel: (field: string) => string
  localeLabel: (locale: string) => string
  /** First translatable field that is required to publish (jump target for `missing_translation`). */
  firstRequiredField?: string
}

/** Reads the (untrusted) `problems` array from an API error; anything malformed is dropped. */
export function extractProblems(err: unknown): PublishProblem[] {
  if (!isApiError(err)) return []
  const raw = (err.details as { problems?: unknown })?.problems
  if (!Array.isArray(raw)) return []
  return raw
    .filter((p): p is Record<string, unknown> => typeof p === 'object' && p !== null && typeof (p as { code?: unknown }).code === 'string')
    .map(p => ({
      code: String(p.code),
      ...(typeof p.field === 'string' ? { field: p.field } : {}),
      ...(typeof p.locale === 'string' ? { locale: p.locale } : {}),
    }))
}

/** Maps a problem code to a localized sentence and the field/tab the editor should jump to. Unknown codes degrade safely. */
export function describeProblem(p: PublishProblem, t: Translate, ctx: DescribeContext): ProblemView {
  const field = p.field ? ctx.fieldLabel(p.field) : ''
  const locale = p.locale ? ctx.localeLabel(p.locale) : ''
  if (!KNOWN.has(p.code)) {
    return {
      code: p.code,
      message: t('admin.problems.unknown', { code: p.code }),
      target: p.field ? { kind: 'field', field: p.field } : { kind: 'none' },
      known: false,
    }
  }
  const message = t(`admin.problems.${p.code}`, { field, locale })
  if (p.code === 'missing_translation' && p.locale) {
    return { code: p.code, message, known: true, target: { kind: 'translation', locale: p.locale, field: ctx.firstRequiredField } }
  }
  if (p.field) return { code: p.code, message, known: true, target: { kind: 'field', field: p.field } }
  return { code: p.code, message, known: true, target: { kind: 'none' } }
}
