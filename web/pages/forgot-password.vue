<script setup lang="ts">
definePageMeta({ layout: 'auth', middleware: 'guest' })
const { t } = useI18n()
const localePath = useLocalePath()
const { request } = useApi()
useSeo(() => ({ title: t('auth.forgotTitle'), description: t('auth.forgotSubtitle'), noindex: true }))

const email = ref('')
const errors = ref<Record<string, string>>({})
const formError = ref('')
const done = ref('')
const busy = ref(false)

async function submit() {
  busy.value = true
  errors.value = {}
  formError.value = ''
  try {
    const res = await request<{ message: string }>('auth/forgot-password', { method: 'POST', body: { email: email.value }, handle401: false })
    done.value = res.data.message
  } catch (e) {
    errors.value = fieldErrors(e)
    if (!Object.keys(errors.value).length) formError.value = isApiError(e) ? e.message : t('errors.generic')
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold">{{ t('auth.forgotTitle') }}</h1>
    <p class="mt-1 text-ink-soft">{{ t('auth.forgotSubtitle') }}</p>
    <UiAlert v-if="done" tone="success" class="mt-6">{{ done }}</UiAlert>
    <form v-else class="mt-6 space-y-5" novalidate @submit.prevent="submit">
      <UiAlert v-if="formError" tone="danger">{{ formError }}</UiAlert>
      <UiFormField :label="t('auth.email')" :error="errors.email" required>
        <UiTextInput v-model="email" type="email" autocomplete="email" inputmode="email" ltr />
      </UiFormField>
      <UiButton type="submit" block :loading="busy">{{ t('auth.sendResetLink') }}</UiButton>
    </form>
    <p class="mt-6 text-center">
      <NuxtLink :to="localePath('/login')" class="inline-flex min-h-touch items-center text-primary-strong underline underline-offset-4">{{ t('auth.backToLogin') }}</NuxtLink>
    </p>
  </div>
</template>
