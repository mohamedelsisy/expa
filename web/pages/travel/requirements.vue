<script setup lang="ts">
const { t } = useI18n()
const siteUrl = String(useRuntimeConfig().public.siteUrl ?? '').replace(/\/$/, '')
const localePath = useLocalePath()
useSeo(() => ({
  title: t('travel.seoTitle'),
  description: t('travel.seoDescription'),
  jsonLdData: { '@context': 'https://schema.org', '@type': 'WebPage', name: t('travel.title'), description: t('travel.seoDescription'), url: siteUrl + localePath('/travel/requirements') },
}))
const crumbs = computed(() => [{ label: t('nav.home'), to: '/' }, { label: t('areas.travel.title'), to: '/travel' }, { label: t('travel.title') }])
</script>

<template>
  <div class="container-page py-8 sm:py-12">
    <UiBreadcrumbs :items="crumbs" class="mb-6" />
    <header class="mb-6 max-w-2xl space-y-3">
      <h1 class="text-2xl font-bold sm:text-3xl">{{ t('travel.title') }}</h1>
      <p class="text-ink-soft">{{ t('travel.subtitle') }}</p>
    </header>
    <UiAlert tone="warning" class="mb-8" data-testid="travel-notice">{{ t('travel.notice') }}</UiAlert>
    <TravelRequirements />
  </div>
</template>
