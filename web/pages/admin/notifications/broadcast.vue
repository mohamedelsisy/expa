<script setup lang="ts">
import { fieldErrors, isApiError } from '~/utils/errors'
import { useRoles } from '~/composables/useRoles'

definePageMeta({ layout: 'admin', middleware: 'admin' })
const { t } = useI18n()
const { request } = useApi()
const toast = useToast()
const { can } = usePermissions()
useAdminSeo(() => t('admin.broadcast.title'))
const LOCALES = ['ar', 'en', 'it'] as const
const form = reactive({ title: { ar: '', en: '', it: '' }, body: { ar: '', en: '', it: '' }, role: '' })
const { roles, load: loadRoles } = useRoles()
onMounted(() => { if (can('roles.view')) loadRoles() })
const errors = ref<Record<string, string>>({})
const failure = ref('')
const confirming = ref(false)
const busy = ref(false)
const sent = ref<{ recipients: number } | null>(null)

function review() {
  errors.value = {}; failure.value = ''; sent.value = null
  if (!form.title.ar.trim() || !form.body.ar.trim()) { errors.value = { 'title.ar': t('admin.broadcast.arabicRequired') }; return }
  confirming.value = true
}
const clean = (m: Record<string, string>) => Object.fromEntries(Object.entries(m).map(([k, v]) => [k, v.trim()]).filter(([, v]) => v))
async function send() {
  busy.value = true; failure.value = ''
  try {
    const res = await request<{ queued: boolean, recipients: number }>('admin/notifications/broadcast', { method: 'POST', body: { title: clean(form.title), body: clean(form.body), ...(form.role ? { role: form.role } : {}) } })
    sent.value = { recipients: res.data.recipients }
    toast.success(t('admin.broadcast.queued', { count: res.data.recipients }))
    for (const l of LOCALES) { form.title[l] = ''; form.body[l] = '' }
    confirming.value = false
  } catch (e) {
    errors.value = fieldErrors(e)
    failure.value = isApiError(e) && e.status === 429 ? t('admin.broadcast.rateLimited') : isApiError(e) && e.status === 403 ? t('admin.common.forbidden') : isApiError(e) ? e.message : t('errors.generic')
    confirming.value = false
  } finally { busy.value = false }
}
</script>

<template>
  <div>
    <AdminPageHeader :title="t('admin.broadcast.title')" :description="t('admin.broadcast.help')" :crumbs="[{ label: t('admin.title'), to: '/admin' }, { label: t('admin.broadcast.title') }]" />
    <UiAlert tone="info" class="mb-6">{{ t('admin.broadcast.note') }}</UiAlert>
    <div aria-live="polite">
      <UiAlert v-if="sent" tone="success" class="mb-4" data-testid="broadcast-sent">{{ t('admin.broadcast.queued', { count: sent.recipients }) }}</UiAlert>
      <UiAlert v-if="failure" tone="danger" class="mb-4">{{ failure }}</UiAlert>
    </div>
    <form class="max-w-3xl space-y-6" novalidate @submit.prevent="review">
      <fieldset v-for="l in LOCALES" :key="l" class="space-y-3 rounded-md border border-line p-4">
        <legend class="px-1 font-bold">{{ t(`languages.${l}`) }}<span v-if="l === 'ar'" class="text-danger"> *</span></legend>
        <UiFormField :label="t('admin.broadcast.subject')" :required="l === 'ar'" :optional="l !== 'ar'" :error="l === 'ar' ? errors['title.ar'] || errors.title : errors[`title.${l}`]">
          <UiTextInput v-model="form.title[l]" :maxlength="120" :dir="l === 'ar' ? 'rtl' : 'ltr'" />
        </UiFormField>
        <UiFormField :label="t('admin.broadcast.message')" :required="l === 'ar'" :optional="l !== 'ar'" :error="l === 'ar' ? errors['body.ar'] || errors.body : errors[`body.${l}`]">
          <UiTextarea v-model="form.body[l]" :rows="3" :maxlength="1000" :dir="l === 'ar' ? 'rtl' : 'ltr'" />
        </UiFormField>
      </fieldset>
      <UiFormField :label="t('admin.broadcast.audience')" :hint="t('admin.broadcast.audienceHint')" optional :error="errors.role">
        <UiSelect v-model="form.role" :options="(roles ?? []).map(r => ({ value: r.key, label: r.label }))" :placeholder="t('admin.broadcast.everyone')" />
      </UiFormField>
      <UiConfirmInline v-if="confirming" :message="t('admin.broadcast.confirm')" :confirm-label="t('admin.broadcast.send')" :loading="busy" @cancel="confirming = false" @confirm="send" />
      <UiButton v-else type="submit"><UiIcon name="send" :size="18" />{{ t('admin.broadcast.review') }}</UiButton>
    </form>
  </div>
</template>
