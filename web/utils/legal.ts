/**
 * Public legal documents (`GET /legal/{slug}`), rendered without `v-html`. The body is either Markdown (string) or
 * already-structured blocks; both are normalised to the same safe block model. No legal text is ever authored here.
 */
export type LegalSlug = 'privacy' | 'terms' | 'cookies'
export const LEGAL_SLUGS: readonly LegalSlug[] = ['privacy', 'terms', 'cookies']

export type Inline = { t: 'text', v: string } | { t: 'strong', v: string } | { t: 'em', v: string } | { t: 'link', v: string, href: string }
export type LegalBlock =
  | { type: 'h', level: 2 | 3 | 4, text: string }
  | { type: 'p', text: string }
  | { type: 'ul' | 'ol', items: string[] }

export interface LegalDoc {
  slug: string
  title: string
  version: string | null
  published_at: string | null
  source: { name?: string, url?: string } | null
  blocks: LegalBlock[]
}

const SAFE_HREF = /^(https:\/\/|mailto:)[^\s]+$/i

/** `**bold**`, `*em*`/`_em_` and `[text](https://…)`; anything else stays literal text. */
export function parseInline(text: string): Inline[] {
  const out: Inline[] = []
  const re = /\*\*([^*]+)\*\*|\[([^\]]+)\]\(([^)\s]+)\)|(?<![\w*])[*_]([^*_]+)[*_](?![\w*])/g
  let last = 0
  let m: RegExpExecArray | null
  while ((m = re.exec(text))) {
    if (m.index > last) out.push({ t: 'text', v: text.slice(last, m.index) })
    if (m[1] !== undefined) out.push({ t: 'strong', v: m[1] })
    else if (m[2] !== undefined && m[3] !== undefined) out.push(SAFE_HREF.test(m[3]) ? { t: 'link', v: m[2], href: m[3] } : { t: 'text', v: m[2] })
    else if (m[4] !== undefined) out.push({ t: 'em', v: m[4] })
    last = re.lastIndex
  }
  if (last < text.length) out.push({ t: 'text', v: text.slice(last) })
  return out
}

export function parseMarkdown(src: string): LegalBlock[] {
  const blocks: LegalBlock[] = []
  let para: string[] = []
  let list: { type: 'ul' | 'ol', items: string[] } | null = null
  const flushPara = () => { if (para.length) blocks.push({ type: 'p', text: para.join(' ') }); para = [] }
  const flushList = () => { if (list) blocks.push(list); list = null }
  for (const raw of src.replace(/\r\n?/g, '\n').split('\n')) {
    const line = raw.trim()
    const h = /^(#{1,4})\s+(.+)$/.exec(line)
    const li = /^([-*+]|\d+[.)])\s+(.+)$/.exec(line)
    if (!line) { flushPara(); flushList() } else if (h) {
      flushPara(); flushList()
      // The page title is the <h1>; document headings start at h2.
      blocks.push({ type: 'h', level: Math.min(4, Math.max(2, h[1]!.length + 1)) as 2 | 3 | 4, text: h[2]! })
    } else if (li) {
      flushPara()
      const type = /^\d/.test(li[1]!) ? 'ol' : 'ul'
      if (list && list.type !== type) flushList()
      list ??= { type, items: [] }
      list.items.push(li[2]!)
    } else {
      flushList()
      para.push(line)
    }
  }
  flushPara(); flushList()
  return blocks
}

function normalizeBlocks(raw: unknown): LegalBlock[] {
  if (typeof raw === 'string') return parseMarkdown(raw)
  if (!Array.isArray(raw)) return []
  const out: LegalBlock[] = []
  for (const b of raw as Record<string, unknown>[]) {
    const type = String(b?.type ?? '')
    const text = typeof b?.text === 'string' ? b.text : typeof b?.content === 'string' ? b.content : ''
    if (type === 'heading' || type === 'h') out.push({ type: 'h', level: Math.min(4, Math.max(2, Number(b.level) || 2)) as 2 | 3 | 4, text })
    else if (type === 'paragraph' || type === 'p') out.push({ type: 'p', text })
    else if ((type === 'list' || type === 'ul' || type === 'ol') && Array.isArray(b.items)) {
      out.push({ type: b.ordered === true || type === 'ol' ? 'ol' : 'ul', items: (b.items as unknown[]).map(String) })
    }
  }
  return out.filter((b) => {
    if (b.type === 'h' || b.type === 'p') return b.text.length > 0
    return b.items.length > 0
  })
}

/** Returns null when the payload has no usable title/body (treated as "not published"). */
export function normalizeLegal(data: unknown): LegalDoc | null {
  const d = data as Record<string, unknown> | null
  if (!d || typeof d !== 'object' || typeof d.title !== 'string' || !d.title) return null
  const blocks = normalizeBlocks(d.body ?? d.body_markdown ?? d.blocks)
  if (!blocks.length) return null
  const src = d.source as { name?: unknown, url?: unknown } | null | undefined
  return {
    slug: String(d.slug ?? ''),
    title: d.title,
    version: typeof d.version === 'string' || typeof d.version === 'number' ? String(d.version) : null,
    published_at: typeof d.published_at === 'string' ? d.published_at : null,
    source: src && typeof src === 'object' ? { name: typeof src.name === 'string' ? src.name : undefined, url: typeof src.url === 'string' && src.url.startsWith('https://') ? src.url : undefined } : null,
    blocks,
  }
}
