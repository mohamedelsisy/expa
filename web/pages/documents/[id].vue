<script setup lang="ts">
import type { DocumentType, UserDocument } from '~/types/api'
import { formatDay } from '~/utils/locale'

definePageMeta({ middleware: 'auth' })
const { t, locale } = useI18n()
const route = useRoute()
const { request } = useApi()
const toast = useToast()
const localePath = useLocalePath()
const id = computed(() => String(route.params.id))

const { data, error, refresh, status } = await useAsyncData(() => `document-${id.value}`, async () => {
  const [doc, types] = await Promise.all([request<UserDocument>(`my-documents/${encodeURIComponent(id.value)}`), request<DocumentType[]>('document-types')])
  return { doc: doc.data, types: types.data }
}, { watch: [locale] })
if (isApiError(error.value) && error.value.status === 404) throw createError({ statusCode: 404, statusMessage: 'Not Found', fatal: true })

const doc = ref<UserDocument | null>(data.value?.doc ?? null)
watch(data, (d) => { if (d) doc.value = d.doc })
useSeo(() => ({ title: doc.value?.display_name ?? t('documents.title'), description: t('documents.subtitle'), noindex: true }))

const editing = ref(false)
const confirmDelete = ref(false)
const deleting = ref(false)
const crumbs = computed(() => [{ label: t('documents.title'), to: '/documents' }, { label: doc.value?.display_name ?? '' }])

function saved(d: UserDocument) { doc.value = d; editing.value = false }
async function remove() {
  deleting.value = true
  try {
    await request(`my-documents/${id.value}`, { method: 'DELETE' })
    toast.success(t('documents.deleted'))
    await navigateTo(localePath('/documents'))
  } catch (e) {
    toast.error(isApiError(e) ? e.message : t('errors.generic'))
  } finally {
    deleting.value = false
  }
}
</script>

<template>
  <div class="container-page max-w-3xl py-8 sm:py-12">
    <UiBreadcrumbs :items="crumbs" class="mb-6" />
    <div v-if="status === 'pending' && !doc" aria-busy="true"><UiSkeleton block :lines="4" /></div>
    <UiErrorState v-else-if="error || !doc || !data" :message="isApiError(error) ? error.message : undefined" retry @retry="refresh()" />
    <div v-else class="space-y-8">
      <header class="space-y-3">
        <DocumentsStatusBadge :status="doc.status" :days="doc.days_remaining" />
        <h1 class="text-2xl font-bold sm:text-3xl">{{ doc.display_name }}</h1>
        <p v-if="doc.label" class="text-ink-soft">{{ doc.type.name }}</p>
      </header>

      <UiCard v-if="editing"><DocumentsForm :doc="doc" :types="data.types" @saved="saved" /><UiButton variant="ghost" class="mt-3" @click="editing = false">{{ t('common.cancel') }}</UiButton></UiCard>
      <UiCard v-else as="section" aria-labelledby="det-h" class="space-y-4">
        <div class="flex items-center justify-between gap-3">
          <h2 id="det-h" class="text-xl font-bold">{{ t('documents.details') }}</h2>
          <UiButton variant="secondary" @click="editing = true"><UiIcon name="edit" :size="16" />{{ t('documents.edit') }}</UiButton>
        </div>
        <dl class="grid gap-4 sm:grid-cols-2">
          <div><dt class="text-sm text-muted">{{ t('documents.form.issue') }}</dt><dd class="font-medium">{{ doc.issue_date ? formatDay(doc.issue_date, locale) : '–' }}</dd></div>
          <div><dt class="text-sm text-muted">{{ t('documents.form.expiry') }}</dt><dd class="font-medium">{{ doc.expiry_date ? formatDay(doc.expiry_date, locale) : t('documents.status.no_expiry') }}</dd></div>
          <div v-if="doc.notes" class="sm:col-span-2"><dt class="text-sm text-muted">{{ t('documents.form.notes') }}</dt><dd class="prose-plain" dir="auto">{{ doc.notes }}</dd></div>
        </dl>
        <div>
          <h3 class="font-bold">{{ t('documents.reminders') }}</h3>
          <p v-if="!doc.reminders_enabled" class="text-muted">{{ t('documents.remindersOff') }}</p>
          <p v-else-if="!doc.expiry_date" class="text-muted">{{ t('documents.remindersNeedExpiry') }}</p>
          <ul v-else-if="doc.upcoming_reminders.length" class="mt-1 space-y-1" data-testid="upcoming-reminders">
            <li v-for="r in doc.upcoming_reminders" :key="r.on + r.kind" class="flex items-center gap-2"><UiIcon name="bell" :size="16" class="text-muted" /><time :datetime="r.on">{{ formatDay(r.on, locale) }}</time><span v-if="r.kind === 'before' && r.offset_days !== null && r.offset_days >= 0" class="text-sm text-muted">({{ t('documents.daysBefore', { count: r.offset_days }) }})</span><span v-else-if="r.kind === 'expired'" class="text-sm text-muted">({{ t('documents.afterExpiry') }})</span></li>
          </ul>
          <p v-else class="text-muted">{{ t('documents.noUpcoming') }}</p>
        </div>
      </UiCard>

      <UiCard><DocumentsAttachments :doc="doc" @changed="doc = $event" /></UiCard>

      <div>
        <UiButton v-if="!confirmDelete" variant="ghost" class="text-danger" @click="confirmDelete = true"><UiIcon name="trash" :size="16" />{{ t('documents.delete') }}</UiButton>
        <UiConfirmInline v-else :message="t('documents.deleteConfirm')" :confirm-label="t('documents.delete')" :loading="deleting" @confirm="remove" @cancel="confirmDelete = false" />
      </div>
    </div>
  </div>
</template>
