<script setup lang="ts">
import { formatDateTime } from '~/utils/locale'
import { isApiError } from '~/utils/errors'
import type { Column } from '~/components/admin/DataTable.vue'

definePageMeta({ layout: 'admin', middleware: 'admin' })
interface Conv { id: number, user_id: number | null, locale: string, messages: number, degraded: number, created_at: string | null, updated_at: string | null }
interface Usage { questions_30d: number, degraded_30d: number, tokens_in_30d: number, tokens_out_30d: number, by_intent: { intent: string, total: number }[] }
const { t, locale } = useI18n()
const { request } = useApi()
useAdminSeo(() => t('admin.ai.conversations.title'))
const page = ref(1)
const { data, error, refresh, status: st } = await useAsyncData('admin-ai-conversations', () => request<Conv[]>('admin/ai/conversations', { query: { page: page.value, per_page: 25 } }), { watch: [page] })
const { data: usage } = await useAsyncData('admin-ai-usage', async () => { try { return (await request<Usage>('admin/ai/usage')).data } catch { return null } })
const rows = computed(() => data.value?.data ?? [])
const meta = computed(() => data.value?.meta)
const nf = computed(() => new Intl.NumberFormat(locale.value))
const columns = computed<Column[]>(() => [
  { key: 'id', label: '#' }, { key: 'user_id', label: t('admin.ai.conversations.user') }, { key: 'locale', label: t('admin.ai.knowledge.language') },
  { key: 'messages', label: t('admin.ai.conversations.messages') }, { key: 'degraded', label: t('admin.ai.conversations.degraded') }, { key: 'updated_at', label: t('admin.ai.conversations.updated') },
])
</script>

<template>
  <div>
    <AdminPageHeader :title="t('admin.ai.conversations.title')" :description="t('admin.ai.conversations.help')" :crumbs="[{ label: t('admin.title'), to: '/admin' }, { label: t('admin.ai.conversations.title') }]" />
    <UiAlert tone="info" class="mb-6" data-testid="metadata-only">{{ t('admin.ai.conversations.privacy') }}</UiAlert>
    <section v-if="usage" aria-labelledby="usage-h" class="mb-8 space-y-3">
      <h2 id="usage-h" class="text-xl font-bold">{{ t('admin.ai.conversations.usageTitle') }}</h2>
      <dl class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div v-for="k in (['questions_30d', 'degraded_30d', 'tokens_in_30d', 'tokens_out_30d'] as const)" :key="k" class="rounded-md border border-line bg-surface p-4">
          <dt class="text-sm text-ink-soft">{{ t(`admin.ai.conversations.usage.${k}`) }}</dt><dd class="mt-1 text-2xl font-bold" dir="ltr">{{ nf.format(usage[k]) }}</dd>
        </div>
      </dl>
      <div v-if="usage.by_intent.length">
        <h3 class="mb-2 font-bold">{{ t('admin.ai.conversations.byIntent') }}</h3>
        <ul class="flex flex-wrap gap-2"><li v-for="i in usage.by_intent" :key="i.intent"><UiBadge tone="neutral"><span dir="ltr">{{ i.intent }}: {{ nf.format(i.total) }}</span></UiBadge></li></ul>
      </div>
    </section>
    <h2 class="mb-3 text-xl font-bold">{{ t('admin.ai.conversations.listTitle') }}</h2>
    <ul v-if="st === 'pending' && !data" aria-busy="true"><li><UiCard><UiSkeleton :lines="5" /></UiCard></li></ul>
    <UiErrorState v-else-if="error" :message="isApiError(error) ? error.message : undefined" retry @retry="refresh()" />
    <UiEmptyState v-else-if="!rows.length" :title="t('admin.ai.conversations.empty')" icon="help" />
    <template v-else>
      <AdminDataTable :columns="columns" :rows="rows" row-key="id" :caption="t('admin.ai.conversations.title')">
        <template #cell-user_id="{ row }"><span dir="ltr">{{ row.user_id ?? '—' }}</span></template>
        <template #cell-locale="{ row }">{{ t(`languages.${row.locale}`) }}</template>
        <template #cell-updated_at="{ row }"><span class="text-sm">{{ formatDateTime(row.updated_at, locale) }}</span></template>
      </AdminDataTable>
      <div class="mt-4"><UiPagination :page="meta?.page ?? 1" :last-page="meta?.last_page ?? 1" @change="page = $event" /></div>
    </template>
  </div>
</template>
