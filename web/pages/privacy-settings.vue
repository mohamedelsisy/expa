<script setup lang="ts">
import type { ConsentsPayload, PurposesPayload } from '~/types/api'

definePageMeta({ middleware: 'auth' })
const { t, locale } = useI18n()
const { request } = useApi()
const auth = useAuthStore()
const toast = useToast()
const localePath = useLocalePath()
useSeo(() => ({ title: t('privacy.title'), description: t('privacy.subtitle'), noindex: true }))

const { data, error, refresh, status } = await useAsyncData('privacy', async () => {
  const [purposes, consents] = await Promise.all([request<PurposesPayload>('privacy/purposes'), request<ConsentsPayload>('profile/consents')])
  return { purposes: purposes.data, consents: consents.data }
}, { watch: [locale] })

const savingKey = ref<string | null>(null)
async function toggle(key: string, granted: boolean) {
  if (!data.value) return
  const before = data.value
  // optimistic, with rollback
  data.value = { ...before, consents: { ...before.consents, consents: { ...before.consents.consents, [key]: { ...before.consents.consents[key], granted, decided: true } } } }
  savingKey.value = key
  try {
    const res = await request<ConsentsPayload>('profile/consents', { method: 'PUT', body: { consents: { [key]: granted } } })
    data.value = { ...before, consents: res.data }
    toast.success(t('privacy.consentSaved'))
  } catch (e) {
    data.value = before
    toast.error(isApiError(e) ? e.message : t('errors.generic'))
  } finally {
    savingKey.value = null
  }
}

// --- Export ---
const exporting = ref(false)
async function exportData() {
  exporting.value = true
  try {
    const res = await request<unknown>('profile/export')
    const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'expa-data-export.json'
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
    toast.success(t('privacy.exportReady'))
  } catch (e) {
    toast.error(isApiError(e) ? e.message : t('errors.generic'))
  } finally {
    exporting.value = false
  }
}

// --- Deletion ---
const deleting = ref(false)
const confirmOpen = ref(false)
const understand = ref(false)
const password = ref('')
const delErrors = ref<Record<string, string>>({})
async function deleteAccount() {
  deleting.value = true
  delErrors.value = {}
  try {
    await request('profile', { method: 'DELETE', body: { password: password.value } })
    await auth.logout()
    toast.info(t('privacy.deleteStarted'))
    await navigateTo(localePath('/'))
  } catch (e) {
    delErrors.value = fieldErrors(e)
    if (!Object.keys(delErrors.value).length) toast.error(isApiError(e) ? e.message : t('errors.generic'))
  } finally {
    deleting.value = false
  }
}

const purposes = computed(() => data.value?.purposes.purposes ?? [])
</script>

<template>
  <div class="container-page max-w-3xl py-8 sm:py-12">
    <h1 class="text-2xl font-bold sm:text-3xl">{{ t('privacy.title') }}</h1>
    <p class="mt-1 text-ink-soft">{{ t('privacy.subtitle') }}</p>

    <div v-if="status === 'pending' && !data" class="mt-8" aria-busy="true"><UiSkeleton block :lines="5" /></div>
    <UiErrorState v-else-if="error || !data" class="mt-8" :message="isApiError(error) ? error.message : undefined" retry @retry="refresh()" />

    <div v-else class="mt-8 space-y-10">
      <section aria-labelledby="cons-h" class="space-y-4">
        <h2 id="cons-h" class="text-xl font-bold">{{ t('privacy.consentsTitle') }}</h2>
        <p class="text-sm text-muted">{{ t('privacy.policyVersion', { version: data.consents.policy_version }) }}</p>
        <ul class="space-y-3">
          <li v-for="p in purposes" :key="p.key">
            <ProfileConsentPurposeItem
              :purpose="p"
              :model-value="p.required ? true : !!data.consents.consents[p.key]?.granted"
              :disabled="p.required || savingKey === p.key"
              @update:model-value="toggle(p.key, $event)"
            />
            <p v-if="data.consents.consents[p.key]?.outdated" class="mt-1 text-sm font-medium text-warning">{{ t('privacy.outdated') }}</p>
            <p v-if="p.required" class="mt-1 text-sm text-muted">{{ t('privacy.requiredNote') }}</p>
          </li>
        </ul>
      </section>

      <UiCard as="section" aria-labelledby="exp-h" class="space-y-3">
        <h2 id="exp-h" class="text-xl font-bold">{{ t('privacy.exportTitle') }}</h2>
        <p class="text-ink-soft">{{ t('privacy.exportBody') }}</p>
        <UiButton variant="secondary" :loading="exporting" @click="exportData"><UiIcon name="download" :size="18" />{{ t('privacy.exportButton') }}</UiButton>
      </UiCard>

      <UiCard as="section" aria-labelledby="del-h" class="space-y-4 !border-danger">
        <h2 id="del-h" class="text-xl font-bold text-danger">{{ t('privacy.deleteTitle') }}</h2>
        <UiAlert tone="danger" :title="t('privacy.deleteWarningTitle')">{{ t('privacy.deleteWarning') }}</UiAlert>
        <UiButton v-if="!confirmOpen" variant="danger" @click="confirmOpen = true"><UiIcon name="trash" :size="18" />{{ t('privacy.deleteStart') }}</UiButton>
        <form v-else class="space-y-4" novalidate @submit.prevent="deleteAccount">
          <UiFormField :label="t('privacy.deletePassword')" :hint="t('privacy.deletePasswordHint')" :error="delErrors.password" required>
            <UiPasswordInput v-model="password" autocomplete="current-password" />
          </UiFormField>
          <UiCheckbox v-model="understand" :label="t('privacy.deleteUnderstand')" />
          <div class="flex flex-wrap gap-3">
            <UiButton type="submit" variant="danger" :disabled="!understand || !password" :loading="deleting">{{ t('privacy.deleteConfirm') }}</UiButton>
            <UiButton variant="secondary" @click="confirmOpen = false; password = ''; understand = false">{{ t('common.cancel') }}</UiButton>
          </div>
        </form>
      </UiCard>
    </div>
  </div>
</template>
