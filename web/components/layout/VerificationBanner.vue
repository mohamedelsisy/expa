<script setup lang="ts">
const { t } = useI18n()
const auth = useAuthStore()
const { request } = useApi()
const toast = useToast()
const sending = ref(false)

async function resend() {
  sending.value = true
  try {
    const res = await request<{ message: string }>('auth/resend-verification', { method: 'POST' })
    toast.success(res.data?.message ?? t('verify.resent'))
  } catch (e) {
    toast.error(isApiError(e) ? e.message : t('errors.generic'))
  } finally {
    sending.value = false
  }
}
</script>

<template>
  <div v-if="auth.user && !auth.user.email_verified" class="container-page pt-4">
    <UiAlert tone="warning" :title="t('verify.pendingTitle')">
      <p>{{ t('verify.pendingBody', { email: auth.user.email }) }}</p>
      <UiButton variant="secondary" class="mt-3" :loading="sending" @click="resend">{{ t('verify.resend') }}</UiButton>
    </UiAlert>
  </div>
</template>
