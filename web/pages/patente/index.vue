<script setup lang="ts">
import type { PatenteItem, PatenteProgress, PatenteTopic } from '~/types/api'

const { t, locale } = useI18n()
const localePath = useLocalePath()
const auth = useAuthStore()
const { request } = useApi()
useSeo(() => ({ title: t('patente.title'), description: t('patente.subtitle') }))

const { data, error, refresh, status } = await useAsyncData('patente-home', async () => {
  const [cats, topics] = await Promise.all([request<PatenteItem[]>('patente/categories'), request<PatenteTopic[]>('patente/topics')])
  let progress: PatenteProgress | null = null
  if (auth.isAuthenticated) {
    try { progress = (await request<PatenteProgress>('patente/progress')).data } catch { progress = null }
  }
  return { cats: cats.data, topics: topics.data, progress }
}, { watch: [locale] })
const acc = computed(() => new Map((data.value?.progress?.topics ?? []).map(x => [x.topic.slug, x])))
const weak = computed(() => (data.value?.progress?.topics ?? []).filter(x => x.weak))
</script>

<template>
  <div class="container-page py-8 sm:py-12">
    <header class="mb-6 max-w-2xl"><h1 class="text-2xl font-bold sm:text-3xl">{{ t('patente.title') }}</h1><p class="mt-1 text-ink-soft">{{ t('patente.subtitle') }}</p></header>
    <PatenteDisclaimer class="mb-6" />
    <div class="mb-8 flex flex-wrap gap-3">
      <UiButton to="/patente/exam"><UiIcon name="clock" :size="18" />{{ t('patente.startExam') }}</UiButton>
      <UiButton to="/patente/practice" variant="secondary"><UiIcon name="list" :size="18" />{{ t('patente.practice') }}</UiButton>
      <UiButton v-if="auth.isAuthenticated" to="/patente/weak" variant="secondary"><UiIcon name="alert" :size="18" />{{ t('patente.weakPage.title') }}</UiButton>
      <UiButton to="/patente/glossary" variant="ghost">{{ t('patente.glossary.title') }}</UiButton>
      <UiButton v-if="auth.isAuthenticated" to="/patente/history" variant="ghost">{{ t('patente.history') }}</UiButton>
    </div>

    <div v-if="status === 'pending' && !data" aria-busy="true"><UiSkeleton block :lines="4" /></div>
    <UiErrorState v-else-if="error || !data" :message="isApiError(error) ? error.message : undefined" retry @retry="refresh()" />
    <template v-else>
      <section v-if="data.progress" aria-labelledby="sum-h" class="mb-8 space-y-3">
        <h2 id="sum-h" class="text-xl font-bold">{{ t('patente.yourProgress') }}</h2>
        <dl class="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <UiCard v-for="k in (['exams_taken', 'exams_passed', 'practice_sessions'] as const)" :key="k" class="!p-4"><dt class="text-sm text-muted">{{ t(`patente.summary.${k}`) }}</dt><dd class="text-2xl font-bold tabular-nums">{{ data.progress.summary[k] }}</dd></UiCard>
          <UiCard class="!p-4"><dt class="text-sm text-muted">{{ t('patente.summary.average_errors') }}</dt><dd class="text-2xl font-bold tabular-nums">{{ data.progress.summary.average_errors ?? '–' }}</dd></UiCard>
        </dl>
        <UiAlert v-if="weak.length" tone="warning" :title="t('patente.weakTitle')"><ul class="list-disc ps-5"><li v-for="w in weak" :key="w.topic.slug"><NuxtLink :to="localePath(`/patente/topics/${w.topic.slug}`)" class="underline underline-offset-4">{{ w.topic.title }}</NuxtLink> ({{ w.accuracy }}%)</li></ul></UiAlert>
      </section>

      <section v-if="data.cats.length" aria-labelledby="cat-h" class="mb-8 space-y-3">
        <h2 id="cat-h" class="text-xl font-bold">{{ t('patente.categories') }}</h2>
        <ul class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"><li v-for="c in data.cats" :key="c.slug"><UiCard as="article" class="space-y-2 h-full"><div class="flex flex-wrap gap-2"><UiSourceBadge :type="c.source.type" /></div><h3 class="font-bold"><UiAutoItalian :text="c.title" /></h3><p v-if="c.summary" class="text-ink-soft">{{ c.summary }}</p><GuideFallbackNotice v-if="c.fallback" :locale="c.locale" /></UiCard></li></ul>
      </section>

      <section aria-labelledby="top-h" class="space-y-3">
        <h2 id="top-h" class="text-xl font-bold">{{ t('patente.topics') }}</h2>
        <UiEmptyState v-if="!data.topics.length" :title="t('patente.noTopicsTitle')" :description="t('patente.noTopics')" icon="car" />
        <ul v-else class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <li v-for="tp in data.topics" :key="tp.slug">
            <UiCard as="article" class="relative flex h-full flex-col gap-2 hover:shadow-2">
              <div class="flex flex-wrap gap-2"><UiSourceBadge :type="tp.source.type" /><UiBadge v-if="acc.get(tp.slug)?.weak" tone="warning"><UiIcon name="alert" :size="14" />{{ t('patente.weak') }}</UiBadge></div>
              <h3 class="text-lg font-bold"><NuxtLink :to="localePath(`/patente/topics/${tp.slug}`)" class="after:absolute after:inset-0 after:content-['']"><UiAutoItalian :text="tp.title" /></NuxtLink></h3>
              <p v-if="tp.summary" class="line-clamp-3 text-ink-soft">{{ tp.summary }}</p>
              <div class="mt-auto space-y-1 pt-2 text-sm text-muted">
                <p>{{ t('patente.questionCount', { count: tp.question_count }) }}</p>
                <p v-if="acc.get(tp.slug)?.accuracy != null">{{ t('patente.accuracy', { value: acc.get(tp.slug)!.accuracy! }) }}</p>
                <p v-if="tp.source.freshness !== 'fresh'" class="font-medium" :class="tp.source.freshness === 'stale' ? 'text-warning' : 'text-danger'">{{ t(`freshness.state.${tp.source.freshness}`) }}</p>
              </div>
            </UiCard>
          </li>
        </ul>
      </section>
    </template>
  </div>
</template>
