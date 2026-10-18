<script setup lang="ts">
import { fieldErrors, isApiError } from '~/utils/errors'
import { formatPlanPrice, formatMinor } from '~/utils/billing'
import { PLAN_INTERVALS, PLAN_LOCALES, buildPlanPatch, isFreePlan, planToForm, validatePlanForm, type AdminPlan, type PlanForm } from '~/utils/admin/plans'
import type { Column } from '~/components/admin/DataTable.vue'

definePageMeta({ layout: 'admin', middleware: 'admin' })
interface PlansMeta { billing_available?: boolean, max_price_minor?: number }
const { t, locale } = useI18n()
const { request } = useApi()
const toast = useToast()
const { can } = usePermissions()
useAdminSeo(() => t('admin.plans.title'))

const { data, error, refresh, status: st } = await useAsyncData('admin-billing-plans', () => request<AdminPlan[]>('admin/billing/plans'))
const rows = computed(() => data.value?.data ?? [])
const meta = computed(() => (data.value?.meta ?? {}) as PlansMeta)
const maxPrice = computed(() => (typeof meta.value.max_price_minor === 'number' ? meta.value.max_price_minor : null))
const canManage = computed(() => can('plans.manage'))

const nameOf = (p: AdminPlan) => p.translations?.[locale.value as 'ar']?.name || p.translations?.en?.name || p.translations?.ar?.name || p.key
const priceOf = (p: AdminPlan) => formatPlanPrice(p.price, locale.value, { free: t('pricing.free'), interval: i => t(`pricing.interval.${i}`) })
const columns = computed<Column[]>(() => [
  { key: 'name', label: t('admin.plans.name') }, { key: 'price', label: t('admin.plans.price') }, { key: 'status', label: t('admin.fields.status') },
  { key: 'active_subscriptions', label: t('admin.plans.subscribers') }, ...(canManage.value ? [{ key: 'actions', label: t('admin.common.actions') }] : []),
])

// ---- edit
const editing = ref<AdminPlan | null>(null)
const form = reactive<PlanForm>(planToForm({ key: '', active: false, sort_order: 0, price: { amount_minor: 0, currency: 'EUR', interval: 'month' }, features: {}, translations: {}, active_subscriptions: 0, stripe_price_id_configured: false }))
const errors = ref<Record<string, string>>({})
const failure = ref('')
const busy = ref(false)
const notice = ref<string[]>([])
function open(p: AdminPlan) {
  editing.value = p; errors.value = {}; failure.value = ''
  Object.assign(form, planToForm(p))
}
const free = computed(() => !!editing.value && isFreePlan(editing.value))
async function save() {
  const p = editing.value
  if (!p) return
  failure.value = ''
  const local = validatePlanForm(p, form, maxPrice.value)
  errors.value = Object.fromEntries(Object.entries(local).map(([k, v]) => [k, t(v.key, v.params ?? {})]))
  if (Object.keys(errors.value).length) return
  const patch = buildPlanPatch(p, form)
  if (!patch) { failure.value = t('admin.plans.noChanges'); return }
  busy.value = true
  try {
    const res = await request<AdminPlan>(`admin/billing/plans/${p.key}`, { method: 'PATCH', body: patch })
    const warnings = ((res.meta as { warnings?: string[] } | undefined)?.warnings ?? []).filter(w => w === 'stripe_price_id_overrides_price')
    notice.value = warnings
    toast.success(t('admin.plans.saved'))
    editing.value = null
    await refresh()
  } catch (e) {
    errors.value = fieldErrors(e)
    failure.value = isApiError(e) && e.status === 403 ? t('admin.common.forbidden') : isApiError(e) && e.status === 429 ? t('admin.plans.tooMany') : !Object.keys(errors.value).length ? (isApiError(e) ? e.message : t('errors.generic')) : t('admin.plans.fixErrors')
  } finally { busy.value = false }
}
const maxLabel = computed(() => (maxPrice.value === null ? '' : formatMinor(maxPrice.value, 'EUR', locale.value)))
</script>

<template>
  <div>
    <AdminPageHeader :title="t('admin.plans.title')" :description="t('admin.plans.subtitle')" :crumbs="[{ label: t('admin.title'), to: '/admin' }, { label: t('admin.plans.title') }]" />
    <UiAlert v-if="data && meta.billing_available === false" tone="info" class="mb-4" :title="t('pricing.notEnabledTitle')" data-testid="plans-billing-off">{{ t('admin.plans.billingOff') }}</UiAlert>
    <UiAlert tone="warning" class="mb-4" data-testid="plans-newonly">{{ t('admin.plans.newCheckoutsOnly') }}</UiAlert>
    <div aria-live="polite">
      <UiAlert v-if="notice.includes('stripe_price_id_overrides_price')" tone="warning" class="mb-4" data-testid="plans-stripe-warning" :title="t('admin.plans.stripeOverrideTitle')">{{ t('admin.plans.stripeOverride') }}</UiAlert>
    </div>

    <UiSkeleton v-if="st === 'pending' && !data" :lines="4" />
    <UiErrorState v-else-if="error" :message="isApiError(error) && error.status === 403 ? t('admin.common.forbidden') : isApiError(error) ? error.message : undefined" retry @retry="refresh()" />
    <UiEmptyState v-else-if="!rows.length" :title="t('admin.common.noResults')" :description="t('admin.common.noResultsHelp')" icon="euro" />
    <AdminDataTable v-else :columns="columns" :rows="rows" row-key="key" :caption="t('admin.plans.title')">
      <template #cell-name="{ row }"><span dir="auto" class="font-medium">{{ nameOf(row) }}</span> <span class="text-sm text-muted" dir="ltr">({{ row.key }})</span></template>
      <template #cell-price="{ row }"><bdi class="tabular-nums">{{ priceOf(row) }}</bdi></template>
      <template #cell-status="{ row }">
        <UiBadge :tone="row.active ? 'success' : 'neutral'">{{ row.active ? t('admin.plans.active') : t('admin.plans.inactive') }}</UiBadge>
        <UiBadge v-if="row.stripe_price_id_configured" tone="warning" class="ms-1">{{ t('admin.plans.stripePriceBadge') }}</UiBadge>
      </template>
      <template #cell-active_subscriptions="{ row }"><span class="tabular-nums">{{ row.active_subscriptions }}</span></template>
      <template #cell-actions="{ row }"><UiButton variant="secondary" :data-testid="`edit-${row.key}`" @click="open(row)">{{ t('admin.common.edit') }}<span class="sr-only"> {{ nameOf(row) }}</span></UiButton></template>
    </AdminDataTable>

    <AdminDialog :open="!!editing" :title="t('admin.plans.edit', { plan: editing ? nameOf(editing) : '' })" @close="editing = null">
      <form v-if="editing" id="plan-form" class="space-y-5" novalidate @submit.prevent="save">
        <div aria-live="polite"><UiAlert v-if="failure" tone="danger" data-testid="plan-failure">{{ failure }}</UiAlert></div>
        <UiAlert v-if="editing.stripe_price_id_configured" tone="warning" :title="t('admin.plans.stripeOverrideTitle')">{{ t('admin.plans.stripeOverride') }}</UiAlert>
        <UiAlert v-if="free" tone="info">{{ t('admin.plans.freeLocked') }}</UiAlert>

        <fieldset class="space-y-3">
          <legend class="text-lg font-bold">{{ t('admin.plans.pricing') }}</legend>
          <UiCheckbox v-model="form.active" :label="t('admin.plans.activeLabel')" :description="t('admin.plans.activeHelp')" :disabled="free" :invalid="!!errors.active" :describedby="errors.active ? 'plan-active-err' : undefined" />
          <p v-if="errors.active" id="plan-active-err" class="text-sm font-medium text-danger" role="alert">{{ errors.active }}</p>
          <div class="grid gap-4 sm:grid-cols-2">
            <UiFormField :label="t('admin.plans.priceEuro')" :hint="maxLabel ? t('admin.plans.priceHint', { max: maxLabel }) : t('admin.plans.priceHintNoMax')" :error="errors.price_minor || errors.currency" required>
              <UiTextInput v-model="form.price" inputmode="decimal" ltr :disabled="free" />
            </UiFormField>
            <UiFormField :label="t('admin.plans.interval')" :error="errors.interval" required>
              <UiSelect v-model="form.interval" :options="PLAN_INTERVALS.map(i => ({ value: i, label: t(`pricing.interval.${i}`) }))" :disabled="free" />
            </UiFormField>
          </div>
        </fieldset>

        <fieldset class="space-y-3">
          <legend class="text-lg font-bold">{{ t('admin.plans.features') }}</legend>
          <div class="grid gap-4 sm:grid-cols-2">
            <UiFormField :label="t('admin.plans.aiDailyLimit')" :error="errors['features.ai_daily_limit']"><UiTextInput v-model="form.ai_daily_limit" inputmode="numeric" ltr /></UiFormField>
            <UiFormField :label="t('admin.plans.humanCredits')" :error="errors['features.human_credits']"><UiTextInput v-model="form.human_credits" inputmode="numeric" ltr /></UiFormField>
          </div>
          <UiCheckbox v-model="form.reminders_advanced" :label="t('pricing.features.reminders_advanced')" />
          <UiCheckbox v-model="form.document_ai" :label="t('pricing.features.document_ai')" />
        </fieldset>

        <fieldset class="space-y-4">
          <legend class="text-lg font-bold">{{ t('admin.plans.texts') }}</legend>
          <div v-for="l in PLAN_LOCALES" :key="l" class="space-y-3 rounded-md border border-line p-3">
            <p class="font-semibold">{{ t(`languages.${l}`) }}</p>
            <UiFormField :label="t('admin.plans.name')" :error="errors[`translations.${l}.name`]" optional><UiTextInput v-model="form.names[l]" :maxlength="80" :dir="l === 'ar' ? 'rtl' : 'ltr'" /></UiFormField>
            <UiFormField :label="t('admin.plans.description')" :error="errors[`translations.${l}.description`]" optional><UiTextInput v-model="form.descriptions[l]" :maxlength="300" :dir="l === 'ar' ? 'rtl' : 'ltr'" /></UiFormField>
          </div>
        </fieldset>
      </form>
      <template #footer><UiButton variant="secondary" @click="editing = null">{{ t('common.cancel') }}</UiButton><UiButton type="submit" :loading="busy" data-testid="plan-save" @click="save">{{ t('common.save') }}</UiButton></template>
    </AdminDialog>
  </div>
</template>
