<script setup lang="ts">
import type { HousingResult, HousingSaved, HousingUsage } from '~/types/extra'
import { isConsentRequired } from '~/utils/errors'
import { formatDate } from '~/utils/locale'
import { DEFAULT_MAX_CHARS, DEFAULT_MIN_CHARS, EXTRA_FIELDS, buildHousingBody, validateHousing, type ExtraField } from '~/utils/housing'

definePageMeta({ middleware: 'auth' })
const { t, locale } = useI18n()
const { request } = useApi()
const toast = useToast()
useSeo(() => ({ title: t('housing.check.title'), description: t('housing.check.subtitle'), noindex: true }))
const crumbs = computed(() => [{ label: t('housing.title'), to: '/housing' }, { label: t('housing.check.title') }])

const usage = ref<(HousingUsage & { max_chars?: number }) | null>(null)
const limits = computed(() => ({ min: DEFAULT_MIN_CHARS, max: usage.value?.max_chars ?? DEFAULT_MAX_CHARS }))
async function loadUsage() {
  try { usage.value = (await request<HousingUsage & { max_chars: number }>('housing/usage', { handle401: false })).data } catch { usage.value = null }
}
const { granted, load: loadConsent } = useConsent('housing_analysis')
onMounted(() => { void loadUsage(); void loadConsent(); void loadSaved() })

const form = reactive({ text: '', extra: Object.fromEntries(EXTRA_FIELDS.map(k => [k, ''])) as Record<ExtraField, string>, explain: false, save: false, label: '' })
const errors = ref<Record<string, string>>({})
const submitting = ref(false)
const needConsent = ref(false)
const needVerify = ref(false)
const notice = ref<{ tone: 'warning' | 'danger', text: string } | null>(null)
const result = ref<HousingResult | null>(null)
const resultEl = ref<HTMLElement | null>(null)

async function submit() {
  errors.value = {}
  notice.value = null
  needConsent.value = false
  needVerify.value = false
  const problems = validateHousing(form, limits.value)
  if (problems.length) {
    for (const p of problems) errors.value[p.field] = p.field === 'text' ? t(`housing.check.errors.${p.code}`, { min: limits.value.min, max: limits.value.max }) : t('housing.check.errors.invalid_amount')
    return
  }
  submitting.value = true
  try {
    const res = await request<HousingResult>('housing/check', { method: 'POST', body: buildHousingBody(form), timeoutMs: 45000 })
    result.value = res.data
    if (res.data.usage && usage.value) usage.value = { ...usage.value, remaining: res.data.usage.remaining }
    if (res.data.persisted) void loadSaved()
    await nextTick()
    resultEl.value?.focus()
  } catch (e) {
    if (isConsentRequired(e, 'housing_analysis')) needConsent.value = true
    else if (isApiError(e) && e.code === 'email_not_verified') needVerify.value = true
    else if (isApiError(e) && e.status === 429) notice.value = { tone: 'warning', text: e.code === 'quota_reached' ? t('housing.check.quotaReached') : t('housing.check.tooMany') }
    else if (isApiError(e) && e.code === 'housing_saved_limit') notice.value = { tone: 'warning', text: t('housing.check.savedLimit') }
    else {
      errors.value = fieldErrors(e)
      if (errors.value.text || errors.value['extra.rent_monthly']) { /* shown inline */ }
      else notice.value = { tone: 'danger', text: isApiError(e) ? e.message : t('errors.generic') }
    }
  } finally {
    submitting.value = false
  }
}
function again() { result.value = null }

// ---- saved checks (only exist when the user ticked "save")
const saved = ref<HousingSaved[] | null>(null)
const savedError = ref(false)
async function loadSaved() {
  try { saved.value = (await request<HousingSaved[]>('housing/checks', { handle401: false })).data; savedError.value = false } catch { saved.value = null; savedError.value = true }
}
const confirmId = ref<number | null>(null)
const busyId = ref<number | null>(null)
async function openSaved(id: number) {
  busyId.value = id
  try {
    const res = await request<{ result: HousingResult }>(`housing/checks/${id}`)
    result.value = { ...res.data.result, persisted: true, saved_id: id }
    await nextTick(); resultEl.value?.focus()
  } catch (e) { toast.error(isApiError(e) ? e.message : t('errors.generic')) } finally { busyId.value = null }
}
async function removeSaved(id: number) {
  busyId.value = id
  try { await request(`housing/checks/${id}`, { method: 'DELETE' }); toast.success(t('housing.saved.deleted')); confirmId.value = null; await loadSaved() } catch (e) { toast.error(isApiError(e) ? e.message : t('errors.generic')) } finally { busyId.value = null }
}
</script>

<template>
  <div class="container-page max-w-3xl py-8 sm:py-12">
    <UiBreadcrumbs :items="crumbs" class="mb-6" />
    <header class="mb-6 space-y-2"><h1 class="text-2xl font-bold sm:text-3xl">{{ t('housing.check.title') }}</h1><p class="text-ink-soft">{{ t('housing.check.subtitle') }}</p></header>
    <UiAlert tone="info" class="mb-6" data-testid="housing-privacy">{{ t('housing.check.privacy') }}</UiAlert>
    <AuthVerifyNeeded v-if="needVerify" class="mb-6" />
    <ConsentGate v-if="granted === false || needConsent" purpose="housing_analysis" class="mb-6" @granted="granted = true; needConsent = false" />

    <div v-if="result" ref="resultEl" tabindex="-1" class="space-y-6 outline-none" :aria-label="t('housing.check.resultTitle')">
      <div class="flex flex-wrap items-center justify-between gap-3"><h2 class="text-2xl font-bold">{{ t('housing.check.resultTitle') }}</h2><UiButton variant="secondary" @click="again"><UiIcon name="refresh" :size="18" />{{ t('housing.check.another') }}</UiButton></div>
      <HousingResultView :result="result" />
    </div>

    <template v-else>
      <p v-if="usage && usage.remaining !== null" class="mb-4 text-sm text-muted" data-testid="housing-usage">{{ t('housing.check.remaining', { count: usage.remaining }) }}</p>
      <form class="space-y-5" novalidate @submit.prevent="submit">
        <UiFormField :label="t('housing.check.text')" :hint="t('housing.check.textHint', { min: limits.min, max: limits.max })" :error="errors.text" required>
          <UiTextarea v-model="form.text" :rows="10" :maxlength="limits.max + 2000" />
        </UiFormField>
        <p class="text-sm text-muted" aria-live="polite"><bdi>{{ form.text.trim().length }}</bdi> / <bdi>{{ limits.max }}</bdi></p>
        <fieldset class="space-y-3 rounded-lg border border-line p-4">
          <legend class="px-2 font-semibold">{{ t('housing.check.extraTitle') }}</legend>
          <p class="text-sm text-ink-soft">{{ t('housing.check.extraHint') }}</p>
          <div class="grid gap-4 sm:grid-cols-2">
            <UiFormField v-for="k in EXTRA_FIELDS" :key="k" :label="t(`housing.check.extra.${k}`)" :error="errors[k] ?? errors[`extra.${k}`]" optional><UiTextInput v-model="form.extra[k]" inputmode="decimal" ltr :maxlength="12" /></UiFormField>
          </div>
        </fieldset>
        <UiCheckbox v-model="form.explain" :label="t('housing.check.explain')" :description="t('housing.check.explainHint')" />
        <div class="space-y-2 rounded-lg border border-line p-4">
          <UiCheckbox v-model="form.save" :label="t('housing.check.save')" :description="t('housing.check.saveHint')" />
          <UiFormField v-if="form.save" :label="t('housing.check.label')" optional><UiTextInput v-model="form.label" :maxlength="100" /></UiFormField>
        </div>
        <UiAlert v-if="notice" :tone="notice.tone" data-testid="housing-notice">{{ notice.text }}</UiAlert>
        <UiButton type="submit" size="lg" :loading="submitting"><UiIcon name="search" :size="18" />{{ t('housing.check.submit') }}</UiButton>
      </form>

      <section class="mt-10 space-y-3" aria-labelledby="sv-h">
        <h2 id="sv-h" class="text-xl font-bold">{{ t('housing.saved.title') }}</h2>
        <p class="text-sm text-ink-soft">{{ t('housing.saved.note') }}</p>
        <UiAlert v-if="savedError" tone="warning">{{ t('housing.saved.unavailable') }}</UiAlert>
        <p v-else-if="saved && !saved.length" class="text-muted">{{ t('housing.saved.empty') }}</p>
        <ul v-else-if="saved" class="divide-y divide-line rounded-md border border-line bg-surface">
          <li v-for="s in saved" :key="s.id" class="space-y-2 p-3">
            <div class="flex flex-wrap items-center justify-between gap-2">
              <p class="min-w-0 font-medium" dir="auto">{{ s.label ?? t('housing.saved.unnamed') }} <span class="text-sm font-normal text-muted"><bdi>{{ formatDate(s.created_at, locale) }}</bdi></span></p>
              <div class="flex gap-2"><UiButton variant="secondary" :loading="busyId === s.id" @click="openSaved(s.id)">{{ t('housing.saved.open') }}</UiButton><UiButton variant="ghost" @click="confirmId = s.id">{{ t('common.delete') }}</UiButton></div>
            </div>
            <UiConfirmInline v-if="confirmId === s.id" :message="t('housing.saved.deleteConfirm')" :confirm-label="t('common.delete')" :loading="busyId === s.id" @confirm="removeSaved(s.id)" @cancel="confirmId = null" />
          </li>
        </ul>
        <div v-else aria-busy="true"><UiSkeleton :lines="2" /></div>
      </section>
    </template>
  </div>
</template>
