<script setup lang="ts">
import type { PortalReview } from '~/types/extra'
import { formatDay } from '~/utils/locale'

definePageMeta({ middleware: 'auth' })
const { t, locale } = useI18n()
const { request } = useApi()
const toast = useToast()
useSeo(() => ({ title: t('provider.reviews.title'), description: t('provider.reviews.intro'), noindex: true }))
const { data, error, refresh, status } = await useAsyncData('provider-reviews', async () => (await request<PortalReview[]>('provider/reviews')).data)
const notProvider = computed(() => isApiError(error.value) && (error.value.code === 'provider_account_required' || error.value.status === 403))
const replying = ref<number | null>(null)
const text = ref('')
const err = ref<string | undefined>()
const sending = ref(false)
function open(id: number) { replying.value = id; text.value = ''; err.value = undefined }
async function send(id: number) {
  err.value = undefined
  if (!text.value.trim()) { err.value = t('provider.reviews.replyRequired'); return }
  sending.value = true
  try {
    await request(`provider/reviews/${id}/reply`, { method: 'POST', body: { body: text.value.trim() } })
    toast.success(t('provider.reviews.replySent'))
    replying.value = null
    await refresh()
  } catch (e) { err.value = isApiError(e) ? e.message : t('errors.generic') } finally { sending.value = false }
}
</script>

<template>
  <div class="container-page max-w-3xl py-8 sm:py-12">
    <h1 class="mb-6 text-2xl font-bold sm:text-3xl">{{ t('provider.reviews.title') }}</h1>
    <ProviderNav />
    <p class="mb-4 text-ink-soft">{{ t('provider.reviews.intro') }}</p>
    <div v-if="status === 'pending' && !data" aria-busy="true"><UiSkeleton block :lines="4" /></div>
    <UiEmptyState v-else-if="notProvider" :title="t('provider.noListingTitle')" :description="t('provider.noListing')" icon="user"><UiButton to="/provider">{{ t('provider.apply.title') }}</UiButton></UiEmptyState>
    <UiErrorState v-else-if="error" :message="isApiError(error) ? error.message : undefined" retry @retry="refresh()" />
    <UiEmptyState v-else-if="!data?.length" :title="t('provider.reviews.emptyTitle')" :description="t('provider.reviews.empty')" icon="list" />
    <ul v-else class="space-y-3">
      <li v-for="r in data" :key="r.id" class="space-y-2 rounded-md border border-line bg-surface p-4">
        <p class="flex flex-wrap items-center gap-2"><span class="font-semibold tabular-nums"><bdi>{{ t('services.review.outOf', { rating: r.rating }) }}</bdi></span><span v-if="r.created_at" class="text-sm text-muted"><bdi>{{ formatDay(r.created_at, locale) }}</bdi></span></p>
        <p v-if="r.body" class="prose-plain" dir="auto">{{ r.body }}</p>
        <div v-if="r.reply" class="rounded-md bg-sunken p-3"><p class="flex flex-wrap items-center gap-2 text-sm font-semibold">{{ t('services.review.reply') }}<UiBadge :tone="r.reply_status === 'approved' ? 'success' : 'info'">{{ t(`provider.reviews.replyStatus.${r.reply_status ?? 'pending'}`) }}</UiBadge></p><p class="prose-plain" dir="auto">{{ r.reply }}</p></div>
        <template v-if="!r.reply">
          <UiButton v-if="replying !== r.id" variant="secondary" @click="open(r.id)">{{ t('provider.reviews.reply') }}</UiButton>
          <form v-else class="space-y-3" novalidate @submit.prevent="send(r.id)">
            <UiFormField :label="t('provider.reviews.replyLabel')" :hint="t('provider.reviews.replyHint')" :error="err" required><UiTextarea v-model="text" :rows="3" :maxlength="3000" /></UiFormField>
            <div class="flex gap-2"><UiButton type="submit" :loading="sending">{{ t('provider.reviews.send') }}</UiButton><UiButton variant="ghost" @click="replying = null">{{ t('common.cancel') }}</UiButton></div>
          </form>
        </template>
      </li>
    </ul>
  </div>
</template>
