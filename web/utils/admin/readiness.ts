/** Content readiness: counts per module from the existing admin list endpoints (`meta.total` with per_page=1). No data is invented. */
export interface Counts { total: number, published: number, draft: number, staleLive: number }
export type CountKey = keyof Counts

export const READINESS_QUERIES: Record<CountKey, Record<string, string>> = {
  total: {},
  published: { 'filter[status]': 'published' },
  draft: { 'filter[status]': 'draft' },
  /** Published items whose source was never verified or is older than the freshness window (API `filter[stale]`). */
  staleLive: { 'filter[status]': 'published', 'filter[stale]': 'true' },
}

export type Readiness = 'empty' | 'nothing_published' | 'needs_attention' | 'ready'
export function readinessOf(c: Counts): Readiness {
  if (c.total === 0) return 'empty'
  if (c.published === 0) return 'nothing_published'
  return c.staleLive > 0 ? 'needs_attention' : 'ready'
}

/** Runs `fn` over `items` with at most `limit` in flight (keeps the admin API calm). */
export async function mapLimit<T, R>(items: readonly T[], limit: number, fn: (x: T) => Promise<R>): Promise<R[]> {
  const out: R[] = new Array(items.length)
  let next = 0
  const worker = async () => { while (next < items.length) { const i = next++; out[i] = await fn(items[i]!) } }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker))
  return out
}

export function sumCounts(list: (Counts | null)[]): Counts {
  return list.reduce<Counts>((a, c) => (c ? { total: a.total + c.total, published: a.published + c.published, draft: a.draft + c.draft, staleLive: a.staleLive + c.staleLive } : a), { total: 0, published: 0, draft: 0, staleLive: 0 })
}
