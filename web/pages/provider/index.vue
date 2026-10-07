<script setup lang="ts">
import type { PortalProfile, ProvidersMeta } from '~/types/extra'

definePageMeta({ middleware: 'auth' })
const { t, locale } = useI18n()
const { request } = useApi()
const auth = useAuthStore()
const toast = useToast()
useSeo(() => ({ title: t('provider.title'), description: t('provider.subtitle'), noindex: true }))
const portal = useProviderPortal()
await useAsyncData('provider-index', async () => { await portal.load(); return true })
const { data: meta } = await useAsyncData('provider-meta', async () => (await request<ProvidersMeta>('providers/meta')).data, { watch: [locale] })

const form = reactive({ category: '', display_name: '' })
const errors = ref<Record<string, string>>({})
const applying = ref(false)
const needVerify = ref(false)
async function apply() {
  errors.value = {}
  needVerify.value = false
  if (!form.display_name.trim()) errors.value.display_name = t('provider.apply.nameRequired')
  if (!form.category) errors.value.category = t('provider.apply.categoryRequired')
  if (Object.keys(errors.value).length) return
  applying.value = true
  try {
    const res = await request<PortalProfile>('provider/apply', { method: 'POST', body: { category: form.category, display_name: form.display_name.trim() } })
    portal.set(res.data)
    await auth.ensureLoaded(true) // the account now holds the provider role
    toast.success(t('provider.apply.done'))
  } catch (e) {
    if (isApiError(e) && e.code === 'email_not_verified') needVerify.value = true
    else if (isApiError(e) && e.code === 'provider_exists') { await portal.load() }
    else { errors.value = fieldErrors(e); if (!Object.keys(errors.value).length) toast.error(isApiError(e) ? e.message : t('errors.generic')) }
  } finally { applying.value = false }
}

const submitting = ref(false)
const problems = ref<{ code: string, field?: string }[]>([])
async function submitForReview() {
  submitting.value = true
  problems.value = []
  try {
    portal.set((await request<PortalProfile>('provider/profile/submit', { method: 'POST' })).data)
    toast.success(t('provider.overview.submitted'))
  } catch (e) {
    if (isApiError(e) && e.code === 'listing_incomplete') problems.value = ((e.details as { problems?: { code: string, field?: string }[] }).problems ?? [])
    else toast.error(isApiError(e) ? e.message : t('errors.generic'))
  } finally { submitting.value = false }
}
const p = computed(() => portal.profile.value)
const canSubmit = computed(() => p.value && ['draft', 'archived'].includes(String(p.value.status)))
const problemList = computed(() => (problems.value.length ? problems.value : (p.value?.publish_problems ?? [])))
const problemText = (x: { code: string, field?: string }) => (x.field ? `${x.field}: ${x.code}` : x.code)
</script>

<template>
  <div class="container-page max-w-3xl py-8 sm:py-12">
    <header class="mb-6 space-y-2"><h1 class="text-2xl font-bold sm:text-3xl">{{ t('provider.title') }}</h1><p class="text-ink-soft">{{ t('provider.subtitle') }}</p></header>
    <div v-if="portal.state.value === 'loading' || portal.state.value === 'idle'" aria-busy="true"><UiSkeleton block :lines="4" /></div>
    <UiErrorState v-else-if="portal.state.value === 'error'" :message="portal.error.value ?? undefined" retry @retry="portal.load()" />

    <template v-else-if="portal.state.value === 'none'">
      <UiAlert tone="info" class="mb-6">{{ t('provider.apply.intro') }}</UiAlert>
      <AuthVerifyNeeded v-if="needVerify" class="mb-6" />
      <UiCard>
        <form class="space-y-5" novalidate @submit.prevent="apply">
          <h2 class="text-xl font-bold">{{ t('provider.apply.title') }}</h2>
          <UiFormField :label="t('provider.fields.display_name')" :hint="t('provider.fields.display_nameHint')" :error="errors.display_name" required><UiTextInput v-model="form.display_name" :maxlength="160" /></UiFormField>
          <UiFormField :label="t('provider.fields.category')" :error="errors.category" required><UiSelect v-model="form.category" :options="meta?.categories ?? []" :placeholder="t('common.choose')" /></UiFormField>
          <p class="text-sm text-ink-soft">{{ t('provider.apply.next') }}</p>
          <UiButton type="submit" :loading="applying">{{ t('provider.apply.submit') }}</UiButton>
        </form>
      </UiCard>
    </template>

    <template v-else-if="p">
      <ProviderNav />
      <div class="space-y-6">
        <UiCard class="space-y-3">
          <h2 class="text-xl font-bold" dir="auto">{{ p.display_name }}</h2>
          <dl class="grid gap-3 sm:grid-cols-2">
            <div><dt class="text-sm text-muted">{{ t('provider.overview.status') }}</dt><dd><UiBadge :tone="p.status === 'published' ? 'success' : 'info'" data-testid="listing-status">{{ t(`provider.status.${p.status ?? 'draft'}`) }}</UiBadge></dd></div>
            <div><dt class="text-sm text-muted">{{ t('provider.overview.verification') }}</dt><dd><UiBadge data-testid="verification-status">{{ t(`provider.verification.${p.effective_verification ?? p.verification_status ?? 'unverified'}`) }}</UiBadge></dd></div>
          </dl>
          <UiAlert v-if="p.has_pending_changes" tone="info" data-testid="pending-changes">{{ t('provider.overview.pendingChanges') }}</UiAlert>
          <p class="text-sm text-ink-soft">{{ t('provider.overview.statusNote') }}</p>
        </UiCard>
        <UiAlert v-if="problemList.length" tone="warning" :title="t('provider.overview.problems')" data-testid="publish-problems"><ul class="list-disc ps-5"><li v-for="(x, i) in problemList" :key="i">{{ problemText(x) }}</li></ul></UiAlert>
        <div class="flex flex-wrap gap-3">
          <UiButton to="/provider/profile" variant="secondary">{{ t('provider.overview.editProfile') }}</UiButton>
          <UiButton v-if="canSubmit" :loading="submitting" @click="submitForReview">{{ t('provider.overview.submit') }}</UiButton>
          <UiButton to="/provider/verification" variant="secondary">{{ t('provider.overview.verify') }}</UiButton>
        </div>
      </div>
    </template>
  </div>
</template>
