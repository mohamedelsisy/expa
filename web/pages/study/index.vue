<script setup lang="ts">
import type { StudyMeta } from '~/types/api'

const { t, locale } = useI18n()
const { request } = useApi()
const localePath = useLocalePath()
useSeo(() => ({ title: t('study.seo.title'), description: t('study.seo.description') }))
const { data: meta } = await useAsyncData('study-meta', async () => (await request<StudyMeta>('study/meta')).data, { watch: [locale] })
const tiles = [
  { to: '/study/finder', key: 'finder', icon: 'sparkle' },
  { to: '/study/programs', key: 'programs', icon: 'book' },
  { to: '/study/universities', key: 'universities', icon: 'building' },
  { to: '/study/scholarships', key: 'scholarships', icon: 'euro' },
]
const crumbs = computed(() => [{ label: t('nav.home'), to: '/' }, { label: t('study.title') }])
</script>

<template>
  <div class="container-page py-8 sm:py-12">
    <UiBreadcrumbs :items="crumbs" class="mb-6" />
    <header class="mb-6 max-w-2xl">
      <h1 class="text-2xl font-bold sm:text-3xl">{{ t('study.title') }}</h1>
      <p class="mt-1 text-ink-soft">{{ t('study.subtitle') }}</p>
    </header>
    <StudyVerifyNotice :text="meta?.verify_notice" class="mb-6" />
    <ul class="grid gap-4 sm:grid-cols-2">
      <li v-for="x in tiles" :key="x.key">
        <UiCard as="article" class="relative flex h-full flex-col gap-2 transition-shadow focus-within:shadow-3 hover:shadow-2">
          <span class="grid size-11 place-items-center rounded-md bg-primary-soft text-primary-strong"><UiIcon :name="x.icon" :size="24" /></span>
          <h2 class="text-lg font-bold"><NuxtLink :to="localePath(x.to)" class="after:absolute after:inset-0 after:content-['']">{{ t(`study.tiles.${x.key}.title`) }}</NuxtLink></h2>
          <p class="text-ink-soft">{{ t(`study.tiles.${x.key}.body`) }}</p>
        </UiCard>
      </li>
    </ul>
  </div>
</template>
