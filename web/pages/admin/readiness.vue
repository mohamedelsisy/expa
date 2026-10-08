<script setup lang="ts">
import { CONTENT_MODULES } from '~/utils/admin/modules'
import { READINESS_QUERIES, mapLimit, readinessOf, sumCounts, type CountKey, type Counts } from '~/utils/admin/readiness'
import { formatNumber } from '~/utils/locale'
import { isApiError } from '~/utils/errors'

definePageMeta({ layout: 'admin', middleware: 'admin' })
const { t, locale } = useI18n()
const { request } = useApi()
const { can } = usePermissions()
const localePath = useLocalePath()
useAdminSeo(() => t('admin.ready.title'))

interface Row { key: string, label: string, to: string, icon: string, state: 'pending' | 'done' | 'error', counts: Counts | null, error?: string }
const rows = ref<Row[]>(CONTENT_MODULES.filter(m => can(`${m.permission}.view`)).map(m => ({ key: m.key, label: `admin.modules.${m.key}`, to: `/admin/content/${m.key}`, icon: m.icon, state: 'pending', counts: null })))
const loading = ref(false)
const num = (n: number) => formatNumber(n, locale.value)

async function loadRow(r: Row) {
  const m = CONTENT_MODULES.find(x => x.key === r.key)!
  r.state = 'pending'
  r.error = undefined
  try {
    const keys = Object.keys(READINESS_QUERIES) as CountKey[]
    const totals = await Promise.all(keys.map(async (k) => (await request<unknown[]>(m.endpoint, { query: { per_page: 1, ...READINESS_QUERIES[k] } })).meta.total ?? 0))
    r.counts = Object.fromEntries(keys.map((k, i) => [k, totals[i]])) as unknown as Counts
    r.state = 'done'
  } catch (e) {
    r.state = 'error'
    r.error = isApiError(e) ? e.message : t('errors.generic')
  }
}
// Job sources are not lifecycle content: show how many exist, are active and are failing.
interface Src { active: boolean, last_status: string | null, consecutive_failures: number }
const srcCounts = ref<{ total: number, active: number, failing: number } | null>(null)
const srcError = ref<string | null>(null)
async function loadSources() {
  if (!can('job_sources.view')) return
  srcError.value = null
  try {
    const list = (await request<Src[]>('admin/job-sources')).data
    srcCounts.value = { total: list.length, active: list.filter(x => x.active).length, failing: list.filter(x => x.last_status === 'failed' || x.consecutive_failures > 0).length }
  } catch (e) { srcError.value = isApiError(e) ? e.message : t('errors.generic') }
}
async function loadAll() {
  loading.value = true
  void loadSources()
  await mapLimit(rows.value, 3, loadRow)
  loading.value = false
}
onMounted(loadAll)

const total = computed(() => sumCounts(rows.value.map(r => r.counts)))
const failed = computed(() => rows.value.filter(r => r.state === 'error').length)
</script>

<template>
  <div>
    <AdminPageHeader :title="t('admin.ready.title')" :description="t('admin.ready.description')">
      <UiButton variant="secondary" :loading="loading" @click="loadAll"><UiIcon name="refresh" :size="18" />{{ t('admin.ready.refresh') }}</UiButton>
    </AdminPageHeader>

    <UiEmptyState v-if="!rows.length" :title="t('admin.ready.noneTitle')" :description="t('admin.ready.none')" icon="shield" />
    <template v-else>
      <UiAlert v-if="failed" tone="warning" class="mb-4">{{ t('admin.ready.someFailed', { n: failed }) }}</UiAlert>
      <dl class="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4" data-testid="ready-totals">
        <div v-for="k in (['total', 'published', 'draft', 'staleLive'] as const)" :key="k" class="rounded-lg border border-line bg-surface p-4">
          <dt class="text-sm text-ink-soft">{{ t(`admin.ready.cols.${k}`) }}</dt>
          <dd class="mt-1 text-2xl font-bold tabular-nums">{{ num(total[k]) }}</dd>
        </div>
      </dl>
      <p class="mb-3 text-sm text-muted">{{ t('admin.ready.staleNote') }}</p>
      <div class="overflow-x-auto rounded-lg border border-line" role="region" tabindex="0" :aria-label="t('admin.ready.title')">
        <table class="w-full text-start" data-testid="ready-table">
          <caption class="sr-only">{{ t('admin.ready.title') }}</caption>
          <thead class="bg-sunken text-sm">
            <tr>
              <th scope="col" class="px-3 py-2 text-start">{{ t('admin.ready.module') }}</th>
              <th v-for="k in (['total', 'published', 'draft', 'staleLive'] as const)" :key="k" scope="col" class="px-3 py-2 text-end">{{ t(`admin.ready.cols.${k}`) }}</th>
              <th scope="col" class="px-3 py-2 text-start">{{ t('admin.ready.status') }}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-line">
            <tr v-for="r in rows" :key="r.key" :data-module="r.key">
              <th scope="row" class="px-3 py-2 text-start font-medium"><NuxtLink :to="localePath(r.to)" class="underline-offset-4 hover:underline">{{ t(r.label) }}</NuxtLink></th>
              <template v-if="r.state === 'done' && r.counts">
                <td v-for="k in (['total', 'published', 'draft', 'staleLive'] as const)" :key="k" class="px-3 py-2 text-end tabular-nums">{{ num(r.counts[k]) }}</td>
                <td class="px-3 py-2"><UiBadge :tone="({ empty: 'danger', nothing_published: 'warning', needs_attention: 'warning', ready: 'success' } as const)[readinessOf(r.counts)]">{{ t(`admin.ready.states.${readinessOf(r.counts)}`) }}</UiBadge></td>
              </template>
              <td v-else-if="r.state === 'error'" colspan="5" class="px-3 py-2 text-danger">{{ r.error }} <button type="button" class="inline-flex min-h-touch items-center font-medium underline" @click="loadRow(r)">{{ t('common.retry') }}</button></td>
              <td v-else colspan="5" class="px-3 py-2 text-muted" aria-busy="true">{{ t('common.loading') }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>

    <UiCard v-if="can('job_sources.view')" as="section" aria-labelledby="ready-src-h" class="mt-6 space-y-2" data-testid="ready-sources">
      <h2 id="ready-src-h" class="text-lg font-bold">{{ t('admin.ready.sources') }}</h2>
      <p v-if="srcError" class="text-danger">{{ srcError }}</p>
      <p v-else-if="srcCounts" class="text-ink-soft">{{ t('admin.ready.sourcesCounts', { total: num(srcCounts.total), active: num(srcCounts.active), failing: num(srcCounts.failing) }) }}</p>
      <p v-else class="text-muted">{{ t('common.loading') }}</p>
      <UiButton to="/admin/jobs" variant="ghost">{{ t('admin.ready.openJobs') }}</UiButton>
    </UiCard>
  </div>
</template>
