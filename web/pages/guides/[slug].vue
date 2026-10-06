<script setup lang="ts">
import type { GuideFull } from '~/types/api'
import { safeHttpsUrl } from '~/utils/safe'

const { t, locale } = useI18n()
const route = useRoute()
const { request } = useApi()
const siteUrl = useRuntimeConfig().public.siteUrl.replace(/\/$/, '')
const slug = computed(() => String(route.params.slug))

const { data, error, refresh, status } = await useAsyncData(
  () => `guide-${slug.value}`,
  async () => (await request<GuideFull>(`guides/${encodeURIComponent(slug.value)}`)).data,
  { watch: [locale] },
)
// Unknown slug: render the localized 404 page (with a real 404 status on SSR).
if (isApiError(error.value) && error.value.status === 404) {
  throw createError({ statusCode: 404, statusMessage: 'Not Found', fatal: true })
}
const guide = computed(() => data.value)

useSeo(() => {
  const g = guide.value
  const src = g ? safeHttpsUrl(g.source.url) : null
  return {
    title: g ? g.title : t('guides.title'),
    description: g?.summary ?? t('guides.seo.description'),
    type: 'article',
    fallback: !!g?.fallback,
    jsonLdData: g
      ? {
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: g.title,
          description: g.summary ?? undefined,
          inLanguage: g.locale,
          datePublished: g.published_at ?? undefined,
          dateModified: g.updated_at ?? undefined,
          mainEntityOfPage: `${siteUrl}${route.path}`,
          author: { '@type': 'Organization', name: 'EXPA', url: siteUrl },
          publisher: { '@type': 'Organization', name: 'EXPA', url: siteUrl, logo: { '@type': 'ImageObject', url: `${siteUrl}/og-image.png` } },
          image: `${siteUrl}/og-image.png`,
          ...(src ? { isBasedOn: src } : {}),
        }
      : undefined,
  }
})

const sections = computed(() => {
  const g = guide.value
  if (!g) return []
  return [
    { key: 'what_is', icon: 'info', text: g.what_is },
    { key: 'who_needs', icon: 'user', text: g.who_needs },
    { key: 'where_to_apply', icon: 'map', text: g.where_to_apply },
    { key: 'how_to_book', icon: 'calendar', text: g.how_to_book },
    { key: 'costs', icon: 'euro', text: g.costs },
    { key: 'processing_time', icon: 'clock', text: g.processing_time },
  ].filter(s => !!s.text)
})
const crumbs = computed(() => [
  { label: t('nav.home'), to: '/' },
  { label: t('guides.title'), to: '/guides' },
  { label: guide.value?.title ?? '' },
])
</script>

<template>
  <div class="container-page max-w-4xl py-8 sm:py-12">
    <UiBreadcrumbs :items="crumbs" class="mb-6" />

    <h1 v-if="!guide" class="sr-only">{{ t('guides.title') }}</h1>
    <div v-if="status === 'pending' && !guide" aria-busy="true" class="space-y-6"><UiSkeleton block :lines="2" /><UiSkeleton :lines="6" /></div>
    <UiErrorState v-else-if="error || !guide" :message="isApiError(error) ? error.message : undefined" retry @retry="refresh()" />

    <article v-else class="space-y-8">
      <header class="space-y-3">
        <div class="flex flex-wrap items-center gap-2">
          <UiBadge tone="primary">{{ guide.category_label }}</UiBadge>
          <UiItalianTerm v-if="guide.italian_term">{{ guide.italian_term }}</UiItalianTerm>
          <UiBadge v-if="guide.city || guide.region"><UiIcon name="map" :size="14" />{{ guide.city?.name ?? guide.region?.name }}</UiBadge>
          <UiBadge v-else>{{ t('guides.national') }}</UiBadge>
        </div>
        <h1 class="text-3xl font-bold sm:text-4xl"><UiAutoItalian :text="guide.title" /></h1>
        <p v-if="guide.summary" class="max-w-prose text-lg text-ink-soft">{{ guide.summary }}</p>
        <GuideFallbackNotice v-if="guide.fallback" :locale="guide.locale" />
      </header>

      <div class="grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div class="space-y-8">
          <section v-for="s in sections" :key="s.key" :aria-labelledby="`s-${s.key}`">
            <h2 :id="`s-${s.key}`" class="mb-2 flex items-center gap-2 text-xl font-bold"><UiIcon :name="s.icon" :size="22" class="text-primary" />{{ t(`guides.sections.${s.key}`) }}</h2>
            <p class="prose-plain text-ink-soft sm:text-ink">{{ s.text }}</p>
          </section>

          <section v-if="guide.required_documents?.length" aria-labelledby="s-docs">
            <h2 id="s-docs" class="mb-3 flex items-center gap-2 text-xl font-bold"><UiIcon name="file" :size="22" class="text-primary" />{{ t('guides.sections.required_documents') }}</h2>
            <ul class="space-y-2">
              <li v-for="(d, i) in guide.required_documents" :key="i" class="flex items-start gap-3 rounded-md border border-line bg-surface p-3">
                <UiIcon name="check" :size="20" class="mt-1 text-primary" /><span>{{ d }}</span>
              </li>
            </ul>
          </section>

          <section v-if="guide.steps?.length" aria-labelledby="s-steps">
            <h2 id="s-steps" class="mb-4 flex items-center gap-2 text-xl font-bold"><UiIcon name="list" :size="22" class="text-primary" />{{ t('guides.sections.steps') }}</h2>
            <UiTimeline :items="guide.steps" />
          </section>

          <section v-if="guide.body" aria-labelledby="s-body">
            <h2 id="s-body" class="mb-2 text-xl font-bold">{{ t('guides.sections.body') }}</h2>
            <p class="prose-plain">{{ guide.body }}</p>
          </section>
        </div>

        <aside class="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <GuideSource :source="guide.source" />
          <UiAlert tone="info">{{ t('guides.disclaimer') }}</UiAlert>
        </aside>
      </div>
    </article>
  </div>
</template>
