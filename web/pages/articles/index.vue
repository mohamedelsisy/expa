<script setup lang="ts">
import type { City, Option } from '~/types/api'
import type { ArticleSummary } from '~/types/extra'

const { t, locale } = useI18n()
const route = useRoute()
const { request } = useApi()
useSeo(() => ({ title: t('articles.seo.title'), description: t('articles.seo.description') }))
const get = (k: string) => (typeof route.query[k] === 'string' ? (route.query[k] as string) : '')
const q = computed(() => get('q'))
const category = computed(() => get('category'))
const city = computed(() => get('city'))
const sort = computed(() => get('sort'))
const page = computed(() => Math.max(1, Number(route.query.page) || 1))
const search = ref(q.value)
watch(q, v => { search.value = v })

const { data: lookups, error: lookupError } = await useAsyncData('articles-lookups', async () => {
  const [cats, cities] = await Promise.all([request<Option[]>('articles/categories'), request<City[]>('cities')])
  return { cats: cats.data, cities: cities.data }
}, { watch: [locale] })
const cityOptions = computed(() => (lookups.value?.cities ?? []).map(c => ({ value: c.slug, label: c.name })))
const sortOptions = computed(() => ['-published_at', 'published_at', 'title'].map(v => ({ value: v, label: t(`articles.sort.${v}`) })))

const { data, error, refresh, status } = await useAsyncData('articles', () => request<ArticleSummary[]>('articles', {
  query: { q: q.value, category: category.value, city: city.value, sort: sort.value, page: page.value, per_page: 12 },
}), { watch: [q, category, city, sort, page, locale] })
const items = computed(() => data.value?.data ?? [])
const meta = computed(() => data.value?.meta)
const hasFilters = computed(() => !!(q.value || category.value || city.value || sort.value))
function setQuery(patch: Record<string, string | number>) {
  const merged: Record<string, unknown> = { q: q.value, category: category.value, city: city.value, sort: sort.value, ...patch }
  const next: Record<string, string> = {}
  for (const [k, v] of Object.entries(merged)) if (v !== '' && v !== undefined && v !== null) next[k] = String(v)
  if (!('page' in patch)) delete next.page
  return navigateTo({ path: route.path, query: next })
}
const clear = () => { search.value = ''; return navigateTo({ path: route.path }) }
const crumbs = computed(() => [{ label: t('nav.home'), to: '/' }, { label: t('articles.title') }])
</script>

<template>
  <div class="container-page py-8 sm:py-12">
    <UiBreadcrumbs :items="crumbs" class="mb-6" />
    <header class="mb-6 max-w-2xl"><h1 class="text-2xl font-bold sm:text-3xl">{{ t('articles.title') }}</h1><p class="mt-1 text-ink-soft">{{ t('articles.subtitle') }}</p></header>
    <UiAlert tone="info" class="mb-6">{{ t('articles.editorialNote') }}</UiAlert>
    <form role="search" class="mb-8 grid gap-4 rounded-lg border border-line bg-surface p-4 sm:grid-cols-2 lg:grid-cols-4" @submit.prevent="setQuery({ q: search })">
      <UiFormField :label="t('guides.search')" class="sm:col-span-2 lg:col-span-4"><UiTextInput v-model="search" type="search" inputmode="search" :maxlength="100" :placeholder="t('articles.searchPlaceholder')" /></UiFormField>
      <UiFormField :label="t('articles.category')"><UiSelect :model-value="category" :options="lookups?.cats ?? []" :placeholder="t('articles.allCategories')" @update:model-value="setQuery({ category: $event })" /></UiFormField>
      <UiFormField :label="t('guides.city')"><UiSelect :model-value="city" :options="cityOptions" :placeholder="t('guides.allCities')" @update:model-value="setQuery({ city: $event })" /></UiFormField>
      <UiFormField :label="t('articles.sortBy')"><UiSelect :model-value="sort" :options="sortOptions" :placeholder="t('articles.sort.default')" @update:model-value="setQuery({ sort: $event })" /></UiFormField>
      <div class="flex items-end gap-2"><UiButton type="submit"><UiIcon name="search" :size="18" />{{ t('guides.searchButton') }}</UiButton><UiButton v-if="hasFilters" variant="ghost" @click="clear">{{ t('guides.clear') }}</UiButton></div>
    </form>
    <UiAlert v-if="lookupError" tone="warning" class="mb-6">{{ t('guides.filtersUnavailable') }}</UiAlert>
    <ul v-if="status === 'pending' && !data" class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true"><li v-for="n in 6" :key="n"><UiCard><UiSkeleton :lines="4" /></UiCard></li></ul>
    <UiErrorState v-else-if="error" :message="isApiError(error) ? error.message : undefined" retry @retry="refresh()" />
    <UiEmptyState v-else-if="!items.length" :title="hasFilters ? t('guides.noResultsTitle') : t('articles.emptyTitle')" :description="hasFilters ? t('guides.noResults') : t('articles.empty')" icon="list"><UiButton v-if="hasFilters" variant="secondary" @click="clear">{{ t('guides.clear') }}</UiButton></UiEmptyState>
    <template v-else>
      <p class="mb-4 text-sm text-muted">{{ t('articles.resultsCount', { count: meta?.total ?? items.length }) }}</p>
      <ul class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"><li v-for="a in items" :key="a.id"><ArticlesCard :article="a" /></li></ul>
      <div class="mt-8"><UiPagination :page="meta?.page ?? 1" :last-page="meta?.last_page ?? 1" @change="setQuery({ page: $event })" /></div>
    </template>
  </div>
</template>
