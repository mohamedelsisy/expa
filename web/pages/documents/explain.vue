<script setup lang="ts">
import type { ExplainResult, ExplainUsage } from '~/types/extra'
import { isConsentRequired } from '~/utils/errors'
import { DEFAULT_MAX_FILE_KB, DEFAULT_MAX_TEXT, EXPLAIN_ACCEPT, FILE_ERROR_CODES, MIN_TEXT, validateExplainFile, wantsTextFallback } from '~/utils/explain'
import { formatBytes } from '~/utils/documents'

definePageMeta({ middleware: 'auth' })
const { t, locale } = useI18n()
const { request } = useApi()
useSeo(() => ({ title: t('explain.seo.title'), description: t('explain.seo.description'), noindex: true }))
const crumbs = computed(() => [{ label: t('documents.title'), to: '/documents' }, { label: t('explain.title') }])

const usage = ref<ExplainUsage | null>(null)
const mode = ref<'text' | 'file'>('text')
const maxKb = computed(() => usage.value?.max_file_kb ?? DEFAULT_MAX_FILE_KB)
const maxText = computed(() => usage.value?.max_text_chars ?? DEFAULT_MAX_TEXT)
const ocrAvailable = computed(() => usage.value?.ocr_available !== false)
const { granted, load: loadConsent } = useConsent('document_analysis')
onMounted(async () => {
  try { usage.value = (await request<ExplainUsage>('documents/explain/usage', { handle401: false })).data } catch { usage.value = null }
  if (usage.value?.ocr_available) mode.value = 'file'
  void loadConsent()
})

const text = ref('')
const picked = ref<File | null>(null)
const fileInput = ref<{ reset: () => void } | null>(null)
const fileError = ref<string | undefined>()
const textError = ref<string | undefined>()
const notice = ref<{ tone: 'info' | 'warning' | 'danger', text: string } | null>(null)
const submitting = ref(false)
const needConsent = ref(false)
const needVerify = ref(false)
const result = ref<ExplainResult | null>(null)
const resultEl = ref<HTMLElement | null>(null)
const sizeLabel = computed(() => formatBytes(maxKb.value * 1024, locale.value))

function setMode(m: 'text' | 'file') { mode.value = m; fileError.value = undefined; textError.value = undefined; notice.value = null }
function onPick(e: Event) {
  const f = (e.target as HTMLInputElement).files?.[0] ?? null
  picked.value = null
  fileError.value = undefined
  notice.value = null
  if (!f) return
  const p = validateExplainFile(f, maxKb.value)
  if (p) { fileError.value = t(`explain.fileProblems.${p}`, { size: sizeLabel.value }); return }
  picked.value = f
}

async function submit() {
  fileError.value = textError.value = undefined
  notice.value = null
  needConsent.value = needVerify.value = false
  let body: Record<string, unknown> | FormData
  if (mode.value === 'file') {
    if (!picked.value) { fileError.value = t('explain.fileProblems.empty'); return }
    const fd = new FormData()
    fd.append('file', picked.value) // exactly one of file | text, never both
    body = fd
  } else {
    const len = text.value.trim().length
    if (len < MIN_TEXT || len > maxText.value) { textError.value = len < MIN_TEXT ? t('housing.check.errors.too_short', { min: MIN_TEXT, max: maxText.value }) : t('housing.check.errors.too_long', { min: MIN_TEXT, max: maxText.value }); return }
    body = { text: text.value.trim() }
  }
  submitting.value = true
  try {
    const res = await request<ExplainResult>('documents/explain', { method: 'POST', body, timeoutMs: 90000 })
    result.value = res.data
    if (usage.value && res.data.usage) usage.value = { ...usage.value, remaining: res.data.usage.remaining }
    await nextTick()
    resultEl.value?.focus()
  } catch (e) {
    if (isConsentRequired(e, 'document_analysis')) needConsent.value = true
    else if (isApiError(e) && e.code === 'email_not_verified') needVerify.value = true
    else if (isApiError(e) && wantsTextFallback(e.code, e.details)) {
      // The server could not read the file: nothing was stored; offer paste mode right away.
      notice.value = { tone: 'warning', text: e.code === 'ocr_unavailable' ? t('explain.ocrUnavailable') : t('explain.ocrFallback') }
      picked.value = null; fileInput.value?.reset()
      mode.value = 'text'
    } else if (isApiError(e) && (FILE_ERROR_CODES as readonly string[]).includes(e.code)) fileError.value = t(`explain.serverFile.${e.code}`)
    else if (isApiError(e) && e.code === 'scanner_unavailable') notice.value = { tone: 'warning', text: t('explain.scannerUnavailable') }
    else if (isApiError(e) && e.status === 413) fileError.value = t('explain.fileProblems.too_large', { size: sizeLabel.value })
    else if (isApiError(e) && e.status === 429) notice.value = { tone: 'warning', text: e.code === 'quota_reached' ? t('explain.quotaReached') : t('explain.tooMany') }
    else {
      const fe = fieldErrors(e)
      if (fe.file) fileError.value = fe.file
      else if (fe.text) textError.value = fe.text
      else notice.value = { tone: 'danger', text: isApiError(e) ? e.message : t('errors.generic') }
    }
  } finally {
    submitting.value = false
  }
}
function again() { result.value = null; text.value = ''; picked.value = null }
</script>

<template>
  <div class="container-page max-w-3xl py-8 sm:py-12">
    <UiBreadcrumbs :items="crumbs" class="mb-6" />
    <header class="mb-6 space-y-2"><h1 class="text-2xl font-bold sm:text-3xl">{{ t('explain.title') }}</h1><p class="text-ink-soft">{{ t('explain.subtitle') }}</p></header>
    <UiAlert tone="info" class="mb-6" data-testid="explain-privacy">{{ t('explain.privacy') }}</UiAlert>
    <AuthVerifyNeeded v-if="needVerify" class="mb-6" />
    <ConsentGate v-if="granted === false || needConsent" purpose="document_analysis" class="mb-6" @granted="granted = true; needConsent = false" />

    <div v-if="result" ref="resultEl" tabindex="-1" class="space-y-6 outline-none" :aria-label="t('explain.resultTitle')">
      <div class="flex flex-wrap items-center justify-between gap-3"><h2 class="text-2xl font-bold">{{ t('explain.resultTitle') }}</h2><UiButton variant="secondary" @click="again"><UiIcon name="refresh" :size="18" />{{ t('explain.another') }}</UiButton></div>
      <ExplainResult :result="result" />
    </div>

    <form v-else class="space-y-5" novalidate @submit.prevent="submit">
      <p v-if="usage && usage.remaining !== null" class="text-sm text-muted" data-testid="explain-usage">{{ t('explain.remaining', { count: usage.remaining }) }}</p>
      <div role="group" :aria-label="t('explain.mode.label')" class="inline-flex flex-wrap gap-2">
        <UiButton :variant="mode === 'text' ? 'primary' : 'secondary'" :aria-pressed="mode === 'text'" data-testid="mode-text" @click="setMode('text')">{{ t('explain.mode.text') }}</UiButton>
        <UiButton :variant="mode === 'file' ? 'primary' : 'secondary'" :aria-pressed="mode === 'file'" data-testid="mode-file" @click="setMode('file')">{{ t('explain.mode.file') }}</UiButton>
      </div>
      <UiAlert v-if="mode === 'file' && !ocrAvailable" tone="warning" data-testid="ocr-off">{{ t('explain.ocrUnavailable') }}</UiAlert>
      <UiAlert v-if="notice" :tone="notice.tone" data-testid="explain-notice">{{ notice.text }}</UiAlert>
      <UiFormField v-if="mode === 'text'" :label="t('explain.text')" :hint="t('explain.textHint', { min: MIN_TEXT, max: maxText })" :error="textError" required>
        <UiTextarea v-model="text" :rows="10" :maxlength="maxText + 2000" />
      </UiFormField>
      <UiFormField v-else :label="t('explain.file')" :hint="t('explain.fileHint', { size: sizeLabel })" :error="fileError" required>
        <UiFileInput ref="fileInput" :accept="EXPLAIN_ACCEPT" @change="onPick" />
      </UiFormField>
      <UiButton type="submit" size="lg" :loading="submitting" :disabled="mode === 'file' && !ocrAvailable"><UiIcon name="file" :size="18" />{{ t('explain.submit') }}</UiButton>
    </form>
  </div>
</template>
