<script setup lang="ts">
import type { City, ConsentsPayload, Profile, ProfileOptions, PurposesPayload } from '~/types/api'
import type { StepperItem } from '~/components/ui/Stepper.vue'

definePageMeta({ middleware: 'auth' })
const { t, locale } = useI18n()
const localePath = useLocalePath()
const { request } = useApi()
const toast = useToast()
useSeo(() => ({ title: t('onboarding.title'), description: t('onboarding.subtitle'), noindex: true }))

const { data, error, refresh, status } = await useAsyncData('onboarding', async () => {
  const [options, profile, consents, purposes, cities] = await Promise.all([
    request<ProfileOptions>('profile/options'),
    request<Profile>('profile'),
    request<ConsentsPayload>('profile/consents'),
    request<PurposesPayload>('privacy/purposes'),
    request<City[]>('cities'),
  ])
  return { options: options.data, profile: profile.data, consents: consents.data, purposes: purposes.data, cities: cities.data }
}, { watch: [locale] })

const form = reactive(emptyProfileForm())
const stepIndex = ref(0)
const needConsent = ref(false)
const errors = ref<Record<string, string>>({})
const banner = ref<{ tone: 'danger' | 'warning', text: string } | null>(null)
const busy = ref(false)
const initialised = ref(false)

const steps = computed(() => data.value?.options.onboarding_steps ?? [])
const current = computed(() => steps.value[stepIndex.value])
const personalizationPurpose = computed(() => data.value?.purposes.purposes.find(p => p.key === 'profile_personalization'))
const hasConsent = computed(() => data.value?.consents.consents.profile_personalization?.granted === true)
const optIn = ref(false)

watch(data, (d) => {
  if (!d || initialised.value) return
  initialised.value = true
  Object.assign(form, formFromProfile(d.profile))
  needConsent.value = !hasConsent.value
  const firstPending = d.profile.onboarding.steps.findIndex(s => s.status === 'pending')
  stepIndex.value = Math.max(0, firstPending)
}, { immediate: true })

const stepper = computed<StepperItem[]>(() => steps.value.map((s, i) => {
  const st = data.value?.profile.onboarding.steps.find(x => x.key === s.key)?.status
  return { key: s.key, label: s.title, state: i === stepIndex.value ? 'current' : st === 'answered' ? 'done' : st === 'skipped' ? 'skipped' : i < stepIndex.value ? 'done' : 'upcoming' }
}))

function handleError(e: unknown) {
  errors.value = fieldErrors(e)
  if (isApiError(e) && e.code === 'consent_required') {
    needConsent.value = true
    banner.value = { tone: 'warning', text: e.message }
  } else if (isApiError(e) && e.code === 'email_not_verified') {
    banner.value = { tone: 'warning', text: e.message }
  } else if (!Object.keys(errors.value).length) {
    banner.value = { tone: 'danger', text: isApiError(e) ? e.message : t('errors.generic') }
  }
}

async function reloadProfile() {
  const res = await request<Profile>('profile')
  if (data.value) data.value = { ...data.value, profile: res.data }
}

async function grantConsent() {
  busy.value = true
  banner.value = null
  try {
    const res = await request<ConsentsPayload>('profile/consents', { method: 'PUT', body: { consents: { profile_personalization: true } } })
    if (data.value) data.value = { ...data.value, consents: res.data }
    needConsent.value = false
  } catch (e) {
    handleError(e)
  } finally {
    busy.value = false
  }
}

async function finish() {
  try {
    await request<Profile>('profile/onboarding/complete', { method: 'POST' })
    toast.success(t('onboarding.done'))
    await navigateTo(localePath('/dashboard'))
  } catch (e) {
    if (isApiError(e) && e.code === 'onboarding_incomplete') {
      stepIndex.value = 0
      banner.value = { tone: 'warning', text: e.message }
    } else handleError(e)
  }
}

async function advance() {
  if (stepIndex.value >= steps.value.length - 1) await finish()
  else stepIndex.value += 1
}

async function next() {
  const step = current.value
  if (!step) return
  busy.value = true
  errors.value = {}
  banner.value = null
  try {
    const fields = STEP_FIELDS[step.key] ?? []
    const empty = fields.every(f => (Array.isArray(form[f]) ? (form[f] as string[]).length === 0 : !form[f]))
    if (empty && step.required) {
      errors.value = { [fields[0]]: t('onboarding.answerRequired') }
      return
    }
    if (empty) await request('profile/onboarding/skip', { method: 'POST', body: { step: step.key } })
    else await request('profile', { method: 'PATCH', body: patchBody(form, fields) })
    await reloadProfile()
    await advance()
  } catch (e) {
    handleError(e)
  } finally {
    busy.value = false
  }
}

async function skip() {
  const step = current.value
  if (!step || step.required) return
  busy.value = true
  banner.value = null
  try {
    await request('profile/onboarding/skip', { method: 'POST', body: { step: step.key } })
    await reloadProfile()
    await advance()
  } catch (e) {
    handleError(e)
  } finally {
    busy.value = false
  }
}

function back() {
  errors.value = {}
  banner.value = null
  if (stepIndex.value > 0) stepIndex.value -= 1
}
</script>

<template>
  <div class="container-page max-w-2xl py-8 sm:py-12">
    <div v-if="status === 'pending' && !data" aria-busy="true" class="space-y-4"><UiSkeleton block /><UiSkeleton :lines="4" /></div>
    <UiErrorState v-else-if="error || !data" :message="isApiError(error) ? error.message : undefined" retry @retry="refresh()" />

    <template v-else>
      <h1 class="text-2xl font-bold sm:text-3xl">{{ t('onboarding.title') }}</h1>
      <p class="mt-1 text-ink-soft">{{ t('onboarding.subtitle') }}</p>

      <!-- Consent for personalization comes first, in plain language -->
      <UiCard v-if="needConsent && personalizationPurpose" class="mt-6 space-y-4">
        <h2 class="text-xl font-bold">{{ t('onboarding.consentTitle') }}</h2>
        <p class="text-ink-soft">{{ t('onboarding.consentIntro') }}</p>
        <div class="rounded-md bg-primary-soft p-4">
          <p class="font-semibold"><UiAutoItalian :text="personalizationPurpose.title" /></p>
          <p class="mt-1">{{ personalizationPurpose.why }}</p>
          <p class="mt-2 text-sm text-ink-soft"><span class="font-semibold">{{ t('privacy.dataCollected') }}:</span> {{ personalizationPurpose.data }}</p>
        </div>
        <UiCheckbox v-model="optIn" :label="t('onboarding.consentCheckbox')" />
        <UiAlert v-if="banner" :tone="banner.tone">{{ banner.text }}</UiAlert>
        <div class="flex flex-col gap-3 sm:flex-row">
          <UiButton :disabled="!optIn" :loading="busy" @click="grantConsent">{{ t('onboarding.consentAllow') }}</UiButton>
          <UiButton variant="secondary" to="/dashboard">{{ t('onboarding.consentDecline') }}</UiButton>
        </div>
        <p class="text-sm text-muted">{{ t('onboarding.consentDeclineNote') }}</p>
      </UiCard>

      <section v-else-if="current" class="mt-6 space-y-5" :aria-labelledby="'step-h'">
        <UiStepper :steps="stepper" :label="t('onboarding.progress')" />
        <p class="text-sm text-muted" aria-live="polite">{{ t('onboarding.stepOf', { current: stepIndex + 1, total: steps.length }) }}</p>
        <UiCard class="space-y-5">
          <div class="space-y-2">
            <div class="flex flex-wrap items-center gap-2">
              <h2 id="step-h" class="text-xl font-bold">{{ current.title }}</h2>
              <UiBadge :tone="current.required ? 'accent' : 'neutral'">{{ current.required ? t('common.required') : t('common.optional') }}</UiBadge>
            </div>
            <p class="text-ink-soft">{{ current.why }}</p>
          </div>
          <UiAlert v-if="banner" :tone="banner.tone">
            {{ banner.text }}
          </UiAlert>
          <form class="space-y-5" novalidate @submit.prevent="next">
            <ProfileStepFields :step="current.key" :form="form" :options="data.options" :cities="data.cities" :errors="errors" :label="current.title" />
            <div class="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
              <UiButton variant="ghost" :disabled="stepIndex === 0 || busy" @click="back"><UiIcon name="arrow-start" :size="18" />{{ t('common.back') }}</UiButton>
              <div class="flex flex-col gap-3 sm:flex-row">
                <UiButton v-if="!current.required" variant="secondary" :disabled="busy" @click="skip">{{ t('onboarding.skip') }}</UiButton>
                <UiButton type="submit" :loading="busy">
                  {{ stepIndex === steps.length - 1 ? t('onboarding.finish') : t('common.continue') }}<UiIcon name="arrow-end" :size="18" />
                </UiButton>
              </div>
            </div>
          </form>
        </UiCard>
        <p class="text-center"><UiButton to="/dashboard" variant="ghost">{{ t('onboarding.skipAll') }}</UiButton></p>
      </section>
    </template>
  </div>
</template>
