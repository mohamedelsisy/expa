<script setup lang="ts">
/** Authenticator code or recovery code input with a toggle; shared by the login step and the disable/regenerate forms. */
const props = defineProps<{ error?: string, hint?: string, autofocus?: boolean }>()
const mode = defineModel<'code' | 'recovery'>('mode', { default: 'code' })
const value = defineModel<string>({ default: '' })
const { t } = useI18n()
const root = ref<HTMLElement | null>(null)
function focus() { root.value?.querySelector<HTMLInputElement>('input')?.focus() }
function toggle() {
  mode.value = mode.value === 'code' ? 'recovery' : 'code'
  value.value = ''
  nextTick(focus)
}
onMounted(() => { if (props.autofocus) nextTick(focus) })
defineExpose({ focus })
</script>

<template>
  <div ref="root" class="space-y-3">
    <UiFormField :label="mode === 'code' ? t('twoFactor.login.codeLabel') : t('twoFactor.login.recoveryLabel')" :hint="hint ?? (mode === 'code' ? t('twoFactor.login.codeHint') : t('twoFactor.login.recoveryHint'))" :error="error" required>
      <UiTextInput
        :key="mode"
        v-model="value"
        :autocomplete="mode === 'code' ? 'one-time-code' : 'off'"
        :inputmode="mode === 'code' ? 'numeric' : 'text'"
        :maxlength="mode === 'code' ? 8 : 12"
        ltr
      />
    </UiFormField>
    <button type="button" class="inline-flex min-h-touch items-center text-sm font-medium text-primary-strong underline underline-offset-4" @click="toggle">
      {{ mode === 'code' ? t('twoFactor.login.useRecovery') : t('twoFactor.login.useCode') }}
    </button>
  </div>
</template>
