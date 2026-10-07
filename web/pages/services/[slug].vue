<script setup lang="ts">
import type { ProviderFull, ProviderReview } from '~/types/extra'
import { formatDay } from '~/utils/locale'
import { formatMoney } from '~/utils/money'
import { safeHttpsUrl } from '~/utils/safe'
import { languageName } from '~/utils/services'

const { t, locale } = useI18n()
const route = useRoute()
const auth = useAuthStore()
const localePath = useLocalePath()
const { request } = useApi()
const slug = computed(() => String(route.params.slug))
const { data: p, error, refresh, status } = await useAsyncData(() => `provider-${slug.value}`, async () => (await request<ProviderFull>(`providers/${encodeURIComponent(slug.value)}`)).data, { watch: [locale] })
if (isApiError(error.value) && error.value.status === 404) throw createError({ statusCode: 404, statusMessage: 'Not Found', fatal: true })
useSeo(() => ({ title: p.value ? `${p.value.display_name} | EXPA` : t('services.title'), description: p.value?.headline ?? t('services.subtitle'), fallback: !!p.value?.fallback }))
const crumbs = computed(() => [{ label: t('nav.home'), to: '/' }, { label: t('services.title'), to: '/services' }, { label: p.value?.display_name ?? '' }])

const reviewPage = ref(1)
const { data: reviews, error: reviewsError, refresh: refreshReviews, status: reviewsStatus } = await useAsyncData(() => `provider-reviews-${slug.value}-${reviewPage.value}`, () => request<ProviderReview[]>(`providers/${encodeURIComponent(slug.value)}/reviews`, { query: { page: reviewPage.value, per_page: 10 } }), { watch: [reviewPage, locale] })
const reviewMeta = computed(() => reviews.value?.meta)
const contact = computed(() => ({ email: p.value?.contact?.email, phone: p.value?.contact?.phone, website: safeHttpsUrl(p.value?.contact?.website) }))
const loginTo = computed(() => `/login?redirect=${encodeURIComponent(localePath(`/services/${slug.value}`))}`)
</script>

<template>
  <div class="container-page max-w-5xl py-8 sm:py-12">
    <UiBreadcrumbs :items="crumbs" class="mb-6" />
    <h1 v-if="!p" class="sr-only">{{ t('services.title') }}</h1>
    <div v-if="status === 'pending' && !p" aria-busy="true" class="space-y-6"><UiSkeleton block :lines="2" /><UiSkeleton :lines="6" /></div>
    <UiErrorState v-else-if="error || !p" :message="isApiError(error) ? error.message : undefined" retry @retry="refresh()" />
    <div v-else class="grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
      <article class="min-w-0 space-y-8">
        <header class="space-y-3">
          <div class="flex flex-wrap items-center gap-2"><UiBadge tone="primary">{{ p.category_label }}</UiBadge><ServicesVerification :verification="p.verification" detail /><UiBadge>{{ t('services.thirdParty') }}</UiBadge></div>
          <h1 class="text-3xl font-bold sm:text-4xl" dir="auto">{{ p.display_name }}</h1>
          <p v-if="p.headline" class="text-lg text-ink-soft" dir="auto">{{ p.headline }}</p>
          <ServicesRating :average="p.rating.average" :count="p.rating.count" />
          <GuideFallbackNotice v-if="p.fallback" :locale="p.locale" />
        </header>
        <UiAlert tone="warning" data-testid="provider-notice">{{ p.notice }}</UiAlert>

        <section v-if="p.description" aria-labelledby="pd-h" class="space-y-2"><h2 id="pd-h" class="text-xl font-bold">{{ t('services.about') }}</h2><p class="prose-plain" dir="auto">{{ p.description }}</p></section>

        <section v-if="p.services.length" aria-labelledby="ps-h" class="space-y-3">
          <h2 id="ps-h" class="text-xl font-bold">{{ t('services.offered') }}</h2>
          <ul class="divide-y divide-line rounded-md border border-line bg-surface">
            <li v-for="(s, i) in p.services" :key="i" class="space-y-1 p-3"><p class="font-semibold" dir="auto">{{ s.name }}</p><p v-if="s.description" class="text-ink-soft" dir="auto">{{ s.description }}</p><p v-if="s.price_from_eur !== null" class="text-sm text-muted">{{ t('services.priceFrom', { price: formatMoney(s.price_from_eur, 'EUR', locale) }) }}<span> · {{ t('services.priceNote') }}</span></p></li>
          </ul>
        </section>

        <section aria-labelledby="pw-h" class="space-y-2">
          <h2 id="pw-h" class="text-xl font-bold">{{ t('services.where') }}</h2>
          <ul class="space-y-1 text-ink-soft">
            <li v-if="p.city || p.region" class="flex items-center gap-2"><UiIcon name="map" :size="16" />{{ p.city?.name ?? p.region?.name }}</li>
            <li v-for="(a, i) in p.areas" :key="i" class="flex items-center gap-2"><UiIcon name="map" :size="16" />{{ a.city?.name ?? a.region?.name }}</li>
            <li v-if="p.serves_online" class="flex items-center gap-2"><UiIcon name="globe" :size="16" />{{ t('services.online') }}</li>
            <li v-if="p.languages.length" class="flex items-center gap-2"><UiIcon name="user" :size="16" /><bdi>{{ p.languages.map(l => languageName(l, locale)).join(' · ') }}</bdi></li>
          </ul>
          <p v-if="p.availability_note" class="text-ink-soft" dir="auto">{{ p.availability_note }}</p>
        </section>

        <section aria-labelledby="pr-h" class="space-y-4">
          <h2 id="pr-h" class="text-xl font-bold">{{ t('services.reviews') }}</h2>
          <p class="text-sm text-ink-soft">{{ t('services.reviewsNote') }}</p>
          <div v-if="reviewsStatus === 'pending' && !reviews" aria-busy="true"><UiSkeleton :lines="3" /></div>
          <UiErrorState v-else-if="reviewsError" :message="isApiError(reviewsError) ? reviewsError.message : undefined" retry @retry="refreshReviews()" />
          <p v-else-if="!reviews?.data.length" class="text-muted" data-testid="no-reviews">{{ t('services.noReviews') }}</p>
          <ul v-else class="space-y-3">
            <li v-for="r in reviews.data" :key="r.id" class="space-y-2 rounded-md border border-line bg-surface p-4">
              <p class="flex flex-wrap items-center gap-2"><span class="font-semibold tabular-nums"><bdi>{{ t('services.review.outOf', { rating: r.rating }) }}</bdi></span><UiBadge>{{ r.label }}</UiBadge><span v-if="r.created_at" class="text-sm text-muted"><bdi>{{ formatDay(r.created_at, locale) }}</bdi></span></p>
              <p v-if="r.body" class="prose-plain" dir="auto">{{ r.body }}</p>
              <div v-if="r.reply" class="rounded-md bg-sunken p-3"><p class="text-sm font-semibold">{{ t('services.review.reply') }}</p><p class="prose-plain" dir="auto">{{ r.reply.body }}</p></div>
              <ServicesReportButton v-if="auth.isAuthenticated" :endpoint="`provider-reviews/${r.id}/report`" :label="t('services.review.report')" />
            </li>
          </ul>
          <UiPagination v-if="(reviewMeta?.last_page ?? 1) > 1" :page="reviewMeta?.page ?? 1" :last-page="reviewMeta?.last_page ?? 1" @change="reviewPage = $event" />
        </section>
      </article>

      <aside class="space-y-6 lg:sticky lg:top-24 lg:self-start">
        <UiCard v-if="contact.email || contact.phone || contact.website" class="space-y-2" as="section" aria-labelledby="pc-h">
          <h2 id="pc-h" class="text-lg font-bold">{{ t('services.contact') }}</h2>
          <p class="text-sm text-muted">{{ t('services.contactNote') }}</p>
          <ul class="space-y-1">
            <li v-if="contact.email" class="flex items-center gap-2"><UiIcon name="mail" :size="16" /><a :href="`mailto:${contact.email}`" dir="ltr" class="break-all underline underline-offset-4">{{ contact.email }}</a></li>
            <li v-if="contact.phone" class="flex items-center gap-2"><UiIcon name="phone" :size="16" /><a :href="`tel:${contact.phone.replace(/[^+\d]/g, '')}`" dir="ltr" class="underline underline-offset-4">{{ contact.phone }}</a></li>
            <li v-if="contact.website" class="flex items-center gap-2"><UiIcon name="external" :size="16" /><a :href="contact.website" target="_blank" rel="noopener noreferrer" dir="ltr" class="break-all underline underline-offset-4">{{ contact.website }}<span class="sr-only">{{ t('a11y.opensNewTab') }}</span></a></li>
          </ul>
        </UiCard>
        <UiCard v-if="auth.isAuthenticated"><ServicesLeadForm :slug="p.slug" :name="p.display_name" /></UiCard>
        <UiCard v-else class="space-y-3"><h2 class="text-lg font-bold">{{ t('services.lead.loginTitle') }}</h2><p class="text-ink-soft">{{ t('services.lead.loginBody') }}</p><UiButton :to="loginTo">{{ t('auth.login') }}</UiButton></UiCard>
        <UiCard v-if="auth.isAuthenticated"><ServicesReviewForm :slug="p.slug" /></UiCard>
      </aside>
    </div>
  </div>
</template>
