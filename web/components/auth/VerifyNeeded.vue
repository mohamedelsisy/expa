<script setup lang="ts">
/** Shown when an API feature is gated by a verified email (403 `email_not_verified`). */
const { t } = useI18n()
const { request } = useApi()
const toast = useToast()
const sending = ref(false)
async function resend() {
  sending.value = true
  try {
    await request('auth/resend-verification', { method: 'POST' })
    toast.success(t('verify.resent'))
  } catch (e) {
    toast.error(isApiError(e) ? e.message : t('errors.generic'))
  } finally {
    sending.value = false
  }
}
</script>

<template>
  <UiAlert tone="warning" :title="t('verify.neededTitle')" data-testid="verify-needed">
    <p>{{ t('verify.neededBody') }}</p>
    <UiButton variant="secondary" class="mt-3" :loading="sending" @click="resend">{{ t('verify.resend') }}</UiButton>
  </UiAlert>
</template>
