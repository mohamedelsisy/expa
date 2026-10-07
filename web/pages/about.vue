<script setup lang="ts">
const { t, locale } = useI18n()
const siteUrl = String(useRuntimeConfig().public.siteUrl ?? '').replace(/\/$/, '')
const localePath = useLocalePath()
useSeo(() => ({
  title: t('about.seo.title'),
  description: t('about.seo.description'),
  jsonLdData: { '@context': 'https://schema.org', '@type': 'AboutPage', name: t('about.title'), description: t('about.seo.description'), url: siteUrl + localePath('/about'), inLanguage: locale.value },
}))
const crumbs = computed(() => [{ label: t('nav.home'), to: '/' }, { label: t('about.title') }])
const does = ['guides', 'assistant', 'tracking', 'learning'] as const
const doesNot = ['government', 'legal', 'booking', 'guarantee', 'providers'] as const
const trust = ['sources', 'verified', 'labels', 'privacy'] as const
</script>

<template>
  <div class="container-page py-8 sm:py-12">
    <UiBreadcrumbs :items="crumbs" class="mb-6" />
    <header class="mb-8 max-w-2xl space-y-3">
      <h1 class="text-2xl font-bold sm:text-3xl">{{ t('about.title') }}</h1>
      <p class="text-lg text-ink-soft">{{ t('about.lead') }}</p>
    </header>

    <div class="grid max-w-4xl gap-6">
      <section aria-labelledby="about-mission-h" class="space-y-2">
        <h2 id="about-mission-h" class="text-xl font-bold">{{ t('about.mission.title') }}</h2>
        <p class="max-w-prose text-ink-soft">{{ t('about.mission.body') }}</p>
      </section>
      <section aria-labelledby="about-does-h" class="space-y-2">
        <h2 id="about-does-h" class="text-xl font-bold">{{ t('about.does.title') }}</h2>
        <ul class="list-disc space-y-1 ps-5 text-ink-soft"><li v-for="k in does" :key="k">{{ t(`about.does.items.${k}`) }}</li></ul>
      </section>
      <section aria-labelledby="about-not-h" class="space-y-3">
        <h2 id="about-not-h" class="text-xl font-bold">{{ t('about.doesNot.title') }}</h2>
        <UiAlert tone="warning" data-testid="about-no-claims">
          <ul class="list-disc space-y-1 ps-5"><li v-for="k in doesNot" :key="k">{{ t(`about.doesNot.items.${k}`) }}</li></ul>
        </UiAlert>
      </section>
      <section aria-labelledby="about-trust-h" class="space-y-2">
        <h2 id="about-trust-h" class="text-xl font-bold">{{ t('about.trust.title') }}</h2>
        <ul class="list-disc space-y-1 ps-5 text-ink-soft"><li v-for="k in trust" :key="k">{{ t(`about.trust.items.${k}`) }}</li></ul>
      </section>
      <p class="flex flex-wrap gap-3">
        <UiButton to="/explore" size="lg">{{ t('about.explore') }}</UiButton>
        <UiButton to="/privacy" variant="secondary" size="lg">{{ t('footer.links.privacy') }}</UiButton>
      </p>
    </div>
  </div>
</template>
