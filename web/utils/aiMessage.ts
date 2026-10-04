/** Safe structure for assistant text: plain text, line breaks, and `[n]` citations that match a real source. */
export type Token = { kind: 'text', text: string } | { kind: 'cite', n: number }
/** paragraphs → lines → tokens. Rendered with text interpolation only, never as HTML. */
export type Paragraphs = Token[][][]

const CITE = /\[(\d{1,2})\]/g

export function tokenizeLine(line: string, validNumbers: ReadonlySet<number>): Token[] {
  const out: Token[] = []
  let last = 0
  for (const m of line.matchAll(CITE)) {
    const n = Number(m[1])
    if (!validNumbers.has(n)) continue // citation without a matching source stays plain text
    const i = m.index ?? 0
    if (i > last) out.push({ kind: 'text', text: line.slice(last, i) })
    out.push({ kind: 'cite', n })
    last = i + m[0].length
  }
  if (last < line.length) out.push({ kind: 'text', text: line.slice(last) })
  return out
}

export function parseMessage(content: string, sourceNumbers: readonly number[]): Paragraphs {
  const valid = new Set(sourceNumbers)
  return (content ?? '')
    .replace(/\r\n?/g, '\n')
    .split(/\n{2,}/)
    .map(p => p.trim())
    .filter(Boolean)
    .map(p => p.split('\n').map(l => tokenizeLine(l, valid)))
}
