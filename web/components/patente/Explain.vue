<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from '#imports'
import type { AiAskResponse, AiMessage } from '~/types/api'
import { explainBody, explainErrorHint, type ExplainKind } from '~/utils/patenteExplain'
import { isApiError } from '~/utils/errors'

/**
 * "Explain this" (Patente Teacher). Calls POST /ai/ask with the topic or question slug; the API answers only from that
 * published, licensed item, appends the Italian-to-Arabic/English glossary and carries sources. A canned "no verified
 * content" reply and quota errors are shown as they come (no invented text here).
 */
const props = withDefaults(defineProps<{ kind: ExplainKind, slug: string, title: string, level?: 2 | 3 }>(), { level: 2 })
const { t } = useI18n()
const { request } = useApi()
const auth = useAuthStore()
const route = useRoute()

const loading = ref(false)
const answer = ref<AiMessage | null>(null)
const conversationId = ref<number | null>(null)
const remaining = ref<number | null>(null)
const err = ref<{ code: string, message: string } | null>(null)
const hint = computed(() => (err.value ? explainErrorHint(err.value.code) : null))
const loginTo = computed(() => `/login?redirect=${encodeURIComponent(route.fullPath)}`)
const msgKey = computed(() => `explain-${props.kind}-${props.slug}`)

async function run() {
  const body = explainBody(props.kind, props.slug, t(props.kind === 'topic' ? 'patente.explain.askTopic' : 'patente.explain.askQuestion', { title: props.title }))
  if (!body) return
  loading.value = true
  err.value = null
  try {
    const res = await request<AiAskResponse>('ai/ask', { method: 'POST', body, timeoutMs: 40000 })
    answer.value = { ...res.data.message, degraded: res.data.message.degraded || !!res.meta.degraded }
    conversationId.value = res.data.conversation_id
    remaining.value = res.data.usage?.remaining ?? null
  } catch (e) {
    err.value = isApiError(e) ? { code: e.code, message: e.message } : { code: 'error', message: t('errors.generic') }
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <section class="space-y-3 rounded-lg border border-line bg-surface p-5" :aria-labelledby="`${msgKey}-h`" data-testid="patente-explain">
    <component :is="`h${level}`" :id="`${msgKey}-h`" class="flex items-center gap-2 text-lg font-bold"><UiIcon name="sparkle" :size="20" />{{ t('patente.explain.title') }}</component>
    <p class="text-sm text-ink-soft">{{ t('patente.explain.intro') }}</p>

    <template v-if="!auth.isAuthenticated">
      <UiButton :to="loginTo" variant="secondary">{{ t('patente.explain.login') }}</UiButton>
    </template>
    <template v-else>
      <UiButton variant="secondary" :loading="loading" :disabled="loading" data-testid="explain-btn" @click="run"><UiIcon name="sparkle" :size="18" />{{ answer ? t('patente.explain.again') : t('patente.explain.button') }}</UiButton>
      <p v-if="remaining !== null" class="text-xs text-muted" data-testid="explain-remaining">{{ t('patente.explain.remaining', { n: remaining }) }}</p>
    </template>

    <AuthVerifyNeeded v-if="err?.code === 'email_not_verified'" />
    <UiAlert v-else-if="err" tone="danger" :title="err.code === 'ai_limit_reached' ? t('ask.limitTitle') : t('ask.errorTitle')" data-testid="explain-error">
      <p>{{ err.message }}</p>
      <p v-if="hint === 'limit'" class="mt-1 text-sm">{{ t('ask.limitHint') }}</p>
      <p v-else-if="hint === 'slow'" class="mt-1 text-sm">{{ t('ask.slowDownHint') }}</p>
      <p v-else-if="hint === 'network'" class="mt-1 text-sm">{{ t('ask.networkHint') }}</p>
    </UiAlert>

    <div v-if="answer" class="space-y-3 rounded-lg border border-line bg-canvas p-4" aria-live="polite" data-testid="explain-answer">
      <AskMessage :message="answer" :msg-key="msgKey" :fallback-query="title" />
      <p class="text-xs text-muted">{{ t('patente.explain.note') }}</p>
      <UiButton v-if="conversationId" :to="`/ask?c=${conversationId}`" variant="ghost">{{ t('patente.explain.continue') }}<UiIcon name="arrow-end" :size="16" /></UiButton>
    </div>
  </section>
</template>
