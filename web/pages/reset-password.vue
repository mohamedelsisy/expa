<script setup lang="ts">
definePageMeta({ layout: 'auth' })
const { t } = useI18n()
const route = useRoute()
const localePath = useLocalePath()
const { request } = useApi()
useSeo(() => ({ title: t('auth.resetTitle'), description: t('auth.resetSubtitle'), noindex: true }))

const token = computed(() => String(route.query.token ?? ''))
const email = ref(String(route.query.email ?? ''))
const form = reactive({ password: '', password_confirmation: '' })
const errors = ref<Record<string, string>>({})
const formError = ref('')
const done = ref('')
const busy = ref(false)
const linkMissing = computed(() => !token.value)

async function submit() {
  busy.value = true
  errors.value = {}
  formError.value = ''
  try {
    const res = await request<{ message: string }>('auth/reset-password', {
      method: 'POST', handle401: false,
      body: { token: token.value, email: email.value, ...form },
    })
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
    <h1 class="text-2xl font-bold">{{ t('auth.resetTitle') }}</h1>
    <UiAlert v-if="linkMissing" tone="danger" class="mt-6">{{ t('auth.resetLinkMissing') }}</UiAlert>
    <template v-else-if="done">
      <UiAlert tone="success" class="mt-6">{{ done }}</UiAlert>
      <UiButton to="/login" block class="mt-6">{{ t('auth.login') }}</UiButton>
    </template>
    <form v-else class="mt-6 space-y-5" novalidate @submit.prevent="submit">
      <p class="text-ink-soft">{{ t('auth.resetSubtitle') }}</p>
      <UiAlert v-if="formError" tone="danger">{{ formError }}</UiAlert>
      <UiFormField :label="t('auth.email')" :error="errors.email" required>
        <UiTextInput v-model="email" type="email" autocomplete="email" ltr />
      </UiFormField>
      <UiFormField :label="t('auth.newPassword')" :hint="t('auth.passwordHint')" :error="errors.password" required>
        <UiPasswordInput v-model="form.password" autocomplete="new-password" />
      </UiFormField>
      <UiFormField :label="t('auth.passwordConfirm')" :error="errors.password_confirmation" required>
        <UiPasswordInput v-model="form.password_confirmation" autocomplete="new-password" />
      </UiFormField>
      <UiButton type="submit" block :loading="busy">{{ t('auth.resetSubmit') }}</UiButton>
    </form>
    <p class="mt-6 text-center">
      <NuxtLink :to="localePath('/forgot-password')" class="inline-flex min-h-touch items-center text-primary-strong underline underline-offset-4">{{ t('auth.requestNewLink') }}</NuxtLink>
    </p>
  </div>
</template>
