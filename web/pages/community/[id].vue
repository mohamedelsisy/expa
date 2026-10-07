<script setup lang="ts">
import type { CommunityQuestion } from '~/types/extra'
import { formatDate } from '~/utils/locale'
import { officialGuidePath } from '~/utils/community'

const { t, locale } = useI18n()
const route = useRoute()
const auth = useAuthStore()
const localePath = useLocalePath()
const { request } = useApi()
const toast = useToast()
const community = useCommunityMeta()
if (!(await community.load())) throw createError({ statusCode: 404, statusMessage: 'Not Found', fatal: true })
const id = computed(() => String(route.params.id))
const { data: q, error, refresh, status } = await useAsyncData(() => `community-${id.value}`, async () => (await request<CommunityQuestion>(`community/questions/${encodeURIComponent(id.value)}`)).data, { watch: [locale] })
if (isApiError(error.value) && error.value.status === 404) throw createError({ statusCode: 404, statusMessage: 'Not Found', fatal: true })
useSeo(() => ({ title: q.value ? `${q.value.title} | EXPA` : t('community.title'), description: t('community.seo.description'), noindex: true }))
const crumbs = computed(() => [{ label: t('community.title'), to: '/community' }, { label: q.value?.title ?? '' }])
const canPost = computed(() => auth.isAuthenticated && auth.isVerified)
const guidePath = computed(() => officialGuidePath(q.value?.official_guide?.path))

const answer = ref('')
const answerErr = ref<string | undefined>()
const sending = ref(false)
async function postAnswer() {
  answerErr.value = undefined
  if (!answer.value.trim()) { answerErr.value = t('community.errors.bodyRequired'); return }
  sending.value = true
  try {
    await request(`community/questions/${id.value}/answers`, { method: 'POST', body: { body: answer.value.trim() } })
    toast.success(t('community.posted')); answer.value = ''; await refresh()
  } catch (e) { answerErr.value = isApiError(e) ? e.message : t('errors.generic') } finally { sending.value = false }
}
async function act(fn: () => Promise<unknown>) {
  try { await fn(); await refresh() } catch (e) { toast.error(isApiError(e) ? e.message : t('errors.generic')) }
}
const vote = (type: 'question' | 'answer', itemId: number, voted: boolean) => act(() => request(`community/${type}/${itemId}/vote`, { method: voted ? 'DELETE' : 'PUT' }))
const accept = (answerId: number, accepted: boolean) => act(() => request(`community/questions/${id.value}/accepted-answer`, accepted ? { method: 'DELETE' } : { method: 'PUT', body: { answer_id: answerId } }))
const confirm = ref<string | null>(null)
const remove = (kind: 'questions' | 'answers', itemId: number) => act(async () => { await request(`community/${kind}/${itemId}`, { method: 'DELETE' }); confirm.value = null; if (kind === 'questions') await navigateTo(localePath('/community')) })
</script>

<template>
  <div class="container-page max-w-3xl py-8 sm:py-12">
    <UiBreadcrumbs :items="crumbs" class="mb-6" />
    <h1 v-if="!q" class="sr-only">{{ t('community.title') }}</h1>
    <div v-if="status === 'pending' && !q" aria-busy="true"><UiSkeleton block :lines="5" /></div>
    <UiErrorState v-else-if="error || !q" :message="isApiError(error) ? error.message : undefined" retry @retry="refresh()" />
    <div v-else class="space-y-8">
      <article class="space-y-3">
        <div class="flex flex-wrap items-center gap-2"><CommunityLabels :label="q.label" :status="q.status" :mine="q.mine" /><UiBadge v-if="q.topic_label" tone="primary">{{ q.topic_label }}</UiBadge></div>
        <h1 class="text-2xl font-bold sm:text-3xl" dir="auto">{{ q.title }}</h1>
        <UiAlert v-if="route.query.posted" tone="success">{{ t('community.postedPending') }}</UiAlert>
        <UiAlert v-if="q.notice" tone="warning" data-testid="sensitive-notice">{{ q.notice }}</UiAlert>
        <UiAlert v-if="q.official_guide && guidePath" tone="info" data-testid="official-guide">{{ t('community.officialGuide') }} <NuxtLink :to="localePath(guidePath)" class="font-medium underline underline-offset-4">{{ q.official_guide.title }}</NuxtLink></UiAlert>
        <p class="prose-plain" dir="auto">{{ q.body }}</p>
        <p class="flex flex-wrap items-center gap-2 text-sm text-muted"><time v-if="q.created_at" :datetime="q.created_at">{{ formatDate(q.created_at, locale) }}</time><span v-if="q.city">{{ q.city.name }}</span><span v-for="tg in q.tags" :key="tg">#{{ tg }}</span></p>
        <div class="flex flex-wrap gap-2">
          <UiButton v-if="canPost && !q.mine" variant="secondary" :aria-pressed="!!q.voted" @click="vote('question', q.id, !!q.voted)"><UiIcon name="check" :size="16" />{{ t('community.vote', { count: q.votes }) }}</UiButton>
          <span v-else class="inline-flex min-h-touch items-center text-sm text-muted">{{ t('community.votes', { count: q.votes }) }}</span>
          <ServicesReportButton v-if="canPost && !q.mine" :endpoint="`community/question/${q.id}/report`" />
          <UiButton v-if="q.mine" variant="ghost" @click="confirm = 'q'">{{ t('common.delete') }}</UiButton>
        </div>
        <UiConfirmInline v-if="confirm === 'q'" :message="t('community.deleteConfirm')" :confirm-label="t('common.delete')" @confirm="remove('questions', q.id)" @cancel="confirm = null" />
        <CommunityComments :question-id="q.id" :comments="q.comments ?? []" :can-post="canPost" @changed="refresh()" />
      </article>

      <section aria-labelledby="an-h" class="space-y-4">
        <h2 id="an-h" class="text-xl font-bold">{{ t('community.answersCount', { count: q.answers?.length ?? 0 }) }}</h2>
        <p v-if="!q.answers?.length" class="text-muted">{{ t('community.noAnswers') }}</p>
        <ul v-else class="space-y-4">
          <li v-for="a in q.answers" :key="a.id" class="space-y-2 rounded-lg border border-line bg-surface p-4">
            <div class="flex flex-wrap items-center gap-2"><CommunityLabels :label="a.label" :status="a.status" :mine="a.mine" /><UiBadge v-if="a.accepted" tone="success"><UiIcon name="check" :size="14" />{{ t('community.accepted') }}</UiBadge></div>
            <p class="prose-plain" dir="auto">{{ a.body }}</p>
            <div class="flex flex-wrap gap-2">
              <UiButton v-if="canPost && !a.mine" variant="secondary" :aria-pressed="a.voted" @click="vote('answer', a.id, a.voted)">{{ t('community.vote', { count: a.votes }) }}</UiButton>
              <span v-else class="inline-flex min-h-touch items-center text-sm text-muted">{{ t('community.votes', { count: a.votes }) }}</span>
              <UiButton v-if="q.mine" variant="ghost" @click="accept(a.id, a.accepted)">{{ a.accepted ? t('community.unaccept') : t('community.accept') }}</UiButton>
              <ServicesReportButton v-if="canPost && !a.mine" :endpoint="`community/answer/${a.id}/report`" />
              <UiButton v-if="a.mine" variant="ghost" @click="confirm = `a${a.id}`">{{ t('common.delete') }}</UiButton>
            </div>
            <UiConfirmInline v-if="confirm === `a${a.id}`" :message="t('community.deleteConfirm')" :confirm-label="t('common.delete')" @confirm="remove('answers', a.id)" @cancel="confirm = null" />
            <CommunityComments :question-id="q.id" :answer-id="a.id" :comments="a.comments" :can-post="canPost" @changed="refresh()" />
          </li>
        </ul>
        <form v-if="canPost" class="space-y-3" novalidate @submit.prevent="postAnswer">
          <UiFormField :label="t('community.yourAnswer')" :hint="t('community.moderationNote')" :error="answerErr" required><UiTextarea v-model="answer" :rows="5" :maxlength="20000" /></UiFormField>
          <UiButton type="submit" :loading="sending">{{ t('community.postAnswer') }}</UiButton>
        </form>
        <UiAlert v-else-if="auth.isAuthenticated" tone="warning">{{ t('verify.neededBody') }}</UiAlert>
        <UiButton v-else :to="`/login?redirect=${encodeURIComponent(localePath(`/community/${id}`))}`" variant="secondary">{{ t('community.loginToAnswer') }}</UiButton>
      </section>
    </div>
  </div>
</template>
