<script setup lang="ts">
import { formatDay } from '~/utils/locale'

definePageMeta({ layout: 'admin', middleware: 'admin' })
interface Row { id: number, provider: { id: number, display_name: string }, rating: number, body: string | null, status: string, reply: string | null, reply_status: string | null, moderation_reason: string | null, created_at: string | null, open_reports: number }
const { t, locale } = useI18n()
const { request } = useApi()
const toast = useToast()
useAdminSeo(() => t('admin.market.reviews'))
const state = ref('pending')
const page = ref(1)
const { data, error, refresh, status } = await useAsyncData('admin-reviews', () => request<Row[]>('admin/marketplace/reviews', { query: { status: state.value, page: page.value, per_page: 20 } }), { watch: [state, page] })
const rows = computed(() => data.value?.data ?? [])
const reason = reactive<Record<number, string>>({})
const busy = ref<number | null>(null)
const states = ['pending', 'approved', 'rejected', 'reply_pending']
async function review(r: Row, decision: 'approved' | 'rejected') {
  if (decision === 'rejected' && !(reason[r.id] ?? '').trim()) { toast.error(t('admin.market.reasonRequired')); return }
  busy.value = r.id
  try { await request(`admin/marketplace/reviews/${r.id}/moderate`, { method: 'POST', body: { decision, ...(decision === 'rejected' ? { reason: reason[r.id]!.trim() } : {}) } }); toast.success(t('admin.market.decided')); await refresh() } catch (e) { toast.error(isApiError(e) ? e.message : t('errors.generic')) } finally { busy.value = null }
}
async function reply(r: Row, decision: 'approved' | 'rejected') {
  busy.value = r.id
  try { await request(`admin/marketplace/reviews/${r.id}/reply-moderate`, { method: 'POST', body: { decision } }); toast.success(t('admin.market.decided')); await refresh() } catch (e) { toast.error(isApiError(e) ? e.message : t('errors.generic')) } finally { busy.value = null }
}
</script>

<template>
  <div>
    <AdminPageHeader :title="t('admin.market.reviews')" :description="t('admin.market.reviewsHelp')" :crumbs="[{ label: t('admin.title'), to: '/admin' }, { label: t('admin.market.reviews') }]" />
    <UiFormField :label="t('admin.fields.status')" class="mb-6 max-w-xs"><UiSelect :model-value="state" :options="states.map(v => ({ value: v, label: t(`admin.market.reviewState.${v}`) }))" @update:model-value="state = $event; page = 1" /></UiFormField>
    <UiSkeleton v-if="status === 'pending' && !data" :lines="6" />
    <UiErrorState v-else-if="error" :message="isApiError(error) ? error.message : undefined" retry @retry="refresh()" />
    <UiEmptyState v-else-if="!rows.length" :title="t('admin.market.queueEmpty')" icon="check" />
    <template v-else>
      <ul class="space-y-3">
        <li v-for="r in rows" :key="r.id" class="space-y-2 rounded-md border border-line bg-surface p-4">
          <p class="flex flex-wrap items-center gap-2"><span class="font-semibold" dir="auto">{{ r.provider.display_name }}</span><span class="tabular-nums"><bdi>{{ t('services.review.outOf', { rating: r.rating }) }}</bdi></span><UiBadge v-if="r.open_reports" tone="warning">{{ t('admin.market.reportsOpen', { count: r.open_reports }) }}</UiBadge><span class="text-sm text-muted"><bdi>{{ formatDay(r.created_at, locale) }}</bdi></span></p>
          <p v-if="r.body" class="prose-plain" dir="auto">{{ r.body }}</p>
          <p v-if="r.reply" class="rounded-md bg-sunken p-2 text-sm" dir="auto"><span class="font-semibold">{{ t('services.review.reply') }} ({{ r.reply_status }}):</span> {{ r.reply }}</p>
          <div v-if="state === 'pending'" class="space-y-2"><UiFormField :label="t('admin.market.rejectReason')" optional><UiTextInput v-model="reason[r.id]" :maxlength="255" /></UiFormField><div class="flex gap-2"><UiButton :loading="busy === r.id" @click="review(r, 'approved')">{{ t('admin.market.approve') }}</UiButton><UiButton variant="secondary" :loading="busy === r.id" @click="review(r, 'rejected')">{{ t('admin.market.reject') }}</UiButton></div></div>
          <div v-else-if="state === 'reply_pending'" class="flex gap-2"><UiButton :loading="busy === r.id" @click="reply(r, 'approved')">{{ t('admin.market.approveReply') }}</UiButton><UiButton variant="secondary" :loading="busy === r.id" @click="reply(r, 'rejected')">{{ t('admin.market.rejectReply') }}</UiButton></div>
          <p v-else-if="r.moderation_reason" class="text-sm text-muted">{{ t('services.mine.reason', { reason: r.moderation_reason }) }}</p>
        </li>
      </ul>
      <div class="mt-6"><UiPagination :page="data?.meta.page ?? 1" :last-page="data?.meta.last_page ?? 1" @change="page = $event" /></div>
    </template>
  </div>
</template>
