<script setup lang="ts">
import { formatDay } from '~/utils/locale'

definePageMeta({ layout: 'admin', middleware: 'admin' })
interface Row { id: number, type: string, title: string | null, body: string, status: string, flagged: boolean, shadowed: boolean, author_id: number, moderation_reason: string | null, created_at: string | null, open_reports: number }
interface Report { id: number, type: string, target_id: number, reason: string, note: string | null, status: string, created_at: string | null }
const { t, locale } = useI18n()
const { request } = useApi()
const toast = useToast()
const { can } = usePermissions()
useAdminSeo(() => t('admin.community.title'))
const type = ref('question')
const state = ref('pending')
const page = ref(1)
const { data, error, refresh, status } = await useAsyncData('admin-community', () => request<Row[]>('admin/community/queue', { query: { type: type.value, status: state.value, page: page.value, per_page: 20 } }), { watch: [type, state, page] })
const { data: reports, refresh: refreshReports } = await useAsyncData('admin-community-reports', async () => { try { return (await request<Report[]>('admin/community/reports')).data } catch { return [] as Report[] } })
const disabled = computed(() => isApiError(error.value) && error.value.status === 404)
const rows = computed(() => data.value?.data ?? [])
const reason = reactive<Record<string, string>>({})
const busy = ref<string | null>(null)
async function moderate(r: Row, action: 'approve' | 'hide' | 'remove') {
  const key = `${r.type}${r.id}`
  if (action !== 'approve' && !(reason[key] ?? '').trim()) { toast.error(t('admin.market.reasonRequired')); return }
  busy.value = key
  try { await request(`admin/community/${r.type}/${r.id}/moderate`, { method: 'POST', body: { action, ...(action !== 'approve' ? { reason: reason[key]!.trim() } : {}) } }); toast.success(t('admin.market.decided')); await refresh() } catch (e) { toast.error(isApiError(e) ? e.message : t('errors.generic')) } finally { busy.value = null }
}
async function resolve(r: Report, st: 'resolved' | 'dismissed') {
  busy.value = `r${r.id}`
  try { await request(`admin/community/reports/${r.id}/resolve`, { method: 'POST', body: { status: st } }); toast.success(t('admin.market.decided')); await refreshReports() } catch (e) { toast.error(isApiError(e) ? e.message : t('errors.generic')) } finally { busy.value = null }
}
</script>

<template>
  <div>
    <AdminPageHeader :title="t('admin.community.title')" :description="t('admin.community.help')" :crumbs="[{ label: t('admin.title'), to: '/admin' }, { label: t('admin.community.title') }]" />
    <UiAlert v-if="disabled" tone="info" data-testid="community-off">{{ t('admin.community.off') }}</UiAlert>
    <template v-else>
      <div class="mb-6 grid gap-4 sm:grid-cols-2">
        <UiFormField :label="t('admin.community.type')"><UiSelect :model-value="type" :options="['question', 'answer', 'comment'].map(v => ({ value: v, label: t(`admin.community.types.${v}`) }))" @update:model-value="type = $event; page = 1" /></UiFormField>
        <UiFormField :label="t('admin.fields.status')"><UiSelect :model-value="state" :options="['pending', 'approved', 'hidden', 'removed'].map(v => ({ value: v, label: t(`admin.community.states.${v}`) }))" @update:model-value="state = $event; page = 1" /></UiFormField>
      </div>
      <UiSkeleton v-if="status === 'pending' && !data" :lines="6" />
      <UiErrorState v-else-if="error" :message="isApiError(error) ? error.message : undefined" retry @retry="refresh()" />
      <UiEmptyState v-else-if="!rows.length" :title="t('admin.market.queueEmpty')" icon="check" />
      <ul v-else class="space-y-3">
        <li v-for="r in rows" :key="`${r.type}${r.id}`" class="space-y-2 rounded-md border border-line bg-surface p-4">
          <p class="flex flex-wrap items-center gap-2"><UiBadge v-if="r.flagged" tone="warning">{{ t('admin.community.flagged') }}</UiBadge><UiBadge v-if="r.open_reports" tone="warning">{{ t('admin.market.reportsOpen', { count: r.open_reports }) }}</UiBadge><span class="text-sm text-muted">{{ t('admin.community.author', { id: r.author_id }) }} · <bdi>{{ formatDay(r.created_at, locale) }}</bdi></span></p>
          <p v-if="r.title" class="font-semibold" dir="auto">{{ r.title }}</p>
          <p class="prose-plain" dir="auto">{{ r.body }}</p>
          <div v-if="can('community.moderate')" class="space-y-2"><UiFormField :label="t('admin.market.rejectReason')" optional><UiTextInput v-model="reason[`${r.type}${r.id}`]" :maxlength="255" /></UiFormField>
            <div class="flex flex-wrap gap-2"><UiButton :loading="busy === `${r.type}${r.id}`" @click="moderate(r, 'approve')">{{ t('admin.market.approve') }}</UiButton><UiButton variant="secondary" :loading="busy === `${r.type}${r.id}`" @click="moderate(r, 'hide')">{{ t('admin.community.hide') }}</UiButton><UiButton variant="ghost" :loading="busy === `${r.type}${r.id}`" @click="moderate(r, 'remove')">{{ t('admin.community.remove') }}</UiButton></div></div>
        </li>
      </ul>
      <div class="mt-6"><UiPagination :page="data?.meta.page ?? 1" :last-page="data?.meta.last_page ?? 1" @change="page = $event" /></div>

      <section aria-labelledby="cr-h" class="mt-10 space-y-3">
        <h2 id="cr-h" class="text-xl font-bold">{{ t('admin.community.reports') }}</h2>
        <p v-if="!reports?.length" class="text-muted">{{ t('admin.market.queueEmpty') }}</p>
        <ul v-else class="space-y-2">
          <li v-for="r in reports" :key="r.id" class="flex flex-wrap items-center justify-between gap-2 rounded-md border border-line bg-surface p-3">
            <p><UiBadge tone="warning">{{ t(`report.reasons.${r.reason}`) }}</UiBadge> <span class="text-sm text-muted">{{ t(`admin.community.types.${r.type}`) }} #{{ r.target_id }}</span><span v-if="r.note" class="ms-2 text-sm" dir="auto">{{ r.note }}</span></p>
            <div class="flex gap-2"><UiButton variant="secondary" :loading="busy === `r${r.id}`" @click="resolve(r, 'resolved')">{{ t('admin.community.resolve') }}</UiButton><UiButton variant="ghost" :loading="busy === `r${r.id}`" @click="resolve(r, 'dismissed')">{{ t('admin.market.dismiss') }}</UiButton></div>
          </li>
        </ul>
      </section>
    </template>
  </div>
</template>
