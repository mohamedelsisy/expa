<script setup lang="ts">
import type { ArticleFull } from '~/types/extra'
import { formatDate } from '~/utils/locale'

const { t, locale } = useI18n()
const route = useRoute()
const localePath = useLocalePath()
const { request } = useApi()
const siteUrl = useRuntimeConfig().public.siteUrl.replace(/\/$/, '')
const slug = computed(() => String(route.params.slug))
const { data: a, error, refresh, status } = await useAsyncData(() => `article-${slug.value}`, async () => (await request<ArticleFull>(`articles/${encodeURIComponent(slug.value)}`)).data, { watch: [locale] })
if (isApiError(error.value) && error.value.status === 404) throw createError({ statusCode: 404, statusMessage: 'Not Found', fatal: true })

useSeo(() => {
  const x = a.value
  return {
    title: x ? (x.seo.title ?? x.title) : t('articles.title'),
    description: x ? (x.seo.description ?? x.excerpt ?? t('articles.subtitle')) : t('articles.subtitle'),
    type: 'article',
    fallback: !!x?.fallback,
    jsonLdData: x ? {
      '@context': 'https://schema.org', '@type': 'Article', headline: x.title, description: x.excerpt ?? undefined, inLanguage: x.locale,
      datePublished: x.published_at ?? undefined, dateModified: x.updated_at ?? undefined, mainEntityOfPage: `${siteUrl}${route.path}`,
      author: x.author_name ? { '@type': 'Person', name: x.author_name } : { '@type': 'Organization', name: 'EXPA', url: siteUrl },
      publisher: { '@type': 'Organization', name: 'EXPA', url: siteUrl, logo: { '@type': 'ImageObject', url: `${siteUrl}/og-image.png` } },
      image: `${siteUrl}/og-image.png`,
    } : undefined,
  }
})
const crumbs = computed(() => [{ label: t('nav.home'), to: '/' }, { label: t('articles.title'), to: '/articles' }, { label: a.value?.title ?? '' }])
</script>

<template>
  <div class="container-page max-w-3xl py-8 sm:py-12">
    <UiBreadcrumbs :items="crumbs" class="mb-6" />
    <h1 v-if="!a" class="sr-only">{{ t('articles.title') }}</h1>
    <div v-if="status === 'pending' && !a" aria-busy="true" class="space-y-6"><UiSkeleton block :lines="2" /><UiSkeleton :lines="8" /></div>
    <UiErrorState v-else-if="error || !a" :message="isApiError(error) ? error.message : undefined" retry @retry="refresh()" />
    <article v-else class="space-y-6">
      <header class="space-y-3">
        <div class="flex flex-wrap items-center gap-2"><UiBadge tone="primary">{{ a.category_label }}</UiBadge><UiBadge data-testid="editorial-badge">{{ t('articles.editorial') }}</UiBadge><UiBadge v-if="a.city"><UiIcon name="map" :size="14" />{{ a.city.name }}</UiBadge></div>
        <h1 class="text-3xl font-bold sm:text-4xl">{{ a.title }}</h1>
        <p v-if="a.excerpt" class="text-lg text-ink-soft">{{ a.excerpt }}</p>
        <p class="text-sm text-muted">
          <template v-if="a.author_name">{{ t('articles.by', { name: a.author_name }) }} · </template>
          <time v-if="a.published_at" :datetime="a.published_at">{{ formatDate(a.published_at, locale) }}</time>
          <template v-if="a.reading_minutes"> · {{ t('articles.readingMinutes', { count: a.reading_minutes }) }}</template>
        </p>
        <GuideFallbackNotice v-if="a.fallback" :locale="a.locale" />
      </header>
      <ContentProse v-if="a.body" :body="a.body" />
      <UiAlert v-else tone="info">{{ t('articles.noBody') }}</UiAlert>
      <ul v-if="a.tags.length" class="flex flex-wrap gap-2" :aria-label="t('articles.tags')"><li v-for="tg in a.tags" :key="tg"><UiBadge>{{ tg }}</UiBadge></li></ul>
      <GuideSource v-if="a.source" :source="a.source" />
      <UiAlert tone="info" data-testid="article-disclaimer">{{ a.disclaimer }}</UiAlert>
      <section v-if="a.related_guides?.length" aria-labelledby="rg-h" class="space-y-2">
        <h2 id="rg-h" class="text-xl font-bold">{{ t('articles.relatedGuides') }}</h2>
        <ul class="space-y-1"><li v-for="g in a.related_guides" :key="g.slug"><NuxtLink :to="localePath(`/guides/${g.slug}`)" class="inline-flex min-h-touch items-center text-primary-strong underline underline-offset-4">{{ g.title }}</NuxtLink></li></ul>
      </section>
      <section v-if="a.related_articles?.length" aria-labelledby="ra-h" class="space-y-3">
        <h2 id="ra-h" class="text-xl font-bold">{{ t('articles.relatedArticles') }}</h2>
        <ul class="grid gap-4 sm:grid-cols-2"><li v-for="r in a.related_articles" :key="r.id"><ArticlesCard :article="r" /></li></ul>
      </section>
    </article>
  </div>
</template>
