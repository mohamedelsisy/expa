<script setup lang="ts">
import type { City, StudyMeta, StudyProgram } from '~/types/api'

const { t, locale } = useI18n()
const route = useRoute()
const { request } = useApi()
useSeo(() => ({ title: t('study.programs.title'), description: t('study.programs.subtitle') }))

const str = (k: string) => (typeof route.query[k] === 'string' ? (route.query[k] as string) : '')
const q = computed(() => str('q'))
const field = computed(() => str('field'))
const degree = computed(() => str('degree'))
const language = computed(() => str('language'))
const city = computed(() => str('city'))
const page = computed(() => Math.max(1, Number(route.query.page) || 1))
const search = ref(q.value)
watch(q, v => { search.value = v })

const { data: lookups, error: lookupError } = await useAsyncData('study-lookups', async () => {
  const [meta, cities] = await Promise.all([request<StudyMeta>('study/meta'), request<City[]>('cities')])
  return { meta: meta.data, cities: cities.data }
}, { watch: [locale] })
const cityOptions = computed(() => (lookups.value?.cities ?? []).map(c => ({ value: c.slug, label: c.name })))
const languageOptions = computed(() => (lookups.value?.meta.languages ?? []).filter(l => l.value !== 'both'))

const { data, error, refresh, status } = await useAsyncData('study-programs', () => request<StudyProgram[]>('study/programs', {
  query: { q: q.value, field: field.value, degree: degree.value, language: language.value, city: city.value, page: page.value, per_page: 12 },
}), { watch: [q, field, degree, language, city, page, locale] })
const items = computed(() => data.value?.data ?? [])
const meta = computed(() => data.value?.meta)
const hasFilters = computed(() => !!(q.value || field.value || degree.value || language.value || city.value))

function setQuery(patch: Record<string, string | number | undefined>) {
  const merged: Record<string, unknown> = { q: q.value, field: field.value, degree: degree.value, language: language.value, city: city.value, ...patch }
  const next: Record<string, string> = {}
  for (const [k, v] of Object.entries(merged)) if (v !== undefined && v !== '' && v !== null) next[k] = String(v)
  if (!('page' in patch)) delete next.page
  return navigateTo({ path: route.path, query: next })
}
const clear = () => { search.value = ''; return navigateTo({ path: route.path }) }
const crumbs = computed(() => [{ label: t('nav.home'), to: '/' }, { label: t('study.title'), to: '/study' }, { label: t('study.programs.title') }])
</script>

<template>
  <div class="container-page py-8 sm:py-12">
    <UiBreadcrumbs :items="crumbs" class="mb-6" />
    <header class="mb-6 max-w-2xl">
      <h1 class="text-2xl font-bold sm:text-3xl">{{ t('study.programs.title') }}</h1>
      <p class="mt-1 text-ink-soft">{{ t('study.programs.subtitle') }}</p>
    </header>
    <StudyVerifyNotice :text="items[0]?.verify_notice ?? lookups?.meta.verify_notice" class="mb-6" />
    <form role="search" class="mb-8 grid gap-4 rounded-lg border border-line bg-surface p-4 sm:grid-cols-2 lg:grid-cols-3" @submit.prevent="setQuery({ q: search })">
      <UiFormField :label="t('guides.search')"><UiTextInput v-model="search" type="search" inputmode="search" :maxlength="100" /></UiFormField>
      <UiFormField :label="t('study.field')"><UiSelect :model-value="field" :options="lookups?.meta.fields ?? []" :placeholder="t('study.any')" @update:model-value="setQuery({ field: $event })" /></UiFormField>
      <UiFormField :label="t('study.degree')"><UiSelect :model-value="degree" :options="lookups?.meta.degree_levels ?? []" :placeholder="t('study.any')" @update:model-value="setQuery({ degree: $event })" /></UiFormField>
      <UiFormField :label="t('study.language')"><UiSelect :model-value="language" :options="languageOptions" :placeholder="t('study.any')" @update:model-value="setQuery({ language: $event })" /></UiFormField>
      <UiFormField :label="t('guides.city')"><UiSelect :model-value="city" :options="cityOptions" :placeholder="t('guides.allCities')" @update:model-value="setQuery({ city: $event })" /></UiFormField>
      <div class="flex items-end gap-2">
        <UiButton type="submit"><UiIcon name="search" :size="18" />{{ t('guides.searchButton') }}</UiButton>
        <UiButton v-if="hasFilters" variant="ghost" @click="clear">{{ t('guides.clear') }}</UiButton>
      </div>
    </form>
    <UiAlert v-if="lookupError" tone="warning" class="mb-6">{{ t('guides.filtersUnavailable') }}</UiAlert>
    <div aria-live="polite" class="sr-only">{{ meta ? t('guides.resultsCount', { count: meta.total ?? items.length }) : '' }}</div>

    <ul v-if="status === 'pending' && !data" class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true"><li v-for="n in 6" :key="n"><UiCard><UiSkeleton :lines="4" /></UiCard></li></ul>
    <UiErrorState v-else-if="error" :message="isApiError(error) ? error.message : undefined" retry @retry="refresh()" />
    <UiEmptyState v-else-if="!items.length" :title="hasFilters ? t('guides.noResultsTitle') : t('study.programs.emptyTitle')" :description="hasFilters ? t('guides.noResults') : t('study.programs.empty')" icon="book">
      <UiButton v-if="hasFilters" variant="secondary" @click="clear">{{ t('guides.clear') }}</UiButton>
    </UiEmptyState>
    <template v-else>
      <ul class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"><li v-for="p in items" :key="p.id"><StudyProgramCard :program="p" /></li></ul>
      <div class="mt-8"><UiPagination :page="meta?.page ?? 1" :last-page="meta?.last_page ?? 1" @change="setQuery({ page: $event })" /></div>
    </template>
  </div>
</template>
