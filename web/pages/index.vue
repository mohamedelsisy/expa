<script setup lang="ts">
const { t } = useI18n()
const auth = useAuthStore()
await auth.ensureLoaded()
const siteUrl = useRuntimeConfig().public.siteUrl

// Every card links to a page that exists today; nothing is labelled "coming soon" unless it truly is missing.
const features = [
  { key: 'guides', icon: 'book', to: '/guides' },
  { key: 'dashboard', icon: 'shield', to: '/dashboard' },
  { key: 'tasks', icon: 'tasks', to: '/tasks' },
  { key: 'privacy', icon: 'lock', to: '/privacy-settings' },
  { key: 'ask', icon: 'sparkle', to: '/ask' },
  { key: 'government', icon: 'file', to: '/government' },
  { key: 'appointments', icon: 'calendar', to: '/appointments' },
  { key: 'italian', icon: 'globe', to: '/learn-italian' },
  { key: 'jobs', icon: 'euro', to: '/jobs' },
  { key: 'patente', icon: 'car', to: '/patente' },
  { key: 'study', icon: 'book', to: '/study' },
]
const localePath = useLocalePath()

useSeo(() => ({
  title: t('landing.seo.title'),
  description: t('landing.seo.description'),
  jsonLdData: [
    { '@context': 'https://schema.org', '@type': 'Organization', name: 'EXPA', url: siteUrl, logo: `${siteUrl}/og-image.png` },
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'EXPA',
      url: siteUrl,
      description: t('landing.seo.description'),
      inLanguage: ['ar', 'en', 'it'],
      potentialAction: { '@type': 'SearchAction', target: `${siteUrl}${localePath('/search')}?q={search_term_string}`, 'query-input': 'required name=search_term_string' },
    },
  ],
}))
</script>

<template>
  <div>
    <section class="border-b border-line bg-gradient-to-b from-primary-soft to-canvas">
      <div class="container-page grid gap-8 py-12 sm:py-16 lg:grid-cols-[1.2fr_1fr] lg:items-center lg:py-24">
        <div class="space-y-6">
          <UiBadge tone="accent">{{ t('landing.eyebrow') }}</UiBadge>
          <h1 class="text-3xl font-bold sm:text-4xl lg:text-5xl">{{ t('landing.hero.title') }}</h1>
          <p class="max-w-prose text-lg text-ink-soft">{{ t('landing.hero.subtitle') }}</p>
          <div class="flex flex-col gap-3 sm:flex-row">
            <UiButton v-if="!auth.isAuthenticated" to="/register" size="lg" variant="accent">
              {{ t('landing.cta.register') }}<UiIcon name="arrow-end" :size="20" />
            </UiButton>
            <UiButton v-else to="/dashboard" size="lg" variant="accent">{{ t('landing.cta.dashboard') }}<UiIcon name="arrow-end" :size="20" /></UiButton>
            <UiButton to="/guides" size="lg" variant="secondary">{{ t('landing.cta.explore') }}</UiButton>
          </div>
          <p class="text-sm text-muted">{{ t('landing.hero.note') }}</p>
        </div>
        <UiCard elevated class="hidden space-y-4 lg:block" aria-hidden="true">
          <div class="flex items-center gap-4">
            <UiScoreRing :value="64" :label="t('score.label')" :size="128" />
            <div class="min-w-0 flex-1 space-y-3">
              <UiProgressBar :value="80" :label="t('landing.preview.documents')" show-value />
              <UiProgressBar :value="50" :label="t('landing.preview.healthcare')" show-value />
              <UiProgressBar :value="40" :label="t('landing.preview.banking')" show-value />
            </div>
          </div>
          <p class="text-xs text-muted">{{ t('landing.preview.caption') }}</p>
        </UiCard>
      </div>
    </section>

    <section class="container-page py-12 sm:py-16" :aria-labelledby="'features-h'">
      <h2 id="features-h" class="mb-2 text-2xl font-bold sm:text-3xl">{{ t('landing.features.title') }}</h2>
      <p class="mb-8 max-w-prose text-ink-soft">{{ t('landing.features.subtitle') }}</p>
      <ul class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <li v-for="f in features" :key="f.key">
          <UiCard class="relative flex h-full flex-col gap-3 transition-shadow focus-within:shadow-3 hover:shadow-2">
            <div class="flex items-center justify-between">
              <span class="grid size-11 place-items-center rounded-md bg-primary-soft text-primary-strong"><UiIcon :name="f.icon" :size="24" /></span>
              <UiBadge tone="success">{{ t('landing.available') }}</UiBadge>
            </div>
            <h3 class="text-lg font-bold"><NuxtLink :to="localePath(f.to)" class="after:absolute after:inset-0 after:content-['']">{{ t(`landing.features.${f.key}.title`) }}</NuxtLink></h3>
            <p class="text-ink-soft">{{ t(`landing.features.${f.key}.body`) }}</p>
          </UiCard>
        </li>
      </ul>
    </section>

    <section class="container-page pb-16">
      <UiCard tone="soft" class="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 class="text-xl font-bold">{{ t('landing.trust.title') }}</h2>
          <p class="mt-1 max-w-prose text-ink-soft">{{ t('landing.trust.body') }}</p>
        </div>
        <UiButton v-if="!auth.isAuthenticated" to="/register">{{ t('landing.cta.register') }}</UiButton>
      </UiCard>
    </section>
  </div>
</template>
