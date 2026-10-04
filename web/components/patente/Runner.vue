<script setup lang="ts">
import type { ExamResult, ExamRun } from '~/types/api'
import { createExamClock, formatClock } from '~/utils/exam'

/**
 * Mock exam / practice runner. Answers live only in memory; the server grades once. The countdown comes from the
 * server's `deadline_at`; at zero the answers given so far are submitted automatically (exactly once).
 */
const props = defineProps<{ exam: ExamRun }>()
const emit = defineEmits<{ finished: [result: ExamResult] }>()
const { t } = useI18n()
const { request } = useApi()

const answers = reactive<Record<number, boolean | null>>({})
const index = ref(0)
const submitting = ref(false)
const submitError = ref<string | null>(null)
const confirming = ref(false)
const remaining = ref<number | null>(null)
const announce = ref('')
const timedOut = ref(false)
const qs = computed(() => props.exam.questions)
const q = computed(() => qs.value[index.value])
const answered = computed(() => qs.value.filter(x => answers[x.id] === true || answers[x.id] === false).length)
const unanswered = computed(() => qs.value.length - answered.value)
const isExam = computed(() => props.exam.mode === 'exam')
const sameText = computed(() => !!q.value && (!q.value.statement_it || q.value.statement_it === q.value.statement))

let clock: ReturnType<typeof createExamClock> | null = null
let finished = false

async function submit(auto = false) {
  if (finished || submitting.value) return
  submitting.value = true
  submitError.value = null
  confirming.value = false
  try {
    const body = { answers: qs.value.map(x => ({ question_id: x.id, answer: answers[x.id] ?? null })) }
    const res = await request<ExamResult>(`patente/exams/${props.exam.id}/answers`, { method: 'POST', body, timeoutMs: 30000 })
    finished = true
    clock?.stop()
    emit('finished', res.data)
  } catch (e) {
    if (isApiError(e) && e.code === 'exam_already_finished') { finished = true; clock?.stop(); emit('finished', undefined as unknown as ExamResult); return }
    submitError.value = isApiError(e) ? e.message : t('errors.generic')
    if (auto) timedOut.value = true
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  if (!props.exam.deadline_at) return
  clock = createExamClock(props.exam.deadline_at, {
    onTick: (r) => { remaining.value = r },
    onAnnounce: (s) => { announce.value = s >= 60 ? t('patente.timeLeftMinutes', { count: Math.round(s / 60) }) : t('patente.timeLeftSeconds', { count: s }) },
    onExpire: () => { timedOut.value = true; announce.value = t('patente.timeUp'); void submit(true) },
  })
  clock.start()
})
onBeforeUnmount(() => clock?.stop())

const lowTime = computed(() => remaining.value !== null && remaining.value <= 60)
function pick(v: boolean) { if (q.value) answers[q.value.id] = v }
function go(i: number) { index.value = Math.max(0, Math.min(qs.value.length - 1, i)) }
function onKey(e: KeyboardEvent) {
  if (e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLInputElement) return
  if (e.key === 'ArrowRight') go(index.value + (document.dir === 'rtl' ? -1 : 1))
  if (e.key === 'ArrowLeft') go(index.value + (document.dir === 'rtl' ? 1 : -1))
}
</script>

<template>
  <div class="space-y-5" @keydown="onKey">
    <div class="sticky top-16 z-30 -mx-4 flex flex-wrap items-center justify-between gap-3 border-b border-line bg-surface/95 px-4 py-3 backdrop-blur sm:mx-0 sm:rounded-lg sm:border">
      <p class="font-semibold">{{ t('patente.questionOf', { n: index + 1, total: qs.length }) }} · <span class="text-ink-soft">{{ t('patente.answeredCount', { count: answered }) }}</span></p>
      <p v-if="isExam && remaining !== null" role="timer" class="flex items-center gap-2 rounded-full px-3 py-1 text-lg font-bold tabular-nums" :class="lowTime ? 'bg-danger-soft text-danger' : 'bg-primary-soft text-primary-strong'" :aria-label="t('patente.timeLeftLabel')" data-testid="exam-clock" dir="ltr"><UiIcon name="clock" :size="18" />{{ formatClock(remaining) }}</p>
      <p v-else-if="!isExam" class="text-sm text-muted">{{ t('patente.noTimeLimit') }}</p>
    </div>
    <p class="sr-only" role="status" aria-live="polite" data-testid="exam-announce">{{ announce }}</p>

    <UiAlert v-if="timedOut && !submitError" tone="warning">{{ t('patente.timeUp') }}</UiAlert>
    <UiAlert v-if="submitError" tone="danger" :title="t('patente.submitFailed')" data-testid="submit-error"><p>{{ submitError }}</p><UiButton variant="secondary" class="mt-3" :loading="submitting" @click="submit(timedOut)">{{ t('common.retry') }}</UiButton></UiAlert>

    <UiCard v-if="q" as="section" :aria-label="t('patente.questionOf', { n: index + 1, total: qs.length })" class="space-y-5">
      <div class="space-y-3">
        <p v-if="q.statement_it" class="text-xl font-semibold leading-snug" lang="it" dir="ltr" data-testid="statement-it">{{ q.statement_it }}</p>
        <p v-if="!sameText" class="rounded-md bg-sunken p-3 text-lg text-ink-soft" :lang="q.locale" data-testid="statement-local"><span class="block text-xs font-bold text-muted">{{ t('patente.translation') }}</span>{{ q.statement }}</p>
        <p v-else-if="!q.statement_it" class="text-xl font-semibold">{{ q.statement }}</p>
      </div>
      <div role="radiogroup" :aria-label="t('patente.yourAnswer')" class="grid grid-cols-2 gap-3">
        <button v-for="opt in [true, false]" :key="String(opt)" type="button" role="radio" :aria-checked="answers[q.id] === opt" class="inline-flex min-h-[56px] items-center justify-center gap-2 rounded-md border-2 text-lg font-bold transition-colors" :class="answers[q.id] === opt ? 'border-primary bg-primary text-on-primary' : 'border-line-strong bg-surface text-ink hover:bg-sunken'" @click="pick(opt)">
          <UiIcon :name="opt ? 'check' : 'x'" :size="20" />{{ opt ? t('patente.true') : t('patente.false') }}
        </button>
      </div>
      <div class="flex justify-between gap-3">
        <UiButton variant="secondary" :disabled="index === 0" @click="go(index - 1)"><UiIcon name="chevron-start" :size="18" />{{ t('common.previous') }}</UiButton>
        <UiButton v-if="index < qs.length - 1" @click="go(index + 1)">{{ t('common.next') }}<UiIcon name="chevron-end" :size="18" /></UiButton>
        <UiButton v-else variant="accent" :loading="submitting" @click="confirming = true">{{ t('patente.finish') }}</UiButton>
      </div>
    </UiCard>

    <nav :aria-label="t('patente.navigator')">
      <ol class="grid grid-cols-6 gap-2 sm:grid-cols-10">
        <li v-for="(x, i) in qs" :key="x.id"><button type="button" class="min-h-touch w-full rounded-md border text-sm font-semibold tabular-nums" :class="[i === index ? 'ring-2 ring-primary' : '', answers[x.id] === true || answers[x.id] === false ? 'border-primary bg-primary-soft text-primary-strong' : 'border-line-strong bg-surface']" :aria-current="i === index ? 'step' : undefined" :aria-label="`${t('patente.goToQuestion', { n: i + 1 })}${answers[x.id] === true || answers[x.id] === false ? ` (${t('patente.answered')})` : ''}`" @click="go(i)">{{ i + 1 }}</button></li>
      </ol>
    </nav>

    <UiCard v-if="confirming" role="alertdialog" :aria-label="t('patente.finishConfirmTitle')" class="space-y-3">
      <p class="font-semibold">{{ t('patente.finishConfirmTitle') }}</p>
      <p v-if="unanswered" class="text-warning">{{ t('patente.unansweredWarning', { count: unanswered }) }}</p>
      <p class="text-ink-soft">{{ t('patente.finishConfirmBody') }}</p>
      <div class="flex flex-wrap gap-2"><UiButton variant="secondary" @click="confirming = false">{{ t('patente.keepGoing') }}</UiButton><UiButton :loading="submitting" @click="submit()">{{ t('patente.submitNow') }}</UiButton></div>
    </UiCard>
    <div v-else class="flex justify-end"><UiButton variant="ghost" :loading="submitting" @click="confirming = true">{{ t('patente.finish') }}</UiButton></div>
  </div>
</template>
