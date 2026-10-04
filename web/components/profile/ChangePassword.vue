<script setup lang="ts">
const { t } = useI18n()
const { request } = useApi()
const toast = useToast()
const form = reactive({ current: '', next: '', confirm: '' })
const errors = ref<Record<string, string>>({})
const saving = ref(false)
const done = ref(false)

async function submit() {
  errors.value = {}
  done.value = false
  if (form.next !== form.confirm) { errors.value = { password_confirmation: t('auth.passwordMismatch') }; return }
  saving.value = true
  try {
    await request('auth/change-password', { method: 'POST', body: { current_password: form.current, password: form.next, password_confirmation: form.confirm } })
    form.current = form.next = form.confirm = ''
    done.value = true
    toast.success(t('profile.passwordChanged'))
  } catch (e) {
    errors.value = fieldErrors(e)
    if (!Object.keys(errors.value).length) toast.error(isApiError(e) ? e.message : t('errors.generic'))
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <UiCard as="section" aria-labelledby="pw-h" class="space-y-5">
    <h2 id="pw-h" class="text-xl font-bold">{{ t('profile.changePassword') }}</h2>
    <p class="text-ink-soft">{{ t('profile.changePasswordHint') }}</p>
    <form class="space-y-5" novalidate @submit.prevent="submit">
      <UiFormField :label="t('profile.currentPassword')" :error="errors.current_password" required><UiPasswordInput v-model="form.current" autocomplete="current-password" /></UiFormField>
      <UiFormField :label="t('auth.newPassword')" :hint="t('auth.passwordHint')" :error="errors.password" required><UiPasswordInput v-model="form.next" autocomplete="new-password" /></UiFormField>
      <UiFormField :label="t('auth.passwordConfirm')" :error="errors.password_confirmation" required><UiPasswordInput v-model="form.confirm" autocomplete="new-password" /></UiFormField>
      <UiButton type="submit" :loading="saving">{{ t('profile.changePassword') }}</UiButton>
    </form>
  </UiCard>
</template>
