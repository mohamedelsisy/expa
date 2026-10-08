<script setup lang="ts">
import { formatDate } from '~/utils/locale'
import { groupSecret, isTotp, normalizeTotp, qrPath, recoveryFileText, retryAfterOf, type TwoFactorSetup, type TwoFactorStatus } from '~/utils/twoFactor'

definePageMeta({ middleware: 'auth' })
const { t, locale } = useI18n()
const { request } = useApi()
const auth = useAuthStore()
const toast = useToast()
useSeo(() => ({ title: t('twoFactor.title'), description: t('twoFactor.subtitle'), noindex: true }))
const crumbs = computed(() => [{ label: t('nav.home'), to: '/' }, { label: t('profile.title'), to: '/profile' }, { label: t('twoFactor.title') }])

const { data: status, error, refresh, status: loadState } = await useAsyncData('twofa-status', async () => (await request<TwoFactorStatus>('auth/2fa/status')).data)

// Secret and recovery codes live in component memory only (never in the async-data payload, storage or the URL).
const setup = ref<TwoFactorSetup | null>(null)
const codes = ref<string[] | null>(null)
const savedAck = ref(false)
const panel = ref<'disable' | 'regen' | null>(null)
const busy = ref<'setup' | 'confirm' | null>(null)
const code = ref('')
const codeError = ref('')
const formError = ref('')
const stepHeading = ref<HTMLElement | null>(null)
const codesHeading = ref<HTMLElement | null>(null)
const statusLive = ref('')
const confirmForm = ref<HTMLFormElement | null>(null)
const focusConfirm = () => confirmForm.value?.querySelector<HTMLInputElement>('input')?.focus()

const qr = computed(() => (setup.value ? qrPath(setup.value.otpauth_uri) : null))
const enabled = computed(() => status.value?.enabled === true)

function fail(e: unknown, target: 'form' | 'code' = 'form') {
  const msg = !isApiError(e) ? t('errors.generic')
    : e.status === 429 ? (retryAfterOf(e) ? t('twoFactor.errors.rateLimited', { seconds: retryAfterOf(e) }) : t('twoFactor.errors.rateLimitedLater'))
      : e.code === 'invalid_two_factor_code' ? t('twoFactor.errors.invalidCode')
        : e.code === 'two_factor_already_enabled' ? t('twoFactor.errors.alreadyEnabled') : e.message
  if (target === 'code') codeError.value = msg
  else formError.value = msg
}

async function startSetup() {
  busy.value = 'setup'
  formError.value = ''
  codeError.value = ''
  code.value = ''
  try {
    setup.value = (await request<TwoFactorSetup>('auth/2fa/setup', { method: 'POST' })).data
    await nextTick()
    stepHeading.value?.focus()
  } catch (e) {
    if (isApiError(e) && e.code === 'two_factor_already_enabled') await refresh()
    fail(e)
  } finally {
    busy.value = null
  }
}
function cancelSetup() {
  setup.value = null
  code.value = ''
  codeError.value = ''
}
async function confirm() {
  codeError.value = ''
  formError.value = ''
  if (!isTotp(code.value)) { codeError.value = normalizeTotp(code.value) ? t('twoFactor.errors.invalidCode') : t('twoFactor.errors.codeRequired'); focusConfirm(); return }
  busy.value = 'confirm'
  try {
    const res = await request<{ enabled: boolean, recovery_codes: string[] }>('auth/2fa/confirm', { method: 'POST', body: { code: normalizeTotp(code.value) } })
    codes.value = res.data.recovery_codes
    setup.value = null
    code.value = ''
    savedAck.value = false
    auth.setTwoFactor(true, status.value?.required ?? false)
    toast.success(t('twoFactor.setup.on'))
    await refresh()
    await nextTick()
    codesHeading.value?.focus()
  } catch (e) {
    fail(e, 'code')
    if (isApiError(e) && e.code === 'two_factor_already_enabled') { cancelSetup(); await refresh() }
    else focusConfirm()
  } finally {
    busy.value = null
  }
}
async function reauthDone(newCodes: string[] | null) {
  const kind = panel.value
  panel.value = null
  if (kind === 'regen' && newCodes) {
    codes.value = newCodes
    savedAck.value = false
    await nextTick()
    codesHeading.value?.focus()
  } else if (kind === 'disable') {
    auth.setTwoFactor(false, status.value?.required ?? false)
    toast.success(t('twoFactor.manage.disabled'))
    statusLive.value = t('twoFactor.manage.disabled')
  }
  await refresh()
}
function finishCodes() {
  codes.value = null
  savedAck.value = false
  nextTick(() => document.getElementById('tf-status-h')?.focus())
}
async function copy(text: string) {
  try {
    await navigator.clipboard.writeText(text)
    toast.success(t('twoFactor.setup.copied'))
  } catch {
    toast.error(t('twoFactor.setup.copyFailed'))
  }
}
function download() {
  if (!codes.value) return
  const url = URL.createObjectURL(new Blob([recoveryFileText(t('twoFactor.recovery.file'), codes.value)], { type: 'text/plain' }))
  const a = document.createElement('a')
  a.href = url
  a.download = 'expa-recovery-codes.txt'
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
onBeforeUnmount(() => { setup.value = null; codes.value = null })
</script>

<template>
  <div class="container-page max-w-3xl py-8 sm:py-12">
    <UiBreadcrumbs :items="crumbs" class="mb-6" />
    <h1 class="text-2xl font-bold sm:text-3xl">{{ t('twoFactor.title') }}</h1>
    <p class="mt-1 mb-6 text-ink-soft">{{ t('twoFactor.subtitle') }}</p>
    <p class="sr-only" role="status">{{ statusLive }}</p>

    <div v-if="loadState === 'pending' && !status" aria-busy="true"><UiSkeleton block :lines="3" /></div>
    <UiErrorState v-else-if="error" :message="t('twoFactor.status.loadError')" retry @retry="refresh()" />
    <template v-else-if="status">
      <!-- Recovery codes: shown once -->
      <section v-if="codes" aria-labelledby="tf-codes-h" class="space-y-4" data-testid="two-factor-codes">
        <h2 id="tf-codes-h" ref="codesHeading" tabindex="-1" class="text-xl font-bold outline-none">{{ t('twoFactor.recovery.title') }}</h2>
        <UiAlert tone="warning">{{ t('twoFactor.recovery.warning') }}</UiAlert>
        <ol :aria-label="t('twoFactor.recovery.list')" class="grid grid-cols-1 gap-2 rounded-lg border border-line bg-surface p-4 sm:grid-cols-2">
          <li v-for="c in codes" :key="c" dir="ltr" class="rounded-md bg-sunken px-3 py-2 text-start font-mono text-base tracking-wide">{{ c }}</li>
        </ol>
        <div class="flex flex-wrap gap-2">
          <UiButton variant="secondary" @click="copy(codes.join('\n'))">{{ t('twoFactor.recovery.copyAll') }}</UiButton>
          <UiButton variant="secondary" @click="download"><UiIcon name="download" :size="18" />{{ t('twoFactor.recovery.download') }}</UiButton>
        </div>
        <UiCheckbox v-model="savedAck" :label="t('twoFactor.recovery.saved')" />
        <UiButton :disabled="!savedAck" data-testid="two-factor-codes-done" @click="finishCodes">{{ t('twoFactor.recovery.done') }}</UiButton>
      </section>

      <template v-else>
        <UiAlert v-if="status.required" :tone="enabled ? 'info' : 'warning'" :title="t('twoFactor.status.requiredTitle')" class="mb-6" data-testid="two-factor-required">
          {{ enabled ? t('twoFactor.status.requiredDoneBody') : t('twoFactor.status.requiredSetupBody') }}
        </UiAlert>

        <section aria-labelledby="tf-status-h" class="space-y-3 rounded-lg border border-line bg-surface p-4 sm:p-5">
          <div class="flex flex-wrap items-center justify-between gap-2">
            <h2 id="tf-status-h" tabindex="-1" class="text-xl font-bold outline-none">{{ t('twoFactor.status.heading') }}</h2>
            <UiBadge :tone="enabled ? 'success' : 'neutral'" data-testid="two-factor-state">{{ enabled ? t('twoFactor.status.on') : t('twoFactor.status.off') }}</UiBadge>
          </div>
          <template v-if="enabled">
            <p v-if="status.confirmed_at" class="text-ink-soft">{{ t('twoFactor.status.since', { date: formatDate(status.confirmed_at, locale) }) }}</p>
            <p :class="status.recovery_codes_remaining <= 2 ? 'font-medium text-warning' : 'text-ink-soft'">{{ status.recovery_codes_remaining <= 2 ? t('twoFactor.status.remainingLow', { count: status.recovery_codes_remaining }) : t('twoFactor.status.remaining', { count: status.recovery_codes_remaining }) }}</p>
            <div class="flex flex-wrap gap-2 pt-1">
              <UiButton variant="secondary" :aria-expanded="panel === 'regen'" @click="panel = panel === 'regen' ? null : 'regen'">{{ t('twoFactor.manage.regenTitle') }}</UiButton>
              <UiButton variant="danger" :aria-expanded="panel === 'disable'" @click="panel = panel === 'disable' ? null : 'disable'">{{ t('twoFactor.manage.disableTitle') }}</UiButton>
            </div>
            <UiAlert v-if="panel === 'disable' && status.required" tone="warning">{{ t('twoFactor.manage.requiredCannotDisable') }}</UiAlert>
            <AuthTwoFactorReauth v-if="panel" :key="panel" :kind="panel" @done="reauthDone" @cancel="panel = null" />
          </template>
          <template v-else-if="!setup">
            <UiAlert v-if="formError" tone="danger">{{ formError }}</UiAlert>
            <UiButton :loading="busy === 'setup'" data-testid="two-factor-start" @click="startSetup">{{ status.setup_pending ? t('twoFactor.setup.restart') : t('twoFactor.setup.start') }}</UiButton>
          </template>
        </section>

        <!-- Setup -->
        <section v-if="setup && !enabled" aria-labelledby="tf-step1-h" class="mt-6 space-y-5" data-testid="two-factor-setup">
          <div class="space-y-3 rounded-lg border border-line bg-surface p-4 sm:p-5">
            <h2 id="tf-step1-h" ref="stepHeading" tabindex="-1" class="text-xl font-bold outline-none">{{ t('twoFactor.setup.step1') }}</h2>
            <p class="text-ink-soft">{{ t('twoFactor.setup.scan') }}</p>
            <svg v-if="qr" role="img" :aria-label="t('twoFactor.setup.qrLabel')" :viewBox="`-4 -4 ${qr.size + 8} ${qr.size + 8}`" class="size-56 max-w-full rounded-md border border-line bg-white" shape-rendering="crispEdges" data-testid="two-factor-qr"><path :d="qr.path" fill="#000" /></svg>
            <UiAlert v-else tone="warning">{{ t('twoFactor.setup.qrFailed') }}</UiAlert>
            <p class="text-sm text-muted">{{ t('twoFactor.setup.privacy') }}</p>
            <details class="rounded-md border border-line p-3">
              <summary class="min-h-touch cursor-pointer py-2 font-medium">{{ t('twoFactor.setup.manual') }}</summary>
              <p class="mt-2 text-sm font-medium">{{ t('twoFactor.setup.secretLabel') }}</p>
              <p dir="ltr" class="mt-1 break-all rounded-md bg-sunken px-3 py-2 text-start font-mono" data-testid="two-factor-secret">{{ groupSecret(setup.secret) }}</p>
              <div class="mt-2 flex flex-wrap gap-2">
                <UiButton variant="secondary" @click="copy(setup.secret)">{{ t('twoFactor.setup.copySecret') }}</UiButton>
                <UiButton variant="secondary" @click="copy(setup.otpauth_uri)">{{ t('twoFactor.setup.copyUri') }}</UiButton>
              </div>
            </details>
          </div>
          <form ref="confirmForm" class="space-y-4 rounded-lg border border-line bg-surface p-4 sm:p-5" novalidate aria-labelledby="tf-step2-h" @submit.prevent="confirm">
            <h2 id="tf-step2-h" class="text-xl font-bold">{{ t('twoFactor.setup.step2') }}</h2>
            <UiAlert v-if="formError" tone="danger">{{ formError }}</UiAlert>
            <UiFormField :label="t('twoFactor.login.codeLabel')" :hint="t('twoFactor.login.codeHint')" :error="codeError" required>
              <UiTextInput v-model="code" autocomplete="one-time-code" inputmode="numeric" :maxlength="8" ltr />
            </UiFormField>
            <div class="flex flex-wrap gap-2">
              <UiButton type="submit" :loading="busy === 'confirm'">{{ t('twoFactor.setup.confirm') }}</UiButton>
              <UiButton variant="secondary" @click="cancelSetup">{{ t('twoFactor.setup.cancel') }}</UiButton>
            </div>
          </form>
        </section>
      </template>
    </template>
  </div>
</template>
