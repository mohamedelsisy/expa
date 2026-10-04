<script setup lang="ts">
import type { AiAskResponse, AiConversation, AiConversationSummary, AiMessage, AiUsage } from '~/types/api'
import { formatDateTime } from '~/utils/locale'

definePageMeta({ middleware: 'auth' })
const { t, locale } = useI18n()
const route = useRoute()
const { request } = useApi()
const toast = useToast()
useSeo(() => ({ title: t('ask.title'), description: t('ask.subtitle'), noindex: true }))

const MAX = 1000
const MIN = 2

interface ChatItem { key: string, role: 'user' | 'assistant', content: string, message?: AiMessage, failed?: boolean, question?: string }
let seq = 0
const nextKey = () => `m${++seq}`

const { data: side, refresh: refreshSide, error: sideError } = await useAsyncData('ask-side', async () => {
  const [usage, convs] = await Promise.all([
    request<AiUsage>('ai/usage'),
    request<AiConversationSummary[]>('ai/conversations', { query: { per_page: 30 } }),
  ])
  return { usage: usage.data, conversations: convs.data }
})

const usage = ref<AiUsage | null>(side.value?.usage ?? null)
watch(side, (s) => { if (s) usage.value = s.usage })
const conversations = computed(() => side.value?.conversations ?? [])

const conversationId = ref<number | null>(null)
const items = ref<ChatItem[]>([])
const draft = ref('')
const sending = ref(false)
const loadingConv = ref(false)
const convError = ref<string | null>(null)
const askError = ref<{ code: string, message: string } | null>(null)
const showHistory = ref(false)
const confirmDelete = ref<number | null>(null)
const deleting = ref(false)
const logEl = ref<HTMLElement | null>(null)
const announce = ref('')

const remaining = computed(() => usage.value?.remaining ?? null)
const limitReached = computed(() => remaining.value !== null && remaining.value <= 0)
const trimmed = computed(() => draft.value.trim())
const tooLong = computed(() => draft.value.length > MAX)
const canSend = computed(() => trimmed.value.length >= MIN && !tooLong.value && !sending.value && !limitReached.value)
const counterTone = computed(() => (draft.value.length > MAX ? 'text-danger font-semibold' : draft.value.length > MAX * 0.9 ? 'text-warning font-semibold' : 'text-muted'))

function scrollToEnd() {
  nextTick(() => { logEl.value?.lastElementChild?.scrollIntoView?.({ block: 'nearest' }) })
}

async function openConversation(id: number) {
  loadingConv.value = true
  convError.value = null
  askError.value = null
  showHistory.value = false
  try {
    const res = await request<AiConversation>(`ai/conversations/${id}`)
    conversationId.value = res.data.id
    items.value = res.data.messages.map(m => ({ key: nextKey(), role: m.role, content: m.content, message: m.role === 'assistant' ? m : undefined }))
    scrollToEnd()
  } catch (e) {
    convError.value = isApiError(e) ? e.message : t('errors.generic')
  } finally {
    loadingConv.value = false
  }
}

function newConversation() {
  conversationId.value = null
  items.value = []
  askError.value = null
  convError.value = null
  showHistory.value = false
}

async function deleteConversation(id: number) {
  deleting.value = true
  try {
    await request(`ai/conversations/${id}`, { method: 'DELETE' })
    if (conversationId.value === id) newConversation()
    confirmDelete.value = null
    toast.success(t('ask.deleted'))
    await refreshSide()
  } catch (e) {
    toast.error(isApiError(e) ? e.message : t('errors.generic'))
  } finally {
    deleting.value = false
  }
}

/** Sends `text`. `reuse` is the failed user bubble being retried (no duplicate bubble). */
async function send(text: string, reuse?: ChatItem) {
  askError.value = null
  sending.value = true
  let bubble = reuse
  if (bubble) bubble.failed = false
  else {
    items.value.push({ key: nextKey(), role: 'user', content: text })
    bubble = items.value[items.value.length - 1] // the reactive proxy, so later flag changes re-render
  }
  scrollToEnd()
  try {
    const res = await request<AiAskResponse>('ai/ask', { method: 'POST', body: { message: text, ...(conversationId.value ? { conversation_id: conversationId.value } : {}) }, timeoutMs: 40000 })
    const isNew = conversationId.value === null
    conversationId.value = res.data.conversation_id
    const msg = { ...res.data.message, degraded: res.data.message.degraded || !!res.meta.degraded }
    items.value.push({ key: nextKey(), role: 'assistant', content: msg.content, message: msg, question: text })
    if (res.data.usage) usage.value = { limit: usage.value?.limit ?? null, remaining: res.data.usage.remaining }
    announce.value = t('ask.newAnswer')
    if (isNew) await refreshSide()
  } catch (e) {
    bubble.failed = true
    if (isApiError(e)) askError.value = { code: e.code, message: e.message }
    else askError.value = { code: 'error', message: t('errors.generic') }
    if (isApiError(e) && e.code === 'ai_limit_reached' && usage.value) usage.value = { ...usage.value, remaining: 0 }
  } finally {
    sending.value = false
    scrollToEnd()
  }
}

function submit() {
  if (!canSend.value) return
  const text = trimmed.value
  draft.value = ''
  void send(text)
}
function onKeydown(e: KeyboardEvent) {
  // Enter sends, Shift+Enter inserts a newline; never send while an IME composition is active.
  if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) {
    e.preventDefault()
    submit()
  }
}
const retry = (item: ChatItem) => { void send(item.content, item) }
function usePrompt(p: string) {
  draft.value = p
  nextTick(() => (document.querySelector('[data-ask-input]') as HTMLTextAreaElement | null)?.focus())
}

onMounted(() => {
  const c = Number(route.query.c)
  if (Number.isInteger(c) && c > 0) void openConversation(c)
})
const prompts = computed(() => [t('ask.prompts.p1'), t('ask.prompts.p2'), t('ask.prompts.p3')])
const errorHint = computed(() => {
  const c = askError.value?.code
  if (c === 'ai_limit_reached') return t('ask.limitHint')
  if (c === 'too_many_requests') return t('ask.slowDownHint')
  if (c === 'network' || c === 'timeout') return t('ask.networkHint')
  return null
})
</script>

<template>
  <div class="container-page py-6 sm:py-10">
    <header class="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div class="max-w-2xl">
        <h1 class="text-2xl font-bold sm:text-3xl">{{ t('ask.title') }}</h1>
        <p class="mt-1 text-ink-soft">{{ t('ask.subtitle') }}</p>
      </div>
      <p v-if="usage && usage.limit !== null" class="rounded-full bg-primary-soft px-4 py-1.5 text-sm font-semibold text-primary-strong" data-testid="ai-usage">
        {{ t('ask.usage', { remaining: usage.remaining ?? 0, limit: usage.limit }) }}
      </p>
    </header>

    <UiAlert tone="info" class="mb-5">{{ t('ask.generalNote') }}</UiAlert>

    <div class="grid gap-6 lg:grid-cols-[18rem_minmax(0,1fr)]">
      <!-- History -->
      <aside :aria-label="t('ask.history')" class="lg:order-first">
        <div class="mb-3 flex items-center justify-between gap-2">
          <h2 class="text-lg font-bold">{{ t('ask.history') }}</h2>
          <UiButton variant="secondary" @click="newConversation"><UiIcon name="plus" :size="18" />{{ t('ask.newChat') }}</UiButton>
        </div>
        <button type="button" class="mb-2 inline-flex min-h-touch items-center gap-2 font-medium text-primary-strong lg:hidden" :aria-expanded="showHistory" aria-controls="conv-list" @click="showHistory = !showHistory">
          <UiIcon name="chevron-down" :size="18" :class="showHistory ? 'rotate-180' : ''" />{{ t('ask.historyToggle', { count: conversations.length }) }}
        </button>
        <div id="conv-list" :class="showHistory ? 'block' : 'hidden lg:block'">
          <UiAlert v-if="sideError" tone="warning">{{ t('ask.historyError') }}</UiAlert>
          <p v-else-if="!conversations.length" class="text-sm text-muted">{{ t('ask.historyEmpty') }}</p>
          <ul v-else class="max-h-80 space-y-1 overflow-auto lg:max-h-[32rem]">
            <li v-for="c in conversations" :key="c.id" class="rounded-md" :class="conversationId === c.id ? 'bg-primary-soft' : ''">
              <div class="flex items-center gap-1">
                <button type="button" class="min-h-touch min-w-0 flex-1 rounded-md px-3 py-2 text-start hover:bg-sunken" :aria-current="conversationId === c.id ? 'true' : undefined" @click="openConversation(c.id)">
                  <span class="block truncate font-medium">{{ c.title || t('ask.untitled') }}</span>
                  <span class="block text-xs text-muted">{{ formatDateTime(c.updated_at, locale) }}</span>
                </button>
                <UiIconButton icon="trash" :label="t('ask.deleteConversation')" @click="confirmDelete = c.id" />
              </div>
              <UiConfirmInline v-if="confirmDelete === c.id" class="m-2" :message="t('ask.deleteConfirm')" :confirm-label="t('common.delete')" :loading="deleting" @confirm="deleteConversation(c.id)" @cancel="confirmDelete = null" />
            </li>
          </ul>
        </div>
      </aside>

      <!-- Chat -->
      <section :aria-label="t('ask.chat')" class="flex min-h-[28rem] min-w-0 flex-col rounded-lg border border-line bg-surface">
        <div class="flex-1 space-y-5 overflow-y-auto p-4 sm:p-6" :aria-busy="sending || loadingConv ? 'true' : undefined">
          <UiSkeleton v-if="loadingConv" block :lines="3" />
          <UiErrorState v-else-if="convError" :message="convError" retry @retry="conversationId && openConversation(conversationId)" />
          <div v-else-if="!items.length" class="mx-auto max-w-lg space-y-4 py-6 text-center">
            <span class="mx-auto grid size-14 place-items-center rounded-full bg-primary-soft text-primary-strong"><UiIcon name="sparkle" :size="28" /></span>
            <h2 class="text-lg font-bold">{{ t('ask.emptyTitle') }}</h2>
            <p class="text-ink-soft">{{ t('ask.emptyBody') }}</p>
            <ul class="flex flex-col gap-2">
              <li v-for="p in prompts" :key="p"><button type="button" class="min-h-touch w-full rounded-md border border-line-strong bg-surface px-4 py-2 text-start hover:bg-sunken" @click="usePrompt(p)">{{ p }}</button></li>
            </ul>
          </div>
          <div v-else ref="logEl" role="log" aria-live="polite" :aria-label="t('ask.conversation')" class="space-y-5">
            <div v-for="it in items" :key="it.key" :class="it.role === 'user' ? 'flex justify-end' : 'flex justify-start'">
              <div v-if="it.role === 'user'" class="max-w-[85%] rounded-lg bg-primary px-4 py-3 text-on-primary" data-testid="ask-user-msg">
                <p class="prose-plain break-words" dir="auto">{{ it.content }}</p>
                <div v-if="it.failed" class="mt-2 flex flex-wrap items-center gap-2 text-sm">
                  <span class="font-semibold">{{ t('ask.notSent') }}</span>
                  <button type="button" class="inline-flex min-h-touch items-center gap-1 rounded-md bg-surface px-3 font-medium text-primary-strong" :disabled="sending" @click="retry(it)"><UiIcon name="refresh" :size="16" />{{ t('common.retry') }}</button>
                </div>
              </div>
              <div v-else class="w-full max-w-[95%] rounded-lg border border-line bg-canvas px-4 py-3 sm:max-w-[90%]" data-testid="ask-assistant-msg">
                <AskMessage v-if="it.message" :message="it.message" :msg-key="it.key" :fallback-query="it.question" />
              </div>
            </div>
          </div>
          <p v-if="sending" class="flex items-center gap-2 text-ink-soft" role="status"><span class="size-4 animate-spin rounded-full border-2 border-primary border-t-transparent" aria-hidden="true" />{{ t('ask.thinking') }}</p>
        </div>

        <div class="space-y-3 border-t border-line p-4">
          <AuthVerifyNeeded v-if="askError?.code === 'email_not_verified'" />
          <UiAlert v-else-if="askError" tone="danger" :title="askError.code === 'ai_limit_reached' ? t('ask.limitTitle') : t('ask.errorTitle')" data-testid="ask-error">
            <p>{{ askError.message }}</p>
            <p v-if="errorHint" class="mt-1 text-sm">{{ errorHint }}</p>
          </UiAlert>
          <p class="sr-only" role="status" aria-live="polite">{{ announce }}</p>
          <form class="space-y-2" novalidate @submit.prevent="submit">
            <UiFormField :label="t('ask.inputLabel')" :error="tooLong ? t('ask.tooLong', { max: MAX }) : undefined">
              <UiTextarea v-model="draft" :rows="3" :placeholder="t('ask.placeholder')" :disabled="limitReached" data-ask-input @keydown="onKeydown" />
            </UiFormField>
            <div class="flex flex-wrap items-center justify-between gap-3">
              <p class="text-xs" :class="counterTone" data-testid="ask-counter"><span class="tabular-nums">{{ draft.length }}</span> / {{ MAX }} · {{ t('ask.keysHint') }}</p>
              <UiButton type="submit" :disabled="!canSend" :loading="sending"><UiIcon name="send" :size="18" class="rtl:-scale-x-100" />{{ t('ask.send') }}</UiButton>
            </div>
          </form>
        </div>
      </section>
    </div>
  </div>
</template>
