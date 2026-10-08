<script setup lang="ts">
import type { User } from '~/types/api'
import { codePayload, formatCountdown, isRecovery, isTotp, retryAfterOf } from '~/utils/twoFactor'

/**
 * Second login step. The challenge token never reaches this component: the BFF keeps it in an httpOnly cookie
 * and `/api/auth/two-factor` exchanges it for the session cookie.
 */
const props = defineProps<{ expiresIn: number }>()
const emit = defineEmits<{ done: [user: User, recoveryRemaining: number | null], restart: [reason: 'expired' | 'lost' | 'manual'] }>()
const { t } = useI18n()
const { bff } = useApi()

const mode = ref<'code' | 'recovery'>('code')
const value = ref('')
const error = ref('')
const formError = ref('')
const busy = ref(false)
const fields = ref<{ focus: () => void } | null>(null)

// Countdown: wall-clock based so background tabs and throttled timers stay correct.
const deadline = Date.now() + props.expiresIn * 1000
const now = ref(Date.now())
const remaining = computed(() => Math.max(0, Math.ceil((deadline - now.value) / 1000)))
const expired = computed(() => remaining.value <= 0)
const lockedUntil = ref(0)
const locked = computed(() => lockedUntil.value > now.value)
let timer: ReturnType<typeof setInterval> | undefined
onMounted(() => { timer = setInterval(() => { now.value = Date.now() }, 1000) })
onBeforeUnmount(() => { if (timer) clearInterval(timer) })
// Announced once when the threshold is crossed (the ticking clock itself is not a live region).
const soon = computed(() => remaining.value > 0 && remaining.value <= 60)
watch(locked, (l) => { if (!l && formError.value && lockedUntil.value) { formError.value = ''; lockedUntil.value = 0 } })
watch(expired, (e) => { if (e) { formError.value = ''; error.value = '' } })

async function submit() {
  error.value = ''
  formError.value = ''
  const ok = mode.value === 'code' ? isTotp(value.value) : isRecovery(value.value)
  const body = codePayload(mode.value, value.value)
  if (!body || !ok) {
    error.value = body ? t('twoFactor.login.invalidCode') : t('twoFactor.login.codeRequired')
    fields.value?.focus()
    return
  }
  busy.value = true
  try {
    const res = await bff<{ user: User, recovery_codes_remaining?: number }>('two-factor', { body })
    emit('done', res.data.user, res.data.recovery_codes_remaining ?? null)
  } catch (e) {
    if (!isApiError(e)) { formError.value = t('errors.generic'); return }
    if (e.status === 401 && e.code === 'invalid_challenge') { emit('restart', 'lost'); return }
    if (e.status === 403 && e.code === 'account_suspended') { formError.value = e.message; emit('restart', 'lost'); return }
    if (e.status === 429) {
      const s = retryAfterOf(e)
      if (s) { lockedUntil.value = Date.now() + s * 1000; now.value = Date.now() }
      formError.value = s ? t('twoFactor.login.rateLimited', { seconds: s }) : t('twoFactor.login.rateLimitedLater')
      return
    }
    if (e.status === 422) {
      error.value = e.code === 'invalid_two_factor_code' ? t('twoFactor.login.invalidCode') : (fieldErrors(e).code || fieldErrors(e).recovery_code || e.message)
      value.value = ''
      await nextTick()
      fields.value?.focus()
      return
    }
    formError.value = e.message
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <div data-testid="two-factor-step">
    <h1 id="tf-login-h" class="text-2xl font-bold">{{ t('twoFactor.login.title') }}</h1>
    <p class="mt-1 text-ink-soft">{{ mode === 'code' ? t('twoFactor.login.subtitle') : t('twoFactor.login.recoverySubtitle') }}</p>
    <p class="mt-3 text-sm text-ink-soft" :class="{ 'font-semibold text-warning': soon }" data-testid="two-factor-countdown">
      <template v-if="!expired">{{ t('twoFactor.login.expiresIn', { time: formatCountdown(remaining) }) }}</template>
    </p>
    <p class="sr-only" role="status">{{ soon ? t('twoFactor.login.expiresSoon') : '' }}</p>
    <div v-if="expired" class="mt-4 space-y-3">
      <UiAlert tone="danger">{{ t('twoFactor.login.expired') }}</UiAlert>
      <UiButton block data-testid="two-factor-restart" @click="emit('restart', 'expired')">{{ t('twoFactor.login.startAgain') }}</UiButton>
    </div>
    <form v-else class="mt-4 space-y-5" novalidate aria-labelledby="tf-login-h" @submit.prevent="submit">
      <UiAlert v-if="formError" tone="danger">{{ formError }}</UiAlert>
      <AuthCodeOrRecovery ref="fields" v-model="value" v-model:mode="mode" :error="error" autofocus />
      <UiButton type="submit" block :loading="busy" :disabled="locked">{{ busy ? t('twoFactor.login.verifying') : t('twoFactor.login.verify') }}</UiButton>
      <button type="button" class="inline-flex min-h-touch w-full items-center justify-center text-sm font-medium text-primary-strong underline underline-offset-4" @click="emit('restart', 'manual')">{{ t('auth.backToLogin') }}</button>
    </form>
  </div>
</template>
