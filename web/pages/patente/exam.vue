<script setup lang="ts">
import type { ExamRun, PatenteRules } from '~/types/api'

definePageMeta({ middleware: 'auth' })
const { t } = useI18n()
const { request } = useApi()
const localePath = useLocalePath()
useSeo(() => ({ title: t('patente.examTitle'), description: t('patente.mockNotice'), noindex: true }))

const rules = ref<PatenteRules | null>(null)
const starting = ref(false)
const problem = ref<{ code: string, message: string, available?: string, required?: string } | null>(null)
onMounted(async () => { try { rules.value = (await request<PatenteRules>('patente/rules')).data } catch { rules.value = null } })

async function start() {
  starting.value = true
  problem.value = null
  try {
    const res = await request<ExamRun>('patente/exams', { method: 'POST', body: { mode: 'exam' } })
    await navigateTo(localePath(`/patente/run/${res.data.id}`))
  } catch (e) {
    if (isApiError(e)) {
      const d = e.details as Record<string, string[]>
      problem.value = { code: e.code, message: e.message, available: d?.available?.[0], required: d?.required?.[0] }
    } else problem.value = { code: 'error', message: t('errors.generic') }
  } finally {
    starting.value = false
  }
}
</script>

<template>
  <div class="container-page max-w-2xl py-8 sm:py-12">
    <h1 class="mb-2 text-2xl font-bold sm:text-3xl">{{ t('patente.examTitle') }}</h1>
    <p class="mb-6 text-ink-soft">{{ t('patente.examIntro') }}</p>
    <PatenteDisclaimer class="mb-6" />
    <UiCard v-if="rules" class="mb-6"><dl class="grid grid-cols-3 gap-3 text-center">
      <div><dt class="text-sm text-muted">{{ t('patente.rules.questions') }}</dt><dd class="text-2xl font-bold tabular-nums">{{ rules.questions }}</dd></div>
      <div><dt class="text-sm text-muted">{{ t('patente.rules.maxErrors') }}</dt><dd class="text-2xl font-bold tabular-nums">{{ rules.max_errors }}</dd></div>
      <div><dt class="text-sm text-muted">{{ t('patente.rules.minutes') }}</dt><dd class="text-2xl font-bold tabular-nums">{{ rules.minutes }}</dd></div>
    </dl></UiCard>
    <UiAlert v-if="problem?.code === 'not_enough_questions'" tone="warning" :title="t('patente.notEnoughTitle')" class="mb-6" data-testid="not-enough">
      <p>{{ t('patente.notEnough') }}</p>
      <p v-if="problem.available && problem.required" class="mt-1 text-sm">{{ t('patente.notEnoughCount', { available: problem.available, required: problem.required }) }}</p>
      <UiButton to="/patente/practice" variant="secondary" class="mt-3">{{ t('patente.tryPractice') }}</UiButton>
    </UiAlert>
    <AuthVerifyNeeded v-else-if="problem?.code === 'email_not_verified'" class="mb-6" />
    <UiAlert v-else-if="problem" tone="danger" class="mb-6">{{ problem.message }}</UiAlert>
    <UiButton size="lg" :loading="starting" @click="start"><UiIcon name="clock" :size="20" />{{ t('patente.beginExam') }}</UiButton>
  </div>
</template>
