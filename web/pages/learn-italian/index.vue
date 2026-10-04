<script setup lang="ts">
import type { DailyPlan, ItalianMeta, ItalianProgress, LessonSummary } from '~/types/api'

const { t, locale } = useI18n()
const route = useRoute()
const localePath = useLocalePath()
const auth = useAuthStore()
const { request } = useApi()
useSeo(() => ({ title: t('learn.title'), description: t('learn.subtitle') }))

const level = computed(() => (typeof route.query.level === 'string' ? route.query.level : ''))
const type = computed(() => (typeof route.query.type === 'string' ? route.query.type : ''))
const scenario = computed(() => (typeof route.query.scenario === 'string' ? route.query.scenario : ''))
const page = computed(() => Math.max(1, Number(route.query.page) || 1))
const LEVELS = ['a0', 'a1', 'a2', 'b1', 'b2', 'c1']

const { data: meta } = await useAsyncData('italian-meta', async () => (await request<ItalianMeta>('italian/meta')).data, { watch: [locale] })
const { data: mine, error: mineError, refresh: refreshMine } = await useAsyncData('italian-mine', async () => {
  if (!auth.isAuthenticated) return null
  const [daily, progress] = await Promise.all([request<DailyPlan>('italian/daily'), request<ItalianProgress>('italian/progress')])
  return { daily: daily.data, progress: progress.data }
}, { watch: [locale] })
const { data, error, refresh, status } = await useAsyncData('italian-lessons', () => request<LessonSummary[]>('italian/lessons', {
  query: { level: level.value, type: type.value, scenario: scenario.value, page: page.value, per_page: 12 },
}), { watch: [level, type, scenario, page, locale] })
const lessons = computed(() => data.value?.data ?? [])
const lm = computed(() => data.value?.meta)

function setQuery(patch: Record<string, string | number>) {
  const merged: Record<string, unknown> = { level: level.value, type: type.value, scenario: scenario.value, ...patch }
  const next: Record<string, string> = {}
  for (const [k, v] of Object.entries(merged)) if (v !== '' && v !== undefined) next[k] = String(v)
  if (!('page' in patch)) delete next.page
  return navigateTo({ path: route.path, query: next })
}
const levelOptions = computed(() => LEVELS.map(l => ({ value: l, label: t(`learn.levels.${l}`) })))
const typeOptions = computed(() => (meta.value?.types ?? []).map(o => ({ value: o.value, label: o.label })))
const scenarioOptions = computed(() => (meta.value?.scenarios ?? []).map(o => ({ value: o.value, label: o.label })))
const hasFilters = computed(() => !!(level.value || type.value || scenario.value))
const typeIcon = (tp: string) => ({ vocabulary: 'book', grammar: 'list', conversation: 'sparkle', pronunciation: 'volume', mission: 'check-circle' } as Record<string, string>)[tp] ?? 'book'
</script>

<template>
  <div class="container-page py-8 sm:py-12">
    <header class="mb-8 max-w-2xl">
      <h1 class="text-2xl font-bold sm:text-3xl">{{ t('learn.title') }}</h1>
      <p class="mt-1 text-ink-soft">{{ t('learn.subtitle') }}</p>
    </header>

    <section v-if="auth.isAuthenticated" aria-labelledby="daily-h" class="mb-10 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
      <UiErrorState v-if="mineError || !mine" :message="isApiError(mineError) ? mineError.message : undefined" retry @retry="refreshMine()" class="lg:col-span-2" />
      <template v-else>
        <UiCard class="min-w-0 space-y-4">
          <div class="flex flex-wrap items-center justify-between gap-3">
            <h2 id="daily-h" class="text-xl font-bold">{{ t('learn.dailyTitle') }}</h2>
            <p class="flex flex-wrap items-center gap-2 text-sm">
              <UiBadge tone="accent"><UiIcon name="flame" :size="14" />{{ t('learn.streak', { count: mine.daily.streak }) }}</UiBadge>
              <UiBadge><UiIcon name="clock" :size="14" />{{ t('learn.minutes', { count: mine.daily.minutes }) }}</UiBadge>
              <UiBadge tone="primary">{{ mine.daily.level_label }}</UiBadge>
            </p>
          </div>
          <UiProgressBar :value="mine.daily.total ? Math.round(mine.daily.done_today / mine.daily.total * 100) : 0" :label="t('learn.doneToday', { done: mine.daily.done_today, total: mine.daily.total })" show-value />
          <ol class="divide-y divide-line">
            <li v-for="s in mine.daily.slots" :key="s.slot" class="flex flex-wrap items-center justify-between gap-3 py-3">
              <div class="flex min-w-0 items-center gap-3">
                <span class="grid size-10 shrink-0 place-items-center rounded-full" :class="s.done_today ? 'bg-success-soft text-success' : 'bg-primary-soft text-primary-strong'"><UiIcon :name="s.done_today ? 'check' : typeIcon(s.type)" :size="20" /></span>
                <div class="min-w-0">
                  <p class="text-sm text-muted">{{ s.type_label }}</p>
                  <p v-if="s.lesson" class="truncate font-medium"><UiAutoItalian :text="s.lesson.title" /></p>
                  <p v-else class="text-muted">{{ t('learn.noLessonSlot') }}</p>
                </div>
              </div>
              <div v-if="s.lesson" class="flex shrink-0 items-center gap-2">
                <span class="hidden text-sm text-muted sm:inline">{{ t('learn.minutes', { count: s.lesson.duration_minutes }) }}</span>
                <UiBadge v-if="s.done_today" tone="success">{{ t('learn.done') }}</UiBadge>
                <UiButton :to="`/learn-italian/lessons/${s.lesson.slug}`" :variant="s.done_today ? 'secondary' : 'primary'">{{ s.done_today ? t('learn.review') : t('learn.start') }}</UiButton>
              </div>
            </li>
          </ol>
        </UiCard>
        <UiCard as="section" aria-labelledby="prog-h" class="min-w-0 space-y-4">
          <h2 id="prog-h" class="text-xl font-bold">{{ t('learn.progressTitle') }}</h2>
          <ul class="space-y-3">
            <li v-for="l in mine.progress.levels.filter(x => x.total > 0)" :key="l.level"><UiProgressBar :value="l.percent" :label="`${l.label} · ${l.completed}/${l.total}`" show-value /></li>
          </ul>
          <p v-if="!mine.progress.levels.some(x => x.total > 0)" class="text-muted">{{ t('learn.noLessonsYet') }}</p>
        </UiCard>
      </template>
    </section>
    <UiAlert v-else tone="info" class="mb-8"><p>{{ t('learn.loginForDaily') }}</p><UiButton to="/login" variant="secondary" class="mt-3">{{ t('auth.login') }}</UiButton></UiAlert>

    <section aria-labelledby="browse-h" class="space-y-5">
      <h2 id="browse-h" class="text-xl font-bold">{{ t('learn.browse') }}</h2>
      <div class="grid gap-4 rounded-lg border border-line bg-surface p-4 sm:grid-cols-3">
        <UiFormField :label="t('learn.level')"><UiSelect :model-value="level" :options="levelOptions" :placeholder="t('learn.allLevels')" @update:model-value="setQuery({ level: $event })" /></UiFormField>
        <UiFormField :label="t('learn.type')"><UiSelect :model-value="type" :options="typeOptions" :placeholder="t('learn.allTypes')" @update:model-value="setQuery({ type: $event })" /></UiFormField>
        <UiFormField :label="t('learn.scenario')"><UiSelect :model-value="scenario" :options="scenarioOptions" :placeholder="t('learn.allScenarios')" @update:model-value="setQuery({ scenario: $event })" /></UiFormField>
      </div>
      <div aria-live="polite" class="sr-only">{{ lm ? t('guides.resultsCount', { count: lm.total ?? lessons.length }) : '' }}</div>
      <ul v-if="status === 'pending' && !data" class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true"><li v-for="n in 6" :key="n"><UiCard><UiSkeleton :lines="3" /></UiCard></li></ul>
      <UiErrorState v-else-if="error" :message="isApiError(error) ? error.message : undefined" retry @retry="refresh()" />
      <UiEmptyState v-else-if="!lessons.length" :title="t('learn.emptyTitle')" :description="hasFilters ? t('guides.noResults') : t('learn.empty')" icon="book">
        <UiButton v-if="hasFilters" variant="secondary" @click="navigateTo({ path: route.path })">{{ t('guides.clear') }}</UiButton>
      </UiEmptyState>
      <template v-else>
        <ul class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <li v-for="l in lessons" :key="l.id">
            <UiCard as="article" class="relative flex h-full flex-col gap-3 transition-shadow focus-within:shadow-3 hover:shadow-2">
              <div class="flex flex-wrap items-center gap-2"><UiBadge tone="primary">{{ l.level_label }}</UiBadge><UiBadge>{{ l.type_label }}</UiBadge><UiBadge v-if="l.progress?.status === 'completed'" tone="success"><UiIcon name="check" :size="14" />{{ t('learn.done') }}</UiBadge></div>
              <h3 class="text-lg font-bold"><NuxtLink :to="localePath(`/learn-italian/lessons/${l.slug}`)" class="after:absolute after:inset-0 after:content-['']"><UiAutoItalian :text="l.title" /></NuxtLink></h3>
              <p v-if="l.summary" class="line-clamp-3 text-ink-soft">{{ l.summary }}</p>
              <p class="mt-auto flex items-center gap-1.5 text-sm text-muted"><UiIcon name="clock" :size="16" />{{ t('learn.minutes', { count: l.duration_minutes }) }}<template v-if="l.scenario_label"> · {{ l.scenario_label }}</template></p>
            </UiCard>
          </li>
        </ul>
        <UiPagination :page="lm?.page ?? 1" :last-page="lm?.last_page ?? 1" @change="setQuery({ page: $event })" />
      </template>
    </section>
  </div>
</template>
