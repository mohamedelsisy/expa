<script setup lang="ts">
import type { AttemptResult, Exercise } from '~/types/extra'
import { buildMatchAnswer, correctAnswerText, splitSentence, type AnswerValue } from '~/utils/practice'

const { t, locale } = useI18n()
const route = useRoute()
const auth = useAuthStore()
const { request } = useApi()
const slug = computed(() => String(route.params.slug))
const { data: ex, error, refresh, status } = await useAsyncData(() => `exercise-${slug.value}`, async () => (await request<Exercise>(`italian/exercises/${encodeURIComponent(slug.value)}`)).data, { watch: [locale] })
if (isApiError(error.value) && error.value.status === 404) throw createError({ statusCode: 404, statusMessage: 'Not Found', fatal: true })
useSeo(() => ({ title: ex.value?.prompt ? `${ex.value.prompt} | EXPA` : t('practice.title'), description: t('practice.seo.description'), noindex: true }))
const crumbs = computed(() => [{ label: t('learn.title'), to: '/learn-italian' }, { label: t('practice.title'), to: '/learn-italian/practice' }, { label: ex.value?.type_label ?? '' }])

const choice = ref<number | null>(null)
const text = ref('')
const picks = ref<(number | null)[]>([])
watch(ex, (e) => { picks.value = (e?.form.left ?? []).map(() => null) }, { immediate: true })
const result = ref<AttemptResult | null>(null)
const submitting = ref(false)
const problem = ref<string | null>(null)
const needVerify = ref(false)
const sentence = computed(() => (ex.value?.form.sentence ? splitSentence(ex.value.form.sentence) : null))
const rightOptions = computed(() => (ex.value?.form.right ?? []).map(r => ({ value: String(r.id), label: r.text })))

function answerValue(): AnswerValue | null {
  const e = ex.value
  if (!e) return null
  if (e.type === 'multiple_choice' || e.type === 'listening') return choice.value
  if (e.type === 'fill_blank') return text.value.trim() || null
  return buildMatchAnswer(picks.value)
}
async function submit() {
  problem.value = null
  needVerify.value = false
  const a = answerValue()
  if (a === null) { problem.value = t(ex.value?.type === 'match' ? 'practice.errors.matchIncomplete' : 'practice.errors.noAnswer'); return }
  submitting.value = true
  try {
    result.value = (await request<AttemptResult>(`italian/exercises/${encodeURIComponent(slug.value)}/attempt`, { method: 'POST', body: { answer: a } })).data
  } catch (e) {
    if (isApiError(e) && e.code === 'email_not_verified') needVerify.value = true
    else problem.value = isApiError(e) ? e.message : t('errors.generic')
  } finally { submitting.value = false }
}
function retry() { result.value = null; choice.value = null; text.value = ''; picks.value = (ex.value?.form.left ?? []).map(() => null) }
const correctText = computed(() => (ex.value && result.value ? correctAnswerText(ex.value, result.value.correct_answer) : null))
const loginTo = computed(() => `/login?redirect=${encodeURIComponent(route.fullPath)}`)
</script>

<template>
  <div class="container-page max-w-2xl py-8 sm:py-12">
    <UiBreadcrumbs :items="crumbs" class="mb-6" />
    <h1 v-if="!ex" class="sr-only">{{ t('practice.title') }}</h1>
    <div v-if="status === 'pending' && !ex" aria-busy="true"><UiSkeleton block :lines="5" /></div>
    <UiErrorState v-else-if="error || !ex" :message="isApiError(error) ? error.message : undefined" retry @retry="refresh()" />
    <div v-else class="space-y-5">
      <header class="space-y-2">
        <div class="flex flex-wrap items-center gap-2"><UiBadge tone="primary">{{ ex.level_label }}</UiBadge><UiBadge>{{ ex.type_label }}</UiBadge><UiBadge v-if="ex.scenario_label">{{ ex.scenario_label }}</UiBadge></div>
        <h1 class="text-2xl font-bold sm:text-3xl"><UiAutoItalian :text="ex.prompt ?? ex.type_label" /></h1>
      </header>
      <LearnReviewedNotice :item="ex" />
      <UiAlert v-if="!auth.isAuthenticated" tone="info"><p>{{ t('practice.loginForExercise') }}</p><UiButton :to="loginTo" variant="secondary" class="mt-2">{{ t('auth.login') }}</UiButton></UiAlert>

      <form v-else-if="!result" class="space-y-5" novalidate @submit.prevent="submit">
        <AuthVerifyNeeded v-if="needVerify" />
        <template v-if="ex.type === 'multiple_choice' || ex.type === 'listening'">
          <p v-if="ex.type === 'listening'" class="flex items-center gap-2"><LearnListenButton v-if="ex.form.stem ?? ex.prompt" :text="(ex.form.stem ?? ex.prompt)!" /><span class="text-sm text-muted">{{ t('practice.listeningNote') }}</span></p>
          <fieldset class="space-y-2">
            <legend class="mb-1 text-lg font-semibold" lang="it" dir="auto">{{ ex.form.stem ?? ex.prompt }}</legend>
            <label v-for="c in ex.form.choices" :key="c.index" class="flex min-h-touch cursor-pointer items-center gap-3 rounded-md border px-3 py-2" :class="choice === c.index ? 'border-primary bg-primary-soft' : 'border-line-strong bg-surface'">
              <input v-model="choice" type="radio" name="choice" :value="c.index" class="size-5 accent-primary"><span dir="auto">{{ c.text }}</span>
            </label>
          </fieldset>
        </template>
        <template v-else-if="ex.type === 'fill_blank'">
          <p class="text-lg" lang="it" dir="ltr"><template v-if="sentence">{{ sentence.before }} <span class="font-bold" aria-hidden="true">_____</span> {{ sentence.after }}</template><template v-else>{{ ex.form.sentence }}</template></p>
          <UiFormField :label="t('practice.yourAnswer')" :error="problem ?? undefined"><UiTextInput v-model="text" ltr :maxlength="200" autocomplete="off" /></UiFormField>
        </template>
        <template v-else>
          <p class="text-sm text-ink-soft">{{ t('practice.matchHow') }}</p>
          <ul class="space-y-3">
            <li v-for="(l, i) in ex.form.left" :key="l.index" class="grid gap-2 sm:grid-cols-2 sm:items-center">
              <span class="font-medium" lang="it" dir="auto">{{ l.text }}</span>
              <UiFormField :label="t('practice.matchWith', { item: l.text })"><UiSelect :model-value="picks[i] === null || picks[i] === undefined ? '' : String(picks[i])" :options="rightOptions" :placeholder="t('common.choose')" @update:model-value="picks[i] = $event === '' ? null : Number($event)" /></UiFormField>
            </li>
          </ul>
        </template>
        <UiAlert v-if="problem && ex.type !== 'fill_blank'" tone="warning" data-testid="exercise-problem">{{ problem }}</UiAlert>
        <UiButton type="submit" size="lg" :loading="submitting">{{ t('practice.check') }}</UiButton>
      </form>

      <section v-else class="space-y-4" aria-live="polite" data-testid="exercise-result">
        <UiAlert :tone="result.correct ? 'success' : 'warning'" :title="result.correct ? t('practice.correct') : t('practice.notQuite')">
          <p v-if="!result.correct && correctText" data-testid="correct-answer">{{ t('practice.correctAnswer', { answer: correctText }) }}</p>
          <p v-if="result.explanation" class="mt-1" dir="auto">{{ result.explanation }}</p>
        </UiAlert>
        <p v-if="result.vocabulary" class="text-sm text-muted">{{ t('practice.vocabUpdated') }}</p>
        <div class="flex flex-wrap gap-2"><UiButton variant="secondary" @click="retry">{{ t('practice.tryAgain') }}</UiButton><UiButton to="/learn-italian/practice">{{ t('practice.moreExercises') }}</UiButton></div>
      </section>
    </div>
  </div>
</template>
