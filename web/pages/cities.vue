<script setup lang="ts">
import type { City } from '~/types/api'

const { t, locale } = useI18n()
const localePath = useLocalePath()
const { request } = useApi()
useSeo(() => ({ title: t('cities.title'), description: t('cities.subtitle') }))
const { data, error, refresh, status } = await useAsyncData('cities-all', async () => (await request<City[]>('cities')).data, { watch: [locale] })
const groups = computed(() => {
  const m = new Map<string, { name: string, slug: string, cities: City[] }>()
  for (const c of data.value ?? []) {
    const g = m.get(c.region.slug) ?? { name: c.region.name, slug: c.region.slug, cities: [] }
    g.cities.push(c)
    m.set(c.region.slug, g)
  }
  return [...m.values()].sort((a, b) => a.name.localeCompare(b.name, locale.value))
})
const crumbs = computed(() => [{ label: t('nav.home'), to: '/' }, { label: t('cities.title') }])
</script>

<template>
  <div class="container-page py-8 sm:py-12">
    <UiBreadcrumbs :items="crumbs" class="mb-6" />
    <header class="mb-6 max-w-2xl">
      <h1 class="text-2xl font-bold sm:text-3xl">{{ t('cities.title') }}</h1>
      <p class="mt-1 text-ink-soft">{{ t('cities.subtitle') }}</p>
    </header>
    <div v-if="status === 'pending' && !data" aria-busy="true"><UiSkeleton block :lines="6" /></div>
    <UiErrorState v-else-if="error" :message="isApiError(error) ? error.message : undefined" retry @retry="refresh()" />
    <UiEmptyState v-else-if="!groups.length" :title="t('cities.emptyTitle')" :description="t('cities.empty')" icon="map" />
    <div v-else class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <UiCard v-for="g in groups" :key="g.slug" as="section" :aria-labelledby="`region-${g.slug}`">
        <h2 :id="`region-${g.slug}`" class="mb-2 text-lg font-bold">{{ g.name }}</h2>
        <ul class="space-y-1">
          <li v-for="c in g.cities" :key="c.slug">
            <NuxtLink :to="{ path: localePath('/guides'), query: { city: c.slug } }" class="inline-flex min-h-touch items-center text-primary-strong underline underline-offset-4">{{ c.name }}</NuxtLink>
          </li>
        </ul>
      </UiCard>
    </div>
  </div>
</template>
