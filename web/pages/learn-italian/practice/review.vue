<script setup lang="ts">
import type { ReviewCard, ReviewQueue } from '~/types/extra'
import { sessionSummary } from '~/utils/practice'

definePageMeta({ middleware: 'auth' })
const { t } = useI18n()
const { request } = useApi()
const toast = useToast()
useSeo(() => ({ title: t('practice.reviewTitle'), description: t('practice.reviewExplain'), noindex: true }))
const queue = ref<ReviewCard[]>([])
const loading = ref(true)
const loadError = ref<string | null>(null)
const index = ref(0)
const revealed = ref(false)
const results = ref<boolean[]>([])
const saving = ref(false)
const stats = ref<ReviewQueue['stats'] | null>(null)
async function load() {
  loading.value = true
  loadError.value = null
  try {
    const res = await request<ReviewQueue>('italian/practice/review', { query: { limit: 10 } })
    queue.value = res.data.cards
    stats.value = res.data.stats
    index.value = 0; revealed.value = false; results.value = []
  } catch (e) { loadError.value = isApiError(e) ? e.message : t('errors.generic') } finally { loading.value = false }
}
onMounted(load)
const card = computed(() => queue.value[index.value])
const finished = computed(() => !loading.value && !loadError.value && queue.value.length > 0 && index.value >= queue.value.length)
const summary = computed(() => sessionSummary(results.value))
async function answer(correct: boolean) {
  if (!card.value) return
  saving.value = true
  try {
    await request(`italian/vocabulary/${encodeURIComponent(card.value.slug)}/review`, { method: 'POST', body: { correct } })
    results.value.push(correct)
    index.value += 1
    revealed.value = false
  } catch (e) { toast.error(isApiError(e) ? e.message : t('errors.generic')) } finally { saving.value = false }
}
const crumbs = computed(() => [{ label: t('learn.title'), to: '/learn-italian' }, { label: t('practice.title'), to: '/learn-italian/practice' }, { label: t('practice.reviewTitle') }])
</script>

<template>
  <div class="container-page max-w-2xl py-8 sm:py-12">
    <UiBreadcrumbs :items="crumbs" class="mb-6" />
    <h1 class="mb-2 text-2xl font-bold sm:text-3xl">{{ t('practice.reviewTitle') }}</h1>
    <p class="mb-6 text-ink-soft">{{ t('practice.reviewHow') }}</p>
    <div v-if="loading" aria-busy="true"><UiSkeleton block :lines="4" /></div>
    <UiErrorState v-else-if="loadError" :message="loadError" retry @retry="load" />
    <UiEmptyState v-else-if="!queue.length" :title="t('practice.nothingDueTitle')" :description="t('practice.nothingDue')" icon="check"><UiButton to="/learn-italian/practice" variant="secondary">{{ t('practice.title') }}</UiButton></UiEmptyState>
    <UiCard v-else-if="finished" class="space-y-4" data-testid="review-summary">
      <h2 class="text-xl font-bold">{{ t('practice.sessionDone') }}</h2>
      <p class="text-lg">{{ t('practice.sessionResult', { correct: summary.correct, total: summary.total }) }}</p>
      <p class="text-sm text-muted">{{ t('practice.spacedNote') }}</p>
      <div class="flex flex-wrap gap-2"><UiButton @click="load">{{ t('practice.again') }}</UiButton><UiButton to="/learn-italian/practice" variant="secondary">{{ t('practice.title') }}</UiButton></div>
    </UiCard>
    <section v-else-if="card" class="space-y-4" :aria-label="t('practice.cardOf', { n: index + 1, total: queue.length })">
      <p class="text-sm text-muted" aria-live="polite">{{ t('practice.cardOf', { n: index + 1, total: queue.length }) }}<template v-if="card.new"> · <UiBadge tone="info">{{ t('practice.newCard') }}</UiBadge></template></p>
      <LearnReviewedNotice :item="card" />
      <UiCard class="space-y-4 text-center" data-testid="flashcard">
        <p class="flex items-center justify-center gap-2 text-3xl font-bold" lang="it" dir="ltr">{{ card.lemma }}<LearnListenButton :text="card.lemma" /></p>
        <template v-if="revealed">
          <p class="text-xl" dir="auto" data-testid="card-gloss">{{ card.gloss ?? t('practice.noGloss') }}</p>
          <p v-if="card.example_it" class="text-ink-soft"><span lang="it" dir="ltr">{{ card.example_it }}</span><template v-if="card.example_gloss"><br><span dir="auto">{{ card.example_gloss }}</span></template></p>
        </template>
      </UiCard>
      <div v-if="!revealed" class="flex justify-center"><UiButton size="lg" data-testid="reveal" @click="revealed = true">{{ t('practice.reveal') }}</UiButton></div>
      <div v-else class="grid grid-cols-2 gap-3"><UiButton variant="secondary" size="lg" :loading="saving" data-testid="wrong" @click="answer(false)"><UiIcon name="x" :size="18" />{{ t('practice.didntKnow') }}</UiButton><UiButton size="lg" :loading="saving" data-testid="right" @click="answer(true)"><UiIcon name="check" :size="18" />{{ t('practice.knewIt') }}</UiButton></div>
    </section>
  </div>
</template>
