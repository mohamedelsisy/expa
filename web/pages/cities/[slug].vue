<script setup lang="ts">
import type { Guide } from '~/types/api'
import type { CityProfile } from '~/types/extra'

const { t, locale } = useI18n()
const route = useRoute()
const localePath = useLocalePath()
const { request } = useApi()
const slug = computed(() => String(route.params.slug))
const { data: c, error, refresh, status } = await useAsyncData(() => `city-${slug.value}`, async () => (await request<CityProfile>(`cities/${encodeURIComponent(slug.value)}`)).data, { watch: [locale] })
if (isApiError(error.value) && error.value.status === 404) throw createError({ statusCode: 404, statusMessage: 'Not Found', fatal: true })
useSeo(() => ({
  title: c.value ? t('cities.pageTitle', { city: c.value.name }) : t('cities.title'),
  description: c.value?.seo_description ?? c.value?.summary ?? t('cities.subtitle'),
  fallback: !!c.value?.fallback,
  jsonLdData: c.value ? { '@context': 'https://schema.org', '@type': 'City', name: c.value.name, description: c.value.summary ?? undefined, containedInPlace: { '@type': 'AdministrativeArea', name: c.value.region.name } } : undefined,
}))
const crumbs = computed(() => [{ label: t('nav.home'), to: '/' }, { label: t('cities.title'), to: '/cities' }, { label: c.value?.name ?? '' }])
</script>

<template>
  <div class="container-page max-w-5xl py-8 sm:py-12">
    <UiBreadcrumbs :items="crumbs" class="mb-6" />
    <h1 v-if="!c" class="sr-only">{{ t('cities.title') }}</h1>
    <div v-if="status === 'pending' && !c" aria-busy="true" class="space-y-6"><UiSkeleton block :lines="2" /><UiSkeleton :lines="6" /></div>
    <UiErrorState v-else-if="error || !c" :message="isApiError(error) ? error.message : undefined" retry @retry="refresh()" />
    <div v-else class="space-y-10">
      <header class="space-y-3">
        <UiBadge><UiIcon name="map" :size="14" />{{ c.region.name }}</UiBadge>
        <h1 class="text-3xl font-bold sm:text-4xl">{{ c.name }}</h1>
        <p v-if="c.headline" class="text-xl font-medium text-ink-soft">{{ c.headline }}</p>
        <p v-if="c.summary" class="max-w-prose text-ink-soft">{{ c.summary }}</p>
        <GuideFallbackNotice v-if="c.fallback" :locale="c.locale" />
      </header>
      <UiAlert tone="info" data-testid="city-disclaimer">{{ c.disclaimer }}</UiAlert>

      <section v-if="c.blocks.length" aria-labelledby="cb-h" class="space-y-4">
        <h2 id="cb-h" class="text-2xl font-bold">{{ t('cities.localInfo') }}</h2>
        <div class="grid gap-4 md:grid-cols-2"><ContentInfoBlock v-for="b in c.blocks" :key="b.key" :block="b" /></div>
      </section>
      <UiEmptyState v-else :title="t('cities.noBlocksTitle')" :description="t('cities.noBlocks')" icon="map" />

      <section v-if="c.guides.length" aria-labelledby="cgd-h" class="space-y-4">
        <h2 id="cgd-h" class="text-2xl font-bold">{{ t('cities.guidesHere') }}</h2>
        <ul class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"><li v-for="g in (c.guides as unknown as Guide[])" :key="g.id"><GuideCard :guide="g" /></li></ul>
      </section>
      <section v-if="c.articles.length" aria-labelledby="car-h" class="space-y-4">
        <h2 id="car-h" class="text-2xl font-bold">{{ t('cities.articlesHere') }}</h2>
        <ul class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"><li v-for="a in c.articles" :key="a.id"><ArticlesCard :article="a" /></li></ul>
      </section>
      <p v-if="c.offices_count > 0"><UiButton :to="`/government?city=${encodeURIComponent(c.slug)}`" variant="secondary"><UiIcon name="building" :size="18" />{{ t('cities.offices', { count: c.offices_count }) }}</UiButton></p>
    </div>
  </div>
</template>
