import { computed } from 'vue'
import { nextSort, toApiQuery, toRouteQuery, parseListQuery, withFilter, withPage, withSort, type ListConfig, type ListState } from '~/utils/admin/listState'

/** List state kept in the URL (`?q=&status=&sort=&page=`): reload, share and back-button all keep the view. */
export function useAdminList(cfg: ListConfig) {
  const route = useRoute()
  const state = computed<ListState>(() => parseListQuery(route.query, cfg))
  const apiQuery = computed(() => toApiQuery(state.value, cfg))
  const go = (next: ListState, replace = false) => navigateTo({ path: route.path, query: toRouteQuery(next, cfg) }, { replace })
  return {
    state,
    apiQuery,
    hasFilters: computed(() => Object.keys(state.value.filters).length > 0),
    setFilter: (key: string, value: string) => go(withFilter(state.value, key, value), true),
    setSort: (column: string) => go(withSort(state.value, column)),
    setPage: (page: number) => go(withPage(state.value, page)),
    clear: () => go({ page: 1, sort: cfg.defaultSort, filters: {} }),
    nextSort,
  }
}
