<script setup lang="ts">
import { safeRedirect } from '~/utils/safe'

definePageMeta({ layout: 'auth', middleware: 'guest' })
const { t } = useI18n()
const route = useRoute()
const localePath = useLocalePath()
const auth = useAuthStore()
const { bff } = useApi()
useSeo(() => ({ title: t('auth.loginTitle'), description: t('auth.loginSubtitle'), noindex: true }))

const form = reactive({ email: '', password: '' })
const errors = ref<Record<string, string>>({})
const formError = ref('')
const busy = ref(false)
// Staff with 2FA: the password step is done, the code step is next. Only the expiry lives here; the challenge token stays in an httpOnly cookie.
const challenge = ref<{ expiresIn: number } | null>(null)

function restart(reason: 'expired' | 'lost' | 'manual') {
  challenge.value = null
  form.password = ''
  formError.value = reason === 'lost' ? t('twoFactor.login.challengeLost') : reason === 'expired' ? t('twoFactor.login.expired') : ''
}
async function finish(user: import('~/types/api').User, remaining: number | null) {
  auth.setUser(user)
  if (remaining !== null && remaining <= 2) useToast().info(t('twoFactor.login.lowRecovery', { count: remaining }))
  await navigateTo(safeRedirect(route.query.redirect, localePath('/dashboard')))
}

async function submit() {
  busy.value = true
  errors.value = {}
  formError.value = ''
  try {
    const res = await bff<{ user?: import('~/types/api').User, two_factor_required?: boolean, expires_in?: number }>('login', { body: { ...form } })
    if (res.data.two_factor_required) {
      challenge.value = { expiresIn: res.data.expires_in ?? 300 }
      form.password = ''
      return
    }
    await finish(res.data.user!, null)
  } catch (e) {
    errors.value = fieldErrors(e)
    if (!Object.keys(errors.value).length) formError.value = isApiError(e) ? e.message : t('errors.generic')
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <AuthTwoFactorStep v-if="challenge" :expires-in="challenge.expiresIn" @done="finish" @restart="restart" />
  <div v-else>
    <h1 class="text-2xl font-bold">{{ t('auth.loginTitle') }}</h1>
    <p class="mt-1 text-ink-soft">{{ t('auth.loginSubtitle') }}</p>
    <form class="mt-6 space-y-5" novalidate @submit.prevent="submit">
      <UiAlert v-if="formError" tone="danger">{{ formError }}</UiAlert>
      <UiFormField :label="t('auth.email')" :error="errors.email" required>
        <UiTextInput v-model="form.email" type="email" autocomplete="email" inputmode="email" ltr />
      </UiFormField>
      <UiFormField :label="t('auth.password')" :error="errors.password" required>
        <UiPasswordInput v-model="form.password" autocomplete="current-password" />
      </UiFormField>
      <UiButton type="submit" block :loading="busy">{{ t('auth.login') }}</UiButton>
    </form>
    <div class="mt-6 flex flex-col gap-1 text-center text-sm">
      <NuxtLink :to="localePath('/forgot-password')" class="inline-flex min-h-touch items-center justify-center text-primary-strong underline underline-offset-4">{{ t('auth.forgotLink') }}</NuxtLink>
      <p class="text-ink-soft">
        {{ t('auth.noAccount') }}
        <NuxtLink :to="localePath('/register')" class="inline-flex min-h-touch items-center font-medium text-primary-strong underline underline-offset-4">{{ t('auth.register') }}</NuxtLink>
      </p>
    </div>
  </div>
</template>
