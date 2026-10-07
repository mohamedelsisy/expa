/** The moderator-pinned official guide comes as a path from the API; only `/guides/<slug>` is ever followed. */
export function officialGuidePath(path: unknown): string | null {
  return typeof path === 'string' && /^\/guides\/[A-Za-z0-9][A-Za-z0-9._~-]*$/.test(path) ? path : null
}

export const COMMUNITY_TAG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
/** Free-text tags ("visa, permesso") to API tags (lowercase slugs, deduplicated, max `max`). Invalid ones are dropped. */
export function parseTags(raw: string, max = 5): string[] {
  const out: string[] = []
  for (const part of raw.split(/[,،\n]+/)) {
    const tag = part.trim().toLowerCase().replace(/\s+/g, '-')
    if (tag && tag.length <= 40 && COMMUNITY_TAG.test(tag) && !out.includes(tag)) out.push(tag)
  }
  return out.slice(0, max)
}

export type OwnStatus = 'pending' | 'approved' | 'hidden' | null
/** Only the author ever sees a status; public items are approved by definition. */
export const statusKey = (s: OwnStatus): string | null => (s === 'pending' || s === 'hidden' ? `community.status.${s}` : null)
