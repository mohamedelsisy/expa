<script setup lang="ts">
import { formatDate } from '~/utils/locale'
import { isApiError } from '~/utils/errors'

definePageMeta({ middleware: 'auth' })
interface Block { id: number, blocked_at: string | null }
const { t, locale } = useI18n()
const { request } = useApi()
const toast = useToast()
const community = useCommunityMeta()
const meta = await community.load()
if (!meta) throw createError({ statusCode: 404, statusMessage: 'Not Found', fatal: true })
useSeo(() => ({ title: t('community.blocks.title'), description: t('community.blocks.help'), noindex: true }))
const crumbs = computed(() => [{ label: t('nav.home'), to: '/' }, { label: t('community.title'), to: '/community' }, { label: t('community.blocks.title') }])
const { data, error, refresh, status } = await useAsyncData('community-blocks', async () => (await request<Block[]>('community/blocks')).data)
const busy = ref<number | null>(null)
async function unblock(b: Block) {
  busy.value = b.id
  try { await request(`community/blocks/${b.id}`, { method: 'DELETE' }); toast.success(t('community.blocks.removed')); await refresh() } catch (e) { toast.error(isApiError(e) ? e.message : t('errors.generic')) } finally { busy.value = null }
}
</script>

<template>
  <div class="container-page max-w-3xl py-8 sm:py-12">
    <UiBreadcrumbs :items="crumbs" class="mb-6" />
    <h1 class="text-2xl font-bold sm:text-3xl">{{ t('community.blocks.title') }}</h1>
    <p class="mt-1 mb-6 text-ink-soft">{{ t('community.blocks.help') }}</p>
    <div v-if="status === 'pending' && !data" aria-busy="true"><UiSkeleton block :lines="3" /></div>
    <UiErrorState v-else-if="error" :message="isApiError(error) ? error.message : undefined" retry @retry="refresh()" />
    <UiEmptyState v-else-if="!data?.length" :title="t('community.blocks.emptyTitle')" :description="t('community.blocks.empty')" icon="check" />
    <ul v-else class="space-y-2">
      <li v-for="(b, i) in data" :key="b.id" class="flex flex-wrap items-center justify-between gap-3 rounded-md border border-line bg-surface p-3">
        <p>{{ t('community.blocks.member', { n: i + 1 }) }}<span v-if="b.blocked_at" class="text-sm text-muted"> · {{ t('community.blocks.since', { date: formatDate(b.blocked_at, locale) }) }}</span></p>
        <UiButton variant="secondary" :loading="busy === b.id" @click="unblock(b)">{{ t('community.blocks.unblock') }}<span class="sr-only"> {{ t('community.blocks.member', { n: i + 1 }) }}</span></UiButton>
      </li>
    </ul>
  </div>
</template>
