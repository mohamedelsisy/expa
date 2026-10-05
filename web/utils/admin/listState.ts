/** URL-synced list state: page, sort and filters live in the query string (shareable, back-button friendly). */
export interface ListConfig {
  /** Filter keys (URL param = key, API param = `filter[key]`). */
  filterKeys: readonly string[]
  defaultSort: string
  sortable?: readonly string[]
  defaultPerPage?: number
}
export interface ListState { page: number, sort: string, filters: Record<string, string> }

type Query = Record<string, unknown>
const first = (v: unknown): string => (Array.isArray(v) ? String(v[0] ?? '') : typeof v === 'string' ? v : '')

export function parseListQuery(query: Query, cfg: ListConfig): ListState {
  const page = Number.parseInt(first(query.page), 10)
  let sort = first(query.sort) || cfg.defaultSort
  if (cfg.sortable && !cfg.sortable.includes(sort.replace(/^-/, ''))) sort = cfg.defaultSort
  const filters: Record<string, string> = {}
  for (const k of cfg.filterKeys) {
    const v = first(query[k]).trim()
    if (v) filters[k] = v
  }
  return { page: Number.isFinite(page) && page > 0 ? page : 1, sort, filters }
}

/** Query to put in the URL: defaults and empty values are omitted so URLs stay short and canonical. */
export function toRouteQuery(state: ListState, cfg: ListConfig): Record<string, string> {
  const out: Record<string, string> = {}
  for (const [k, v] of Object.entries(state.filters)) if (v) out[k] = v
  if (state.sort !== cfg.defaultSort) out.sort = state.sort
  if (state.page > 1) out.page = String(state.page)
  return out
}

/** Query for the API (`filter[x]`, `sort`, `page`, `per_page`). */
export function toApiQuery(state: ListState, cfg: ListConfig): Record<string, string | number> {
  const out: Record<string, string | number> = { page: state.page, sort: state.sort }
  if (cfg.defaultPerPage) out.per_page = cfg.defaultPerPage
  for (const [k, v] of Object.entries(state.filters)) if (v) out[`filter[${k}]`] = v
  return out
}

/** Clicking a column: first ascending, then descending, then ascending again. */
export function nextSort(current: string, column: string): string {
  return current === column ? `-${column}` : column
}
export function sortDirection(current: string, column: string): 'ascending' | 'descending' | 'none' {
  if (current === column) return 'ascending'
  if (current === `-${column}`) return 'descending'
  return 'none'
}

export function withFilter(state: ListState, key: string, value: string): ListState {
  const filters = { ...state.filters }
  if (value) filters[key] = value
  else delete filters[key]
  return { ...state, filters, page: 1 }
}
export const withSort = (state: ListState, column: string): ListState => ({ ...state, sort: nextSort(state.sort, column), page: 1 })
export const withPage = (state: ListState, page: number): ListState => ({ ...state, page: Math.max(1, page) })
