<script setup lang="ts">
import { formatDateTime } from '~/utils/locale'
import { isApiError } from '~/utils/errors'
import type { Column } from '~/components/admin/DataTable.vue'
import type { FilterField } from '~/components/admin/Filters.vue'

definePageMeta({ layout: 'admin', middleware: 'admin' })
interface AdminUser { id: number, name: string, email: string, locale: string, status: string, email_verified: boolean, roles: string[], last_login_at: string | null, created_at: string | null }

const { t, locale } = useI18n()
const { request } = useApi()
const toast = useToast()
const auth = useAuthStore()
const { can, isSuperAdmin } = usePermissions()
useAdminSeo(() => t('admin.users.title'))

const list = useAdminList({ filterKeys: ['q', 'status', 'role'], defaultSort: '-id', sortable: ['id', 'name', 'email', 'created_at', 'last_login_at'], defaultPerPage: 20 })
const { roles, load: loadRoles } = useRoles()
onMounted(() => { if (can('roles.view')) loadRoles() })
const { data, error, refresh, status: st } = await useAsyncData('admin-users', () => request<AdminUser[]>('admin/users', { query: list.apiQuery.value }), { watch: [list.apiQuery] })
const rows = computed(() => data.value?.data ?? [])
const meta = computed(() => data.value?.meta)

const fields = computed<FilterField[]>(() => [
  { key: 'q', type: 'search', label: t('admin.common.search'), placeholder: t('admin.users.searchPlaceholder') },
  { key: 'status', type: 'select', label: t('admin.fields.status'), options: ['active', 'suspended', 'pending_erasure'].map(v => ({ value: v, label: t(`admin.users.status.${v}`) })) },
  { key: 'role', type: 'select', label: t('admin.users.role'), options: (roles.value ?? []).map(r => ({ value: r.key, label: r.label })) },
])
const columns = computed<Column[]>(() => [
  { key: 'name', label: t('admin.fields.name'), sortable: true },
  { key: 'email', label: t('admin.fields.email'), sortable: true },
  { key: 'status', label: t('admin.fields.status') },
  { key: 'roles', label: t('admin.users.roles') },
  { key: 'last_login_at', label: t('admin.users.lastLogin'), sortable: true },
  { key: 'created_at', label: t('admin.users.created'), sortable: true },
  { key: 'actions', label: t('admin.common.actions') },
])
const tone = (s: string) => (s === 'active' ? 'success' : s === 'suspended' ? 'danger' : 'warning')

// ---- detail drawer
const selected = ref<AdminUser | null>(null)
const busy = ref(false)
const msgErr = ref('')
const draftRoles = ref<string[]>([])
const confirmSuspend = ref(false)
function openUser(u: AdminUser) { erasing.value = false; typedEmail.value = ''; selected.value = u; draftRoles.value = [...u.roles]; msgErr.value = ''; confirmSuspend.value = false }
const isSelf = computed(() => selected.value?.id === auth.user?.id)
const privilegedKeys = computed(() => (roles.value ?? []).filter(r => r.privileged).map(r => r.key))
const targetPrivileged = computed(() => !!selected.value?.roles.some(r => privilegedKeys.value.includes(r)))
const escalationBlocked = computed(() => !isSuperAdmin.value && targetPrivileged.value)
const canEditStatus = computed(() => can('users.update') && !isSelf.value && !escalationBlocked.value && selected.value?.status !== 'pending_erasure')
const canEditRoles = computed(() => can('roles.assign') && can('roles.view') && !isSelf.value && !escalationBlocked.value)
const rolesChanged = computed(() => [...draftRoles.value].sort().join() !== [...(selected.value?.roles ?? [])].sort().join())

function applyUpdate(u: AdminUser) { selected.value = u; draftRoles.value = [...u.roles]; refresh() }
function explain(e: unknown, kind: 'status' | 'roles') {
  if (isApiError(e) && e.status === 403) msgErr.value = `${t(kind === 'roles' ? 'admin.users.escalation' : 'admin.users.statusForbidden')}`
  else msgErr.value = isApiError(e) ? e.message : t('errors.generic')
}
async function setStatus(status: 'active' | 'suspended') {
  if (!selected.value) return
  busy.value = true; msgErr.value = ''
  try {
    applyUpdate((await request<AdminUser>(`admin/users/${selected.value.id}`, { method: 'PATCH', body: { status } })).data)
    toast.success(t('admin.users.statusUpdated'))
  } catch (e) { explain(e, 'status') } finally { busy.value = false; confirmSuspend.value = false }
}
async function saveRoles() {
  if (!selected.value) return
  busy.value = true; msgErr.value = ''
  try {
    applyUpdate((await request<AdminUser>(`admin/users/${selected.value.id}/roles`, { method: 'PUT', body: { roles: draftRoles.value } })).data)
    toast.success(t('admin.users.rolesUpdated'))
  } catch (e) { explain(e, 'roles') } finally { busy.value = false }
}
// ---- erasure (GDPR): typed confirmation, the API decides who may erase whom (not self, not staff)
const erasing = ref(false)
const typedEmail = ref('')
const canErase = computed(() => can('users.delete') && !isSelf.value && !escalationBlocked.value && selected.value?.status !== 'pending_erasure')
const erasureMatches = computed(() => typedEmail.value.trim().toLowerCase() === (selected.value?.email ?? '').toLowerCase() && !!selected.value)
async function erase() {
  if (!selected.value || !erasureMatches.value) return
  busy.value = true; msgErr.value = ''
  try {
    await request(`admin/users/${selected.value.id}`, { method: 'DELETE' })
    toast.success(t('admin.users.erasureStarted'))
    erasing.value = false; typedEmail.value = ''; selected.value = null
    await refresh()
  } catch (e) {
    msgErr.value = isApiError(e) && e.status === 403 ? t('admin.users.eraseForbidden') : isApiError(e) && e.status === 422 ? t('admin.users.erasureNote') : isApiError(e) ? e.message : t('errors.generic')
  } finally { busy.value = false }
}
const toggleRole = (k: string, on: boolean) => { draftRoles.value = on ? [...draftRoles.value, k] : draftRoles.value.filter(x => x !== k) }
const roleDisabled = (r: { key: string, privileged: boolean }) => !isSuperAdmin.value && r.privileged
</script>

<template>
  <div>
    <AdminPageHeader :title="t('admin.users.title')" :description="t('admin.users.subtitle')" :crumbs="[{ label: t('admin.title'), to: '/admin' }, { label: t('admin.users.title') }]">
      <UiButton v-if="can('roles.view')" variant="secondary" to="/admin/users/roles"><UiIcon name="shield" :size="18" />{{ t('admin.nav.roles') }}</UiButton>
    </AdminPageHeader>
    <AdminFilters :fields="fields" :filters="list.state.value.filters" @set="list.setFilter" @clear="list.clear" />
    <ul v-if="st === 'pending' && !data" aria-busy="true"><li><UiCard><UiSkeleton :lines="5" /></UiCard></li></ul>
    <UiErrorState v-else-if="error" :message="isApiError(error) ? error.message : undefined" retry @retry="refresh()" />
    <UiEmptyState v-else-if="!rows.length" :title="t('admin.common.noResults')" :description="t('admin.common.noResultsHelp')" icon="user"><UiButton v-if="list.hasFilters.value" variant="secondary" @click="list.clear()">{{ t('admin.common.clear') }}</UiButton></UiEmptyState>
    <template v-else>
      <AdminDataTable :columns="columns" :rows="rows" row-key="id" :caption="t('admin.users.title')" :sort="list.state.value.sort" @sort="list.setSort">
        <template #cell-name="{ row }"><span dir="auto">{{ row.name }}</span></template>
        <template #cell-email="{ row }"><span dir="ltr" class="text-sm">{{ row.email }}</span></template>
        <template #cell-status="{ row }"><UiBadge :tone="tone(row.status)">{{ t(`admin.users.status.${row.status}`) }}</UiBadge></template>
        <template #cell-roles="{ row }"><span v-if="!row.roles.length" class="text-muted">—</span><span v-else class="flex flex-wrap gap-1"><UiBadge v-for="r in row.roles" :key="r" tone="primary">{{ r }}</UiBadge></span></template>
        <template #cell-last_login_at="{ row }"><span class="text-sm">{{ row.last_login_at ? formatDateTime(row.last_login_at, locale) : '—' }}</span></template>
        <template #cell-created_at="{ row }"><span class="text-sm">{{ formatDateTime(row.created_at, locale) }}</span></template>
        <template #cell-actions="{ row }"><UiButton variant="secondary" @click="openUser(row)">{{ t('admin.common.details') }}<span class="sr-only"> {{ row.email }}</span></UiButton></template>
      </AdminDataTable>
      <div class="mt-4 space-y-2 text-center"><p v-if="meta?.total !== undefined" class="text-sm text-muted">{{ t('admin.common.results', { count: meta.total }) }}</p><UiPagination :page="meta?.page ?? 1" :last-page="meta?.last_page ?? 1" @change="list.setPage" /></div>
    </template>

    <AdminDialog :open="!!selected" variant="drawer" :title="selected?.name ?? ''" @close="selected = null">
      <div v-if="selected" class="space-y-5">
        <dl class="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2">
          <dt class="text-ink-soft">{{ t('admin.fields.email') }}</dt><dd dir="ltr" class="text-start">{{ selected.email }}</dd>
          <dt class="text-ink-soft">{{ t('admin.fields.status') }}</dt><dd><UiBadge :tone="tone(selected.status)">{{ t(`admin.users.status.${selected.status}`) }}</UiBadge></dd>
          <dt class="text-ink-soft">{{ t('admin.users.verified') }}</dt><dd>{{ t(selected.email_verified ? 'admin.common.true' : 'admin.common.false') }}</dd>
          <dt class="text-ink-soft">{{ t('admin.users.language') }}</dt><dd>{{ t(`languages.${selected.locale}`) }}</dd>
          <dt class="text-ink-soft">{{ t('admin.users.lastLogin') }}</dt><dd>{{ selected.last_login_at ? formatDateTime(selected.last_login_at, locale) : '—' }}</dd>
          <dt class="text-ink-soft">{{ t('admin.users.created') }}</dt><dd>{{ formatDateTime(selected.created_at, locale) }}</dd>
        </dl>
        <div aria-live="polite"><UiAlert v-if="msgErr" tone="danger" :title="t('admin.common.forbiddenTitle')">{{ msgErr }}</UiAlert></div>
        <UiAlert v-if="isSelf" tone="info">{{ t('admin.users.selfNote') }}</UiAlert>
        <UiAlert v-else-if="escalationBlocked" tone="info">{{ t('admin.users.privilegedNote') }}</UiAlert>

        <section v-if="can('users.update')" aria-labelledby="st-h" class="space-y-2">
          <h3 id="st-h" class="font-bold">{{ t('admin.users.accountStatus') }}</h3>
          <p v-if="selected.status === 'pending_erasure'" class="text-sm text-muted">{{ t('admin.users.erasureNote') }}</p>
          <template v-else-if="selected.status === 'active'">
            <UiButton v-if="!confirmSuspend" variant="danger" :disabled="!canEditStatus" @click="confirmSuspend = true">{{ t('admin.users.suspend') }}</UiButton>
            <UiConfirmInline v-else :message="t('admin.users.confirmSuspend')" :confirm-label="t('admin.users.suspend')" :loading="busy" @cancel="confirmSuspend = false" @confirm="setStatus('suspended')" />
          </template>
          <UiButton v-else :loading="busy" :disabled="!canEditStatus" @click="setStatus('active')">{{ t('admin.users.activate') }}</UiButton>
        </section>

        <section v-if="can('roles.assign')" aria-labelledby="rl-h" class="space-y-2">
          <h3 id="rl-h" class="font-bold">{{ t('admin.users.roles') }}</h3>
          <p class="text-sm text-muted">{{ t('admin.users.escalationRules') }}</p>
          <UiFormField group :label="t('admin.users.roles')">
            <UiCheckbox v-for="r in roles ?? []" :key="r.key" :model-value="draftRoles.includes(r.key)" :disabled="!canEditRoles || roleDisabled(r)" :label="r.label" :description="r.privileged ? t('admin.users.privilegedRole') : undefined" @update:model-value="toggleRole(r.key, $event)" />
          </UiFormField>
          <UiButton :loading="busy" :disabled="!canEditRoles || !rolesChanged || !draftRoles.length" @click="saveRoles">{{ t('admin.users.saveRoles') }}</UiButton>
        </section>

        <section v-if="can('users.delete')" aria-labelledby="er-h" class="space-y-2 border-t border-line pt-4">
          <h3 id="er-h" class="font-bold">{{ t('admin.users.eraseTitle') }}</h3>
          <p class="text-sm text-muted">{{ t('admin.users.eraseHelp') }}</p>
          <UiButton v-if="!erasing" variant="danger" :disabled="!canErase" @click="erasing = true">{{ t('admin.users.erase') }}</UiButton>
          <form v-else class="space-y-3 rounded-md border border-danger bg-danger-soft p-4" @submit.prevent="erase">
            <UiFormField :label="t('admin.users.eraseType', { email: selected.email })" required>
              <UiTextInput v-model="typedEmail" type="email" autocomplete="off" ltr data-autofocus />
            </UiFormField>
            <div class="flex flex-wrap gap-2">
              <UiButton type="submit" variant="danger" :disabled="!erasureMatches" :loading="busy">{{ t('admin.users.eraseConfirm') }}</UiButton>
              <UiButton variant="secondary" @click="erasing = false; typedEmail = ''">{{ t('common.cancel') }}</UiButton>
            </div>
          </form>
        </section>
      </div>
    </AdminDialog>
  </div>
</template>
