<script setup lang="ts">
import type { City, Guide, GuideCategory } from '~/types/api'

const { t, locale } = useI18n()
const route = useRoute()
const localePath = useLocalePath()
const { request } = useApi()
useSeo(() => ({ title: t('guides.seo.title'), description: t('guides.seo.description') }))

const PER_PAGE = 12
const q = computed(() => (typeof route.query.q === 'string' ? route.query.q : ''))
const category = computed(() => (typeof route.query.category === 'string' ? route.query.category : ''))
const region = computed(() => (typeof route.query.region === 'string' ? route.query.region : ''))
const city = computed(() => (typeof route.query.city === 'string' ? route.query.city : ''))
const page = computed(() => Math.max(1, Number(route.query.page) || 1))

const search = ref(q.value)
watch(q, v => { search.value = v })

const { data: lookups, error: lookupError } = await useAsyncData('guide-lookups', async () => {
  const [cats, cities] = await Promise.all([request<GuideCategory[]>('guides/categories'), request<City[]>('cities')])
  return { categories: cats.data, cities: cities.data }
}, { watch: [locale] })

const regions = computed(() => {
  const m = new Map<string, string>()
  for (const c of lookups.value?.cities ?? []) m.set(c.region.slug, c.region.name)
  return [...m.entries()].map(([value, label]) => ({ value, label })).sort((a, b) => a.label.localeCompare(b.label, locale.value))
})
const cityOptions = computed(() => (lookups.value?.cities ?? []).filter(c => !region.value || c.region.slug === region.value).map(c => ({ value: c.slug, label: c.name })))
const categoryOptions = computed(() => (lookups.value?.categories ?? []).map(c => ({ value: c.value, label: c.label })))

const { data, error, refresh, status } = await useAsyncData('guides', () => request<Guide[]>('guides', {
  query: { q: q.value, category: category.value, region: city.value ? '' : region.value, city: city.value, page: page.value, per_page: PER_PAGE },
}), { watch: [q, category, region, city, page, locale] })

const guides = computed(() => data.value?.data ?? [])
const meta = computed(() => data.value?.meta)
const hasFilters = computed(() => !!(q.value || category.value || region.value || city.value))

function setQuery(patch: Record<string, string | number | undefined>) {
  const next: Record<string, string> = {}
  const merged = { q: q.value, category: category.value, region: region.value, city: city.value, ...patch }
  for (const [k, v] of Object.entries(merged)) if (v !== undefined && v !== '' && v !== null) next[k] = String(v)
  if (!('page' in patch)) delete next.page
  return navigateTo({ path: route.path, query: next })
}
const onRegion = (v: string) => setQuery({ region: v, city: '' })
const clear = () => { search.value = ''; return navigateTo({ path: route.path }) }
const changePage = (p: number) => setQuery({ page: p })
</script>

<template>
  <div class="container-page py-8 sm:py-12">
    <header class="mb-6 max-w-2xl">
      <h1 class="text-2xl font-bold sm:text-3xl">{{ t('guides.title') }}</h1>
      <p class="mt-1 text-ink-soft">{{ t('guides.subtitle') }}</p>
    </header>

    <form role="search" class="mb-8 grid gap-4 rounded-lg border border-line bg-surface p-4 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr_auto] lg:items-end" @submit.prevent="setQuery({ q: search })">
      <UiFormField :label="t('guides.search')">
        <UiTextInput v-model="search" type="search" inputmode="search" :placeholder="t('guides.searchPlaceholder')" :maxlength="100" />
      </UiFormField>
      <UiFormField :label="t('guides.category')">
        <UiSelect :model-value="category" :options="categoryOptions" :placeholder="t('guides.allCategories')" @update:model-value="setQuery({ category: $event })" />
      </UiFormField>
      <UiFormField :label="t('guides.region')">
        <UiSelect :model-value="region" :options="regions" :placeholder="t('guides.allRegions')" @update:model-value="onRegion" />
      </UiFormField>
      <UiFormField :label="t('guides.city')">
        <UiSelect :model-value="city" :options="cityOptions" :placeholder="t('guides.allCities')" @update:model-value="setQuery({ city: $event })" />
      </UiFormField>
      <div class="flex gap-2 sm:col-span-2 lg:col-span-1">
        <UiButton type="submit"><UiIcon name="search" :size="18" />{{ t('guides.searchButton') }}</UiButton>
        <UiButton v-if="hasFilters" variant="ghost" @click="clear">{{ t('guides.clear') }}</UiButton>
      </div>
    </form>
    <UiAlert v-if="lookupError" tone="warning" class="mb-6">{{ t('guides.filtersUnavailable') }}</UiAlert>

    <div aria-live="polite" class="sr-only">{{ meta ? t('guides.resultsCount', { count: meta.total ?? guides.length }) : '' }}</div>

    <ul v-if="status === 'pending' && !data" class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true">
      <li v-for="n in 6" :key="n"><UiCard><UiSkeleton :lines="4" /></UiCard></li>
    </ul>
    <UiErrorState v-else-if="error" :message="isApiError(error) ? error.message : undefined" retry @retry="refresh()" />
    <UiEmptyState v-else-if="!guides.length" :title="hasFilters ? t('guides.noResultsTitle') : t('guides.emptyTitle')" :description="hasFilters ? t('guides.noResults') : t('guides.empty')" icon="book">
      <UiButton v-if="hasFilters" variant="secondary" @click="clear">{{ t('guides.clear') }}</UiButton>
    </UiEmptyState>
    <template v-else>
      <p class="mb-4 text-sm text-muted">{{ t('guides.resultsCount', { count: meta?.total ?? guides.length }) }}</p>
      <ul class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <li v-for="g in guides" :key="g.id"><GuideCard :guide="g" /></li>
      </ul>
      <div class="mt-8"><UiPagination :page="meta?.page ?? 1" :last-page="meta?.last_page ?? 1" @change="changePage" /></div>
    </template>
  </div>
</template>
