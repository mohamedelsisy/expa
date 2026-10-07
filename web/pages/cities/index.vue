<script setup lang="ts">
import type { City } from '~/types/api'
import type { CitySummary } from '~/types/extra'

const { t, locale } = useI18n()
const localePath = useLocalePath()
const { request } = useApi()
useSeo(() => ({ title: t('cities.title'), description: t('cities.subtitle') }))
const { data, error, refresh, status } = await useAsyncData('cities-all', async () => {
  const [cities, profiles] = await Promise.all([
    request<City[]>('cities'),
    request<CitySummary[]>('city-profiles', { query: { per_page: 50 } }).then(r => r.data).catch(() => [] as CitySummary[]),
  ])
  return { cities: cities.data, profiles }
}, { watch: [locale] })
const groups = computed(() => {
  const m = new Map<string, { name: string, slug: string, cities: City[] }>()
  for (const c of data.value?.cities ?? []) {
    const g = m.get(c.region.slug) ?? { name: c.region.name, slug: c.region.slug, cities: [] }
    g.cities.push(c)
    m.set(c.region.slug, g)
  }
  return [...m.values()].sort((a, b) => a.name.localeCompare(b.name, locale.value))
})
const profiles = computed(() => data.value?.profiles ?? [])
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
    <UiEmptyState v-else-if="!groups.length && !profiles.length" :title="t('cities.emptyTitle')" :description="t('cities.empty')" icon="map" />
    <template v-else>
      <section v-if="profiles.length" aria-labelledby="cp-h" class="mb-10 space-y-4">
        <h2 id="cp-h" class="text-xl font-bold">{{ t('cities.profiles') }}</h2>
        <ul class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" data-testid="city-profiles">
          <li v-for="p in profiles" :key="p.slug">
            <UiCard as="article" class="relative flex h-full flex-col gap-2 hover:shadow-2">
              <UiBadge class="self-start"><UiIcon name="map" :size="14" />{{ p.region.name }}</UiBadge>
              <h3 class="text-lg font-bold"><NuxtLink :to="localePath(`/cities/${p.slug}`)" class="after:absolute after:inset-0 after:content-['']">{{ p.name }}</NuxtLink></h3>
              <p v-if="p.headline" class="font-medium">{{ p.headline }}</p>
              <p v-if="p.summary" class="line-clamp-3 text-ink-soft">{{ p.summary }}</p>
            </UiCard>
          </li>
        </ul>
      </section>
      <section v-if="groups.length" aria-labelledby="cg-h" class="space-y-4">
        <h2 id="cg-h" class="text-xl font-bold">{{ t('cities.guidesByCity') }}</h2>
        <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <UiCard v-for="g in groups" :key="g.slug" as="section" :aria-labelledby="`region-${g.slug}`">
            <h3 :id="`region-${g.slug}`" class="mb-2 text-lg font-bold">{{ g.name }}</h3>
            <ul class="space-y-1">
              <li v-for="c in g.cities" :key="c.slug">
                <NuxtLink :to="{ path: localePath('/guides'), query: { city: c.slug } }" class="inline-flex min-h-touch items-center text-primary-strong underline underline-offset-4">{{ c.name }}</NuxtLink>
              </li>
            </ul>
          </UiCard>
        </div>
      </section>
    </template>
  </div>
</template>
