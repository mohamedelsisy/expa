import type { Exercise } from '~/types/extra'

/** Fill-in-the-blank sentences carry exactly one `___` placeholder. */
export function splitSentence(sentence: string): { before: string, after: string } | null {
  const i = sentence.indexOf('___')
  if (i < 0 || sentence.indexOf('___', i + 3) >= 0) return null
  return { before: sentence.slice(0, i).trimEnd(), after: sentence.slice(i + 3).trimStart() }
}

/**
 * Match answer: one opaque right-hand id per left item, in left order. The ids are positions in a server-side
 * shuffle: they carry no meaning and must be sent back exactly as received. Incomplete or duplicate picks are refused.
 */
export function buildMatchAnswer(picks: (number | null)[]): number[] | null {
  if (!picks.length || picks.some(p => p === null || !Number.isInteger(p))) return null
  const ids = picks as number[]
  return new Set(ids).size === ids.length ? ids : null
}

export type AnswerValue = number | string | number[]

/** What the API told us was right (`correct_answer`), rendered as plain text from the form the learner saw. */
export function correctAnswerText(ex: Pick<Exercise, 'type' | 'form'>, correct: unknown): string | null {
  const c = (correct ?? {}) as { index?: number | null, answers?: string[], right_ids?: number[] }
  if (ex.type === 'multiple_choice' || ex.type === 'listening') return ex.form.choices?.find(x => x.index === c.index)?.text ?? null
  if (ex.type === 'fill_blank') return Array.isArray(c.answers) && c.answers.length ? c.answers.join(' / ') : null
  if (ex.type === 'match' && Array.isArray(c.right_ids)) {
    const left = ex.form.left ?? []
    const right = new Map((ex.form.right ?? []).map(r => [r.id, r.text]))
    return left.map((l, i) => `${l.text} = ${right.get(c.right_ids![i]!) ?? '?'}`).join('; ')
  }
  return null
}

/** Review summary after a flashcard session. */
export function sessionSummary(results: boolean[]): { total: number, correct: number, percent: number | null } {
  const correct = results.filter(Boolean).length
  return { total: results.length, correct, percent: results.length ? Math.round(correct / results.length * 100) : null }
}
