<script setup lang="ts">
import { formatDay } from '~/utils/locale'
import { isApiError } from '~/utils/errors'
import type { Column } from '~/components/admin/DataTable.vue'

definePageMeta({ layout: 'admin', middleware: 'admin' })
interface Chunk { item_type: string, item_id: number, item_slug: string | null, locale: string, title: string | null, source_name: string | null, source_url: string | null, source_type: string | null, last_verified_at: string | null, chunks: number }
const { t, locale } = useI18n()
const { request } = useApi()
const toast = useToast()
useAdminSeo(() => t('admin.ai.knowledge.title'))

const page = ref(1)
const lang = ref('')
const sourceType = ref('')
const query = computed(() => ({ page: page.value, per_page: 25, ...(lang.value ? { locale: lang.value } : {}), ...(sourceType.value ? { source_type: sourceType.value } : {}) }))
const { data, error, refresh, status: st } = await useAsyncData('admin-ai-knowledge', () => request<Chunk[]>('admin/ai/knowledge', { query: query.value }), { watch: [query] })
const rows = computed(() => data.value?.data ?? [])
const meta = computed(() => data.value?.meta as { page?: number, last_page?: number, total?: number, chunks_total?: number, stale_after_days?: number } | undefined)
const columns = computed<Column[]>(() => [
  { key: 'title', label: t('admin.ai.knowledge.item') }, { key: 'item_type', label: t('admin.ai.knowledge.type') }, { key: 'locale', label: t('admin.ai.knowledge.language') },
  { key: 'source', label: t('admin.ai.knowledge.source') }, { key: 'last_verified_at', label: t('admin.ai.knowledge.verified') }, { key: 'chunks', label: t('admin.ai.knowledge.chunks') },
])
const stale = (c: Chunk) => !c.last_verified_at || (meta.value?.stale_after_days != null && Date.now() - new Date(c.last_verified_at).getTime() > meta.value.stale_after_days * 86_400_000)

const confirming = ref(false)
const busy = ref(false)
const failure = ref('')
async function reindex() {
  busy.value = true; failure.value = ''
  try {
    const res = await request<{ chunks: number }>('admin/ai/knowledge/reindex', { method: 'POST' })
    toast.success(t('admin.ai.knowledge.reindexed', { count: res.data.chunks }))
    confirming.value = false
    await refresh()
  } catch (e) {
    failure.value = isApiError(e) && e.status === 403 ? t('admin.common.forbidden') : isApiError(e) ? e.message : t('errors.generic')
  } finally { busy.value = false }
}
</script>

<template>
  <div>
    <AdminPageHeader :title="t('admin.ai.knowledge.title')" :description="t('admin.ai.knowledge.help')" :crumbs="[{ label: t('admin.title'), to: '/admin' }, { label: t('admin.ai.knowledge.title') }]">
      <UiButton v-if="!confirming" variant="secondary" @click="confirming = true"><UiIcon name="refresh" :size="18" />{{ t('admin.ai.knowledge.reindex') }}</UiButton>
    </AdminPageHeader>
    <UiConfirmInline v-if="confirming" class="mb-6" :message="t('admin.ai.knowledge.reindexConfirm')" :confirm-label="t('admin.ai.knowledge.reindex')" :loading="busy" @cancel="confirming = false" @confirm="reindex" />
    <div aria-live="polite"><UiAlert v-if="failure" tone="danger" class="mb-4">{{ failure }}</UiAlert></div>
    <p v-if="meta?.chunks_total !== undefined" class="mb-4 text-ink-soft" data-testid="knowledge-total">{{ t('admin.ai.knowledge.total', { chunks: meta.chunks_total, items: meta.total ?? 0 }) }}</p>
    <div class="mb-6 grid gap-4 sm:grid-cols-2">
      <UiFormField :label="t('admin.ai.knowledge.language')"><UiSelect :model-value="lang" :options="['ar', 'en', 'it'].map(v => ({ value: v, label: t(`languages.${v}`) }))" :placeholder="t('admin.common.all')" @update:model-value="lang = $event; page = 1" /></UiFormField>
      <UiFormField :label="t('admin.ai.knowledge.source')"><UiSelect :model-value="sourceType" :options="['official', 'institutional', 'verified_partner', 'third_party'].map(v => ({ value: v, label: t(`admin.ai.knowledge.sourceTypes.${v}`) }))" :placeholder="t('admin.common.all')" @update:model-value="sourceType = $event; page = 1" /></UiFormField>
    </div>
    <ul v-if="st === 'pending' && !data" aria-busy="true"><li><UiCard><UiSkeleton :lines="5" /></UiCard></li></ul>
    <UiErrorState v-else-if="error" :message="isApiError(error) ? error.message : undefined" retry @retry="refresh()" />
    <UiEmptyState v-else-if="!rows.length" :title="t('admin.ai.knowledge.empty')" :description="t('admin.ai.knowledge.emptyHelp')" icon="book" />
    <template v-else>
      <AdminDataTable :columns="columns" :rows="rows" row-key="item_slug" :caption="t('admin.ai.knowledge.title')">
        <template #cell-title="{ row }"><span dir="auto">{{ row.title ?? row.item_slug ?? row.item_id }}</span></template>
        <template #cell-source="{ row }"><span class="text-sm"><span dir="auto">{{ row.source_name ?? '—' }}</span><UiBadge v-if="row.source_type" class="ms-2" tone="neutral">{{ t(`admin.ai.knowledge.sourceTypes.${row.source_type}`) }}</UiBadge></span></template>
        <template #cell-last_verified_at="{ row }"><span class="text-sm">{{ row.last_verified_at ? formatDay(row.last_verified_at, locale) : t('admin.ai.knowledge.never') }}</span><UiBadge v-if="stale(row)" class="ms-2" tone="warning">{{ t('admin.ai.knowledge.stale') }}</UiBadge></template>
      </AdminDataTable>
      <div class="mt-4"><UiPagination :page="meta?.page ?? 1" :last-page="meta?.last_page ?? 1" @change="page = $event" /></div>
    </template>
  </div>
</template>
