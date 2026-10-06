<script setup lang="ts">
import type { LessonFull } from '~/types/api'

const { t, locale } = useI18n()
const route = useRoute()
const auth = useAuthStore()
const { request } = useApi()
const toast = useToast()
const slug = computed(() => String(route.params.slug))
const { data: lesson, error, refresh, status } = await useAsyncData(() => `lesson-${slug.value}`, async () => (await request<LessonFull>(`italian/lessons/${encodeURIComponent(slug.value)}`)).data, { watch: [locale] })
if (isApiError(error.value) && error.value.status === 404) throw createError({ statusCode: 404, statusMessage: 'Not Found', fatal: true })
useSeo(() => ({ title: lesson.value ? `${lesson.value.title} | EXPA` : t('learn.title'), description: lesson.value?.summary ?? t('learn.subtitle') }))
const crumbs = computed(() => [{ label: t('learn.title'), to: '/learn-italian' }, { label: lesson.value?.title ?? '' }])

const completed = ref(false)
watch(lesson, (l) => { completed.value = l?.progress?.status === 'completed' }, { immediate: true })
const saving = ref(false)
const feedback = ref<{ streak: number } | null>(null)
async function complete() {
  saving.value = true
  try {
    const res = await request<{ status: string, streak: number }>(`italian/lessons/${encodeURIComponent(slug.value)}/progress`, { method: 'POST', body: { status: 'completed' } })
    completed.value = true
    feedback.value = { streak: res.data.streak }
    toast.success(t('learn.completedToast'))
  } catch (e) {
    toast.error(isApiError(e) ? e.message : t('errors.generic'))
  } finally {
    saving.value = false
  }
}
const items = computed(() => lesson.value?.items ?? [])
</script>

<template>
  <div class="container-page max-w-3xl py-8 sm:py-12">
    <UiBreadcrumbs :items="crumbs" class="mb-6" />
    <div v-if="status === 'pending' && !lesson" aria-busy="true"><UiSkeleton block :lines="5" /></div>
    <UiErrorState :heading-level="1" v-else-if="error || !lesson" :message="isApiError(error) ? error.message : undefined" retry @retry="refresh()" />
    <article v-else class="space-y-6">
      <header class="space-y-3">
        <div class="flex flex-wrap items-center gap-2"><UiBadge tone="primary">{{ lesson.level_label }}</UiBadge><UiBadge>{{ lesson.type_label }}</UiBadge><UiBadge v-if="lesson.scenario_label">{{ lesson.scenario_label }}</UiBadge><UiBadge><UiIcon name="clock" :size="14" />{{ t('learn.minutes', { count: lesson.duration_minutes }) }}</UiBadge></div>
        <h1 class="text-3xl font-bold"><UiAutoItalian :text="lesson.title" /></h1>
        <p v-if="lesson.summary" class="text-lg text-ink-soft">{{ lesson.summary }}</p>
      </header>
      <GuideFallbackNotice v-if="lesson.fallback" :locale="lesson.locale" />

      <p v-if="lesson.body && lesson.type !== 'vocabulary'" class="prose-plain rounded-lg border border-line bg-surface p-4 text-lg" :data-type="lesson.type"><UiAutoItalian :text="lesson.body" /></p>

      <!-- vocabulary cards -->
      <ul v-if="lesson.type === 'vocabulary'" class="grid gap-4 sm:grid-cols-2">
        <li v-for="(it, i) in items" :key="i"><UiCard class="space-y-2" data-testid="vocab-card">
          <div class="flex items-start justify-between gap-2"><p class="text-2xl font-bold" lang="it" dir="ltr">{{ it.it }}</p><LearnListenButton :text="it.it" /></div>
          <p v-if="it.gloss" class="text-ink-soft">{{ it.gloss }}</p>
          <div v-if="it.example_it" class="rounded-md bg-sunken p-3 text-sm"><p lang="it" dir="ltr" class="flex items-start justify-between gap-2"><span>{{ it.example_it }}</span><LearnListenButton :text="it.example_it" /></p><p v-if="it.example_gloss" class="mt-1 text-ink-soft">{{ it.example_gloss }}</p></div>
        </UiCard></li>
      </ul>

      <!-- grammar examples -->
      <ul v-else-if="lesson.type === 'grammar' && items.length" class="space-y-3">
        <li v-for="(it, i) in items" :key="i" class="rounded-md border border-line bg-surface p-3"><p class="flex items-start justify-between gap-2 font-semibold" lang="it" dir="ltr"><span>{{ it.it }}</span><LearnListenButton :text="it.it" /></p><p v-if="it.gloss" class="text-ink-soft">{{ it.gloss }}</p><p v-if="it.tip" class="mt-1 text-sm text-muted">{{ it.tip }}</p></li>
      </ul>

      <!-- conversation bubbles -->
      <ol v-else-if="lesson.type === 'conversation'" class="space-y-3" :aria-label="t('learn.dialogue')">
        <li v-for="(it, i) in items" :key="i" class="flex" :class="i % 2 ? 'justify-end' : 'justify-start'" data-testid="dialogue-line">
          <div class="max-w-[90%] rounded-lg px-4 py-3" :class="i % 2 ? 'bg-primary-soft' : 'bg-surface border border-line'">
            <p v-if="it.speaker" class="text-xs font-bold text-muted">{{ it.speaker }}</p>
            <p class="flex items-start gap-2 font-medium" lang="it" dir="ltr"><span>{{ it.it }}</span><LearnListenButton :text="it.it" /></p>
            <p v-if="it.gloss" class="text-sm text-ink-soft">{{ it.gloss }}</p>
          </div>
        </li>
      </ol>

      <!-- pronunciation -->
      <ul v-else-if="lesson.type === 'pronunciation'" class="space-y-3">
        <li v-for="(it, i) in items" :key="i"><UiCard class="space-y-1" data-testid="pron-item">
          <div class="flex items-start justify-between gap-2"><p class="text-xl font-bold" lang="it" dir="ltr">{{ it.it }}</p><LearnListenButton :text="it.it" /></div>
          <p v-if="it.phonetic" class="text-primary-strong" dir="ltr">/{{ it.phonetic.replace(/^\/|\/$/g, '') }}/</p>
          <p v-if="it.gloss" class="text-ink-soft">{{ it.gloss }}</p>
          <p v-if="it.tip" class="rounded-md bg-sunken p-2 text-sm">{{ it.tip }}</p>
        </UiCard></li>
      </ul>

      <!-- mission: body already shown; list any items as steps -->
      <ol v-else-if="lesson.type === 'mission' && items.length" class="list-decimal space-y-2 ps-6"><li v-for="(it, i) in items" :key="i"><span lang="it" dir="ltr">{{ it.it }}</span><span v-if="it.gloss" class="text-ink-soft"> — {{ it.gloss }}</span></li></ol>

      <UiCard v-if="auth.isAuthenticated" tone="soft" class="space-y-3" aria-live="polite">
        <template v-if="completed">
          <p class="flex items-center gap-2 text-lg font-bold text-success"><UiIcon name="check-circle" :size="22" />{{ t('learn.completed') }}</p>
          <p v-if="feedback" class="flex items-center gap-2"><UiIcon name="flame" :size="18" />{{ t('learn.streak', { count: feedback.streak }) }}</p>
          <UiButton to="/learn-italian" variant="secondary">{{ t('learn.backToPlan') }}</UiButton>
        </template>
        <UiButton v-else :loading="saving" size="lg" @click="complete"><UiIcon name="check" :size="20" />{{ t('learn.markComplete') }}</UiButton>
      </UiCard>
      <UiAlert v-else tone="info"><p>{{ t('learn.loginToSave') }}</p><UiButton to="/login" variant="secondary" class="mt-3">{{ t('auth.login') }}</UiButton></UiAlert>
    </article>
  </div>
</template>
