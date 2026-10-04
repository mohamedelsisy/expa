<script setup lang="ts">
import type { PatenteItem } from '~/types/api'

const { t, locale } = useI18n()
const route = useRoute()
const { request } = useApi()
const slug = computed(() => String(route.params.slug))
const { data: tp, error, refresh, status } = await useAsyncData(() => `patente-topic-${slug.value}`, async () => (await request<PatenteItem>(`patente/topics/${encodeURIComponent(slug.value)}`)).data, { watch: [locale] })
if (isApiError(error.value) && error.value.status === 404) throw createError({ statusCode: 404, statusMessage: 'Not Found', fatal: true })
useSeo(() => ({ title: tp.value ? `${tp.value.title} | EXPA` : t('patente.title'), description: tp.value?.summary ?? t('patente.subtitle'), type: 'article' }))
const crumbs = computed(() => [{ label: t('patente.title'), to: '/patente' }, { label: tp.value?.title ?? '' }])
const localePath = useLocalePath()
</script>

<template>
  <div class="container-page max-w-3xl py-8 sm:py-12">
    <UiBreadcrumbs :items="crumbs" class="mb-6" />
    <div v-if="status === 'pending' && !tp" aria-busy="true"><UiSkeleton block :lines="5" /></div>
    <UiErrorState v-else-if="error || !tp" :message="isApiError(error) ? error.message : undefined" retry @retry="refresh()" />
    <article v-else class="space-y-6">
      <header class="space-y-2"><h1 class="text-3xl font-bold"><UiAutoItalian :text="tp.title" /></h1><p v-if="tp.summary" class="text-lg text-ink-soft">{{ tp.summary }}</p></header>
      <GuideFallbackNotice v-if="tp.fallback" :locale="tp.locale" />
      <p v-if="tp.body" class="prose-plain text-lg"><UiAutoItalian :text="tp.body" /></p>
      <UiButton :to="`/patente/practice?topic=${encodeURIComponent(tp.slug)}`" variant="secondary"><UiIcon name="list" :size="18" />{{ t('patente.practiceThis') }}</UiButton>
      <GuideSource :source="tp.source" />
      <PatenteDisclaimer />
    </article>
  </div>
</template>
