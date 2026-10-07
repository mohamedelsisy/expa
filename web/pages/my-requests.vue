<script setup lang="ts">
import type { MyLead, MyReview } from '~/types/extra'
import { formatDateTime } from '~/utils/locale'

definePageMeta({ middleware: 'auth' })
const { t, locale } = useI18n()
const { request } = useApi()
const toast = useToast()
const localePath = useLocalePath()
useSeo(() => ({ title: t('services.mine.title'), description: t('services.mine.subtitle'), noindex: true }))

const { data, error, refresh, status } = await useAsyncData('my-requests', async () => {
  const [leads, reviews] = await Promise.all([request<MyLead[]>('my/provider-leads'), request<MyReview[]>('my/provider-reviews')])
  return { leads: leads.data, reviews: reviews.data }
}, { watch: [locale] })
const confirmId = ref<number | null>(null)
const busy = ref(false)
async function removeReview(id: number) {
  busy.value = true
  try { await request(`my/provider-reviews/${id}`, { method: 'DELETE' }); toast.success(t('services.mine.reviewDeleted')); confirmId.value = null; await refresh() } catch (e) { toast.error(isApiError(e) ? e.message : t('errors.generic')) } finally { busy.value = false }
}
const crumbs = computed(() => [{ label: t('services.title'), to: '/services' }, { label: t('services.mine.title') }])
</script>

<template>
  <div class="container-page max-w-3xl py-8 sm:py-12">
    <UiBreadcrumbs :items="crumbs" class="mb-6" />
    <header class="mb-6"><h1 class="text-2xl font-bold sm:text-3xl">{{ t('services.mine.title') }}</h1><p class="mt-1 text-ink-soft">{{ t('services.mine.subtitle') }}</p></header>
    <div v-if="status === 'pending' && !data" aria-busy="true"><UiSkeleton block :lines="5" /></div>
    <UiErrorState v-else-if="error || !data" :message="isApiError(error) ? error.message : undefined" retry @retry="refresh()" />
    <div v-else class="space-y-10">
      <section aria-labelledby="ml-h" class="space-y-3">
        <h2 id="ml-h" class="text-xl font-bold">{{ t('services.mine.requests') }}</h2>
        <p class="text-sm text-ink-soft">{{ t('services.lead.notBooking') }}</p>
        <UiEmptyState v-if="!data.leads.length" :title="t('services.mine.noRequestsTitle')" :description="t('services.mine.noRequests')" icon="send"><UiButton to="/services" variant="secondary">{{ t('services.title') }}</UiButton></UiEmptyState>
        <ul v-else class="space-y-3">
          <li v-for="l in data.leads" :key="l.id" class="space-y-1 rounded-md border border-line bg-surface p-4">
            <p class="flex flex-wrap items-center gap-2"><NuxtLink :to="localePath(`/services/${l.provider.slug}`)" class="font-semibold text-primary-strong underline underline-offset-4" dir="auto">{{ l.provider.display_name }}</NuxtLink><UiBadge>{{ t(`services.leadStatus.${l.status}`) }}</UiBadge></p>
            <p class="line-clamp-3 text-ink-soft" dir="auto">{{ l.message }}</p>
            <p class="text-sm text-muted"><bdi>{{ formatDateTime(l.created_at, locale) }}</bdi></p>
          </li>
        </ul>
      </section>
      <section aria-labelledby="mr-h" class="space-y-3">
        <h2 id="mr-h" class="text-xl font-bold">{{ t('services.mine.reviews') }}</h2>
        <UiEmptyState v-if="!data.reviews.length" :title="t('services.mine.noReviewsTitle')" :description="t('services.mine.noReviews')" icon="list" />
        <ul v-else class="space-y-3">
          <li v-for="r in data.reviews" :key="r.id" class="space-y-2 rounded-md border border-line bg-surface p-4">
            <p class="flex flex-wrap items-center gap-2"><NuxtLink :to="localePath(`/services/${r.provider.slug}`)" class="font-semibold text-primary-strong underline underline-offset-4" dir="auto">{{ r.provider.display_name }}</NuxtLink><UiBadge :tone="r.status === 'approved' ? 'success' : r.status === 'rejected' ? 'danger' : 'info'">{{ t(`services.reviewStatus.${r.status}`) }}</UiBadge><span class="tabular-nums"><bdi>{{ t('services.review.outOf', { rating: r.rating }) }}</bdi></span></p>
            <p v-if="r.body" class="prose-plain" dir="auto">{{ r.body }}</p>
            <p v-if="r.moderation_reason" class="text-sm text-warning">{{ t('services.mine.reason', { reason: r.moderation_reason }) }}</p>
            <UiButton variant="ghost" @click="confirmId = r.id">{{ t('common.delete') }}</UiButton>
            <UiConfirmInline v-if="confirmId === r.id" :message="t('services.mine.deleteConfirm')" :confirm-label="t('common.delete')" :loading="busy" @confirm="removeReview(r.id)" @cancel="confirmId = null" />
          </li>
        </ul>
      </section>
    </div>
  </div>
</template>
