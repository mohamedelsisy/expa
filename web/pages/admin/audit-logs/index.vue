<script setup lang="ts">
import { formatDateTime } from '~/utils/locale'
import { isApiError } from '~/utils/errors'
import { formatChanges } from '~/utils/admin/changes'
import type { Column } from '~/components/admin/DataTable.vue'
import type { FilterField } from '~/components/admin/Filters.vue'

definePageMeta({ layout: 'admin', middleware: 'admin' })
interface Log { id: number, actor_id: number | null, action: string, subject_type: string | null, subject_id: number | null, changes: unknown, created_at: string | null }
const { t, te, locale } = useI18n()
const { request } = useApi()
useAdminSeo(() => t('admin.audit.title'))

const list = useAdminList({ filterKeys: ['action', 'actor_id', 'subject_type', 'subject_id', 'from', 'to'], defaultSort: '-id', defaultPerPage: 25 })
const { data, error, refresh, status: st } = await useAsyncData('admin-audit', () => request<Log[]>('admin/audit-logs', { query: Object.fromEntries(Object.entries(list.apiQuery.value).filter(([k]) => k !== 'sort')) }), { watch: [list.apiQuery] })
const rows = computed(() => data.value?.data ?? [])
const meta = computed(() => data.value?.meta)
const fields = computed<FilterField[]>(() => [
  { key: 'action', type: 'search', label: t('admin.audit.action'), placeholder: t('admin.audit.actionHelp'), ltr: true },
  { key: 'actor_id', type: 'search', label: t('admin.audit.actor'), ltr: true },
  { key: 'subject_type', type: 'search', label: t('admin.audit.subjectType'), ltr: true },
  { key: 'subject_id', type: 'search', label: t('admin.audit.subjectId'), ltr: true },
  { key: 'from', type: 'date', label: t('admin.dash.from') },
  { key: 'to', type: 'date', label: t('admin.dash.to') },
])
const cols = computed<Column[]>(() => [{ key: 'created_at', label: t('admin.audit.when') }, { key: 'action', label: t('admin.audit.action') }, { key: 'actor_id', label: t('admin.audit.actor') }, { key: 'subject', label: t('admin.audit.subject') }, { key: 'changes', label: t('admin.audit.changes') }])
const actionLabel = (a: string) => { const k = `admin.audit.actions.${a.replace(/\./g, '_')}`; return te(k) ? t(k) : a }
const rowsOf = (c: unknown) => formatChanges(c)
const keyLabel = (k: string) => (te(`admin.audit.keys.${k}`) ? t(`admin.audit.keys.${k}`) : k)
const subject = (l: Log) => (l.subject_type ? `${l.subject_type.split('\\').pop()} #${l.subject_id ?? ''}` : '—')
</script>

<template>
  <div>
    <AdminPageHeader :title="t('admin.audit.title')" :description="t('admin.audit.subtitle')" :crumbs="[{ label: t('admin.title'), to: '/admin' }, { label: t('admin.audit.title') }]" />
    <AdminFilters :fields="fields" :filters="list.state.value.filters" @set="list.setFilter" @clear="list.clear" />
    <UiSkeleton v-if="st === 'pending' && !data" :lines="6" />
    <UiErrorState v-else-if="error" :message="isApiError(error) ? error.message : undefined" retry @retry="refresh()" />
    <UiEmptyState v-else-if="!rows.length" :title="t('admin.common.noResults')" :description="t('admin.common.noResultsHelp')" icon="list" />
    <template v-else>
      <AdminDataTable :columns="cols" :rows="rows" row-key="id" :caption="t('admin.audit.title')">
        <template #cell-created_at="{ row }"><time :datetime="row.created_at ?? undefined" class="text-sm">{{ formatDateTime(row.created_at, locale) }}</time></template>
        <template #cell-action="{ row }"><span class="font-medium">{{ actionLabel(row.action) }}</span><span class="block text-xs text-muted" dir="ltr">{{ row.action }}</span></template>
        <template #cell-actor_id="{ row }"><span dir="ltr">{{ row.actor_id ?? t('admin.audit.system') }}</span></template>
        <template #cell-subject="{ row }"><span dir="ltr" class="text-sm">{{ subject(row) }}</span></template>
        <template #cell-changes="{ row }">
          <span v-if="!rowsOf(row.changes).length" class="text-muted">—</span>
          <ul v-else class="space-y-0.5 text-sm">
            <li v-for="c in rowsOf(row.changes)" :key="c.key">
              <span class="font-medium">{{ keyLabel(c.key) }}:</span>
              <template v-if="c.mode === 'diff'">
                <AdminChangeValue :v="c.old!" /> <span aria-hidden="true">→</span><span class="sr-only">{{ t('admin.audit.to') }}</span> <AdminChangeValue :v="c.new" />
              </template>
              <AdminChangeValue v-else :v="c.new" />
            </li>
          </ul>
        </template>
      </AdminDataTable>
      <div class="mt-4 space-y-2 text-center"><p v-if="meta?.total !== undefined" class="text-sm text-muted">{{ t('admin.common.results', { count: meta.total }) }}</p><UiPagination :page="meta?.page ?? 1" :last-page="meta?.last_page ?? 1" @change="list.setPage" /></div>
    </template>
  </div>
</template>
