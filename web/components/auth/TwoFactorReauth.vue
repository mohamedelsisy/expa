<script setup lang="ts">
import { codePayload, isRecovery, isTotp, retryAfterOf } from '~/utils/twoFactor'

/** Password + (code | recovery code) form used to turn 2FA off or to create new recovery codes. */
const props = defineProps<{ kind: 'disable' | 'regen' }>()
const emit = defineEmits<{ done: [codes: string[] | null], cancel: [] }>()
const { t } = useI18n()
const { request } = useApi()

const password = ref('')
const mode = ref<'code' | 'recovery'>('code')
const value = ref('')
const errors = ref<Record<string, string>>({})
const formError = ref('')
const busy = ref(false)
const fields = ref<{ focus: () => void } | null>(null)
const root = ref<HTMLElement | null>(null)

async function submit() {
  errors.value = {}
  formError.value = ''
  const body = codePayload(mode.value, value.value)
  if (!password.value) errors.value.password = t('twoFactor.errors.passwordRequired')
  if (!body || !(mode.value === 'code' ? isTotp(value.value) : isRecovery(value.value))) errors.value.code = body ? t('twoFactor.errors.invalidCode') : t('twoFactor.errors.codeRequired')
  if (Object.keys(errors.value).length) {
    await nextTick()
    root.value?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus()
    return
  }
  busy.value = true
  try {
    const path = props.kind === 'disable' ? 'auth/2fa/disable' : 'auth/2fa/recovery-codes'
    const res = await request<{ recovery_codes?: string[] }>(path, { method: 'POST', body: { password: password.value, ...body } })
    password.value = ''
    emit('done', props.kind === 'regen' ? (res.data?.recovery_codes ?? []) : null)
  } catch (e) {
    if (!isApiError(e)) { formError.value = t('errors.generic'); return }
    if (e.status === 422) {
      const fe = fieldErrors(e)
      if (e.code === 'invalid_two_factor_code') errors.value.code = t('twoFactor.errors.invalidCode')
      else { if (fe.password) errors.value.password = fe.password; if (fe.code || fe.recovery_code) errors.value.code = (fe.code || fe.recovery_code)! }
      if (!Object.keys(errors.value).length) formError.value = e.message
      await nextTick()
      root.value?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus()
      return
    }
    if (e.status === 429) { const s = retryAfterOf(e); formError.value = s ? t('twoFactor.errors.rateLimited', { seconds: s }) : t('twoFactor.errors.rateLimitedLater'); return }
    if (e.status === 409) { formError.value = e.code === 'two_factor_not_enabled' ? t('twoFactor.errors.notEnabled') : e.message; return }
    formError.value = e.message
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <form ref="root" class="space-y-5 rounded-lg border border-line bg-surface p-4 sm:p-5" novalidate :aria-label="kind === 'disable' ? t('twoFactor.manage.disableTitle') : t('twoFactor.manage.regenTitle')" :data-testid="`two-factor-${kind}`" @submit.prevent="submit" @keydown.esc.stop="emit('cancel')">
    <p class="text-ink-soft">{{ kind === 'disable' ? t('twoFactor.manage.disableHelp') : t('twoFactor.manage.regenHelp') }}</p>
    <UiAlert v-if="formError" tone="danger">{{ formError }}</UiAlert>
    <UiFormField :label="t('twoFactor.manage.password')" :hint="t('twoFactor.manage.passwordHint')" :error="errors.password" required>
      <UiPasswordInput v-model="password" autocomplete="current-password" />
    </UiFormField>
    <AuthCodeOrRecovery ref="fields" v-model="value" v-model:mode="mode" :error="errors.code" />
    <div class="flex flex-wrap gap-2">
      <UiButton type="submit" :variant="kind === 'disable' ? 'danger' : 'primary'" :loading="busy">{{ kind === 'disable' ? t('twoFactor.manage.disable') : t('twoFactor.manage.regen') }}</UiButton>
      <UiButton variant="secondary" @click="emit('cancel')">{{ t('twoFactor.manage.close') }}</UiButton>
    </div>
  </form>
</template>
