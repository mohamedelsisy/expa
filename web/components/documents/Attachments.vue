<script setup lang="ts">
import type { UserDocument } from '~/types/api'
import { ACCEPT, formatBytes, validateUpload } from '~/utils/documents'
import { isConsentRequired } from '~/utils/errors'
import { formatDateTime } from '~/utils/locale'

const props = defineProps<{ doc: UserDocument }>()
const emit = defineEmits<{ changed: [doc: UserDocument] }>()
const { t, locale } = useI18n()
const { request, download } = useApi()
const toast = useToast()

const picked = ref<File | null>(null)
const problem = ref<string | null>(null)
const serverError = ref<string | null>(null)
const uploading = ref(false)
const needConsent = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)
const confirmId = ref<number | null>(null)
const deleting = ref(false)
const downloading = ref<number | null>(null)

function onPick(e: Event) {
  const f = (e.target as HTMLInputElement).files?.[0] ?? null
  serverError.value = null
  picked.value = null
  problem.value = null
  if (!f) return
  const p = validateUpload(f)
  if (p) { problem.value = t(`documents.upload.${p}`); return }
  picked.value = f
}

async function upload() {
  if (!picked.value) return
  uploading.value = true
  serverError.value = null
  const fd = new FormData()
  fd.append('file', picked.value)
  try {
    const res = await request<UserDocument>(`my-documents/${props.doc.id}/attachments`, { method: 'POST', body: fd, timeoutMs: 60000 })
    toast.success(t('documents.upload.done'))
    picked.value = null
    if (fileInput.value) fileInput.value.value = ''
    emit('changed', res.data)
  } catch (e) {
    if (isConsentRequired(e, 'document_storage')) needConsent.value = true
    else {
      const fe = fieldErrors(e)
      serverError.value = fe.file ?? (isApiError(e) ? (e.status === 413 ? t('documents.upload.too_large') : e.message) : t('errors.generic'))
    }
  } finally {
    uploading.value = false
  }
}

async function get(a: { id: number, name: string }) {
  downloading.value = a.id
  try {
    const blob = await download(`my-documents/${props.doc.id}/attachments/${a.id}`)
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = a.name
    link.rel = 'noopener'
    document.body.appendChild(link)
    link.click()
    link.remove()
    setTimeout(() => URL.revokeObjectURL(url), 10000)
  } catch (e) {
    toast.error(isApiError(e) ? e.message : t('errors.generic'))
  } finally {
    downloading.value = null
  }
}

async function remove(id: number) {
  deleting.value = true
  try {
    await request(`my-documents/${props.doc.id}/attachments/${id}`, { method: 'DELETE' })
    toast.success(t('documents.attachments.deleted'))
    confirmId.value = null
    const res = await request<UserDocument>(`my-documents/${props.doc.id}`)
    emit('changed', res.data)
  } catch (e) {
    toast.error(isApiError(e) ? e.message : t('errors.generic'))
  } finally {
    deleting.value = false
  }
}
</script>

<template>
  <section aria-labelledby="att-h" class="space-y-4">
    <h2 id="att-h" class="text-xl font-bold">{{ t('documents.attachments.title') }}</h2>
    <p class="flex items-start gap-2 text-sm text-ink-soft"><UiIcon name="lock" :size="16" class="mt-0.5" />{{ t('documents.attachments.privacy') }}</p>

    <p v-if="!doc.attachments.length" class="text-muted">{{ t('documents.attachments.empty') }}</p>
    <ul v-else class="divide-y divide-line rounded-md border border-line bg-surface">
      <li v-for="a in doc.attachments" :key="a.id" class="space-y-2 p-3">
        <div class="flex flex-wrap items-center justify-between gap-2">
          <div class="min-w-0">
            <p class="truncate font-medium" dir="auto">{{ a.name }}</p>
            <p class="flex flex-wrap gap-x-2 text-xs text-muted"><bdi dir="ltr">{{ formatBytes(a.size) }}</bdi><span aria-hidden="true">·</span><bdi dir="ltr">{{ formatDateTime(a.created_at, locale) }}</bdi></p>
          </div>
          <div class="flex gap-2">
            <UiButton variant="secondary" :loading="downloading === a.id" :aria-label="`${t('documents.attachments.download')}: ${a.name}`" @click="get(a)"><UiIcon name="download" :size="16" />{{ t('documents.attachments.download') }}</UiButton>
            <UiButton variant="ghost" :aria-label="`${t('common.delete')}: ${a.name}`" @click="confirmId = a.id"><UiIcon name="trash" :size="16" />{{ t('common.delete') }}</UiButton>
          </div>
        </div>
        <UiConfirmInline v-if="confirmId === a.id" :message="t('documents.attachments.deleteConfirm')" :confirm-label="t('common.delete')" :loading="deleting" @confirm="remove(a.id)" @cancel="confirmId = null" />
      </li>
    </ul>

    <ConsentGate v-if="needConsent" purpose="document_storage" @granted="needConsent = false; upload()" />
    <form class="space-y-3 rounded-md border border-dashed border-line-strong p-4" novalidate @submit.prevent="upload">
      <UiFormField :label="t('documents.upload.label')" :hint="t('documents.upload.hint')" :error="problem ?? serverError ?? undefined">
        <input ref="fileInput" type="file" :accept="ACCEPT" class="block min-h-touch w-full rounded-md border border-line-strong bg-surface p-2 text-ink file:me-3 file:rounded-md file:border-0 file:bg-primary-soft file:px-3 file:py-2 file:font-medium file:text-primary-strong" @change="onPick">
      </UiFormField>
      <UiButton type="submit" :loading="uploading" :disabled="!picked"><UiIcon name="upload" :size="18" />{{ t('documents.upload.button') }}</UiButton>
    </form>
  </section>
</template>
