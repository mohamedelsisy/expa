<script setup lang="ts">
import type { ExamSummary } from '~/types/api'
import { formatDateTime } from '~/utils/locale'

definePageMeta({ middleware: 'auth' })
const { t, locale } = useI18n()
const route = useRoute()
const { request } = useApi()
const localePath = useLocalePath()
useSeo(() => ({ title: t('patente.history'), description: t('patente.mockNotice'), noindex: true }))
const page = computed(() => Math.max(1, Number(route.query.page) || 1))
const { data, error, refresh, status } = await useAsyncData('patente-history', () => request<ExamSummary[]>('patente/exams', { query: { page: page.value } }), { watch: [page] })
const rows = computed(() => data.value?.data ?? [])
</script>

<template>
  <div class="container-page max-w-3xl py-8 sm:py-12">
    <h1 class="mb-6 text-2xl font-bold sm:text-3xl">{{ t('patente.history') }}</h1>
    <ul v-if="status === 'pending' && !data" aria-busy="true"><li><UiSkeleton block /></li></ul>
    <UiErrorState v-else-if="error" :message="isApiError(error) ? error.message : undefined" retry @retry="refresh()" />
    <UiEmptyState v-else-if="!rows.length" :title="t('patente.historyEmptyTitle')" :description="t('patente.historyEmpty')" icon="clock"><UiButton to="/patente/exam">{{ t('patente.startExam') }}</UiButton></UiEmptyState>
    <template v-else>
      <ul class="space-y-3">
        <li v-for="e in rows" :key="e.id"><UiCard as="article" class="relative flex flex-wrap items-center justify-between gap-3 hover:shadow-2">
          <div class="space-y-1">
            <p class="flex flex-wrap items-center gap-2"><UiBadge tone="warning">{{ t('patente.simulation') }}</UiBadge><UiBadge>{{ e.mode === 'exam' ? t('patente.modeExam') : t('patente.modePractice') }}</UiBadge>
              <UiBadge v-if="e.mode === 'exam'" :tone="e.timed_out ? 'warning' : e.passed ? 'success' : 'danger'">{{ e.timed_out ? t('patente.timedOutShort') : e.passed ? t('patente.passedShort') : t('patente.failedShort') }}</UiBadge></p>
            <p class="text-sm text-ink-soft">{{ t('patente.scoreLine', { correct: e.correct, errors: e.errors, total: e.total }) }} · {{ formatDateTime(e.finished_at, locale) }}</p>
          </div>
          <NuxtLink :to="localePath(`/patente/results/${e.id}`)" class="inline-flex min-h-touch items-center font-medium text-primary-strong underline underline-offset-4 after:absolute after:inset-0 after:content-['']">{{ t('patente.review') }}</NuxtLink>
        </UiCard></li>
      </ul>
      <div class="mt-8"><UiPagination :page="data?.meta.page ?? 1" :last-page="data?.meta.last_page ?? 1" @change="navigateTo({ path: route.path, query: { page: $event } })" /></div>
    </template>
  </div>
</template>
