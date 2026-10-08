/** Body of the Patente Teacher request: one published topic or one licensed question, by slug (the API validates both). */
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export type ExplainKind = 'topic' | 'question'

export function explainBody(kind: ExplainKind, slug: string, message: string): { message: string, patente_topic?: string, patente_question?: string } | null {
  if (!SLUG.test(slug) || slug.length > 120) return null
  const text = message.trim().slice(0, 300)
  if (text.length < 2) return null
  return kind === 'topic' ? { message: text, patente_topic: slug } : { message: text, patente_question: slug }
}

/** Which hint to show next to an API error (quota is the one people can act on). */
export function explainErrorHint(code: string): 'limit' | 'slow' | 'network' | null {
  if (code === 'ai_limit_reached') return 'limit'
  if (code === 'too_many_requests') return 'slow'
  if (code === 'network' || code === 'timeout') return 'network'
  return null
}
