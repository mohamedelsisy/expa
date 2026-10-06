<script setup lang="ts">
import type { City, Profile, ProfileOptions } from '~/types/api'

definePageMeta({ middleware: 'auth' })
const { t, locale, locales } = useI18n()
const switchLocalePath = useSwitchLocalePath()
const { request } = useApi()
const auth = useAuthStore()
const toast = useToast()
const localePath = useLocalePath()
useSeo(() => ({ title: t('profile.title'), description: t('profile.subtitle'), noindex: true }))

const { data, error, refresh, status } = await useAsyncData('profile-page', async () => {
  const [options, profile, cities] = await Promise.all([request<ProfileOptions>('profile/options'), request<Profile>('profile'), request<City[]>('cities')])
  return { options: options.data, profile: profile.data, cities: cities.data }
}, { watch: [locale] })

const form = reactive(emptyProfileForm())
const name = ref('')
const errors = ref<Record<string, string>>({})
const consentMissing = ref(false)
const savingAccount = ref(false)
const savingProfile = ref(false)
const accountErrors = ref<Record<string, string>>({})

// Initialised synchronously (same on server and client) so hydration never sees a form that changes after render.
function applyProfile(d: typeof data.value) {
  if (!d) return
  Object.assign(form, formFromProfile(d.profile))
  name.value = d.profile.user.name
}
applyProfile(data.value)
watch(data, applyProfile)

const localeOptions = computed(() => (locales.value as { code: string, name?: string }[]).map(l => ({ value: l.code, label: l.name ?? l.code })))
const allSteps = Object.keys(STEP_FIELDS)

async function saveAccount() {
  savingAccount.value = true
  accountErrors.value = {}
  try {
    const res = await request<Profile>('profile', { method: 'PATCH', body: { name: name.value } })
    auth.setUser(res.data.user)
    toast.success(t('profile.saved'))
  } catch (e) {
    accountErrors.value = fieldErrors(e)
    if (!Object.keys(accountErrors.value).length) toast.error(isApiError(e) ? e.message : t('errors.generic'))
  } finally {
    savingAccount.value = false
  }
}

async function changeLanguage(code: string) {
  try {
    const res = await request<Profile>('profile', { method: 'PATCH', body: { locale: code } })
    auth.setUser(res.data.user)
  } catch (e) {
    toast.error(isApiError(e) ? e.message : t('errors.generic'))
  }
  await navigateTo(switchLocalePath(code as 'ar'))
}

async function saveProfile() {
  savingProfile.value = true
  errors.value = {}
  consentMissing.value = false
  try {
    const fields = Object.values(STEP_FIELDS).flat()
    await request<Profile>('profile', { method: 'PATCH', body: patchBody(form, fields) })
    toast.success(t('profile.saved'))
    await refresh()
  } catch (e) {
    errors.value = fieldErrors(e)
    if (isApiError(e) && e.code === 'consent_required') consentMissing.value = true
    else if (!Object.keys(errors.value).length) toast.error(isApiError(e) ? e.message : t('errors.generic'))
  } finally {
    savingProfile.value = false
  }
}

async function logout() {
  await auth.logout()
  await navigateTo(localePath('/'))
}
</script>

<template>
  <div class="container-page max-w-3xl py-8 sm:py-12">
    <h1 class="text-2xl font-bold sm:text-3xl">{{ t('profile.title') }}</h1>
    <p class="mt-1 text-ink-soft">{{ t('profile.subtitle') }}</p>

    <div v-if="status === 'pending' && !data" class="mt-8" aria-busy="true"><UiSkeleton block :lines="5" /></div>
    <UiErrorState v-else-if="error || !data" class="mt-8" :message="isApiError(error) ? error.message : undefined" retry @retry="refresh()" />

    <div v-else class="mt-8 space-y-8">
      <UiCard as="section" aria-labelledby="acc-h" class="space-y-5">
        <h2 id="acc-h" class="text-xl font-bold">{{ t('profile.account') }}</h2>
        <form class="space-y-5" novalidate @submit.prevent="saveAccount">
          <UiFormField :label="t('auth.name')" :error="accountErrors.name" required>
            <UiTextInput v-model="name" autocomplete="name" :maxlength="100" />
          </UiFormField>
          <div>
            <p class="text-sm font-medium">{{ t('auth.email') }}</p>
            <p class="flex flex-wrap items-center gap-2"><span dir="ltr">{{ data.profile.user.email }}</span>
              <UiBadge :tone="data.profile.user.email_verified ? 'success' : 'warning'">{{ data.profile.user.email_verified ? t('profile.verified') : t('profile.unverified') }}</UiBadge>
            </p>
          </div>
          <UiButton type="submit" :loading="savingAccount">{{ t('common.save') }}</UiButton>
        </form>
      </UiCard>

      <UiCard as="section" aria-labelledby="lang-h" class="space-y-4">
        <h2 id="lang-h" class="text-xl font-bold">{{ t('profile.language') }}</h2>
        <UiFormField :label="t('profile.languageHint')">
          <UiSelect :model-value="locale" :options="localeOptions" @update:model-value="changeLanguage" />
        </UiFormField>
      </UiCard>

      <UiCard as="section" aria-labelledby="prof-h" class="space-y-5">
        <h2 id="prof-h" class="text-xl font-bold">{{ t('profile.about') }}</h2>
        <p class="text-ink-soft">{{ t('profile.aboutHint') }}</p>
        <UiAlert v-if="consentMissing" tone="warning">
          <p>{{ t('profile.consentMissing') }}</p>
          <UiButton to="/privacy-settings" variant="secondary" class="mt-3">{{ t('dashboard.personalizationOffCta') }}</UiButton>
        </UiAlert>
        <form class="space-y-6" novalidate @submit.prevent="saveProfile">
          <ProfileStepFields v-for="s in allSteps" :key="s" :step="s" :form="form" :options="data.options" :cities="data.cities" :errors="errors" />
          <UiButton type="submit" :loading="savingProfile">{{ t('common.save') }}</UiButton>
        </form>
      </UiCard>

      <ProfileChangePassword />

      <div class="flex flex-wrap gap-3">
        <UiButton to="/privacy-settings" variant="secondary"><UiIcon name="shield" :size="18" />{{ t('nav.privacy') }}</UiButton>
        <UiButton variant="ghost" @click="logout"><UiIcon name="logout" :size="18" />{{ t('auth.logout') }}</UiButton>
      </div>
    </div>
  </div>
</template>
