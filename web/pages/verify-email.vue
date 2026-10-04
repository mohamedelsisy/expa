<script setup lang="ts">
definePageMeta({ layout: 'auth' })
const { t } = useI18n()
const route = useRoute()
const auth = useAuthStore()
const { bff } = useApi()
useSeo(() => ({ title: t('verify.title'), description: t('verify.subtitle'), noindex: true }))

type State = 'working' | 'ok' | 'error'
const state = ref<State>('working')
const message = ref('')

onMounted(async () => {
  const url = route.query.url
  if (typeof url !== 'string' || !url) {
    state.value = 'error'
    message.value = t('verify.invalid')
    return
  }
  try {
    // The BFF validates host/path against the configured API before calling it (no SSRF / open redirect).
    await bff('verify-email', { body: { url } })
    state.value = 'ok'
    await auth.ensureLoaded(true)
  } catch (e) {
    state.value = 'error'
    message.value = isApiError(e) ? e.message : t('errors.generic')
  }
})
</script>

<template>
  <div class="text-center">
    <h1 class="text-2xl font-bold">{{ t('verify.title') }}</h1>
    <div class="mt-6" aria-live="polite">
      <div v-if="state === 'working'" class="space-y-3"><UiSkeleton :lines="2" /><span class="sr-only">{{ t('common.loading') }}</span></div>
      <UiAlert v-else-if="state === 'ok'" tone="success">{{ t('verify.success') }}</UiAlert>
      <UiAlert v-else tone="danger">{{ message }}</UiAlert>
    </div>
    <div class="mt-6">
      <UiButton v-if="state === 'ok'" :to="auth.isAuthenticated ? '/dashboard' : '/login'" block>{{ auth.isAuthenticated ? t('landing.cta.dashboard') : t('auth.login') }}</UiButton>
      <UiButton v-else-if="state === 'error'" :to="auth.isAuthenticated ? '/dashboard' : '/login'" variant="secondary" block>{{ auth.isAuthenticated ? t('verify.resendFromDashboard') : t('auth.login') }}</UiButton>
    </div>
  </div>
</template>
