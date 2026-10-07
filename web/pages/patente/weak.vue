<script setup lang="ts">
import type { WeakTopicRow, WeakTopics } from '~/types/extra'

definePageMeta({ middleware: 'auth' })
const { t, locale } = useI18n()
const { request } = useApi()
const localePath = useLocalePath()
useSeo(() => ({ title: t('patente.weakPage.title'), description: t('patente.weakPage.subtitle'), noindex: true }))
const { data, error, refresh, status } = await useAsyncData('patente-weak', async () => (await request<WeakTopics>('patente/weak-topics')).data, { watch: [locale] })
const practice = usePracticeStart()
const size = 15
const hasContent = computed(() => !!data.value && (data.value.weak.length > 0 || data.value.untouched.length > 0))
const crumbs = computed(() => [{ label: t('patente.title'), to: '/patente' }, { label: t('patente.weakPage.title') }])
const row = (r: WeakTopicRow) => ({ ...r, acc: r.accuracy === null ? null : `${r.accuracy}%` })
</script>

<template>
  <div class="container-page max-w-3xl py-8 sm:py-12">
    <UiBreadcrumbs :items="crumbs" class="mb-6" />
    <h1 class="mb-2 text-2xl font-bold sm:text-3xl">{{ t('patente.weakPage.title') }}</h1>
    <p class="mb-6 text-ink-soft">{{ t('patente.weakPage.subtitle') }}</p>
    <PatenteDisclaimer class="mb-6" />
    <div v-if="status === 'pending' && !data" aria-busy="true"><UiSkeleton block :lines="5" /></div>
    <UiErrorState v-else-if="error || !data" :message="isApiError(error) ? error.message : undefined" retry @retry="refresh()" />
    <UiEmptyState v-else-if="!hasContent" :title="t('patente.weakPage.noContentTitle')" :description="t('patente.weakPage.noContent')" icon="car"><UiButton to="/patente" variant="secondary">{{ t('patente.title') }}</UiButton></UiEmptyState>
    <div v-else class="space-y-8">
      <AuthVerifyNeeded v-if="practice.needsVerify.value" />
      <UiAlert v-if="practice.problem.value" tone="warning" data-testid="practice-problem">{{ practice.problem.value }}</UiAlert>
      <section aria-labelledby="wk-h" class="space-y-3">
        <h2 id="wk-h" class="text-xl font-bold">{{ t('patente.weakPage.weak') }}</h2>
        <p class="text-sm text-muted">{{ t('patente.weakPage.rule', { threshold: data.threshold, min: data.min_answers }) }}</p>
        <p v-if="!data.weak.length" class="rounded-md border border-line bg-sunken p-3" data-testid="no-weak">{{ t('patente.weakPage.noWeak') }}</p>
        <template v-else>
          <ul class="divide-y divide-line rounded-md border border-line bg-surface">
            <li v-for="w in data.weak.map(row)" :key="w.topic.slug" class="flex flex-wrap items-center justify-between gap-3 p-3">
              <div class="min-w-0"><NuxtLink :to="localePath(`/patente/topics/${w.topic.slug}`)" class="font-semibold text-primary-strong underline underline-offset-4"><UiAutoItalian :text="w.topic.title" /></NuxtLink><p class="text-sm text-muted">{{ t('patente.weakPage.stats', { correct: w.correct, answered: w.answered }) }}<template v-if="w.acc"> · <bdi>{{ w.acc }}</bdi></template></p></div>
              <UiButton variant="secondary" :loading="practice.starting.value === w.topic.slug" :disabled="!w.available_questions" @click="practice.start(`patente/topics/${encodeURIComponent(w.topic.slug)}/practice`, w.topic.slug, { size })">{{ t('patente.practiceThis') }}</UiButton>
            </li>
          </ul>
          <UiButton size="lg" :loading="practice.starting.value === '__weak'" @click="practice.start('patente/practice/weak', '__weak', { size })"><UiIcon name="list" :size="18" />{{ t('patente.weakPage.startWeak') }}</UiButton>
        </template>
      </section>
      <section v-if="data.untouched.length" aria-labelledby="un-h" class="space-y-3">
        <h2 id="un-h" class="text-xl font-bold">{{ t('patente.weakPage.untouched') }}</h2>
        <ul class="divide-y divide-line rounded-md border border-line bg-surface">
          <li v-for="w in data.untouched" :key="w.topic.slug" class="flex flex-wrap items-center justify-between gap-3 p-3">
            <div class="min-w-0"><NuxtLink :to="localePath(`/patente/topics/${w.topic.slug}`)" class="font-semibold text-primary-strong underline underline-offset-4"><UiAutoItalian :text="w.topic.title" /></NuxtLink><p class="text-sm text-muted">{{ t('patente.questionCount', { count: w.available_questions }) }}</p></div>
            <UiBadge v-if="data.recommended === w.topic.slug" tone="info">{{ t('patente.weakPage.recommended') }}</UiBadge>
            <UiButton variant="secondary" :loading="practice.starting.value === w.topic.slug" @click="practice.start(`patente/topics/${encodeURIComponent(w.topic.slug)}/practice`, w.topic.slug, { size })">{{ t('patente.practiceThis') }}</UiButton>
          </li>
        </ul>
      </section>
    </div>
  </div>
</template>
