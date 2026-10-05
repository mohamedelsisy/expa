<script setup lang="ts">
import { computed } from 'vue'
import { ENUMS, type ContentModule } from '~/utils/admin/modules'
import { STATUSES } from '~/utils/admin/workflow'
import { isApiError } from '~/utils/errors'
import { formatDateTime } from '~/utils/locale'
import type { FilterField } from './Filters.vue'
import type { Column } from './DataTable.vue'

/** Generic list for any lifecycle module: status/search/stale/module filters, sort, pagination, all URL-synced. */
const props = defineProps<{ module: ContentModule }>()
const m = props.module
const { t, locale } = useI18n()
const { request } = useApi()
const { can } = usePermissions()
const localePath = useLocalePath()
const filterKeys = ['q', 'status', 'stale', ...m.filters.map(f => f.key)]
const list = useAdminList({ filterKeys, defaultSort: '-updated_at', sortable: m.sortable, defaultPerPage: 20 })
const rels = Object.fromEntries(m.filters.filter(f => f.relation).map(f => [f.key, useRelationOptions(f.relation as never)]))
onMounted(() => Object.values(rels).forEach(r => r.load()))

const { data, error, refresh, status: st } = await useAsyncData(`admin-list-${m.key}`, () => request<Record<string, any>[]>(m.endpoint, { query: list.apiQuery.value }), { watch: [list.apiQuery] })
const rows = computed(() => data.value?.data ?? [])
const meta = computed(() => data.value?.meta)

const enumOpts = (e: string) => ENUMS[e]!.map(v => ({ value: v, label: t(`admin.enums.${e}.${v}`) }))
const fields = computed<FilterField[]>(() => [
  { key: 'q', type: 'search', label: t('admin.common.search'), placeholder: t('admin.content.searchPlaceholder') },
  { key: 'status', type: 'select', label: t('admin.fields.status'), options: STATUSES.map(v => ({ value: v, label: t(`admin.status.${v}`) })) },
  ...m.filters.map(f => ({ key: f.key, type: 'select' as const, label: t(`admin.fields.${f.key}`), options: f.enum ? enumOpts(f.enum) : (rels[f.key]?.options.value ?? []) })),
  { key: 'stale', type: 'checkbox', label: t('admin.content.staleOnly') },
])
const columns = computed<Column[]>(() => [
  { key: 'title', label: t(`admin.fields.${m.primary}`) },
  { key: 'slug', label: t('admin.fields.slug'), sortable: true },
  { key: 'status', label: t('admin.fields.status'), sortable: true },
  ...m.columns.map(c => ({ key: c, label: t(`admin.fields.${c}`), sortable: m.sortable.includes(c) })),
  { key: 'freshness', label: t('admin.fields.freshness'), sortable: true },
  { key: 'missing', label: t('admin.translation.missing') },
  { key: 'updated_at', label: t('admin.fields.updated_at'), sortable: true },
])
// freshness sorts by the verification date
const onSort = (c: string) => list.setSort(c === 'freshness' ? 'last_verified_at' : c)
const sortForTable = computed(() => list.state.value.sort.replace('last_verified_at', 'freshness'))
const titleOf = (r: Record<string, any>) => r.titles?.[locale.value] || r.titles?.ar || r.titles?.en || r.titles?.it || r.slug
const cell = (r: Record<string, any>, c: string) => {
  const v = r[c]
  if (v === true || v === false) return t(v ? 'admin.common.true' : 'admin.common.false')
  const enumKey = m.attributes.find(a => a.key === c)?.enum
  return enumKey && v ? t(`admin.enums.${enumKey}.${v}`) : (v ?? '—')
}
const errMsg = computed(() => (isApiError(error.value) ? error.value.message : undefined))
</script>

<template>
  <div>
    <AdminFilters :fields="fields" :filters="list.state.value.filters" :label="t('admin.common.filters')" @set="list.setFilter" @clear="list.clear" />
    <div aria-live="polite" class="sr-only">{{ meta?.total !== undefined ? t('admin.common.results', { count: meta.total }) : '' }}</div>
    <ul v-if="st === 'pending' && !data" aria-busy="true"><li><UiCard><UiSkeleton :lines="5" /></UiCard></li></ul>
    <UiErrorState v-else-if="error" :message="errMsg" retry @retry="refresh()" />
    <UiEmptyState v-else-if="!rows.length" :title="list.hasFilters.value ? t('admin.common.noResults') : t('admin.content.emptyTitle')" :description="list.hasFilters.value ? t('admin.common.noResultsHelp') : t('admin.content.empty')" icon="file">
      <UiButton v-if="list.hasFilters.value" variant="secondary" @click="list.clear()">{{ t('admin.common.clear') }}</UiButton>
      <UiButton v-else-if="can(`${m.permission}.create`)" :to="`/admin/content/${m.key}/new`">{{ t('admin.content.new') }}</UiButton>
    </UiEmptyState>
    <template v-else>
      <AdminDataTable :columns="columns" :rows="rows" row-key="id" :caption="t(`admin.modules.${m.key}`)" :sort="sortForTable" @sort="onSort">
        <template #cell-title="{ row }"><NuxtLink :to="localePath(`/admin/content/${m.key}/${row.id}`)" class="inline-flex min-h-touch items-center text-primary-strong underline underline-offset-4" dir="auto">{{ titleOf(row) }}</NuxtLink></template>
        <template #cell-slug="{ row }"><span dir="ltr" class="text-sm text-ink-soft">{{ row.slug }}</span></template>
        <template #cell-status="{ row }"><AdminStatusBadge :status="row.status" /></template>
        <template v-for="c in m.columns" #[`cell-${c}`]="{ row }">{{ cell(row, c) }}</template>
        <template #cell-freshness="{ row }"><AdminFreshnessBadge :freshness="row.source?.freshness ?? 'unverified'" /></template>
        <template #cell-missing="{ row }"><span v-if="!row.missing_locales?.length" class="text-muted">—</span><span v-else class="flex flex-wrap gap-1"><UiBadge v-for="l in row.missing_locales" :key="l" tone="warning">{{ l.toUpperCase() }}</UiBadge></span></template>
        <template #cell-updated_at="{ row }"><time :datetime="row.updated_at" class="text-sm text-ink-soft">{{ formatDateTime(row.updated_at, locale) }}</time></template>
      </AdminDataTable>
      <div class="mt-4 space-y-2 text-center">
        <p v-if="meta?.total !== undefined" class="text-sm text-muted">{{ t('admin.common.results', { count: meta.total }) }}</p>
        <UiPagination :page="meta?.page ?? 1" :last-page="meta?.last_page ?? 1" @change="list.setPage" />
      </div>
    </template>
  </div>
</template>
