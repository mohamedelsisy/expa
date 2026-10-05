<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { fieldErrors, isApiError } from '~/utils/errors'
import { formatDateTime } from '~/utils/locale'

export interface JobSource { id: number, key: string, name: string, driver: string, active: boolean, schedule_hours: number, legal_basis: string | null, config_summary: { host: string | null, has_headers: boolean, items_path: string | null, map: Record<string, string> | never[] }, last_run_at: string | null, last_status: string | null, consecutive_failures: number }
interface Run { id: number, status: string, fetched: number, created: number, updated: number, unchanged: number, duplicates: number, invalid: number, error_samples: unknown, error_message: string | null, started_at: string | null, finished_at: string | null }
type Pair = { k: string, v: string }

/** Create/edit a job source. The API never returns the URL or headers: editing config means entering NEW values. */
const props = defineProps<{ source: JobSource | null }>()
const emit = defineEmits<{ saved: [], close: [] }>()
const { t, locale } = useI18n()
const { request } = useApi()
const toast = useToast()
const { can } = usePermissions()
const creating = !props.source
const s = props.source
const mapObj = (s && !Array.isArray(s.config_summary.map) ? s.config_summary.map : {}) as Record<string, string>
const f = reactive({
  key: s?.key ?? '', name: s?.name ?? '', driver: s?.driver ?? 'json_feed', schedule_hours: String(s?.schedule_hours ?? 6), active: s?.active ?? false,
  legal_basis: s?.legal_basis ?? '', url: '', items_path: s?.config_summary.items_path ?? '', company_default: '',
  headers: [] as Pair[], map: Object.entries(mapObj).map(([k, v]) => ({ k, v })) as Pair[],
})
const touchedHeaders = ref(false)
const errors = ref<Record<string, string>>({})
const formError = ref('')
const busy = ref(false)
const legalOk = computed(() => f.legal_basis.trim().length >= 20)
const canWrite = computed(() => (creating ? can('job_sources.create') : can('job_sources.update')))

const runs = ref<Run[] | null>(null)
const runsError = ref('')
async function loadRuns() {
  if (!s || !can('job_sources.view')) return
  try { runs.value = (await request<Run[]>(`admin/job-sources/${s.id}/runs`)).data } catch (e) { runsError.value = isApiError(e) ? e.message : t('errors.generic') }
}
onMounted(loadRuns)
const sample = (v: unknown): string[] => (Array.isArray(v) ? v : v ? [v] : []).map(x => (typeof x === 'string' ? x : JSON.stringify(x)).slice(0, 240))

function toObj(pairs: Pair[]) { return Object.fromEntries(pairs.filter(p => p.k.trim()).map(p => [p.k.trim(), p.v])) }
async function save() {
  errors.value = {}; formError.value = ''
  if (f.active && !legalOk.value) { errors.value = { legal_basis: t('admin.jobs.legalRequired') }; return }
  const config: Record<string, unknown> = {}
  if (f.url.trim()) config.url = f.url.trim()
  if (f.items_path.trim() && f.items_path !== (s?.config_summary.items_path ?? '')) config.items_path = f.items_path.trim()
  if (f.company_default.trim()) config.company_default = f.company_default.trim()
  if (touchedHeaders.value) config.headers = toObj(f.headers)
  const mapNow = toObj(f.map)
  if (creating ? Object.keys(mapNow).length : JSON.stringify(mapNow) !== JSON.stringify(mapObj)) config.map = mapNow
  if (creating && !config.url) { errors.value = { 'config.url': t('admin.validation.required') }; return }
  const body: Record<string, unknown> = { name: f.name.trim(), driver: f.driver, schedule_hours: Number(f.schedule_hours), active: f.active, legal_basis: f.legal_basis.trim() || null }
  if (creating) body.key = f.key.trim()
  if (creating || Object.keys(config).length) body.config = config
  busy.value = true
  try {
    await request(creating ? 'admin/job-sources' : `admin/job-sources/${s!.id}`, { method: creating ? 'POST' : 'PUT', body })
    toast.success(t('admin.jobs.saved'))
    emit('saved')
  } catch (e) {
    if (!isApiError(e)) { formError.value = t('errors.generic'); return }
    errors.value = fieldErrors(e)
    formError.value = e.status === 403 ? (e.message || t('admin.common.forbidden')) : e.message
  } finally { busy.value = false }
}
async function runNow() {
  busy.value = true
  try { await request(`admin/job-sources/${s!.id}/run`, { method: 'POST' }); toast.success(t('admin.jobs.runQueued')); setTimeout(loadRuns, 1500) } catch (e) { formError.value = isApiError(e) ? e.message : t('errors.generic') } finally { busy.value = false }
}
const addPair = (list: Pair[]) => list.push({ k: '', v: '' })
</script>

<template>
  <form class="space-y-5" novalidate @submit.prevent="save">
    <div aria-live="polite"><UiAlert v-if="formError" tone="danger">{{ formError }}</UiAlert></div>
    <UiAlert v-if="!canWrite" tone="info">{{ t('admin.content.readonly') }}</UiAlert>
    <div class="grid gap-4 sm:grid-cols-2">
      <UiFormField v-if="creating" :label="t('admin.jobs.key')" :hint="t('admin.jobs.keyHelp')" :error="errors.key" required><UiTextInput v-model="f.key" ltr :disabled="!canWrite" /></UiFormField>
      <UiFormField :label="t('admin.fields.name')" :error="errors.name" required><UiTextInput v-model="f.name" :disabled="!canWrite" /></UiFormField>
      <UiFormField :label="t('admin.jobs.driver')" :error="errors.driver" required><UiSelect v-model="f.driver" :options="[{ value: 'json_feed', label: 'JSON feed' }, { value: 'rss', label: 'RSS' }]" :disabled="!canWrite" /></UiFormField>
      <UiFormField :label="t('admin.jobs.scheduleHours')" :hint="t('admin.jobs.scheduleHelp')" :error="errors.schedule_hours" required><UiTextInput v-model="f.schedule_hours" type="number" inputmode="numeric" ltr :disabled="!canWrite" /></UiFormField>
    </div>

    <UiFormField :label="t('admin.jobs.legalBasis')" :hint="t('admin.jobs.legalHelp')" :error="errors.legal_basis" :required="f.active" :optional="!f.active">
      <UiTextarea v-model="f.legal_basis" :rows="3" :maxlength="2000" :disabled="!canWrite" />
    </UiFormField>
    <div>
      <UiCheckbox v-model="f.active" :label="t('admin.jobs.active')" :description="legalOk ? t('admin.jobs.activeHelp') : t('admin.jobs.activeBlocked')" :disabled="!canWrite || (!legalOk && !f.active)" />
      <UiAlert v-if="!legalOk" tone="warning" class="mt-2">{{ t('admin.jobs.legalWarning') }}</UiAlert>
    </div>

    <fieldset class="space-y-3 rounded-md border border-line p-4">
      <legend class="px-1 font-bold">{{ t('admin.jobs.config') }}</legend>
      <UiAlert tone="info"><template v-if="!creating">{{ t('admin.jobs.configNeverShown', { host: s?.config_summary.host ?? '—', headers: s?.config_summary.has_headers ? t('admin.common.true') : t('admin.common.false') }) }}</template><template v-else>{{ t('admin.jobs.configCreate') }}</template></UiAlert>
      <UiFormField :label="creating ? t('admin.jobs.url') : t('admin.jobs.urlNew')" :hint="t('admin.jobs.urlHelp')" :error="errors['config.url']" :required="creating" :optional="!creating"><UiTextInput v-model="f.url" type="url" ltr autocomplete="off" :disabled="!canWrite" /></UiFormField>
      <div class="grid gap-4 sm:grid-cols-2">
        <UiFormField :label="t('admin.jobs.itemsPath')" :error="errors['config.items_path']" optional><UiTextInput v-model="f.items_path" ltr :disabled="!canWrite" /></UiFormField>
        <UiFormField :label="t('admin.jobs.companyDefault')" :error="errors['config.company_default']" optional><UiTextInput v-model="f.company_default" :disabled="!canWrite" /></UiFormField>
      </div>
      <div class="space-y-2">
        <p class="font-medium">{{ t('admin.jobs.headers') }}</p>
        <p class="text-sm text-muted">{{ !creating ? t('admin.jobs.headersReplace') : t('admin.jobs.headersHelp') }}</p>
        <div v-for="(p, i) in f.headers" :key="i" class="grid grid-cols-[1fr_1fr_auto] items-end gap-2">
          <UiFormField :label="t('admin.jobs.headerName')"><UiTextInput v-model="p.k" ltr autocomplete="off" :disabled="!canWrite" /></UiFormField>
          <UiFormField :label="t('admin.jobs.headerValue')"><UiTextInput v-model="p.v" type="password" ltr autocomplete="off" :disabled="!canWrite" /></UiFormField>
          <UiIconButton icon="trash" :label="t('admin.editor.remove', { n: i + 1 })" @click="f.headers.splice(i, 1)" />
        </div>
        <UiButton variant="secondary" :disabled="!canWrite || f.headers.length >= 10" @click="touchedHeaders = true; addPair(f.headers)"><UiIcon name="plus" :size="18" />{{ t('admin.jobs.addHeader') }}</UiButton>
        <UiButton v-if="!creating && !touchedHeaders && s?.config_summary.has_headers" variant="ghost" :disabled="!canWrite" @click="touchedHeaders = true">{{ t('admin.jobs.clearHeaders') }}</UiButton>
      </div>
      <div class="space-y-2">
        <p class="font-medium">{{ t('admin.jobs.map') }}</p>
        <p class="text-sm text-muted">{{ t('admin.jobs.mapHelp') }}</p>
        <div v-for="(p, i) in f.map" :key="i" class="grid grid-cols-[1fr_1fr_auto] items-end gap-2">
          <UiFormField :label="t('admin.jobs.mapTarget')"><UiTextInput v-model="p.k" ltr :disabled="!canWrite" /></UiFormField>
          <UiFormField :label="t('admin.jobs.mapSource')"><UiTextInput v-model="p.v" ltr :disabled="!canWrite" /></UiFormField>
          <UiIconButton icon="trash" :label="t('admin.editor.remove', { n: i + 1 })" @click="f.map.splice(i, 1)" />
        </div>
        <UiButton variant="secondary" :disabled="!canWrite || f.map.length >= 30" @click="addPair(f.map)"><UiIcon name="plus" :size="18" />{{ t('admin.jobs.addMap') }}</UiButton>
      </div>
    </fieldset>

    <div class="flex flex-wrap gap-2">
      <UiButton type="submit" :loading="busy" :disabled="!canWrite">{{ creating ? t('admin.content.create') : t('admin.content.saveChanges') }}</UiButton>
      <UiButton v-if="!creating && can('job_sources.update')" variant="secondary" :disabled="busy || !s?.active" @click="runNow"><UiIcon name="refresh" :size="18" />{{ t('admin.jobs.runNow') }}</UiButton>
    </div>
    <p v-if="!creating && !s?.active" class="text-sm text-muted">{{ t('admin.jobs.runInactive') }}</p>

    <section v-if="!creating && can('job_sources.view')" aria-labelledby="runs-h" class="space-y-2">
      <h3 id="runs-h" class="font-bold">{{ t('admin.jobs.runs') }}</h3>
      <UiAlert v-if="runsError" tone="danger">{{ runsError }}</UiAlert>
      <UiSkeleton v-else-if="!runs" :lines="3" />
      <p v-else-if="!runs.length" class="text-sm text-muted">{{ t('admin.jobs.noRuns') }}</p>
      <div v-else class="relative overflow-x-auto rounded-md border border-line" role="region" :aria-label="t('admin.jobs.runs')" tabindex="0">
        <table class="w-full min-w-[34rem] border-collapse text-start text-sm">
          <caption class="sr-only">{{ t('admin.jobs.runs') }}</caption>
          <thead class="bg-sunken"><tr>
            <th scope="col" class="px-2 py-1.5 text-start">{{ t('admin.jobs.runStarted') }}</th><th scope="col" class="px-2 py-1.5 text-start">{{ t('admin.fields.status') }}</th>
            <th scope="col" class="px-2 py-1.5 text-end">{{ t('admin.jobs.fetched') }}</th><th scope="col" class="px-2 py-1.5 text-end">{{ t('admin.jobs.created') }}</th><th scope="col" class="px-2 py-1.5 text-end">{{ t('admin.jobs.updated') }}</th><th scope="col" class="px-2 py-1.5 text-end">{{ t('admin.jobs.duplicates') }}</th><th scope="col" class="px-2 py-1.5 text-end">{{ t('admin.jobs.invalid') }}</th>
          </tr></thead>
          <tbody class="divide-y divide-line">
            <template v-for="r in runs" :key="r.id">
              <tr>
                <th scope="row" class="px-2 py-1.5 text-start font-normal">{{ formatDateTime(r.started_at, locale) }}</th>
                <td class="px-2 py-1.5"><UiBadge :tone="r.status === 'failed' ? 'danger' : r.status === 'success' || r.status === 'completed' ? 'success' : 'neutral'">{{ r.status }}</UiBadge></td>
                <td class="px-2 py-1.5 text-end tabular-nums">{{ r.fetched }}</td><td class="px-2 py-1.5 text-end tabular-nums">{{ r.created }}</td><td class="px-2 py-1.5 text-end tabular-nums">{{ r.updated }}</td><td class="px-2 py-1.5 text-end tabular-nums">{{ r.duplicates }}</td><td class="px-2 py-1.5 text-end tabular-nums">{{ r.invalid }}</td>
              </tr>
              <tr v-if="r.error_message || sample(r.error_samples).length"><td colspan="7" class="bg-danger-soft px-2 py-1.5 text-danger"><p v-if="r.error_message" dir="auto">{{ r.error_message }}</p><ul class="list-disc ps-5"><li v-for="(x, i) in sample(r.error_samples)" :key="i" dir="auto">{{ x }}</li></ul></td></tr>
            </template>
          </tbody>
        </table>
      </div>
    </section>
  </form>
</template>
