<script setup lang="ts">
import type { ExamRun, PatenteTopic } from '~/types/api'

definePageMeta({ middleware: 'auth' })
const { t, locale } = useI18n()
const route = useRoute()
const { request } = useApi()
const localePath = useLocalePath()
useSeo(() => ({ title: t('patente.practiceTitle'), description: t('patente.mockNotice'), noindex: true }))

const { data: topics, error, refresh } = await useAsyncData('practice-topics', async () => (await request<PatenteTopic[]>('patente/topics')).data, { watch: [locale] })
const selected = ref<string[]>(typeof route.query.topic === 'string' ? [route.query.topic] : [])
const size = ref('20')
const starting = ref(false)
const problem = ref<string | null>(null)
const needsVerify = ref(false)
const noQuestions = ref(false)
const toggle = (slug: string, on: boolean) => { selected.value = on ? [...new Set([...selected.value, slug])] : selected.value.filter(s => s !== slug) }

async function start() {
  problem.value = null
  noQuestions.value = false
  needsVerify.value = false
  if (!selected.value.length) { problem.value = t('patente.pickTopic'); return }
  starting.value = true
  try {
    const res = await request<ExamRun>('patente/exams', { method: 'POST', body: { mode: 'practice', topics: selected.value, size: Math.max(1, Math.min(40, Number(size.value) || 20)) } })
    await navigateTo(localePath(`/patente/run/${res.data.id}`))
  } catch (e) {
    if (isApiError(e) && e.code === 'not_enough_questions') noQuestions.value = true
    else if (isApiError(e) && e.code === 'email_not_verified') needsVerify.value = true
    else problem.value = isApiError(e) ? e.message : t('errors.generic')
  } finally {
    starting.value = false
  }
}
</script>

<template>
  <div class="container-page max-w-2xl py-8 sm:py-12">
    <h1 class="mb-2 text-2xl font-bold sm:text-3xl">{{ t('patente.practiceTitle') }}</h1>
    <p class="mb-6 text-ink-soft">{{ t('patente.practiceIntro') }}</p>
    <PatenteDisclaimer class="mb-6" />
    <UiErrorState v-if="error || !topics" :message="isApiError(error) ? error.message : undefined" retry @retry="refresh()" />
    <UiEmptyState v-else-if="!topics.length" :title="t('patente.noTopicsTitle')" :description="t('patente.noTopics')" icon="car" />
    <form v-else class="space-y-5" novalidate @submit.prevent="start">
      <UiFormField :label="t('patente.chooseTopics')" group :error="problem ?? undefined">
        <UiCheckbox v-for="tp in topics" :key="tp.slug" :model-value="selected.includes(tp.slug)" :description="t('patente.questionCount', { count: tp.question_count })" @update:model-value="toggle(tp.slug, $event)"><UiAutoItalian :text="tp.title" /></UiCheckbox>
      </UiFormField>
      <UiFormField :label="t('patente.practiceSize')" :hint="t('patente.practiceSizeHint')" class="max-w-xs"><UiTextInput v-model="size" type="number" inputmode="numeric" ltr /></UiFormField>
      <AuthVerifyNeeded v-if="needsVerify" />
      <UiAlert v-if="noQuestions" tone="warning" data-testid="not-enough">{{ t('patente.notEnoughPractice') }}</UiAlert>
      <UiButton type="submit" size="lg" :loading="starting">{{ t('patente.beginPractice') }}</UiButton>
    </form>
  </div>
</template>
