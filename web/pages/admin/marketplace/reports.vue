<script setup lang="ts">
import { formatDay } from '~/utils/locale'

definePageMeta({ layout: 'admin', middleware: 'admin' })
interface Row { id: number, review_id: number, reason: string, note: string | null, status: string, created_at: string | null }
const { t, locale } = useI18n()
const { request } = useApi()
const toast = useToast()
useAdminSeo(() => t('admin.market.reports'))
const state = ref('open')
const { data, error, refresh, status } = await useAsyncData('admin-reports', async () => (await request<Row[]>('admin/marketplace/reports', { query: { status: state.value } })).data, { watch: [state] })
const busy = ref<number | null>(null)
async function resolve(r: Row, st: 'resolved' | 'dismissed', rejectReview = false) {
  busy.value = r.id
  try { await request(`admin/marketplace/reports/${r.id}/resolve`, { method: 'POST', body: { status: st, ...(rejectReview ? { reject_review: true, reason: 'report upheld' } : {}) } }); toast.success(t('admin.market.decided')); await refresh() } catch (e) { toast.error(isApiError(e) ? e.message : t('errors.generic')) } finally { busy.value = null }
}
</script>

<template>
  <div>
    <AdminPageHeader :title="t('admin.market.reports')" :description="t('admin.market.reportsHelp')" :crumbs="[{ label: t('admin.title'), to: '/admin' }, { label: t('admin.market.reports') }]" />
    <UiFormField :label="t('admin.fields.status')" class="mb-6 max-w-xs"><UiSelect v-model="state" :options="['open', 'resolved', 'dismissed'].map(v => ({ value: v, label: t(`admin.market.reportState.${v}`) }))" /></UiFormField>
    <UiSkeleton v-if="status === 'pending' && !data" :lines="5" />
    <UiErrorState v-else-if="error" :message="isApiError(error) ? error.message : undefined" retry @retry="refresh()" />
    <UiEmptyState v-else-if="!data?.length" :title="t('admin.market.queueEmpty')" icon="check" />
    <ul v-else class="space-y-3">
      <li v-for="r in data" :key="r.id" class="space-y-2 rounded-md border border-line bg-surface p-4">
        <p class="flex flex-wrap items-center gap-2"><UiBadge tone="warning">{{ t(`report.reasons.${r.reason}`) }}</UiBadge><span class="text-sm text-muted">{{ t('admin.market.reviewNo', { id: r.review_id }) }} · <bdi>{{ formatDay(r.created_at, locale) }}</bdi></span></p>
        <p v-if="r.note" class="text-ink-soft" dir="auto">{{ r.note }}</p>
        <div v-if="r.status === 'open'" class="flex flex-wrap gap-2"><UiButton :loading="busy === r.id" @click="resolve(r, 'resolved', true)">{{ t('admin.market.uphold') }}</UiButton><UiButton variant="secondary" :loading="busy === r.id" @click="resolve(r, 'dismissed')">{{ t('admin.market.dismiss') }}</UiButton></div>
      </li>
    </ul>
  </div>
</template>
