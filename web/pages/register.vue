<script setup lang="ts">
import type { PurposesPayload, User } from '~/types/api'

definePageMeta({ layout: 'auth', middleware: 'guest' })
const { t, locale } = useI18n()
const localePath = useLocalePath()
const auth = useAuthStore()
const toast = useToast()
const { bff, request } = useApi()
useSeo(() => ({ title: t('auth.registerTitle'), description: t('auth.registerSubtitle'), noindex: true }))

const { data: purposesRes, error: purposesError, refresh, status } = await useAsyncData('register-purposes', () => request<PurposesPayload>('privacy/purposes', { handle401: false }), { watch: [locale] })
const purposes = computed(() => purposesRes.value?.data.purposes ?? [])
const required = computed(() => purposes.value.filter(p => p.required))
const optional = computed(() => purposes.value.filter(p => !p.required))

const form = reactive({ name: '', email: '', password: '', password_confirmation: '', accept_terms: false, accept_privacy: false })
// Optional consents are never pre-checked.
const optIn = reactive<Record<string, boolean>>({})
const errors = ref<Record<string, string>>({})
const formError = ref('')
const busy = ref(false)

function acceptKey(key: string): 'accept_terms' | 'accept_privacy' | null {
  return key === 'terms' ? 'accept_terms' : key === 'privacy' ? 'accept_privacy' : null
}

async function submit() {
  busy.value = true
  errors.value = {}
  formError.value = ''
  try {
    const res = await bff<{ user: User }>('register', { body: { ...form, locale: locale.value } })
    auth.setUser(res.data.user)
    const granted = Object.fromEntries(Object.entries(optIn).filter(([, v]) => v))
    if (Object.keys(granted).length) {
      try {
        await request('profile/consents', { method: 'PUT', body: { consents: granted }, handle401: false })
      } catch {
        toast.error(t('register.consentsFailed'))
      }
    }
    await navigateTo(localePath('/onboarding'))
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
    <h1 class="text-2xl font-bold">{{ t('auth.registerTitle') }}</h1>
    <p class="mt-1 text-ink-soft">{{ t('auth.registerSubtitle') }}</p>

    <form class="mt-6 space-y-5" novalidate @submit.prevent="submit">
      <UiAlert v-if="formError" tone="danger">{{ formError }}</UiAlert>
      <UiFormField :label="t('auth.name')" :error="errors.name" required>
        <UiTextInput v-model="form.name" autocomplete="name" :maxlength="100" />
      </UiFormField>
      <UiFormField :label="t('auth.email')" :error="errors.email" required>
        <UiTextInput v-model="form.email" type="email" autocomplete="email" inputmode="email" ltr />
      </UiFormField>
      <UiFormField :label="t('auth.password')" :hint="t('auth.passwordHint')" :error="errors.password" required>
        <UiPasswordInput v-model="form.password" autocomplete="new-password" />
      </UiFormField>
      <UiFormField :label="t('auth.passwordConfirm')" :error="errors.password_confirmation" required>
        <UiPasswordInput v-model="form.password_confirmation" autocomplete="new-password" />
      </UiFormField>

      <section class="space-y-3" :aria-label="t('register.privacyTitle')">
        <h2 class="text-lg font-bold">{{ t('register.privacyTitle') }}</h2>
        <p class="text-sm text-ink-soft">{{ t('register.privacyIntro') }}</p>
        <LegalLinks :version="purposesRes?.data.policy_version" />

        <div v-if="status === 'pending' && !purposesRes" aria-busy="true"><UiSkeleton block :lines="2" /></div>
        <UiErrorState v-else-if="purposesError" :message="isApiError(purposesError) ? purposesError.message : undefined" retry @retry="refresh()" />
        <template v-else>
          <ProfileConsentPurposeItem
            v-for="p in required"
            :key="p.key"
            :purpose="p"
            :model-value="acceptKey(p.key) ? form[acceptKey(p.key)!] : true"
            :error-text="acceptKey(p.key) ? errors[acceptKey(p.key)!] : undefined"
            @update:model-value="acceptKey(p.key) && (form[acceptKey(p.key)!] = $event)"
          />
          <h3 v-if="optional.length" class="pt-2 text-base font-bold">{{ t('register.optionalTitle') }}</h3>
          <p v-if="optional.length" class="text-sm text-ink-soft">{{ t('register.optionalIntro') }}</p>
          <ProfileConsentPurposeItem v-for="p in optional" :key="p.key" :purpose="p" :model-value="!!optIn[p.key]" @update:model-value="optIn[p.key] = $event" />
        </template>
      </section>

      <UiButton type="submit" block :loading="busy" :disabled="!!purposesError">{{ t('auth.register') }}</UiButton>
    </form>

    <p class="mt-6 text-center text-sm text-ink-soft">
      {{ t('auth.haveAccount') }}
      <NuxtLink :to="localePath('/login')" class="inline-flex min-h-touch items-center font-medium text-primary-strong underline underline-offset-4">{{ t('auth.login') }}</NuxtLink>
    </p>
  </div>
</template>
