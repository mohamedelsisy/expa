<script setup lang="ts">
import type { City, Job, JobsMeta } from '~/types/api'

const { t, locale } = useI18n()
const route = useRoute()
const auth = useAuthStore()
const { request } = useApi()
useSeo(() => ({ title: t('jobs.title'), description: t('jobs.subtitle') }))

const q = computed(() => (typeof route.query.q === 'string' ? route.query.q : ''))
const get = (k: string) => (typeof route.query[k] === 'string' ? (route.query[k] as string) : '')
const city = computed(() => get('city'))
const remote = computed(() => get('remote'))
const type = computed(() => get('type'))
const category = computed(() => get('category'))
const italianMax = computed(() => get('italian_max'))
const page = computed(() => Math.max(1, Number(route.query.page) || 1))
const search = ref(q.value)
watch(q, v => { search.value = v })

const { data: lookups, error: lookupError } = await useAsyncData('jobs-lookups', async () => {
  const [meta, cities] = await Promise.all([request<JobsMeta>('jobs/meta'), request<City[]>('cities')])
  return { meta: meta.data, cities: cities.data }
}, { watch: [locale] })
const LEVELS = ['a0', 'a1', 'a2', 'b1', 'b2', 'c1', 'c2']
const levelOptions = computed(() => LEVELS.map(l => ({ value: l, label: t(`learn.levels.${l}`) })))
const cityOptions = computed(() => (lookups.value?.cities ?? []).map(c => ({ value: c.slug, label: c.name })))

const { data, error, refresh, status } = await useAsyncData('jobs', () => request<Job[]>('jobs', {
  query: { q: q.value, city: city.value, remote: remote.value, type: type.value, category: category.value, italian_max: italianMax.value, page: page.value, per_page: 12 },
}), { watch: [q, city, remote, type, category, italianMax, page, locale] })
const jobs = computed(() => data.value?.data ?? [])
const meta = computed(() => data.value?.meta)
const hasFilters = computed(() => !!(q.value || city.value || remote.value || type.value || category.value || italianMax.value))

function setQuery(patch: Record<string, string | number>) {
  const merged: Record<string, unknown> = { q: q.value, city: city.value, remote: remote.value, type: type.value, category: category.value, italian_max: italianMax.value, ...patch }
  const next: Record<string, string> = {}
  for (const [k, v] of Object.entries(merged)) if (v !== '' && v !== undefined && v !== null) next[k] = String(v)
  if (!('page' in patch)) delete next.page
  return navigateTo({ path: route.path, query: next })
}
const clear = () => { search.value = ''; return navigateTo({ path: route.path }) }
</script>

<template>
  <div class="container-page py-8 sm:py-12">
    <header class="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div class="max-w-2xl"><h1 class="text-2xl font-bold sm:text-3xl">{{ t('jobs.title') }}</h1><p class="mt-1 text-ink-soft">{{ t('jobs.subtitle') }}</p></div>
      <div v-if="auth.isAuthenticated" class="flex flex-wrap gap-2"><UiButton to="/jobs/recommended" variant="secondary">{{ t('jobs.recommended') }}</UiButton><UiButton to="/jobs/saved" variant="secondary"><UiIcon name="bookmark" :size="18" />{{ t('jobs.saved') }}</UiButton><UiButton to="/jobs/preferences" variant="ghost">{{ t('jobs.preferences') }}</UiButton></div>
    </header>
    <UiAlert tone="info" class="mb-6">{{ lookups?.meta.apply_notice ?? t('jobs.applyNoticeFallback') }}</UiAlert>
    <form role="search" class="mb-8 grid gap-4 rounded-lg border border-line bg-surface p-4 sm:grid-cols-2 lg:grid-cols-3" @submit.prevent="setQuery({ q: search })">
      <UiFormField :label="t('guides.search')" class="sm:col-span-2 lg:col-span-3"><UiTextInput v-model="search" type="search" inputmode="search" :maxlength="100" :placeholder="t('jobs.searchPlaceholder')" /></UiFormField>
      <UiFormField :label="t('guides.city')"><UiSelect :model-value="city" :options="cityOptions" :placeholder="t('guides.allCities')" @update:model-value="setQuery({ city: $event })" /></UiFormField>
      <UiFormField :label="t('jobs.remote')"><UiSelect :model-value="remote" :options="lookups?.meta.remote_modes ?? []" :placeholder="t('jobs.any')" @update:model-value="setQuery({ remote: $event })" /></UiFormField>
      <UiFormField :label="t('jobs.employmentType')"><UiSelect :model-value="type" :options="lookups?.meta.employment_types ?? []" :placeholder="t('jobs.any')" @update:model-value="setQuery({ type: $event })" /></UiFormField>
      <UiFormField :label="t('jobs.category')"><UiSelect :model-value="category" :options="lookups?.meta.categories ?? []" :placeholder="t('jobs.any')" @update:model-value="setQuery({ category: $event })" /></UiFormField>
      <UiFormField :label="t('jobs.italianMax')" :hint="t('jobs.italianMaxHint')"><UiSelect :model-value="italianMax" :options="levelOptions" :placeholder="t('jobs.any')" @update:model-value="setQuery({ italian_max: $event })" /></UiFormField>
      <div class="flex items-end gap-2"><UiButton type="submit"><UiIcon name="search" :size="18" />{{ t('guides.searchButton') }}</UiButton><UiButton v-if="hasFilters" variant="ghost" @click="clear">{{ t('guides.clear') }}</UiButton></div>
    </form>
    <UiAlert v-if="lookupError" tone="warning" class="mb-6">{{ t('guides.filtersUnavailable') }}</UiAlert>
    <div aria-live="polite" class="sr-only">{{ meta ? t('jobs.resultsCount', { count: meta.total ?? jobs.length }) : '' }}</div>
    <ul v-if="status === 'pending' && !data" class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true"><li v-for="n in 6" :key="n"><UiCard><UiSkeleton :lines="4" /></UiCard></li></ul>
    <UiErrorState v-else-if="error" :message="isApiError(error) ? error.message : undefined" retry @retry="refresh()" />
    <UiEmptyState v-else-if="!jobs.length" :title="hasFilters ? t('guides.noResultsTitle') : t('jobs.emptyTitle')" :description="hasFilters ? t('guides.noResults') : t('jobs.empty')" icon="briefcase"><UiButton v-if="hasFilters" variant="secondary" @click="clear">{{ t('guides.clear') }}</UiButton></UiEmptyState>
    <template v-else>
      <p class="mb-4 text-sm text-muted">{{ t('jobs.resultsCount', { count: meta?.total ?? jobs.length }) }}</p>
      <ul class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"><li v-for="j in jobs" :key="j.id"><JobsJobCard :job="j" /></li></ul>
      <div class="mt-8"><UiPagination :page="meta?.page ?? 1" :last-page="meta?.last_page ?? 1" @change="setQuery({ page: $event })" /></div>
    </template>
  </div>
</template>
