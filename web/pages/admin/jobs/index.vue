<script setup lang="ts">
import { formatDateTime } from '~/utils/locale'
import { isApiError } from '~/utils/errors'
import type { JobSource } from '~/components/admin/JobSourceForm.vue'
import type { Column } from '~/components/admin/DataTable.vue'
import type { FilterField } from '~/components/admin/Filters.vue'

definePageMeta({ layout: 'admin', middleware: 'admin' })
interface AdminJob { id: number, title: string, company: string | null, status: string, source: string | null, published_at: string | null, apply_clicks: number }
const { t, locale } = useI18n()
const { request } = useApi()
const toast = useToast()
const route = useRoute()
const { can } = usePermissions()
useAdminSeo(() => t('admin.jobs.title'))

const tabs = computed(() => [can('job_sources.view') && 'sources', can('jobs.view') && 'listings'].filter(Boolean) as string[])
const tab = computed(() => (typeof route.query.tab === 'string' && tabs.value.includes(route.query.tab) ? route.query.tab : tabs.value[0] ?? 'sources'))
const setTab = (v: string) => navigateTo({ path: route.path, query: v === tabs.value[0] ? {} : { tab: v } })

// ---- sources
const sources = can('job_sources.view') ? await useAsyncData('admin-job-sources', () => request<JobSource[]>('admin/job-sources')) : null
const editing = ref<JobSource | null>(null)
const creating = ref(false)
const failing = (s: JobSource) => s.last_status === 'failed' || s.consecutive_failures > 0
const srcCols = computed<Column[]>(() => [{ key: 'name', label: t('admin.fields.name') }, { key: 'driver', label: t('admin.jobs.driver') }, { key: 'active', label: t('admin.jobs.active') }, { key: 'health', label: t('admin.jobs.health') }, { key: 'last_run_at', label: t('admin.jobs.lastRun') }, { key: 'actions', label: t('admin.common.actions') }])
const sourceList = computed(() => sources?.data.value?.data ?? [])
function closeForm(reload: boolean) { editing.value = null; creating.value = false; if (reload) sources?.refresh() }

// ---- listings
const list = useAdminList({ filterKeys: ['q', 'status', 'source_id'], defaultSort: '-id', defaultPerPage: 25 })
const jobs = can('jobs.view') ? await useAsyncData('admin-jobs', () => request<AdminJob[]>('admin/jobs', { query: Object.fromEntries(Object.entries(list.apiQuery.value).filter(([k]) => k !== 'sort')) }), { watch: [list.apiQuery] }) : null
const rows = computed(() => jobs?.data.value?.data ?? [])
const meta = computed(() => jobs?.data.value?.meta)
const jobFields = computed<FilterField[]>(() => [
  { key: 'q', type: 'search', label: t('admin.common.search') },
  { key: 'status', type: 'select', label: t('admin.fields.status'), options: ['published', 'expired', 'hidden'].map(v => ({ value: v, label: t(`admin.jobs.jobStatus.${v}`) })) },
  { key: 'source_id', type: 'select', label: t('admin.jobs.source'), options: sourceList.value.map(s => ({ value: String(s.id), label: s.name })) },
])
const jobCols = computed<Column[]>(() => [{ key: 'title', label: t('admin.jobs.jobTitle') }, { key: 'company', label: t('admin.jobs.company') }, { key: 'status', label: t('admin.fields.status') }, { key: 'source', label: t('admin.jobs.source') }, { key: 'published_at', label: t('admin.jobs.published') }, { key: 'apply_clicks', label: t('admin.jobs.clicks') }, { key: 'actions', label: t('admin.common.actions') }])
const jobErr = ref('')
async function setJob(j: AdminJob, status: 'published' | 'hidden') {
  jobErr.value = ''
  try { await request(`admin/jobs/${j.id}`, { method: 'PATCH', body: { status } }); toast.success(t('admin.jobs.jobUpdated')); jobs?.refresh() } catch (e) { jobErr.value = isApiError(e) ? e.message : t('errors.generic') }
}
</script>

<template>
  <div>
    <AdminPageHeader :title="t('admin.jobs.title')" :description="t('admin.jobs.subtitle')" :crumbs="[{ label: t('admin.title'), to: '/admin' }, { label: t('admin.jobs.title') }]">
      <UiButton v-if="tab === 'sources' && can('job_sources.create')" @click="creating = true"><UiIcon name="plus" :size="18" />{{ t('admin.jobs.newSource') }}</UiButton>
    </AdminPageHeader>
    <div role="tablist" :aria-label="t('admin.jobs.title')" class="mb-4 flex gap-1 border-b border-line">
      <button v-for="x in tabs" :key="x" type="button" role="tab" :aria-selected="tab === x" class="inline-flex min-h-touch items-center rounded-t-md border border-b-0 px-4 font-medium" :class="tab === x ? 'border-line bg-surface text-primary-strong' : 'border-transparent text-ink-soft hover:bg-sunken'" @click="setTab(x)">{{ t(`admin.jobs.tab.${x}`) }}</button>
    </div>

    <section v-if="tab === 'sources' && sources" role="tabpanel">
      <UiSkeleton v-if="sources.status.value === 'pending' && !sources.data.value" :lines="5" />
      <UiErrorState v-else-if="sources.error.value" :message="isApiError(sources.error.value) ? sources.error.value.message : undefined" retry @retry="sources.refresh()" />
      <UiEmptyState v-else-if="!sourceList.length" :title="t('admin.jobs.noSources')" :description="t('admin.jobs.noSourcesHelp')" icon="briefcase" />
      <AdminDataTable v-else :columns="srcCols" :rows="sourceList" row-key="id" :caption="t('admin.jobs.tab.sources')">
        <template #cell-name="{ row }"><span dir="auto">{{ row.name }}</span><span class="block text-xs text-muted" dir="ltr">{{ row.key }} · {{ row.config_summary.host ?? '—' }}</span></template>
        <template #cell-active="{ row }"><UiBadge :tone="row.active ? 'success' : 'neutral'">{{ t(row.active ? 'admin.jobs.activeOn' : 'admin.jobs.activeOff') }}</UiBadge></template>
        <template #cell-health="{ row }"><UiBadge v-if="failing(row)" tone="danger">{{ t('admin.jobs.failing', { n: row.consecutive_failures }) }}</UiBadge><UiBadge v-else-if="row.last_status" tone="success">{{ t('admin.jobs.healthy') }}</UiBadge><span v-else class="text-muted">—</span></template>
        <template #cell-last_run_at="{ row }"><span class="text-sm">{{ row.last_run_at ? formatDateTime(row.last_run_at, locale) : t('admin.jobs.never') }}</span></template>
        <template #cell-actions="{ row }"><UiButton variant="secondary" @click="editing = row">{{ can('job_sources.update') ? t('admin.common.edit') : t('admin.common.details') }}<span class="sr-only"> {{ row.name }}</span></UiButton></template>
      </AdminDataTable>
    </section>

    <section v-else-if="tab === 'listings' && jobs" role="tabpanel">
      <AdminFilters :fields="jobFields" :filters="list.state.value.filters" @set="list.setFilter" @clear="list.clear" />
      <div aria-live="polite"><UiAlert v-if="jobErr" tone="danger" class="mb-3">{{ jobErr }}</UiAlert></div>
      <UiSkeleton v-if="jobs.status.value === 'pending' && !jobs.data.value" :lines="5" />
      <UiErrorState v-else-if="jobs.error.value" :message="isApiError(jobs.error.value) ? jobs.error.value.message : undefined" retry @retry="jobs.refresh()" />
      <UiEmptyState v-else-if="!rows.length" :title="t('admin.common.noResults')" :description="t('admin.common.noResultsHelp')" icon="briefcase" />
      <template v-else>
        <AdminDataTable :columns="jobCols" :rows="rows" row-key="id" :caption="t('admin.jobs.tab.listings')">
          <template #cell-title="{ row }"><span dir="auto">{{ row.title }}</span></template>
          <template #cell-company="{ row }"><span dir="auto">{{ row.company ?? '—' }}</span></template>
          <template #cell-status="{ row }"><UiBadge :tone="row.status === 'published' ? 'success' : row.status === 'hidden' ? 'warning' : 'neutral'">{{ t(`admin.jobs.jobStatus.${row.status}`) }}</UiBadge></template>
          <template #cell-published_at="{ row }"><span class="text-sm">{{ row.published_at ? formatDateTime(row.published_at, locale) : '—' }}</span></template>
          <template #cell-actions="{ row }">
            <UiButton v-if="can('jobs.publish') && row.status === 'published'" variant="secondary" @click="setJob(row, 'hidden')">{{ t('admin.jobs.hide') }}<span class="sr-only"> {{ row.title }}</span></UiButton>
            <UiButton v-else-if="can('jobs.publish') && row.status === 'hidden'" variant="secondary" @click="setJob(row, 'published')">{{ t('admin.jobs.unhide') }}<span class="sr-only"> {{ row.title }}</span></UiButton>
            <span v-else class="text-muted">—</span>
          </template>
        </AdminDataTable>
        <div class="mt-4 text-center"><UiPagination :page="meta?.page ?? 1" :last-page="meta?.last_page ?? 1" @change="list.setPage" /></div>
      </template>
    </section>

    <AdminDialog :open="creating || !!editing" variant="drawer" :title="creating ? t('admin.jobs.newSource') : (editing?.name ?? '')" @close="closeForm(false)">
      <AdminJobSourceForm v-if="creating || editing" :key="editing?.id ?? 'new'" :source="editing" @saved="closeForm(true)" />
    </AdminDialog>
  </div>
</template>
