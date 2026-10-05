<script setup lang="ts">
import { computed, nextTick, reactive, ref } from 'vue'
import type { ContentModule, Loc } from '~/utils/admin/modules'
import { COMMON_FIELDS, PLACE_FIELDS, SOURCE_FIELDS } from '~/utils/admin/modules'
import { buildPayload, fromItem, emptyForm, translationErrors, validateForm, type FormState } from '~/utils/admin/form'
import { editState, editWarning, type ContentStatus } from '~/utils/admin/workflow'
import { extractProblems, type ProblemTarget } from '~/utils/admin/problems'
import { fieldErrors, isApiError } from '~/utils/errors'
import { formatDateTime } from '~/utils/locale'

/** Create / edit form for any lifecycle module, driven entirely by the module schema. */
const props = defineProps<{ module: ContentModule, initial: Record<string, any> | null }>()
const emit = defineEmits<{ saved: [item: Record<string, any>], deleted: [] }>()
const { t, locale } = useI18n()
const { request } = useApi()
const toast = useToast()
const auth = useAuthStore()
const { can } = usePermissions()
const m = props.module

const item = ref<Record<string, any> | null>(props.initial)
const form = reactive<FormState>(item.value ? fromItem(m, item.value) : emptyForm(m))
const baseline = ref(JSON.stringify(form))
const dirty = computed(() => JSON.stringify(form) !== baseline.value)
const errors = ref<Record<string, string>>({})
const formError = ref('')
const problems = ref<ReturnType<typeof extractProblems>>([])
const saving = ref(false)
const confirmDelete = ref(false)
const active = ref<Loc>('ar')

const creating = computed(() => !item.value)
const status = computed<ContentStatus>(() => (item.value?.status ?? 'draft') as ContentStatus)
const state = computed(() => (creating.value ? (can(`${m.permission}.create`) ? 'editable' : 'readonly') : editState(status.value, m.permission, can)))
const disabled = computed(() => state.value !== 'editable' || saving.value)
const warning = computed(() => (creating.value ? null : editWarning(status.value, can(`${m.permission}.publish`))))
const trErrors = computed(() => translationErrors(errors.value))
const firstRequired = m.translatable.find(f => f.requiredToPublish)?.key
const err = (key: string) => (errors.value[key] ? errors.value[key] : undefined)
const label = (k: string) => t(`admin.fields.${k}`)
const msg = (k: string) => (k.startsWith('admin.') ? t(k) : k)
const attrError = (k: string) => { const v = errors.value[k]; return v ? msg(v) : undefined }

const { regions, cities, load: loadPlaces } = usePlaces()
onMounted(() => { if (m.place) loadPlaces() })
const cityOptions = computed(() => cities.value.filter(c => !form.attrs.region_id || String(c.region.id) === form.attrs.region_id).map(c => ({ value: String(c.id), label: c.name })))
const regionOptions = computed(() => regions.value.map(r => ({ value: String(r.id), label: r.name })))
function setRegion(v: string) {
  form.attrs.region_id = v
  const c = cities.value.find(x => String(x.id) === form.attrs.city_id)
  if (c && v && String(c.region.id) !== v) form.attrs.city_id = ''
}
function setCity(v: string) {
  form.attrs.city_id = v
  const c = cities.value.find(x => String(x.id) === v)
  if (c) form.attrs.region_id = String(c.region.id)
}

function replaceFrom(next: Record<string, any>) {
  item.value = next
  Object.assign(form, fromItem(m, next))
  baseline.value = JSON.stringify(form)
}

function jump(target: ProblemTarget) {
  if (target.kind === 'none') return
  let sel: string
  if (target.kind === 'translation') { active.value = target.locale as Loc; sel = `[data-admin-field="tr:${target.locale}:${target.field ?? m.primary}"]` }
  else sel = `[data-admin-field="${target.field}"]`
  nextTick(() => {
    const root = document.querySelector<HTMLElement>(sel)
    root?.scrollIntoView({ block: 'center' })
    root?.querySelector<HTMLElement>('input,select,textarea,button')?.focus()
  })
}

function applyServerErrors(e: unknown) {
  const raw = fieldErrors(e)
  const flat: Record<string, string> = {}
  for (const [k, v] of Object.entries(raw)) flat[k.startsWith('translations.') ? k : k.split('.')[0]!] ??= v
  for (const [k, v] of Object.entries(raw)) if (k.startsWith('translations.')) flat[k] = v
  errors.value = flat
  const first = Object.keys(flat)[0]
  if (first) {
    const tr = /^translations\.(ar|en|it)\.([^.]+)/.exec(first)
    jump(tr ? { kind: 'translation', locale: tr[1]!, field: tr[2] } : { kind: 'field', field: first.split('.')[0]! })
  }
}

async function save() {
  formError.value = ''
  problems.value = []
  const local = validateForm(m, form, { creating: creating.value })
  errors.value = local
  const first = Object.keys(local)[0]
  if (first) {
    const tr = /^translations\.(ar|en|it)\.([^.]+)/.exec(first)
    jump(tr ? { kind: 'translation', locale: tr[1]!, field: tr[2] } : { kind: 'field', field: first })
    return
  }
  saving.value = true
  try {
    const body = buildPayload(m, form, { creating: creating.value })
    const res = creating.value
      ? await request<Record<string, any>>(m.endpoint, { method: 'POST', body })
      : await request<Record<string, any>>(`${m.endpoint}/${item.value!.id}`, { method: 'PUT', body })
    toast.success(t('admin.content.saved'))
    if (creating.value) { emit('saved', res.data); return }
    replaceFrom(res.data)
    emit('saved', res.data)
  } catch (e) {
    if (!isApiError(e)) { formError.value = t('errors.generic'); return }
    if (e.code === 'content_not_publishable') { problems.value = extractProblems(e); formError.value = e.message }
    else if (e.status === 422) { applyServerErrors(e); formError.value = e.message }
    else formError.value = e.status === 403 ? (e.message || t('admin.common.forbidden')) : e.message
  } finally { saving.value = false }
}

async function transition(to: ContentStatus) {
  const res = await request<Record<string, any>>(`${m.endpoint}/${item.value!.id}/transition`, { method: 'POST', body: { to } })
  if (dirty.value) item.value = res.data
  else replaceFrom(res.data)
  toast.success(t('admin.workflow.done'))
}
async function schedule(iso: string) {
  const res = await request<Record<string, any>>(`${m.endpoint}/${item.value!.id}/schedule`, { method: 'POST', body: { publish_at: iso } })
  if (dirty.value) item.value = res.data
  else replaceFrom(res.data)
  toast.success(t('admin.workflow.scheduled'))
}
async function remove() {
  try {
    await request(`${m.endpoint}/${item.value!.id}`, { method: 'DELETE' })
    toast.success(t('admin.content.deleted'))
    emit('deleted')
  } catch (e) {
    confirmDelete.value = false
    formError.value = isApiError(e) ? e.message : t('errors.generic')
  }
}
const canDelete = computed(() => !creating.value && ['draft', 'archived'].includes(status.value) && can(`${m.permission}.delete`))
</script>

<template>
  <form class="space-y-6" novalidate @submit.prevent="save">
    <AdminWorkflowBar
      v-if="item"
      :status="status"
      :allowed="item.allowed_transitions ?? []"
      :prefix="m.permission"
      :can="can"
      :publish-at="item.publish_at"
      :created-by-me="item.created_by === auth.user?.id"
      :first-required-field="firstRequired"
      :transition="transition"
      :schedule="schedule"
      :dirty="dirty"
      @jump="jump"
    />

    <UiAlert v-if="state === 'readonly'" tone="info">{{ t('admin.content.readonly') }}</UiAlert>
    <UiAlert v-else-if="state === 'locked'" tone="info">{{ t('admin.content.locked') }}</UiAlert>
    <UiAlert v-else-if="warning === 'review_reset'" tone="warning">{{ t('admin.content.warnReview') }}</UiAlert>
    <UiAlert v-else-if="warning === 'live_revalidate'" tone="warning">{{ t('admin.content.warnLive') }}</UiAlert>

    <div aria-live="polite">
      <AdminProblemsChecklist v-if="problems.length" :problems="problems" :first-required-field="firstRequired" @jump="jump" />
      <UiAlert v-else-if="formError" tone="danger">{{ formError }}</UiAlert>
    </div>

    <UiCard as="section" aria-labelledby="sec-general">
      <h2 id="sec-general" class="mb-4 text-lg font-bold">{{ t('admin.content.general') }}</h2>
      <div class="grid gap-4 sm:grid-cols-2">
        <AdminAttrField v-for="f in [...COMMON_FIELDS, ...m.attributes]" :key="f.key" v-model="form.attrs[f.key]!" :field="f" :error="attrError(f.key)" :disabled="disabled" :class="f.relation === 'offices' || f.type === 'multiselect' || f.type === 'textarea' ? 'sm:col-span-2' : ''" />
      </div>
    </UiCard>

    <UiCard v-if="m.place" as="section" aria-labelledby="sec-place">
      <h2 id="sec-place" class="mb-1 text-lg font-bold">{{ t('admin.content.place') }}</h2>
      <p class="mb-4 text-sm text-muted">{{ t('admin.content.placeHelp') }}</p>
      <div class="grid gap-4 sm:grid-cols-2">
        <div data-admin-field="region_id"><UiFormField :label="label('region_id')" optional :error="attrError('region_id')"><UiSelect :model-value="(form.attrs.region_id as string)" :options="regionOptions" :placeholder="t('admin.common.noneNational')" :disabled="disabled" @update:model-value="setRegion" /></UiFormField></div>
        <div data-admin-field="city_id"><UiFormField :label="label('city_id')" optional :error="attrError('city_id')"><UiSelect :model-value="(form.attrs.city_id as string)" :options="cityOptions" :placeholder="t('admin.common.noneNational')" :disabled="disabled" @update:model-value="setCity" /></UiFormField></div>
      </div>
    </UiCard>

    <UiCard as="section" aria-labelledby="sec-source">
      <div class="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h2 id="sec-source" class="text-lg font-bold">{{ t('admin.content.source') }}</h2>
        <AdminFreshnessBadge v-if="item" :freshness="item.source?.freshness ?? 'unverified'" />
      </div>
      <p class="mb-4 text-sm text-muted">{{ m.sourceRequired ? t('admin.content.sourceRequired') : t('admin.content.sourceOptional') }}</p>
      <div class="grid gap-4 sm:grid-cols-2">
        <AdminAttrField v-for="f in SOURCE_FIELDS" :key="f.key" v-model="form.attrs[f.key]!" :field="f" :error="attrError(f.key)" :disabled="disabled" />
      </div>
    </UiCard>

    <UiCard as="section" aria-labelledby="sec-tr">
      <h2 id="sec-tr" class="mb-1 text-lg font-bold">{{ t('admin.content.translations') }}</h2>
      <p v-if="errors.translations" class="mb-2 font-medium text-danger" role="alert">{{ msg(errors.translations) }}</p>
      <AdminTranslationEditor v-model="form.translations" v-model:active="active" :fields="m.translatable" :primary="m.primary" :required-locales="m.requiredLocales" :missing-locales="item?.missing_locales ?? ['ar', 'en', 'it']" :errors="trErrors" :disabled="disabled" />
    </UiCard>

    <p v-if="item" class="text-sm text-muted">{{ t('admin.content.updatedAt', { date: formatDateTime(item.updated_at, locale) }) }}</p>

    <div class="sticky bottom-0 z-10 -mx-4 flex flex-wrap items-center gap-2 border-t border-line bg-surface/95 px-4 py-3 backdrop-blur sm:mx-0 sm:rounded-lg sm:border">
      <UiButton type="submit" :loading="saving" :disabled="state !== 'editable'">{{ creating ? t('admin.content.create') : t('admin.content.saveChanges') }}</UiButton>
      <UiButton variant="secondary" :to="`/admin/content/${m.key}`">{{ t('common.cancel') }}</UiButton>
      <span v-if="dirty" class="text-sm text-muted" role="status">{{ t('admin.content.unsaved') }}</span>
      <UiButton v-if="canDelete && !confirmDelete" variant="ghost" class="ms-auto" @click="confirmDelete = true"><UiIcon name="trash" :size="18" />{{ t('common.delete') }}</UiButton>
    </div>
    <UiConfirmInline v-if="confirmDelete" :message="t('admin.content.confirmDelete')" :confirm-label="t('common.delete')" @cancel="confirmDelete = false" @confirm="remove" />
  </form>
</template>
