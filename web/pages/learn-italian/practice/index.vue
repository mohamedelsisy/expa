<script setup lang="ts">
import type { Exercise, PracticeProgress, Scenario } from '~/types/extra'

const { t, locale } = useI18n()
const route = useRoute()
const localePath = useLocalePath()
const auth = useAuthStore()
const { request } = useApi()
useSeo(() => ({ title: t('practice.seo.title'), description: t('practice.seo.description') }))
const get = (k: string) => (typeof route.query[k] === 'string' ? (route.query[k] as string) : '')
const scenario = computed(() => get('scenario'))
const type = computed(() => get('type'))
const level = computed(() => get('level'))
const page = computed(() => Math.max(1, Number(route.query.page) || 1))
const LEVELS = ['a0', 'a1', 'a2', 'b1', 'b2', 'c1']
const TYPES = ['multiple_choice', 'fill_blank', 'match', 'listening']
const levelOptions = computed(() => LEVELS.map(l => ({ value: l, label: t(`learn.levels.${l}`) })))
const typeOptions = computed(() => TYPES.map(v => ({ value: v, label: t(`practice.types.${v}`) })))

const { data: scenarios, error: scError, refresh: scRefresh } = await useAsyncData('practice-scenarios', async () => (await request<Scenario[]>('italian/scenarios')).data, { watch: [locale] })
const scenarioOptions = computed(() => (scenarios.value ?? []).filter(s => s.exercises > 0).map(s => ({ value: s.value, label: s.label })))
const { data: mine } = await useAsyncData('practice-progress', async () => {
  if (!auth.isAuthenticated) return null
  try { return (await request<PracticeProgress>('italian/practice/progress', { handle401: false })).data } catch { return null }
}, { watch: [locale] })
const { data, error, refresh, status } = await useAsyncData('practice-exercises', () => request<Exercise[]>('italian/exercises', { query: { scenario: scenario.value, type: type.value, level: level.value, page: page.value, per_page: 12 } }), { watch: [scenario, type, level, page, locale] })
const exercises = computed(() => data.value?.data ?? [])
const em = computed(() => data.value?.meta)
const hasFilters = computed(() => !!(scenario.value || type.value || level.value))
function setQuery(patch: Record<string, string | number>) {
  const merged: Record<string, unknown> = { scenario: scenario.value, type: type.value, level: level.value, ...patch }
  const next: Record<string, string> = {}
  for (const [k, v] of Object.entries(merged)) if (v !== '' && v !== undefined) next[k] = String(v)
  if (!('page' in patch)) delete next.page
  return navigateTo({ path: route.path, query: next })
}
const crumbs = computed(() => [{ label: t('learn.title'), to: '/learn-italian' }, { label: t('practice.title') }])
</script>

<template>
  <div class="container-page py-8 sm:py-12">
    <UiBreadcrumbs :items="crumbs" class="mb-6" />
    <header class="mb-6 max-w-2xl"><h1 class="text-2xl font-bold sm:text-3xl">{{ t('practice.title') }}</h1><p class="mt-1 text-ink-soft">{{ t('practice.subtitle') }}</p></header>
    <UiAlert tone="info" class="mb-6">{{ t('practice.reviewExplain') }}</UiAlert>

    <section aria-labelledby="pr-h" class="mb-10 grid gap-4 sm:grid-cols-2">
      <UiCard class="space-y-3">
        <h2 id="pr-h" class="text-xl font-bold">{{ t('practice.reviewTitle') }}</h2>
        <template v-if="auth.isAuthenticated">
          <p v-if="mine" class="text-ink-soft" data-testid="practice-stats">{{ t('practice.dueNow', { count: mine.vocabulary.due_now }) }} · {{ t('practice.learning', { count: mine.vocabulary.cards_learning }) }} · {{ t('practice.mastered', { count: mine.vocabulary.mastered }) }}</p>
          <UiButton to="/learn-italian/practice/review" size="lg"><UiIcon name="refresh" :size="18" />{{ t('practice.startReview') }}</UiButton>
        </template>
        <template v-else><p class="text-ink-soft">{{ t('practice.loginForReview') }}</p><UiButton to="/login" variant="secondary">{{ t('auth.login') }}</UiButton></template>
      </UiCard>
      <UiCard class="space-y-3"><h2 class="text-xl font-bold">{{ t('practice.vocabularyTitle') }}</h2><p class="text-ink-soft">{{ t('practice.vocabularyBody') }}</p><UiButton to="/learn-italian/vocabulary" variant="secondary"><UiIcon name="book" :size="18" />{{ t('practice.browseVocabulary') }}</UiButton></UiCard>
    </section>

    <section aria-labelledby="sc-h" class="mb-10 space-y-3">
      <h2 id="sc-h" class="text-xl font-bold">{{ t('practice.scenariosTitle') }}</h2>
      <UiErrorState v-if="scError" :message="isApiError(scError) ? scError.message : undefined" retry @retry="scRefresh()" />
      <ul v-else class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <li v-for="s in scenarios" :key="s.value">
          <UiCard as="article" class="space-y-1 !p-4"><h3 class="font-bold">{{ s.label }}</h3><p class="text-sm text-muted">{{ t('practice.scenarioCounts', { lessons: s.lessons, vocabulary: s.vocabulary, exercises: s.exercises }) }}</p>
            <p class="flex flex-wrap gap-2 pt-1"><NuxtLink v-if="s.exercises" :to="{ path: localePath('/learn-italian/practice'), query: { scenario: s.value } }" class="inline-flex min-h-touch items-center text-primary-strong underline underline-offset-4">{{ t('practice.exercisesLink') }}</NuxtLink><NuxtLink v-if="s.vocabulary" :to="{ path: localePath('/learn-italian/vocabulary'), query: { category: s.value } }" class="inline-flex min-h-touch items-center text-primary-strong underline underline-offset-4">{{ t('practice.vocabularyLink') }}</NuxtLink><NuxtLink v-if="s.lessons" :to="{ path: localePath('/learn-italian'), query: { scenario: s.value } }" class="inline-flex min-h-touch items-center text-primary-strong underline underline-offset-4">{{ t('practice.lessonsLink') }}</NuxtLink></p>
          </UiCard>
        </li>
      </ul>
    </section>

    <section aria-labelledby="ex-h" class="space-y-4">
      <h2 id="ex-h" class="text-xl font-bold">{{ t('practice.exercisesTitle') }}</h2>
      <div class="grid gap-4 rounded-lg border border-line bg-surface p-4 sm:grid-cols-3">
        <UiFormField :label="t('learn.level')"><UiSelect :model-value="level" :options="levelOptions" :placeholder="t('learn.allLevels')" @update:model-value="setQuery({ level: $event })" /></UiFormField>
        <UiFormField :label="t('practice.type')"><UiSelect :model-value="type" :options="typeOptions" :placeholder="t('learn.allTypes')" @update:model-value="setQuery({ type: $event })" /></UiFormField>
        <UiFormField :label="t('learn.scenario')"><UiSelect :model-value="scenario" :options="scenarioOptions" :placeholder="t('learn.allScenarios')" @update:model-value="setQuery({ scenario: $event })" /></UiFormField>
      </div>
      <ul v-if="status === 'pending' && !data" class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true"><li v-for="n in 6" :key="n"><UiCard><UiSkeleton :lines="3" /></UiCard></li></ul>
      <UiErrorState v-else-if="error" :message="isApiError(error) ? error.message : undefined" retry @retry="refresh()" />
      <UiEmptyState v-else-if="!exercises.length" :title="t('practice.emptyTitle')" :description="hasFilters ? t('guides.noResults') : t('practice.empty')" icon="book"><UiButton v-if="hasFilters" variant="secondary" @click="navigateTo({ path: route.path })">{{ t('guides.clear') }}</UiButton></UiEmptyState>
      <template v-else>
        <ul class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <li v-for="e in exercises" :key="e.slug">
            <UiCard as="article" class="relative flex h-full flex-col gap-3 hover:shadow-2">
              <div class="flex flex-wrap items-center gap-2"><UiBadge tone="primary">{{ e.level_label }}</UiBadge><UiBadge>{{ e.type_label }}</UiBadge><LearnReviewedNotice :item="e" compact /></div>
              <h3 class="text-lg font-bold"><NuxtLink :to="localePath(`/learn-italian/exercises/${e.slug}`)" class="after:absolute after:inset-0 after:content-['']"><UiAutoItalian :text="e.prompt ?? e.type_label" /></NuxtLink></h3>
              <p v-if="e.scenario_label" class="mt-auto text-sm text-muted">{{ e.scenario_label }}</p>
            </UiCard>
          </li>
        </ul>
        <UiPagination :page="em?.page ?? 1" :last-page="em?.last_page ?? 1" @change="setQuery({ page: $event })" />
      </template>
    </section>
  </div>
</template>
