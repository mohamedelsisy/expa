<script setup lang="ts">
import type { City, University } from '~/types/api'

const { t, locale } = useI18n()
const route = useRoute()
const localePath = useLocalePath()
const { request } = useApi()
useSeo(() => ({ title: t('study.universities.title'), description: t('study.universities.subtitle') }))

const q = computed(() => (typeof route.query.q === 'string' ? route.query.q : ''))
const city = computed(() => (typeof route.query.city === 'string' ? route.query.city : ''))
const page = computed(() => Math.max(1, Number(route.query.page) || 1))
const search = ref(q.value)
watch(q, v => { search.value = v })

const { data: cities } = await useAsyncData('study-uni-cities', async () => (await request<City[]>('cities')).data, { watch: [locale] })
const cityOptions = computed(() => (cities.value ?? []).map(c => ({ value: c.slug, label: c.name })))
const { data, error, refresh, status } = await useAsyncData('study-universities', () => request<University[]>('study/universities', { query: { q: q.value, city: city.value, page: page.value, per_page: 12 } }), { watch: [q, city, page, locale] })
const items = computed(() => data.value?.data ?? [])
const meta = computed(() => data.value?.meta)
const hasFilters = computed(() => !!(q.value || city.value))
function setQuery(patch: Record<string, string | number | undefined>) {
  const merged: Record<string, unknown> = { q: q.value, city: city.value, ...patch }
  const next: Record<string, string> = {}
  for (const [k, v] of Object.entries(merged)) if (v !== undefined && v !== '' && v !== null) next[k] = String(v)
  if (!('page' in patch)) delete next.page
  return navigateTo({ path: route.path, query: next })
}
const clear = () => { search.value = ''; return navigateTo({ path: route.path }) }
const crumbs = computed(() => [{ label: t('nav.home'), to: '/' }, { label: t('study.title'), to: '/study' }, { label: t('study.universities.title') }])
</script>

<template>
  <div class="container-page py-8 sm:py-12">
    <UiBreadcrumbs :items="crumbs" class="mb-6" />
    <header class="mb-6 max-w-2xl">
      <h1 class="text-2xl font-bold sm:text-3xl">{{ t('study.universities.title') }}</h1>
      <p class="mt-1 text-ink-soft">{{ t('study.universities.subtitle') }}</p>
    </header>
    <form role="search" class="mb-8 grid gap-4 rounded-lg border border-line bg-surface p-4 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_auto] lg:items-end" @submit.prevent="setQuery({ q: search })">
      <UiFormField :label="t('guides.search')"><UiTextInput v-model="search" type="search" inputmode="search" :maxlength="100" /></UiFormField>
      <UiFormField :label="t('guides.city')"><UiSelect :model-value="city" :options="cityOptions" :placeholder="t('guides.allCities')" @update:model-value="setQuery({ city: $event })" /></UiFormField>
      <div class="flex gap-2"><UiButton type="submit"><UiIcon name="search" :size="18" />{{ t('guides.searchButton') }}</UiButton><UiButton v-if="hasFilters" variant="ghost" @click="clear">{{ t('guides.clear') }}</UiButton></div>
    </form>
    <div aria-live="polite" class="sr-only">{{ meta ? t('guides.resultsCount', { count: meta.total ?? items.length }) : '' }}</div>
    <ul v-if="status === 'pending' && !data" class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true"><li v-for="n in 6" :key="n"><UiCard><UiSkeleton :lines="3" /></UiCard></li></ul>
    <UiErrorState v-else-if="error" :message="isApiError(error) ? error.message : undefined" retry @retry="refresh()" />
    <UiEmptyState v-else-if="!items.length" :title="hasFilters ? t('guides.noResultsTitle') : t('study.universities.emptyTitle')" :description="hasFilters ? t('guides.noResults') : t('study.universities.empty')" icon="building" />
    <template v-else>
      <ul class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <li v-for="u in items" :key="u.slug">
          <UiCard as="article" class="relative flex h-full flex-col gap-2 transition-shadow focus-within:shadow-3 hover:shadow-2">
            <div class="flex flex-wrap gap-2"><UiBadge tone="primary">{{ u.kind_label }}</UiBadge><UiSourceBadge :type="u.source.type" /></div>
            <h2 class="text-lg font-bold"><NuxtLink :to="localePath(`/study/universities/${u.slug}`)" class="after:absolute after:inset-0 after:content-['']">{{ u.name }}</NuxtLink></h2>
            <p v-if="u.city" class="flex items-center gap-1.5 text-ink-soft"><UiIcon name="map" :size="16" />{{ u.city.name }}</p>
            <p v-if="u.summary" class="line-clamp-3 text-ink-soft">{{ u.summary }}</p>
          </UiCard>
        </li>
      </ul>
      <div class="mt-8"><UiPagination :page="meta?.page ?? 1" :last-page="meta?.last_page ?? 1" @change="setQuery({ page: $event })" /></div>
    </template>
  </div>
</template>
