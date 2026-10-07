<script setup lang="ts">
import { fieldErrors, isApiError } from '~/utils/errors'
import type { Column } from '~/components/admin/DataTable.vue'

definePageMeta({ layout: 'admin', middleware: 'admin' })
interface Region { id: number, code: string, slug: string, cities: number, translations: Record<string, string> }
interface CityRow { id: number, slug: string, region_id: number, translations: Record<string, string> }
const LOCALES = ['ar', 'en', 'it'] as const
const { t, locale } = useI18n()
const { request } = useApi()
const toast = useToast()
const { can } = usePermissions()
useAdminSeo(() => t('admin.geo.title'))

const regionFilter = ref('')
const q = ref('')
const page = ref(1)
const query = computed(() => ({ page: page.value, per_page: 50, ...(regionFilter.value ? { region_id: regionFilter.value } : {}), ...(q.value.trim() ? { q: q.value.trim() } : {}) }))
const { data: regionData } = await useAsyncData('admin-regions', async () => { try { return (await request<Region[]>('admin/regions')).data } catch { return [] as Region[] } })
const regions = computed(() => regionData.value ?? [])
const { data, error, refresh, status: st } = await useAsyncData('admin-cities', () => request<CityRow[]>('admin/cities', { query: query.value }), { watch: [query] })
const rows = computed(() => data.value?.data ?? [])
const meta = computed(() => data.value?.meta)
const nameOf = (tr: Record<string, string>) => tr[locale.value] ?? tr.en ?? tr.ar ?? Object.values(tr)[0] ?? ''
const regionName = (id: number) => { const r = regions.value.find(x => x.id === id); return r ? nameOf(r.translations) || r.slug : String(id) }
const columns = computed<Column[]>(() => [
  { key: 'name', label: t('admin.geo.name') }, { key: 'slug', label: t('admin.geo.slug') }, { key: 'region', label: t('admin.geo.region') },
  ...(can('cities.update') || can('cities.delete') ? [{ key: 'actions', label: t('admin.common.actions') }] : []),
])

// ---- create / edit
const editing = ref<CityRow | 'new' | null>(null)
const form = reactive({ slug: '', region_id: '', names: { ar: '', en: '', it: '' } as Record<string, string> })
const errors = ref<Record<string, string>>({})
const failure = ref('')
const busy = ref(false)
function open(c: CityRow | 'new') {
  editing.value = c; errors.value = {}; failure.value = ''
  form.slug = c === 'new' ? '' : c.slug
  form.region_id = c === 'new' ? '' : String(c.region_id)
  for (const l of LOCALES) form.names[l] = c === 'new' ? '' : c.translations[l] ?? ''
}
async function save() {
  errors.value = {}; failure.value = ''
  if (!form.region_id) { errors.value = { region_id: t('admin.geo.regionRequired') }; return }
  if (!form.names.ar!.trim()) { errors.value = { 'translations.ar': t('admin.geo.arabicRequired') }; return }
  busy.value = true
  const translations = Object.fromEntries(LOCALES.filter(l => form.names[l]!.trim()).map(l => [l, { name: form.names[l]!.trim() }]))
  try {
    const body = { slug: form.slug.trim(), region_id: Number(form.region_id), translations }
    if (editing.value === 'new') await request('admin/cities', { method: 'POST', body })
    else await request(`admin/cities/${(editing.value as CityRow).id}`, { method: 'PUT', body })
    toast.success(t('admin.geo.saved'))
    editing.value = null
    await refresh()
  } catch (e) {
    errors.value = fieldErrors(e)
    failure.value = isApiError(e) && e.status === 403 ? t('admin.common.forbidden') : !Object.keys(errors.value).length ? (isApiError(e) ? e.message : t('errors.generic')) : ''
  } finally { busy.value = false }
}

// ---- delete
const removing = ref<CityRow | null>(null)
const removeError = ref('')
async function remove() {
  if (!removing.value) return
  busy.value = true; removeError.value = ''
  try {
    await request(`admin/cities/${removing.value.id}`, { method: 'DELETE' })
    toast.success(t('admin.geo.deleted'))
    removing.value = null
    await refresh()
  } catch (e) {
    removeError.value = isApiError(e) && e.code === 'city_in_use' ? t('admin.geo.inUse') : isApiError(e) && e.status === 403 ? t('admin.common.forbidden') : isApiError(e) ? e.message : t('errors.generic')
  } finally { busy.value = false }
}
</script>

<template>
  <div>
    <AdminPageHeader :title="t('admin.geo.title')" :description="t('admin.geo.help')" :crumbs="[{ label: t('admin.title'), to: '/admin' }, { label: t('admin.geo.title') }]">
      <UiButton v-if="can('cities.create')" @click="open('new')"><UiIcon name="plus" :size="18" />{{ t('admin.geo.add') }}</UiButton>
    </AdminPageHeader>

    <section v-if="regions.length" aria-labelledby="reg-h" class="mb-8">
      <h2 id="reg-h" class="mb-2 text-xl font-bold">{{ t('admin.geo.regions') }}</h2>
      <ul class="flex flex-wrap gap-2"><li v-for="r in regions" :key="r.id"><UiBadge tone="neutral"><span dir="auto">{{ nameOf(r.translations) || r.slug }}</span> <span class="text-muted" dir="ltr">({{ r.cities }})</span></UiBadge></li></ul>
    </section>

    <div class="mb-6 grid gap-4 sm:grid-cols-2">
      <UiFormField :label="t('admin.common.search')"><UiTextInput v-model="q" type="search" @update:model-value="page = 1" /></UiFormField>
      <UiFormField :label="t('admin.geo.region')"><UiSelect :model-value="regionFilter" :options="regions.map(r => ({ value: String(r.id), label: nameOf(r.translations) || r.slug }))" :placeholder="t('admin.common.all')" @update:model-value="regionFilter = $event; page = 1" /></UiFormField>
    </div>

    <ul v-if="st === 'pending' && !data" aria-busy="true"><li><UiCard><UiSkeleton :lines="5" /></UiCard></li></ul>
    <UiErrorState v-else-if="error" :message="isApiError(error) ? error.message : undefined" retry @retry="refresh()" />
    <UiEmptyState v-else-if="!rows.length" :title="t('admin.common.noResults')" :description="t('admin.common.noResultsHelp')" icon="map" />
    <template v-else>
      <AdminDataTable :columns="columns" :rows="rows" row-key="id" :caption="t('admin.geo.title')">
        <template #cell-name="{ row }"><span dir="auto">{{ nameOf(row.translations) }}</span></template>
        <template #cell-slug="{ row }"><span dir="ltr">{{ row.slug }}</span></template>
        <template #cell-region="{ row }"><span dir="auto">{{ regionName(row.region_id) }}</span></template>
        <template #cell-actions="{ row }">
          <span class="flex flex-wrap gap-2">
            <UiButton v-if="can('cities.update')" variant="secondary" @click="open(row)">{{ t('admin.common.edit') }}<span class="sr-only"> {{ nameOf(row.translations) }}</span></UiButton>
            <UiButton v-if="can('cities.delete')" variant="danger" @click="removing = row; removeError = ''">{{ t('admin.geo.delete') }}<span class="sr-only"> {{ nameOf(row.translations) }}</span></UiButton>
          </span>
        </template>
      </AdminDataTable>
      <div class="mt-4"><UiPagination :page="meta?.page ?? 1" :last-page="meta?.last_page ?? 1" @change="page = $event" /></div>
    </template>

    <AdminDialog :open="!!editing" :title="editing === 'new' ? t('admin.geo.add') : t('admin.geo.edit')" @close="editing = null">
      <form class="space-y-4" novalidate @submit.prevent="save">
        <div aria-live="polite"><UiAlert v-if="failure" tone="danger">{{ failure }}</UiAlert></div>
        <UiFormField :label="t('admin.geo.slug')" :hint="t('admin.geo.slugHint')" required :error="errors.slug"><UiTextInput v-model="form.slug" ltr :maxlength="80" /></UiFormField>
        <UiFormField :label="t('admin.geo.region')" required :error="errors.region_id"><UiSelect v-model="form.region_id" :options="regions.map(r => ({ value: String(r.id), label: nameOf(r.translations) || r.slug }))" :placeholder="t('common.choose')" /></UiFormField>
        <UiFormField v-for="l in LOCALES" :key="l" :label="`${t('admin.geo.name')} (${t(`languages.${l}`)})`" :required="l === 'ar'" :optional="l !== 'ar'" :error="errors[`translations.${l}.name`] || errors[`translations.${l}`] || (l === 'ar' ? errors.translations || errors['translations.ar'] : undefined)">
          <UiTextInput v-model="form.names[l]!" :maxlength="120" :dir="l === 'ar' ? 'rtl' : 'ltr'" />
        </UiFormField>
        <div class="flex flex-wrap gap-2"><UiButton type="submit" :loading="busy">{{ t('common.save') }}</UiButton><UiButton variant="secondary" @click="editing = null">{{ t('common.cancel') }}</UiButton></div>
      </form>
    </AdminDialog>

    <AdminDialog :open="!!removing" :title="t('admin.geo.delete')" @close="removing = null">
      <div v-if="removing" class="space-y-4">
        <div aria-live="polite"><UiAlert v-if="removeError" tone="danger">{{ removeError }}</UiAlert></div>
        <UiConfirmInline :message="t('admin.geo.deleteConfirm', { name: nameOf(removing.translations) })" :confirm-label="t('admin.geo.delete')" :loading="busy" @cancel="removing = null" @confirm="remove" />
      </div>
    </AdminDialog>
  </div>
</template>
