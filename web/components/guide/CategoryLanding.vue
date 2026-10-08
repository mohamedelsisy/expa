<script setup lang="ts">
import type { Guide } from '~/types/api'
import type { ArticleSummary } from '~/types/extra'
import { isApiError } from '~/utils/errors'

/** Life-area landing page: published guides of one category, matching articles, honest empty states and a general-guidance disclaimer. */
const props = defineProps<{ area: 'healthcare' | 'money' | 'business' | 'family' | 'travel' | 'dailyLife', category: string, articleCategory?: string | null, path: string, icon: string }>()
const { t, locale } = useI18n()
const { request } = useApi()
const siteUrl = String(useRuntimeConfig().public.siteUrl ?? '').replace(/\/$/, '')
const localePath = useLocalePath()
useSeo(() => ({
  title: t(`areas.${props.area}.seoTitle`),
  description: t(`areas.${props.area}.seoDescription`),
  jsonLdData: { '@context': 'https://schema.org', '@type': 'CollectionPage', name: t(`areas.${props.area}.title`), description: t(`areas.${props.area}.seoDescription`), url: siteUrl + localePath(props.path), inLanguage: locale.value },
}))
const crumbs = computed(() => [{ label: t('nav.home'), to: '/' }, { label: t('explore.title'), to: '/explore' }, { label: t(`areas.${props.area}.title`) }])
const { data: guides, error, refresh, status } = await useAsyncData(`area-guides-${props.area}`, async () => (await request<Guide[]>('guides', { query: { category: props.category, per_page: 12 } })).data, { watch: [locale] })
const { data: articles } = await useAsyncData(`area-articles-${props.area}`, async () => {
  if (!props.articleCategory) return []
  try { return (await request<ArticleSummary[]>('articles', { query: { category: props.articleCategory, per_page: 6 } })).data } catch { return [] }
}, { watch: [locale] })
</script>

<template>
  <div class="container-page py-8 sm:py-12">
    <UiBreadcrumbs :items="crumbs" class="mb-6" />
    <header class="mb-8 max-w-2xl space-y-3">
      <h1 class="text-2xl font-bold sm:text-3xl">{{ t(`areas.${area}.title`) }}</h1>
      <p class="text-ink-soft">{{ t(`areas.${area}.subtitle`) }}</p>
    </header>

    <UiAlert tone="warning" class="mb-8" data-testid="area-disclaimer">{{ t(`areas.${area}.disclaimer`) }}</UiAlert>

    <div v-if="$slots.tools" class="mb-8"><slot name="tools" /></div>

    <section aria-labelledby="area-guides-h" class="space-y-4">
      <h2 id="area-guides-h" class="text-xl font-bold">{{ t('areas.common.guides') }}</h2>
      <div v-if="status === 'pending' && !guides" aria-busy="true"><UiSkeleton block :lines="3" /></div>
      <UiErrorState v-else-if="error" :message="isApiError(error) ? error.message : undefined" retry @retry="refresh()" />
      <UiEmptyState v-else-if="!guides?.length" :title="t('areas.common.noGuidesTitle')" :description="t('areas.common.noGuides')" :icon="icon" />
      <ul v-else class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"><li v-for="g in guides" :key="g.id"><GuideCard :guide="g" /></li></ul>
      <p class="flex flex-wrap gap-2">
        <UiButton :to="`/guides?category=${category}`" variant="ghost">{{ t('areas.common.allGuides') }}</UiButton>
        <UiButton to="/ask" variant="ghost"><UiIcon name="sparkle" :size="18" />{{ t('areas.common.ask') }}</UiButton>
      </p>
    </section>

    <section v-if="articleCategory" aria-labelledby="area-articles-h" class="mt-10 space-y-4">
      <h2 id="area-articles-h" class="text-xl font-bold">{{ t('areas.common.articles') }}</h2>
      <p v-if="!articles?.length" class="text-ink-soft">{{ t('areas.common.noArticles') }}</p>
      <ul v-else class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"><li v-for="a in articles" :key="a.id"><ArticlesCard :article="a" /></li></ul>
      <p><UiButton :to="`/articles?category=${articleCategory}`" variant="ghost">{{ t('areas.common.allArticles') }}</UiButton></p>
    </section>

    <p class="mt-10 max-w-2xl text-sm text-muted">{{ t('areas.common.sourcesNote') }}</p>
  </div>
</template>
