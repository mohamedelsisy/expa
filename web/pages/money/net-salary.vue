<script setup lang="ts">
const { t } = useI18n()
const siteUrl = String(useRuntimeConfig().public.siteUrl ?? '').replace(/\/$/, '')
const localePath = useLocalePath()
useSeo(() => ({
  title: t('net.seoTitle'),
  description: t('net.seoDescription'),
  jsonLdData: { '@context': 'https://schema.org', '@type': 'WebPage', name: t('net.title'), description: t('net.seoDescription'), url: siteUrl + localePath('/money/net-salary') },
}))
const crumbs = computed(() => [{ label: t('nav.home'), to: '/' }, { label: t('areas.money.title'), to: '/money' }, { label: t('net.title') }])
</script>

<template>
  <div class="container-page py-8 sm:py-12">
    <UiBreadcrumbs :items="crumbs" class="mb-6" />
    <header class="mb-6 max-w-2xl space-y-3">
      <h1 class="text-2xl font-bold sm:text-3xl">{{ t('net.title') }}</h1>
      <p class="text-ink-soft">{{ t('net.subtitle') }}</p>
    </header>
    <UiAlert tone="warning" class="mb-8" data-testid="net-notice">{{ t('net.notAdvice') }}</UiAlert>
    <MoneyNetSalary />
  </div>
</template>
