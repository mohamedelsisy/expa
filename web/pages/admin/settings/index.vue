<script setup lang="ts">
import { isApiError } from '~/utils/errors'

definePageMeta({ layout: 'admin', middleware: 'admin' })
const { t } = useI18n()
const { request } = useApi()
useAdminSeo(() => t('admin.settings.title'))
const { data, error, refresh, status: st } = await useAsyncData('admin-settings', () => request<Record<string, unknown>>('admin/settings'))

type Entry = { key: string, value: string }
/** Flattens one level of nested config into label/value rows; arrays and booleans are rendered as plain text. */
function entries(obj: unknown): Entry[] {
  if (!obj || typeof obj !== 'object') return []
  return Object.entries(obj as Record<string, unknown>).map(([key, v]) => ({
    key,
    value: typeof v === 'boolean' ? t(v ? 'admin.common.true' : 'admin.common.false') : Array.isArray(v) ? v.join(', ') : v !== null && typeof v === 'object' ? JSON.stringify(v) : String(v ?? '—'),
  }))
}
const sections = computed(() => Object.entries(data.value?.data ?? {}).map(([key, v]) => (v !== null && typeof v === 'object' && !Array.isArray(v) ? { key, rows: entries(v) } : { key: 'general', rows: [{ key, value: typeof v === 'boolean' ? t(v ? 'admin.common.true' : 'admin.common.false') : Array.isArray(v) ? v.join(', ') : String(v ?? '—') }] })).reduce<{ key: string, rows: Entry[] }[]>((acc, s) => {
  const hit = acc.find(a => a.key === s.key)
  if (hit) hit.rows.push(...s.rows)
  else acc.push(s)
  return acc
}, []))
</script>

<template>
  <div>
    <AdminPageHeader :title="t('admin.settings.title')" :description="t('admin.settings.help')" :crumbs="[{ label: t('admin.title'), to: '/admin' }, { label: t('admin.settings.title') }]" />
    <UiAlert tone="info" class="mb-6" data-testid="settings-readonly">{{ t('admin.settings.readonly') }}</UiAlert>
    <ul v-if="st === 'pending' && !data" aria-busy="true"><li><UiCard><UiSkeleton :lines="6" /></UiCard></li></ul>
    <UiErrorState v-else-if="error" :message="isApiError(error) ? error.message : undefined" retry @retry="refresh()" />
    <div v-else class="grid gap-6 lg:grid-cols-2">
      <section v-for="s in sections" :key="s.key" :aria-labelledby="`set-${s.key}`" class="rounded-lg border border-line bg-surface p-4">
        <h2 :id="`set-${s.key}`" class="mb-3 text-lg font-bold">{{ t(`admin.settings.sections.${s.key}`) }}</h2>
        <dl class="grid grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] gap-x-4 gap-y-2 text-sm">
          <template v-for="r in s.rows" :key="r.key"><dt class="break-words text-ink-soft" dir="ltr">{{ r.key }}</dt><dd class="break-words font-medium" dir="auto">{{ r.value }}</dd></template>
        </dl>
      </section>
    </div>
  </div>
</template>
