<script setup lang="ts">
import type { City } from '~/types/api'
import type { ProviderSummary, ProvidersMeta } from '~/types/extra'
import { SERVICE_LANGUAGES, languageName } from '~/utils/services'

const { t, locale } = useI18n()
const route = useRoute()
const auth = useAuthStore()
const { request } = useApi()
useSeo(() => ({ title: t('services.seo.title'), description: t('services.seo.description') }))
const get = (k: string) => (typeof route.query[k] === 'string' ? (route.query[k] as string) : '')
const q = computed(() => get('q'))
const category = computed(() => get('category'))
const city = computed(() => get('city'))
const language = computed(() => get('language'))
const verified = computed(() => get('verified'))
const online = computed(() => get('online'))
const sort = computed(() => get('sort'))
const page = computed(() => Math.max(1, Number(route.query.page) || 1))
const search = ref(q.value)
watch(q, v => { search.value = v })

const { data: lookups, error: lookupError } = await useAsyncData('services-lookups', async () => {
  const [meta, cities] = await Promise.all([request<ProvidersMeta>('providers/meta'), request<City[]>('cities')])
  return { meta: meta.data, cities: cities.data }
}, { watch: [locale] })
const cityOptions = computed(() => (lookups.value?.cities ?? []).map(c => ({ value: c.slug, label: c.name })))
const langOptions = computed(() => SERVICE_LANGUAGES.map(l => ({ value: l, label: languageName(l, locale.value) })))
const sortOptions = computed(() => (lookups.value?.meta.sorts ?? []).map(v => ({ value: v, label: t(`services.sort.${v}`) })))

const { data, error, refresh, status } = await useAsyncData('providers', () => request<ProviderSummary[]>('providers', {
  query: { q: q.value, category: category.value, city: city.value, language: language.value, verified: verified.value, online: online.value, sort: sort.value, page: page.value, per_page: 12 },
}), { watch: [q, category, city, language, verified, online, sort, page, locale] })
const items = computed(() => data.value?.data ?? [])
const meta = computed(() => data.value?.meta)
const hasFilters = computed(() => !!(q.value || category.value || city.value || language.value || verified.value || online.value || sort.value))
function setQuery(patch: Record<string, string | number>) {
  const merged: Record<string, unknown> = { q: q.value, category: category.value, city: city.value, language: language.value, verified: verified.value, online: online.value, sort: sort.value, ...patch }
  const next: Record<string, string> = {}
  for (const [k, v] of Object.entries(merged)) if (v !== '' && v !== undefined && v !== null) next[k] = String(v)
  if (!('page' in patch)) delete next.page
  return navigateTo({ path: route.path, query: next })
}
const clear = () => { search.value = ''; return navigateTo({ path: route.path }) }
const crumbs = computed(() => [{ label: t('nav.home'), to: '/' }, { label: t('services.title') }])
</script>

<template>
  <div class="container-page py-8 sm:py-12">
    <UiBreadcrumbs :items="crumbs" class="mb-6" />
    <header class="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div class="max-w-2xl"><h1 class="text-2xl font-bold sm:text-3xl">{{ t('services.title') }}</h1><p class="mt-1 text-ink-soft">{{ t('services.subtitle') }}</p></div>
      <div v-if="auth.isAuthenticated" class="flex flex-wrap gap-2"><UiButton to="/my-requests" variant="secondary">{{ t('services.myRequests') }}</UiButton><UiButton to="/provider" variant="ghost">{{ t('provider.entry') }}</UiButton></div>
      <UiButton v-else to="/provider" variant="ghost">{{ t('provider.entry') }}</UiButton>
    </header>
    <UiAlert tone="warning" class="mb-6" data-testid="services-notice">{{ lookups?.meta.notice ?? t('services.noticeFallback') }}</UiAlert>
    <form role="search" class="mb-8 grid gap-4 rounded-lg border border-line bg-surface p-4 sm:grid-cols-2 lg:grid-cols-3" @submit.prevent="setQuery({ q: search })">
      <UiFormField :label="t('guides.search')" class="sm:col-span-2 lg:col-span-3"><UiTextInput v-model="search" type="search" inputmode="search" :maxlength="100" :placeholder="t('services.searchPlaceholder')" /></UiFormField>
      <UiFormField :label="t('services.category')"><UiSelect :model-value="category" :options="lookups?.meta.categories ?? []" :placeholder="t('services.allCategories')" @update:model-value="setQuery({ category: $event })" /></UiFormField>
      <UiFormField :label="t('guides.city')"><UiSelect :model-value="city" :options="cityOptions" :placeholder="t('guides.allCities')" @update:model-value="setQuery({ city: $event })" /></UiFormField>
      <UiFormField :label="t('services.language')"><UiSelect :model-value="language" :options="langOptions" :placeholder="t('services.anyLanguage')" @update:model-value="setQuery({ language: $event })" /></UiFormField>
      <UiFormField :label="t('articles.sortBy')"><UiSelect :model-value="sort" :options="sortOptions" :placeholder="t('services.sort.default')" @update:model-value="setQuery({ sort: $event })" /></UiFormField>
      <div class="flex flex-col justify-end">
        <UiCheckbox :model-value="verified === '1'" :label="t('services.onlyVerified')" @update:model-value="setQuery({ verified: $event ? '1' : '' })" />
        <UiCheckbox :model-value="online === '1'" :label="t('services.onlyOnline')" @update:model-value="setQuery({ online: $event ? '1' : '' })" />
      </div>
      <div class="flex items-end gap-2"><UiButton type="submit"><UiIcon name="search" :size="18" />{{ t('guides.searchButton') }}</UiButton><UiButton v-if="hasFilters" variant="ghost" @click="clear">{{ t('guides.clear') }}</UiButton></div>
    </form>
    <UiAlert v-if="lookupError" tone="warning" class="mb-6">{{ t('guides.filtersUnavailable') }}</UiAlert>
    <ul v-if="status === 'pending' && !data" class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true"><li v-for="n in 6" :key="n"><UiCard><UiSkeleton :lines="4" /></UiCard></li></ul>
    <UiErrorState v-else-if="error" :message="isApiError(error) ? error.message : undefined" retry @retry="refresh()" />
    <UiEmptyState v-else-if="!items.length" :title="hasFilters ? t('guides.noResultsTitle') : t('services.emptyTitle')" :description="hasFilters ? t('guides.noResults') : t('services.empty')" icon="user"><UiButton v-if="hasFilters" variant="secondary" @click="clear">{{ t('guides.clear') }}</UiButton></UiEmptyState>
    <template v-else>
      <p class="mb-4 text-sm text-muted">{{ t('services.resultsCount', { count: meta?.total ?? items.length }) }}</p>
      <ul class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"><li v-for="p in items" :key="p.id"><ServicesCard :provider="p" /></li></ul>
      <div class="mt-8"><UiPagination :page="meta?.page ?? 1" :last-page="meta?.last_page ?? 1" @change="setQuery({ page: $event })" /></div>
    </template>
  </div>
</template>
