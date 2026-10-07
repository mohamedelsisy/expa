<script setup lang="ts">
import type { Scenario, Vocabulary } from '~/types/extra'

const { t, locale } = useI18n()
const route = useRoute()
const { request } = useApi()
useSeo(() => ({ title: t('vocab.seo.title'), description: t('vocab.seo.description') }))
const get = (k: string) => (typeof route.query[k] === 'string' ? (route.query[k] as string) : '')
const level = computed(() => get('level'))
const category = computed(() => get('category'))
const q = computed(() => get('q'))
const page = computed(() => Math.max(1, Number(route.query.page) || 1))
const search = ref(q.value)
watch(q, v => { search.value = v })
const LEVELS = ['a0', 'a1', 'a2', 'b1', 'b2', 'c1']
const levelOptions = computed(() => LEVELS.map(l => ({ value: l, label: t(`learn.levels.${l}`) })))
const { data: scenarios } = await useAsyncData('vocab-scenarios', async () => (await request<Scenario[]>('italian/scenarios')).data, { watch: [locale] })
const categoryOptions = computed(() => (scenarios.value ?? []).filter(s => s.vocabulary > 0).map(s => ({ value: s.value, label: s.label })))
const { data, error, refresh, status } = await useAsyncData('vocabulary', () => request<Vocabulary[]>('italian/vocabulary', { query: { level: level.value, category: category.value, q: q.value, page: page.value, per_page: 30 } }), { watch: [level, category, q, page, locale] })
const items = computed(() => data.value?.data ?? [])
const meta = computed(() => data.value?.meta)
const hasFilters = computed(() => !!(level.value || category.value || q.value))
function setQuery(patch: Record<string, string | number>) {
  const merged: Record<string, unknown> = { level: level.value, category: category.value, q: q.value, ...patch }
  const next: Record<string, string> = {}
  for (const [k, v] of Object.entries(merged)) if (v !== '' && v !== undefined) next[k] = String(v)
  if (!('page' in patch)) delete next.page
  return navigateTo({ path: route.path, query: next })
}
const clear = () => { search.value = ''; return navigateTo({ path: route.path }) }
const crumbs = computed(() => [{ label: t('learn.title'), to: '/learn-italian' }, { label: t('practice.title'), to: '/learn-italian/practice' }, { label: t('vocab.title') }])
</script>

<template>
  <div class="container-page py-8 sm:py-12">
    <UiBreadcrumbs :items="crumbs" class="mb-6" />
    <header class="mb-6 max-w-2xl"><h1 class="text-2xl font-bold sm:text-3xl">{{ t('vocab.title') }}</h1><p class="mt-1 text-ink-soft">{{ t('vocab.subtitle') }}</p></header>
    <form role="search" class="mb-8 grid gap-4 rounded-lg border border-line bg-surface p-4 sm:grid-cols-3" @submit.prevent="setQuery({ q: search })">
      <UiFormField :label="t('guides.search')" class="sm:col-span-3"><UiTextInput v-model="search" type="search" inputmode="search" :maxlength="100" :placeholder="t('vocab.searchPlaceholder')" /></UiFormField>
      <UiFormField :label="t('learn.level')"><UiSelect :model-value="level" :options="levelOptions" :placeholder="t('learn.allLevels')" @update:model-value="setQuery({ level: $event })" /></UiFormField>
      <UiFormField :label="t('vocab.category')"><UiSelect :model-value="category" :options="categoryOptions" :placeholder="t('vocab.allCategories')" @update:model-value="setQuery({ category: $event })" /></UiFormField>
      <div class="flex items-end gap-2"><UiButton type="submit"><UiIcon name="search" :size="18" />{{ t('guides.searchButton') }}</UiButton><UiButton v-if="hasFilters" variant="ghost" @click="clear">{{ t('guides.clear') }}</UiButton></div>
    </form>
    <ul v-if="status === 'pending' && !data" class="space-y-3" aria-busy="true"><li v-for="n in 5" :key="n"><UiCard><UiSkeleton :lines="2" /></UiCard></li></ul>
    <UiErrorState v-else-if="error" :message="isApiError(error) ? error.message : undefined" retry @retry="refresh()" />
    <UiEmptyState v-else-if="!items.length" :title="hasFilters ? t('guides.noResultsTitle') : t('vocab.emptyTitle')" :description="hasFilters ? t('guides.noResults') : t('vocab.empty')" icon="book"><UiButton v-if="hasFilters" variant="secondary" @click="clear">{{ t('guides.clear') }}</UiButton></UiEmptyState>
    <template v-else>
      <p class="mb-3 text-sm text-muted">{{ t('vocab.resultsCount', { count: meta?.total ?? items.length }) }}</p>
      <ul class="divide-y divide-line rounded-lg border border-line bg-surface" data-testid="vocab-list">
        <li v-for="v in items" :key="v.slug" class="space-y-1 p-4">
          <div class="flex flex-wrap items-center gap-2"><span class="text-lg font-bold" lang="it" dir="ltr">{{ v.lemma }}</span><LearnListenButton :text="v.lemma" /><UiBadge tone="primary">{{ v.level_label }}</UiBadge><UiBadge v-if="v.category_label">{{ v.category_label }}</UiBadge><LearnReviewedNotice :item="v" compact /></div>
          <p v-if="v.gloss" class="text-ink" dir="auto">{{ v.gloss }}</p>
          <p v-if="v.example_it" class="text-sm text-ink-soft"><span lang="it" dir="ltr">{{ v.example_it }}</span><template v-if="v.example_gloss"> — <span dir="auto">{{ v.example_gloss }}</span></template></p>
          <p v-if="v.fallback" class="text-xs text-muted">{{ t('guides.shownIn', { language: t(`languages.${v.locale}`) }) }}</p>
        </li>
      </ul>
      <div class="mt-6"><UiPagination :page="meta?.page ?? 1" :last-page="meta?.last_page ?? 1" @change="setQuery({ page: $event })" /></div>
    </template>
  </div>
</template>
