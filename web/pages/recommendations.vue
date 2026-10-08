<script setup lang="ts">
import type { Recommendations } from '~/types/extra'

definePageMeta({ middleware: 'auth' })
const { t, locale } = useI18n()
const { request } = useApi()
useSeo(() => ({ title: t('recs.seoTitle'), description: t('recs.subtitle'), noindex: true }))
const { data, error, refresh, status } = await useAsyncData('recommendations', async () => (await request<Recommendations>('recommendations')).data, { watch: [locale] })
const crumbs = computed(() => [{ label: t('nav.home'), to: '/dashboard' }, { label: t('recs.title') }])
</script>

<template>
  <div class="container-page max-w-4xl py-8 sm:py-12">
    <UiBreadcrumbs :items="crumbs" class="mb-6" />
    <header class="mb-6 max-w-2xl space-y-2">
      <h1 class="text-2xl font-bold sm:text-3xl">{{ t('recs.title') }}</h1>
      <p class="text-ink-soft">{{ t('recs.subtitle') }}</p>
    </header>
    <div v-if="status === 'pending' && !data" aria-busy="true"><UiSkeleton block :lines="5" /></div>
    <UiErrorState v-else-if="error || !data" :heading-level="2" :message="isApiError(error) ? error.message : undefined" retry @retry="refresh()" />
    <RecsList v-else :recs="data" />
    <p class="mt-8 max-w-2xl text-sm text-muted">{{ t('recs.footnote') }}</p>
  </div>
</template>
