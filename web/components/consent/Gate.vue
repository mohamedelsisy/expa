<script setup lang="ts">
import type { ConsentsPayload, PurposesPayload } from '~/types/api'

/**
 * Shown when an action needs an optional consent (403 `consent_required`). Explains why using the API's own
 * purpose text and offers a one-click grant through PUT /profile/consents. Withdrawal stays in Privacy settings.
 */
const props = defineProps<{ purpose: string }>()
const emit = defineEmits<{ granted: [] }>()
const { t, locale } = useI18n()
const { request } = useApi()
const toast = useToast()

const { data } = await useAsyncData(() => `purposes-${props.purpose}-${locale.value}`, async () => {
  try {
    const res = await request<PurposesPayload>('privacy/purposes')
    return res.data.purposes.find(p => p.key === props.purpose) ?? null
  } catch {
    return null
  }
}, { watch: [locale] })

const granting = ref(false)
async function grant() {
  granting.value = true
  try {
    await request<ConsentsPayload>('profile/consents', { method: 'PUT', body: { consents: { [props.purpose]: true } } })
    toast.success(t('consentGate.granted'))
    emit('granted')
  } catch (e) {
    toast.error(isApiError(e) ? e.message : t('errors.generic'))
  } finally {
    granting.value = false
  }
}
</script>

<template>
  <UiAlert tone="info" :title="data?.title ?? t('consentGate.title')" data-testid="consent-gate">
    <p>{{ data?.why ?? t(`consentGate.why.${purpose}`) }}</p>
    <details v-if="data?.data" class="mt-2 text-sm">
      <summary class="inline-flex min-h-touch cursor-pointer items-center font-medium text-primary-strong">{{ t('privacy.dataCollected') }}</summary>
      <p class="text-ink-soft">{{ data.data }}</p>
    </details>
    <p class="mt-2 text-sm text-ink-soft">{{ t('consentGate.withdraw') }}</p>
    <div class="mt-3 flex flex-wrap gap-2">
      <UiButton :loading="granting" @click="grant">{{ t('consentGate.allow') }}</UiButton>
      <UiButton to="/privacy-settings" variant="secondary">{{ t('nav.privacy') }}</UiButton>
    </div>
  </UiAlert>
</template>
