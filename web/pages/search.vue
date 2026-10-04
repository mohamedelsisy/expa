<script setup lang="ts">
import type { SearchFacet, SearchResult } from '~/types/api'
import { mapApiRoute } from '~/utils/routes'

const { t, locale } = useI18n()
const route = useRoute()
const localePath = useLocalePath()
const { request } = useApi()

const q = computed(() => (typeof route.query.q === 'string' ? route.query.q.trim() : ''))
const type = computed(() => (typeof route.query.type === 'string' ? route.query.type : ''))
const page = computed(() => Math.max(1, Number(route.query.page) || 1))
useSeo(() => ({ title: q.value ? `${q.value} | ${t('search.title')}` : t('search.title'), description: t('search.subtitle'), noindex: true }))
const input = ref(q.value)
watch(q, v => { input.value = v })
const tooShort = computed(() => q.value.length > 0 && q.value.length < 2)

const { data, error, refresh, status } = await useAsyncData('search', async () => {
  if (q.value.length < 2) return null
  return request<SearchResult[]>('search', { query: { q: q.value, 'types[]': type.value, page: page.value, per_page: 20 }, handle401: false })
}, { watch: [q, type, page, locale] })
const results = computed(() => data.value?.data ?? [])
const meta = computed(() => data.value?.meta)
const facets = computed<SearchFacet[]>(() => meta.value?.facets ?? [])
const chips = computed(() => [{ value: '', label: t('search.allTypes'), count: facets.value.reduce((n, f) => n + f.count, 0) }, ...facets.value.map(f => ({ value: f.type, label: f.label, count: f.count }))])

function go(patch: Record<string, string | number>) {
  const merged: Record<string, unknown> = { q: q.value, type: type.value, ...patch }
  const next: Record<string, string> = {}
  for (const [k, v] of Object.entries(merged)) if (v !== '' && v !== undefined) next[k] = String(v)
  if (!('page' in patch)) delete next.page
  return navigateTo({ path: route.path, query: next })
}
const submit = () => go({ q: input.value.trim(), type: '' })
const pathFor = (r: SearchResult) => mapApiRoute(r.route)
</script>

<template>
  <div class="container-page max-w-4xl py-8 sm:py-12">
    <h1 class="text-2xl font-bold sm:text-3xl">{{ t('search.title') }}</h1>
    <form role="search" class="my-6 flex flex-wrap items-end gap-3" @submit.prevent="submit">
      <UiFormField :label="t('search.label')" class="min-w-0 flex-1 basis-64" :error="tooShort ? t('search.tooShort') : undefined"><UiTextInput v-model="input" type="search" inputmode="search" :maxlength="100" :placeholder="t('search.placeholder')" /></UiFormField>
      <UiButton type="submit"><UiIcon name="search" :size="18" />{{ t('guides.searchButton') }}</UiButton>
    </form>

    <UiEmptyState v-if="!q" :title="t('search.startTitle')" :description="t('search.start')" icon="search" />
    <template v-else-if="!tooShort">
      <UiChips v-if="facets.length" :model-value="type" :options="chips" :label="t('search.filterByType')" class="mb-5" @update:model-value="go({ type: $event })" />
      <div aria-live="polite" class="sr-only">{{ meta ? t('search.resultsCount', { count: meta.total ?? results.length }) : '' }}</div>
      <ul v-if="status === 'pending' && !data" aria-busy="true" class="space-y-3"><li v-for="n in 4" :key="n"><UiCard><UiSkeleton :lines="2" /></UiCard></li></ul>
      <UiErrorState v-else-if="error" :message="isApiError(error) ? error.message : undefined" retry @retry="refresh()" />
      <UiEmptyState v-else-if="!results.length" :title="t('search.noResultsTitle')" :description="t('search.noResults', { q })" icon="search"><UiButton to="/guides" variant="secondary">{{ t('landing.cta.explore') }}</UiButton></UiEmptyState>
      <template v-else>
        <p class="mb-4 text-sm text-muted">{{ t('search.resultsCount', { count: meta?.total ?? results.length }) }}</p>
        <ul class="space-y-3">
          <li v-for="r in results" :key="`${r.type}-${r.id}`">
            <UiCard as="article" class="relative space-y-1.5 hover:shadow-2" data-testid="search-result">
              <div class="flex flex-wrap items-center gap-2"><UiBadge tone="primary">{{ r.type_label }}</UiBadge><UiItalianTerm v-if="r.meta?.italian_term">{{ r.meta.italian_term }}</UiItalianTerm></div>
              <h2 class="text-lg font-bold">
                <NuxtLink v-if="pathFor(r)" :to="localePath(pathFor(r)!)" class="after:absolute after:inset-0 after:content-['']"><UiAutoItalian :text="r.title" /></NuxtLink>
                <UiAutoItalian v-else :text="r.title" />
              </h2>
              <p v-if="r.snippet" class="line-clamp-2 text-ink-soft" dir="auto">{{ r.snippet }}</p>
              <p v-if="r.locale && r.locale !== locale" class="text-xs text-muted">{{ t('guides.shownIn', { language: t(`languages.${r.locale}`) }) }}</p>
            </UiCard>
          </li>
        </ul>
        <div class="mt-8"><UiPagination :page="meta?.page ?? 1" :last-page="meta?.last_page ?? 1" @change="go({ page: $event })" /></div>
      </template>
    </template>
  </div>
</template>
