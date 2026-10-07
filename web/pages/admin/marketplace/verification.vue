<script setup lang="ts">
import type { EvidenceDoc } from '~/types/extra'
import { formatBytes } from '~/utils/documents'
import { formatDay } from '~/utils/locale'

definePageMeta({ layout: 'admin', middleware: 'admin' })
interface Row { id: number, display_name: string, category: string, slug: string, effective_verification: string, verification_requested_at: string | null, verification_expires_at: string | null, evidence_count?: number }
const { t, locale } = useI18n()
const { request, download } = useApi()
const toast = useToast()
useAdminSeo(() => t('admin.market.verification'))
const { data, error, refresh, status } = await useAsyncData('admin-verification', async () => (await request<{ pending: Row[], expiring: Row[] }>('admin/marketplace/verification-queue')).data)
const open = ref<number | null>(null)
const evidence = ref<EvidenceDoc[]>([])
const evError = ref('')
const form = reactive({ basis: '', expires_at: '', reason: '' })
const errs = ref<Record<string, string>>({})
const busy = ref(false)
async function openRow(r: Row) {
  open.value = r.id; Object.assign(form, { basis: '', expires_at: '', reason: '' }); errs.value = {}; evidence.value = []; evError.value = ''
  try { evidence.value = (await request<EvidenceDoc[]>(`admin/marketplace/providers/${r.id}/evidence`)).data } catch (e) { evError.value = isApiError(e) ? e.message : t('errors.generic') }
}
async function getDoc(id: number, d: EvidenceDoc) {
  try {
    const blob = await download(`admin/marketplace/providers/${id}/evidence/${d.id}`)
    const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = d.original_name; a.rel = 'noopener'; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 10000)
  } catch (e) { toast.error(isApiError(e) ? e.message : t('errors.generic')) }
}
async function decide(id: number, action: 'approve' | 'reject') {
  errs.value = {}
  if (action === 'approve' && form.basis.trim().length < 10) { errs.value.basis = t('admin.market.basisRequired'); return }
  if (action === 'reject' && !form.reason.trim()) { errs.value.reason = t('admin.market.reasonRequired'); return }
  busy.value = true
  try {
    await request(`admin/marketplace/providers/${id}/verification`, { method: 'POST', body: action === 'approve' ? { action, basis: form.basis.trim(), ...(form.expires_at ? { expires_at: form.expires_at } : {}) } : { action, reason: form.reason.trim() } })
    toast.success(t('admin.market.decided')); open.value = null; await refresh()
  } catch (e) { errs.value = fieldErrors(e); if (!Object.keys(errs.value).length) toast.error(isApiError(e) ? e.message : t('errors.generic')) } finally { busy.value = false }
}
const groups = computed(() => [{ key: 'pending', rows: data.value?.pending ?? [] }, { key: 'expiring', rows: data.value?.expiring ?? [] }])
</script>

<template>
  <div>
    <AdminPageHeader :title="t('admin.market.verification')" :description="t('admin.market.verificationHelp')" :crumbs="[{ label: t('admin.title'), to: '/admin' }, { label: t('admin.market.verification') }]" />
    <UiSkeleton v-if="status === 'pending' && !data" :lines="6" />
    <UiErrorState v-else-if="error" :message="isApiError(error) ? error.message : undefined" retry @retry="refresh()" />
    <div v-else class="space-y-8">
      <section v-for="g in groups" :key="g.key" :aria-labelledby="`vq-${g.key}`" class="space-y-3">
        <h2 :id="`vq-${g.key}`" class="text-xl font-bold">{{ t(`admin.market.queue.${g.key}`) }}</h2>
        <p v-if="!g.rows.length" class="text-muted">{{ t('admin.market.queueEmpty') }}</p>
        <ul v-else class="space-y-3">
          <li v-for="r in g.rows" :key="r.id" class="space-y-3 rounded-md border border-line bg-surface p-4">
            <div class="flex flex-wrap items-center justify-between gap-2"><p class="font-semibold" dir="auto">{{ r.display_name }} <UiBadge>{{ r.category }}</UiBadge></p><UiButton variant="secondary" :aria-expanded="open === r.id" @click="open === r.id ? open = null : openRow(r)">{{ t('admin.market.review') }}</UiButton></div>
            <p class="text-sm text-muted"><template v-if="r.verification_requested_at">{{ t('admin.market.requested', { date: formatDay(r.verification_requested_at, locale) }) }}</template><template v-if="r.verification_expires_at"> · {{ t('admin.market.expires', { date: formatDay(r.verification_expires_at, locale) }) }}</template></p>
            <div v-if="open === r.id" class="space-y-3 border-t border-line pt-3">
              <p class="text-sm text-ink-soft">{{ t('admin.market.evidenceNote') }}</p>
              <UiAlert v-if="evError" tone="warning">{{ evError }}</UiAlert>
              <p v-else-if="!evidence.length" class="text-muted">{{ t('admin.market.noEvidence') }}</p>
              <ul v-else class="space-y-1"><li v-for="d in evidence" :key="d.id" class="flex flex-wrap items-center gap-2"><span dir="auto">{{ d.original_name }}</span><span class="text-xs text-muted"><bdi>{{ formatBytes(d.size, locale) }}</bdi></span><UiButton variant="ghost" @click="getDoc(r.id, d)"><UiIcon name="download" :size="16" />{{ t('documents.attachments.download') }}</UiButton></li></ul>
              <UiFormField :label="t('admin.market.basis')" :hint="t('admin.market.basisHint')" :error="errs.basis"><UiTextarea v-model="form.basis" :rows="3" :maxlength="2000" /></UiFormField>
              <UiFormField :label="t('admin.market.expiresAt')" :error="errs.expires_at" optional><UiTextInput v-model="form.expires_at" type="date" ltr /></UiFormField>
              <UiFormField :label="t('admin.market.rejectReason')" :error="errs.reason" optional><UiTextInput v-model="form.reason" :maxlength="255" /></UiFormField>
              <div class="flex flex-wrap gap-2"><UiButton :loading="busy" @click="decide(r.id, 'approve')">{{ t('admin.market.approve') }}</UiButton><UiButton variant="secondary" :loading="busy" @click="decide(r.id, 'reject')">{{ t('admin.market.reject') }}</UiButton></div>
            </div>
          </li>
        </ul>
      </section>
    </div>
  </div>
</template>
