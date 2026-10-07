<script setup lang="ts">
import type { EvidenceDoc, PortalProfile } from '~/types/extra'
import { formatBytes } from '~/utils/documents'
import { EXPLAIN_ACCEPT, validateExplainFile } from '~/utils/explain'
import { formatDateTime } from '~/utils/locale'

definePageMeta({ middleware: 'auth' })
const { t, locale } = useI18n()
const { request } = useApi()
const toast = useToast()
useSeo(() => ({ title: t('provider.verify.title'), description: t('provider.verify.intro'), noindex: true }))
const portal = useProviderPortal()
/** Mirrors backend config/marketplace.php `evidence` (the API stays the authority). */
const MAX_KB = 5 * 1024
const MAX_FILES = 5
const { data: docs, error, refresh, status } = await useAsyncData('provider-evidence', async () => {
  await portal.load()
  if (portal.state.value !== 'ready') return [] as EvidenceDoc[]
  return (await request<EvidenceDoc[]>('provider/verification/documents')).data
})
const picked = ref<File | null>(null)
const fileError = ref<string | undefined>()
const uploading = ref(false)
const fileInput = ref<{ reset: () => void } | null>(null)
const confirmId = ref<number | null>(null)
const busy = ref(false)
const requesting = ref(false)
const reqError = ref<string | null>(null)

function onPick(e: Event) {
  const f = (e.target as HTMLInputElement).files?.[0] ?? null
  picked.value = null; fileError.value = undefined
  if (!f) return
  const p = validateExplainFile(f, MAX_KB)
  if (p) { fileError.value = t(`provider.verify.fileProblems.${p}`, { size: formatBytes(MAX_KB * 1024, locale.value) }); return }
  picked.value = f
}
async function upload() {
  if (!picked.value) { fileError.value = t('provider.verify.fileProblems.empty'); return }
  if ((docs.value?.length ?? 0) >= MAX_FILES) { fileError.value = t('provider.verify.maxFiles', { count: MAX_FILES }); return }
  uploading.value = true
  const fd = new FormData()
  fd.append('file', picked.value)
  try {
    await request('provider/verification/documents', { method: 'POST', body: fd, timeoutMs: 60000 })
    toast.success(t('provider.verify.uploaded'))
    picked.value = null; fileInput.value?.reset()
    await refresh()
  } catch (e) {
    const fe = fieldErrors(e)
    fileError.value = fe.file ?? (isApiError(e) ? (e.status === 413 ? t('provider.verify.fileProblems.too_large', { size: formatBytes(MAX_KB * 1024, locale.value) }) : e.message) : t('errors.generic'))
  } finally { uploading.value = false }
}
async function remove(id: number) {
  busy.value = true
  try { await request(`provider/verification/documents/${id}`, { method: 'DELETE' }); confirmId.value = null; toast.success(t('provider.verify.deleted')); await refresh() } catch (e) { toast.error(isApiError(e) ? e.message : t('errors.generic')) } finally { busy.value = false }
}
async function requestVerification() {
  requesting.value = true
  reqError.value = null
  try {
    portal.set((await request<PortalProfile>('provider/verification/request', { method: 'POST' })).data)
    toast.success(t('provider.verify.requested'))
  } catch (e) {
    reqError.value = isApiError(e) && e.code === 'verification_evidence_required' ? t('provider.verify.evidenceRequired') : (isApiError(e) ? e.message : t('errors.generic'))
  } finally { requesting.value = false }
}
const p = computed(() => portal.profile.value)
const vStatus = computed(() => String(p.value?.effective_verification ?? p.value?.verification_status ?? 'unverified'))
</script>

<template>
  <div class="container-page max-w-3xl py-8 sm:py-12">
    <h1 class="mb-6 text-2xl font-bold sm:text-3xl">{{ t('provider.verify.title') }}</h1>
    <ProviderNav />
    <div v-if="status === 'pending' && !docs" aria-busy="true"><UiSkeleton block :lines="4" /></div>
    <UiErrorState v-else-if="error" :message="isApiError(error) ? error.message : undefined" retry @retry="refresh()" />
    <UiEmptyState v-else-if="portal.state.value !== 'ready' || !p" :title="t('provider.noListingTitle')" :description="t('provider.noListing')" icon="user"><UiButton to="/provider">{{ t('provider.apply.title') }}</UiButton></UiEmptyState>
    <div v-else class="space-y-8">
      <UiAlert tone="info">{{ t('provider.verify.intro') }}</UiAlert>
      <p class="flex flex-wrap items-center gap-2"><span class="font-medium">{{ t('provider.overview.verification') }}:</span><UiBadge data-testid="verification-status">{{ t(`provider.verification.${vStatus}`) }}</UiBadge></p>
      <section aria-labelledby="ev-h" class="space-y-3">
        <h2 id="ev-h" class="text-xl font-bold">{{ t('provider.verify.documents') }}</h2>
        <p class="flex items-start gap-2 text-sm text-ink-soft"><UiIcon name="lock" :size="16" class="mt-0.5" />{{ t('provider.verify.privacy') }}</p>
        <p v-if="!docs?.length" class="text-muted">{{ t('provider.verify.noDocs') }}</p>
        <ul v-else class="divide-y divide-line rounded-md border border-line bg-surface">
          <li v-for="d in docs" :key="d.id" class="space-y-2 p-3">
            <div class="flex flex-wrap items-center justify-between gap-2">
              <div class="min-w-0"><p class="truncate font-medium" dir="auto">{{ d.original_name }}</p><p class="text-xs text-muted"><bdi>{{ formatBytes(d.size, locale) }}</bdi> · <bdi>{{ formatDateTime(d.created_at, locale) }}</bdi></p></div>
              <UiButton variant="ghost" :aria-label="`${t('common.delete')}: ${d.original_name}`" @click="confirmId = d.id"><UiIcon name="trash" :size="16" />{{ t('common.delete') }}</UiButton>
            </div>
            <UiConfirmInline v-if="confirmId === d.id" :message="t('provider.verify.deleteConfirm')" :confirm-label="t('common.delete')" :loading="busy" @confirm="remove(d.id)" @cancel="confirmId = null" />
          </li>
        </ul>
        <form class="space-y-3 rounded-md border border-dashed border-line-strong p-4" novalidate @submit.prevent="upload">
          <UiFormField :label="t('provider.verify.file')" :hint="t('provider.verify.fileHint', { size: formatBytes(MAX_KB * 1024, locale), count: MAX_FILES })" :error="fileError"><UiFileInput ref="fileInput" :accept="EXPLAIN_ACCEPT" @change="onPick" /></UiFormField>
          <UiButton type="submit" :loading="uploading" :disabled="!picked"><UiIcon name="upload" :size="18" />{{ t('provider.verify.upload') }}</UiButton>
        </form>
      </section>
      <section aria-labelledby="rq-h" class="space-y-3">
        <h2 id="rq-h" class="text-xl font-bold">{{ t('provider.verify.request') }}</h2>
        <p class="text-ink-soft">{{ t('provider.verify.requestNote') }}</p>
        <UiAlert v-if="reqError" tone="warning">{{ reqError }}</UiAlert>
        <UiButton :loading="requesting" :disabled="!docs?.length" @click="requestVerification">{{ t('provider.verify.requestButton') }}</UiButton>
      </section>
    </div>
  </div>
</template>
