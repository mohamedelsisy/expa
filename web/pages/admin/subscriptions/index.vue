<script setup lang="ts">
import { formatDateTime } from '~/utils/locale'
import { fieldErrors, isApiError } from '~/utils/errors'
import type { Column } from '~/components/admin/DataTable.vue'
import type { FilterField } from '~/components/admin/Filters.vue'

definePageMeta({ layout: 'admin', middleware: 'admin' })
interface Sub { id: number, user_id: number, user_email?: string | null, plan: string, status: string, provider: string | null, current_period_end: string | null, cancel_at_period_end: boolean }
interface Plan { key: string, name?: string }
interface FoundUser { id: number, name: string, email: string }
const { t, locale } = useI18n()
const { request } = useApi()
const toast = useToast()
const { can } = usePermissions()
useAdminSeo(() => t('admin.subs.title'))

const list = useAdminList({ filterKeys: ['status', 'plan'], defaultSort: '-id', defaultPerPage: 25 })
const { data: plansData } = await useAsyncData('admin-plans', () => request<Plan[]>('billing/plans').catch(() => ({ data: [] as Plan[], meta: {} })))
const plans = computed(() => plansData.value?.data ?? [])
const { data, error, refresh, status: st } = await useAsyncData('admin-subs', () => request<Sub[]>('admin/subscriptions', { query: Object.fromEntries(Object.entries(list.apiQuery.value).filter(([k]) => k !== 'sort')) }), { watch: [list.apiQuery] })
const rows = computed(() => data.value?.data ?? [])
const meta = computed(() => data.value?.meta)
const fields = computed<FilterField[]>(() => [
  { key: 'status', type: 'select', label: t('admin.fields.status'), options: ['active', 'trialing', 'past_due', 'canceled', 'expired'].map(v => ({ value: v, label: t(`admin.subs.status.${v}`) })) },
  { key: 'plan', type: 'select', label: t('admin.subs.plan'), options: plans.value.map(p => ({ value: p.key, label: p.name || p.key })) },
])
const cols = computed<Column[]>(() => [
  { key: 'id', label: '#' }, { key: 'user', label: t('admin.subs.user') }, { key: 'plan', label: t('admin.subs.plan') }, { key: 'status', label: t('admin.fields.status') },
  { key: 'provider', label: t('admin.subs.provider') }, { key: 'current_period_end', label: t('admin.subs.periodEnd') }, ...(can('subscriptions.manage') ? [{ key: 'actions', label: t('admin.common.actions') }] : []),
])
const tone = (s: string) => (s === 'active' || s === 'trialing' ? 'success' : s === 'past_due' ? 'warning' : 'neutral')

// ---- cancel
const cancelId = ref<number | null>(null)
const err = ref('')
async function cancel(id: number) {
  err.value = ''
  try { await request(`admin/subscriptions/${id}/cancel`, { method: 'POST' }); toast.success(t('admin.subs.canceled')); cancelId.value = null; refresh() } catch (e) { cancelId.value = null; err.value = isApiError(e) ? e.message : t('errors.generic') }
}

// ---- grant
const grantOpen = ref(false)
const q = ref('')
const found = ref<FoundUser[]>([])
const lookupMsg = ref('')
const picked = ref<FoundUser | null>(null)
const manualId = ref('')
const plan = ref('')
const days = ref('30')
const gErrors = ref<Record<string, string>>({})
const gErr = ref('')
const busy = ref(false)
const canLookup = computed(() => can('users.view'))
function openGrant() { grantOpen.value = true; q.value = ''; found.value = []; picked.value = null; manualId.value = ''; plan.value = ''; days.value = '30'; gErrors.value = {}; gErr.value = ''; lookupMsg.value = '' }
async function lookup() {
  lookupMsg.value = ''; found.value = []
  if (!q.value.trim()) return
  try {
    found.value = (await request<FoundUser[]>('admin/users', { query: { 'filter[q]': q.value.trim(), per_page: 5 } })).data
    if (!found.value.length) lookupMsg.value = t('admin.subs.noUser')
  } catch (e) { lookupMsg.value = isApiError(e) ? e.message : t('errors.generic') }
}
async function grant() {
  gErrors.value = {}; gErr.value = ''
  const userId = picked.value?.id ?? Number(manualId.value)
  if (!userId) { gErrors.value = { user_id: t('admin.subs.pickUser') }; return }
  busy.value = true
  try {
    await request('admin/subscriptions/grant', { method: 'POST', body: { user_id: userId, plan: plan.value, days: Number(days.value) } })
    toast.success(t('admin.subs.granted')); grantOpen.value = false; refresh()
  } catch (e) {
    if (isApiError(e)) { gErrors.value = fieldErrors(e); gErr.value = e.message } else gErr.value = t('errors.generic')
  } finally { busy.value = false }
}
</script>

<template>
  <div>
    <AdminPageHeader :title="t('admin.subs.title')" :description="t('admin.subs.subtitle')" :crumbs="[{ label: t('admin.title'), to: '/admin' }, { label: t('admin.subs.title') }]">
      <UiButton v-if="can('subscriptions.manage')" @click="openGrant"><UiIcon name="plus" :size="18" />{{ t('admin.subs.grant') }}</UiButton>
    </AdminPageHeader>
    <AdminFilters :fields="fields" :filters="list.state.value.filters" @set="list.setFilter" @clear="list.clear" />
    <div aria-live="polite"><UiAlert v-if="err" tone="danger" class="mb-3">{{ err }}</UiAlert></div>
    <UiSkeleton v-if="st === 'pending' && !data" :lines="5" />
    <UiErrorState v-else-if="error" :message="isApiError(error) ? error.message : undefined" retry @retry="refresh()" />
    <UiEmptyState v-else-if="!rows.length" :title="t('admin.common.noResults')" :description="t('admin.common.noResultsHelp')" icon="euro" />
    <template v-else>
      <AdminDataTable :columns="cols" :rows="rows" row-key="id" :caption="t('admin.subs.title')">
        <template #cell-user="{ row }"><span v-if="row.user_email" dir="ltr" class="text-sm">{{ row.user_email }}</span><span v-else class="text-sm text-muted">{{ t('admin.subs.userId', { id: row.user_id }) }}</span></template>
        <template #cell-status="{ row }"><UiBadge :tone="tone(row.status)">{{ t(`admin.subs.status.${row.status}`) }}</UiBadge><span v-if="row.cancel_at_period_end" class="ms-1 text-xs text-muted">{{ t('admin.subs.endsAtPeriod') }}</span></template>
        <template #cell-current_period_end="{ row }"><span class="text-sm">{{ row.current_period_end ? formatDateTime(row.current_period_end, locale) : '—' }}</span></template>
        <template #cell-actions="{ row }">
          <template v-if="['active', 'trialing', 'past_due'].includes(row.status)">
            <UiButton v-if="cancelId !== row.id" variant="secondary" @click="cancelId = row.id">{{ t('admin.subs.cancel') }}<span class="sr-only"> #{{ row.id }}</span></UiButton>
            <UiConfirmInline v-else :message="t('admin.subs.confirmCancel')" :confirm-label="t('admin.subs.cancel')" @cancel="cancelId = null" @confirm="cancel(row.id)" />
          </template>
        </template>
      </AdminDataTable>
      <div class="mt-4 text-center"><UiPagination :page="meta?.page ?? 1" :last-page="meta?.last_page ?? 1" @change="list.setPage" /></div>
    </template>

    <AdminDialog :open="grantOpen" :title="t('admin.subs.grant')" @close="grantOpen = false">
      <form id="grant-form" class="space-y-4" novalidate @submit.prevent="grant">
        <div aria-live="polite"><UiAlert v-if="gErr" tone="danger">{{ gErr }}</UiAlert></div>
        <fieldset class="space-y-2">
          <legend class="font-medium">{{ t('admin.subs.user') }}</legend>
          <template v-if="canLookup">
            <div class="flex gap-2"><UiFormField :label="t('admin.subs.lookup')" class="flex-1"><UiTextInput v-model="q" type="search" ltr data-autofocus @keydown.enter.prevent="lookup" /></UiFormField><UiButton variant="secondary" class="self-end" @click="lookup">{{ t('admin.common.search') }}</UiButton></div>
            <p v-if="lookupMsg" class="text-sm text-muted" role="status">{{ lookupMsg }}</p>
            <ul v-if="found.length" class="space-y-1"><li v-for="u in found" :key="u.id"><label class="flex min-h-touch cursor-pointer items-center gap-3 rounded-md border border-line px-3"><input v-model="picked" type="radio" name="user" :value="u" class="size-5 accent-primary"><span dir="auto">{{ u.name }}</span><span dir="ltr" class="text-sm text-muted">{{ u.email }}</span></label></li></ul>
            <p v-if="picked" class="text-sm font-medium text-success">{{ t('admin.subs.picked', { email: picked.email }) }}</p>
          </template>
          <UiFormField v-else :label="t('admin.subs.userIdLabel')" :hint="t('admin.subs.userIdHelp')"><UiTextInput v-model="manualId" type="number" inputmode="numeric" ltr /></UiFormField>
          <p v-if="gErrors.user_id" class="font-medium text-danger" role="alert">{{ gErrors.user_id }}</p>
        </fieldset>
        <UiFormField :label="t('admin.subs.plan')" :error="gErrors.plan" required><UiSelect v-model="plan" :options="plans.map(p => ({ value: p.key, label: p.name || p.key }))" :placeholder="t('admin.common.choose')" /></UiFormField>
        <UiFormField :label="t('admin.subs.days')" :hint="t('admin.subs.daysHelp')" :error="gErrors.days" required><UiTextInput v-model="days" type="number" inputmode="numeric" ltr /></UiFormField>
      </form>
      <template #footer><UiButton variant="secondary" @click="grantOpen = false">{{ t('common.cancel') }}</UiButton><UiButton type="submit" :loading="busy" @click="grant">{{ t('admin.subs.grant') }}</UiButton></template>
    </AdminDialog>
  </div>
</template>
