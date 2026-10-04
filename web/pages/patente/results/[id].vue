<script setup lang="ts">
import type { ExamResult } from '~/types/api'

definePageMeta({ middleware: 'auth' })
const { t } = useI18n()
const route = useRoute()
const { request } = useApi()
const id = computed(() => String(route.params.id))
useSeo(() => ({ title: t('patente.resultTitle'), description: t('patente.mockNotice'), noindex: true }))

// Browser-only fetch: review content (answers, explanations) is never SSR-rendered or cached.
const r = ref<ExamResult | null>(null)
const error = ref<string | null>(null)
const loading = ref(true)
const onlyWrong = ref(false)
onMounted(async () => {
  try {
    const res = await request<ExamResult | { finished: false }>(`patente/exams/${encodeURIComponent(id.value)}`)
    if (!res.data.finished) error.value = t('patente.notFinished')
    else r.value = res.data as ExamResult
  } catch (e) {
    error.value = isApiError(e) ? e.message : t('errors.generic')
  } finally {
    loading.value = false
  }
})
const verdict = computed(() => {
  if (!r.value || r.value.mode !== 'exam') return null
  if (r.value.timed_out) return { tone: 'warning' as const, text: t('patente.timedOut'), icon: 'clock' }
  return r.value.passed ? { tone: 'success' as const, text: t('patente.passedMock'), icon: 'check-circle' } : { tone: 'danger' as const, text: t('patente.failedMock'), icon: 'x-circle' }
})
const rows = computed(() => (r.value?.review ?? []).filter(x => !onlyWrong.value || !x.correct))
const answerText = (v: boolean | null) => (v === null ? t('patente.noAnswer') : v ? t('patente.true') : t('patente.false'))
</script>

<template>
  <div class="container-page max-w-3xl py-8 sm:py-12">
    <div v-if="loading" aria-busy="true"><UiSkeleton block :lines="4" /></div>
    <UiErrorState v-else-if="error || !r" :message="error ?? undefined" />
    <div v-else class="space-y-6">
      <header class="space-y-3">
        <UiBadge tone="warning">{{ t('patente.simulation') }}</UiBadge>
        <h1 class="text-2xl font-bold sm:text-3xl">{{ r.mode === 'exam' ? t('patente.resultTitle') : t('patente.practiceResultTitle') }}</h1>
        <UiAlert v-if="verdict" :tone="verdict.tone" :title="verdict.text" data-testid="verdict"><p>{{ t('patente.verdictNote') }}</p></UiAlert>
        <dl class="grid grid-cols-3 gap-3 text-center">
          <UiCard class="!p-4"><dt class="text-sm text-muted">{{ t('patente.correct') }}</dt><dd class="text-2xl font-bold tabular-nums text-success">{{ r.correct }}</dd></UiCard>
          <UiCard class="!p-4"><dt class="text-sm text-muted">{{ t('patente.errors') }}</dt><dd class="text-2xl font-bold tabular-nums text-danger">{{ r.errors }}</dd></UiCard>
          <UiCard class="!p-4"><dt class="text-sm text-muted">{{ r.max_errors !== null ? t('patente.maxErrors') : t('patente.total') }}</dt><dd class="text-2xl font-bold tabular-nums">{{ r.max_errors ?? r.total }}</dd></UiCard>
        </dl>
      </header>
      <UiCheckbox v-model="onlyWrong" :label="t('patente.onlyWrong')" />
      <ol class="space-y-4">
        <li v-for="(x, i) in rows" :key="x.question_id"><UiCard as="article" class="space-y-3" :data-correct="x.correct ? 'true' : 'false'">
          <p class="flex flex-wrap items-center gap-2"><UiBadge :tone="x.correct ? 'success' : 'danger'"><UiIcon :name="x.correct ? 'check' : 'x'" :size="14" />{{ x.correct ? t('patente.correctBadge') : t('patente.incorrectBadge') }}</UiBadge></p>
          <p v-if="x.statement_it" class="text-lg font-semibold" lang="it" dir="ltr">{{ x.statement_it }}</p>
          <p v-if="x.statement && x.statement !== x.statement_it" class="text-ink-soft">{{ x.statement }}</p>
          <p class="text-sm"><span class="font-semibold">{{ t('patente.yourAnswer') }}:</span> {{ answerText(x.your_answer) }} · <span class="font-semibold">{{ t('patente.correctAnswer') }}:</span> {{ answerText(x.correct_answer) }}</p>
          <p v-if="x.explanation" class="prose-plain rounded-md bg-sunken p-3 text-sm"><span class="font-semibold">{{ t('patente.explanation') }}:</span> {{ x.explanation }}</p>
        </UiCard></li>
      </ol>
      <div class="flex flex-wrap gap-3"><UiButton to="/patente/exam">{{ t('patente.tryAgain') }}</UiButton><UiButton to="/patente/practice" variant="secondary">{{ t('patente.practice') }}</UiButton><UiButton to="/patente/history" variant="ghost">{{ t('patente.history') }}</UiButton></div>
    </div>
  </div>
</template>
