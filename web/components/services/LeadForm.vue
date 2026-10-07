<script setup lang="ts">
import type { MyLead } from '~/types/extra'
import { SERVICE_LANGUAGES, buildLeadBody, languageName, validateLead, type LeadForm } from '~/utils/services'

/**
 * Request-contact form. It sends a REQUEST to the provider, never a booking. Sharing the contact details needs an
 * explicit, unticked-by-default consent (`consent_share_contact`).
 */
const props = defineProps<{ slug: string, name: string }>()
const { t, locale } = useI18n()
const { request } = useApi()
const form = reactive<LeadForm>({ message: '', request_type: 'contact', preferred_language: '', contact_name: '', contact_email: '', contact_phone: '', consent: false })
const errors = ref<Record<string, string>>({})
const submitting = ref(false)
const needVerify = ref(false)
const notice = ref<{ tone: 'warning' | 'danger', text: string } | null>(null)
const sent = ref<MyLead | null>(null)
const langOptions = computed(() => SERVICE_LANGUAGES.map(l => ({ value: l, label: languageName(l, locale.value) })))
const typeOptions = computed(() => ['contact', 'booking'].map(v => ({ value: v, label: t(`services.lead.types.${v}`) })))

async function submit() {
  errors.value = {}
  notice.value = null
  needVerify.value = false
  const problems = validateLead(form)
  if (Object.keys(problems).length) {
    for (const [k, v] of Object.entries(problems)) errors.value[k] = t(`services.lead.errors.${v}`, { max: 5000 })
    return
  }
  submitting.value = true
  try {
    sent.value = (await request<MyLead>(`providers/${encodeURIComponent(props.slug)}/leads`, { method: 'POST', body: buildLeadBody(form) })).data
  } catch (e) {
    if (isApiError(e) && e.code === 'email_not_verified') needVerify.value = true
    else if (isApiError(e) && e.code === 'lead_cooldown') notice.value = { tone: 'warning', text: t('services.lead.cooldown') }
    else if (isApiError(e) && e.status === 429) notice.value = { tone: 'warning', text: e.message }
    else {
      errors.value = fieldErrors(e)
      if (!Object.keys(errors.value).length) notice.value = { tone: 'danger', text: isApiError(e) ? e.message : t('errors.generic') }
    }
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <section class="space-y-3" aria-labelledby="ld-h" data-testid="lead-section">
    <h3 id="ld-h" class="text-lg font-bold">{{ t('services.lead.title', { name }) }}</h3>
    <UiAlert v-if="sent" tone="success" :title="t('services.lead.sentTitle')" data-testid="lead-sent">
      <p>{{ sent.notice ?? t('services.lead.sentBody') }}</p>
      <p class="mt-1 text-sm">{{ t('services.lead.notBooking') }}</p>
      <UiButton to="/my-requests" variant="secondary" class="mt-2">{{ t('services.myRequests') }}</UiButton>
    </UiAlert>
    <form v-else class="space-y-4" novalidate @submit.prevent="submit">
      <UiAlert tone="info">{{ t('services.lead.notBooking') }}</UiAlert>
      <AuthVerifyNeeded v-if="needVerify" />
      <UiFormField :label="t('services.lead.type')"><UiSelect v-model="form.request_type" :options="typeOptions" /></UiFormField>
      <UiFormField :label="t('services.lead.message')" :error="errors.message" required><UiTextarea v-model="form.message" :rows="5" :maxlength="5100" /></UiFormField>
      <div class="grid gap-4 sm:grid-cols-2">
        <UiFormField :label="t('services.lead.name')" optional><UiTextInput v-model="form.contact_name" autocomplete="name" :maxlength="120" /></UiFormField>
        <UiFormField :label="t('services.lead.language')" optional><UiSelect v-model="form.preferred_language" :options="langOptions" :placeholder="t('services.anyLanguage')" /></UiFormField>
        <UiFormField :label="t('services.lead.email')" :error="errors.contact_email" optional><UiTextInput v-model="form.contact_email" type="email" autocomplete="email" ltr :maxlength="190" /></UiFormField>
        <UiFormField :label="t('services.lead.phone')" :error="errors.contact_phone" optional><UiTextInput v-model="form.contact_phone" type="tel" autocomplete="tel" ltr :maxlength="25" /></UiFormField>
      </div>
      <div class="rounded-md border border-line bg-sunken p-3">
        <UiCheckbox v-model="form.consent" :invalid="!!errors.consent" :label="t('services.lead.consent', { name })" :description="t('services.lead.consentHint')" />
        <p v-if="errors.consent" class="text-sm text-danger" role="alert" data-testid="consent-error">{{ errors.consent }}</p>
      </div>
      <UiAlert v-if="notice" :tone="notice.tone">{{ notice.text }}</UiAlert>
      <UiButton type="submit" :loading="submitting"><UiIcon name="send" :size="18" />{{ t('services.lead.submit') }}</UiButton>
    </form>
  </section>
</template>
