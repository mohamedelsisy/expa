<script setup lang="ts">
import type { Guide } from '~/types/api'

const { t, locale } = useI18n()
const auth = useAuthStore()
const localePath = useLocalePath()
const { request } = useApi()
useSeo(() => ({ title: t('housing.seo.title'), description: t('housing.seo.description') }))
const crumbs = computed(() => [{ label: t('nav.home'), to: '/' }, { label: t('housing.title') }])
const { data: guides, error, refresh, status } = await useAsyncData('housing-guides', async () => (await request<Guide[]>('guides', { query: { category: 'housing', per_page: 6 } })).data, { watch: [locale] })
const points = ['paste', 'flags', 'cost', 'limits'] as const
</script>

<template>
  <div class="container-page py-8 sm:py-12">
    <UiBreadcrumbs :items="crumbs" class="mb-6" />
    <header class="mb-8 max-w-2xl space-y-3">
      <h1 class="text-2xl font-bold sm:text-3xl">{{ t('housing.title') }}</h1>
      <p class="text-ink-soft">{{ t('housing.subtitle') }}</p>
    </header>

    <UiCard tone="soft" class="mb-8 space-y-4">
      <h2 class="text-xl font-bold">{{ t('housing.check.title') }}</h2>
      <p class="max-w-prose text-ink-soft">{{ t('housing.check.subtitle') }}</p>
      <ul class="list-disc space-y-1 ps-5 text-ink-soft"><li v-for="p in points" :key="p">{{ t(`housing.landing.${p}`) }}</li></ul>
      <UiAlert tone="warning">{{ t('housing.landing.disclaimer') }}</UiAlert>
      <div class="flex flex-wrap gap-3">
        <UiButton v-if="auth.isAuthenticated" to="/housing/check" size="lg"><UiIcon name="search" :size="18" />{{ t('housing.landing.start') }}</UiButton>
        <UiButton v-else :to="`/login?redirect=${encodeURIComponent(localePath('/housing/check'))}`" size="lg">{{ t('housing.landing.loginToStart') }}</UiButton>
      </div>
    </UiCard>

    <section aria-labelledby="hg-h" class="space-y-4">
      <h2 id="hg-h" class="text-xl font-bold">{{ t('housing.landing.guides') }}</h2>
      <div v-if="status === 'pending' && !guides" aria-busy="true"><UiSkeleton block :lines="3" /></div>
      <UiErrorState v-else-if="error" :message="isApiError(error) ? error.message : undefined" retry @retry="refresh()" />
      <UiEmptyState v-else-if="!guides?.length" :title="t('housing.landing.noGuidesTitle')" :description="t('housing.landing.noGuides')" icon="home" />
      <ul v-else class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"><li v-for="g in guides" :key="g.id"><GuideCard :guide="g" /></li></ul>
      <p class="flex flex-wrap gap-2"><UiButton to="/guides?category=housing" variant="ghost">{{ t('housing.landing.allGuides') }}</UiButton><UiButton to="/articles?category=housing" variant="ghost">{{ t('housing.landing.articles') }}</UiButton></p>
    </section>
  </div>
</template>
