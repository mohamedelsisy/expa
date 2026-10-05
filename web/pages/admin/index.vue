<script setup lang="ts">
import { formatNumber } from '~/utils/locale'
import { isApiError } from '~/utils/errors'
import { visibleNav } from '~/utils/admin/nav'

definePageMeta({ layout: 'admin', middleware: 'admin' })
const { t, locale } = useI18n()
const { request } = useApi()
const { can, canAny } = usePermissions()
const localePath = useLocalePath()
useAdminSeo(() => t('admin.title'))

interface Stats {
  users: { total: number, new_30d: number, active_30d: number }
  ai: { questions_30d: number }
  content: { published_guides: number, pending_review: number, stale_sources: number }
  jobs: { listed: number, imported_30d: number, failing_sources: number }
  billing: { active_subscriptions: number, revenue_30d_minor: number, failed_payments_30d: number }
  system: { failed_queue_jobs: number, pending_queue_jobs: number }
}
interface Analytics { totals: { name: string, total: number }[], daily: { day: string, name: string, total: number }[], top_content: { name: string, subject: string, total: number }[] }

const canReports = can('reports.view')
const route = useRoute()
const q = computed(() => ({ from: typeof route.query.from === 'string' ? route.query.from : '', to: typeof route.query.to === 'string' ? route.query.to : '', name: typeof route.query.name === 'string' ? route.query.name : '' }))
const stats = canReports ? await useAsyncData('admin-stats', () => request<Stats>('admin/stats')) : null
const analytics = canReports ? await useAsyncData('admin-analytics', () => request<Analytics>('admin/analytics', { query: q.value }), { watch: [q] }) : null

const s = computed(() => stats?.data.value?.data)
const num = (n: number) => formatNumber(n, locale.value)
const money = (minor: number) => formatNumber(minor / 100, locale.value, { style: 'currency', currency: 'EUR' })
const cards = computed(() => {
  const d = s.value
  if (!d) return []
  return [
    { key: 'users', title: t('admin.dash.users'), items: [[t('admin.dash.total'), num(d.users.total)], [t('admin.dash.new30'), num(d.users.new_30d)], [t('admin.dash.active30'), num(d.users.active_30d)]] },
    { key: 'ai', title: t('admin.dash.ai'), items: [[t('admin.dash.questions30'), num(d.ai.questions_30d)]] },
    { key: 'content', title: t('admin.dash.content'), items: [[t('admin.dash.publishedGuides'), num(d.content.published_guides)], [t('admin.dash.pendingReview'), num(d.content.pending_review)], [t('admin.dash.staleSources'), num(d.content.stale_sources)]], warn: d.content.stale_sources > 0 || d.content.pending_review > 0 },
    { key: 'jobs', title: t('admin.dash.jobs'), items: [[t('admin.dash.listed'), num(d.jobs.listed)], [t('admin.dash.imported30'), num(d.jobs.imported_30d)], [t('admin.dash.failingSources'), num(d.jobs.failing_sources)]], warn: d.jobs.failing_sources > 0 },
    { key: 'billing', title: t('admin.dash.billing'), items: [[t('admin.dash.activeSubs'), num(d.billing.active_subscriptions)], [t('admin.dash.revenue30'), money(d.billing.revenue_30d_minor)], [t('admin.dash.failedPayments30'), num(d.billing.failed_payments_30d)]], warn: d.billing.failed_payments_30d > 0 },
    { key: 'system', title: t('admin.dash.queue'), items: [[t('admin.dash.pendingQueue'), num(d.system.pending_queue_jobs)], [t('admin.dash.failedQueue'), num(d.system.failed_queue_jobs)]], warn: d.system.failed_queue_jobs > 0 },
  ]
})

const A = computed(() => analytics?.data.value?.data)
const maxTotal = computed(() => Math.max(1, ...(A.value?.totals.map(x => x.total) ?? [1])))
// daily series: one row per day (all events summed, or the filtered event)
const days = computed(() => {
  const by = new Map<string, number>()
  for (const r of A.value?.daily ?? []) by.set(r.day, (by.get(r.day) ?? 0) + r.total)
  return [...by.entries()].map(([day, total]) => ({ day, total }))
})
const maxDay = computed(() => Math.max(1, ...days.value.map(d => d.total)))
const EVENTS = ['signup', 'login', 'guide_view', 'job_view', 'job_apply_click', 'lesson_started', 'lesson_completed', 'ai_question', 'document_added', 'reminder_created', 'appointment_clicked', 'subscription_started']
const evLabel = (n: string) => (EVENTS.includes(n) ? t(`admin.events.${n}`) : n)
const setQ = (patch: Record<string, string>) => navigateTo({ path: route.path, query: Object.fromEntries(Object.entries({ ...q.value, ...patch }).filter(([, v]) => v)) }, { replace: true })
const quick = computed(() => visibleNav(canAny).flatMap(g => g.items).filter(i => !i.exact))
const err = (e: unknown) => (isApiError(e) ? e.message : undefined)
</script>

<template>
  <div class="space-y-8">
    <AdminPageHeader :title="t('admin.title')" :description="t('admin.dash.subtitle')" />

    <section v-if="!canReports" aria-labelledby="quick">
      <UiAlert tone="info" class="mb-4">{{ t('admin.dash.noReports') }}</UiAlert>
      <h2 id="quick" class="mb-3 text-lg font-bold">{{ t('admin.dash.quickLinks') }}</h2>
      <ul class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <li v-for="i in quick" :key="i.key"><NuxtLink :to="localePath(i.to)" class="flex min-h-touch items-center gap-3 rounded-lg border border-line bg-surface p-4 font-medium hover:shadow-2"><UiIcon :name="i.icon" />{{ t(i.label) }}</NuxtLink></li>
      </ul>
    </section>

    <template v-else>
      <section aria-labelledby="stats-h">
        <h2 id="stats-h" class="sr-only">{{ t('admin.dash.overview') }}</h2>
        <ul v-if="stats?.status.value === 'pending' && !s" aria-busy="true" class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"><li v-for="n in 6" :key="n"><UiCard><UiSkeleton :lines="3" /></UiCard></li></ul>
        <UiErrorState v-else-if="stats?.error.value" :message="err(stats.error.value)" retry @retry="stats?.refresh()" />
        <ul v-else class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <li v-for="c in cards" :key="c.key">
            <UiCard as="article" class="h-full" :data-card="c.key">
              <h3 class="mb-3 flex items-center gap-2 text-base font-bold">{{ c.title }}<UiBadge v-if="c.warn" tone="warning">{{ t('admin.dash.attention') }}</UiBadge></h3>
              <dl class="space-y-1.5">
                <div v-for="(it, i) in c.items" :key="i" class="flex items-baseline justify-between gap-3"><dt class="text-ink-soft">{{ it[0] }}</dt><dd class="text-lg font-bold tabular-nums" dir="ltr">{{ it[1] }}</dd></div>
              </dl>
            </UiCard>
          </li>
        </ul>
      </section>

      <section aria-labelledby="an-h" class="space-y-4">
        <h2 id="an-h" class="text-xl font-bold">{{ t('admin.dash.analytics') }}</h2>
        <form class="grid gap-3 rounded-lg border border-line bg-surface p-4 sm:grid-cols-3" @submit.prevent>
          <UiFormField :label="t('admin.dash.from')" optional><UiTextInput :model-value="q.from" type="date" ltr @update:model-value="setQ({ from: $event })" /></UiFormField>
          <UiFormField :label="t('admin.dash.to')" optional><UiTextInput :model-value="q.to" type="date" ltr @update:model-value="setQ({ to: $event })" /></UiFormField>
          <UiFormField :label="t('admin.dash.event')"><UiSelect :model-value="q.name" :options="EVENTS.map(e => ({ value: e, label: t(`admin.events.${e}`) }))" :placeholder="t('admin.common.all')" @update:model-value="setQ({ name: $event })" /></UiFormField>
        </form>
        <p class="text-sm text-muted">{{ t('admin.dash.privacyNote') }}</p>
        <UiSkeleton v-if="analytics?.status.value === 'pending' && !A" :lines="4" />
        <UiErrorState v-else-if="analytics?.error.value" :message="err(analytics.error.value)" retry @retry="analytics?.refresh()" />
        <UiEmptyState v-else-if="!A?.totals.length" :title="t('admin.dash.noData')" :description="t('admin.dash.noDataHelp')" icon="list" />
        <div v-else class="grid gap-6 lg:grid-cols-2">
          <div class="relative overflow-x-auto rounded-lg border border-line bg-surface" role="region" :aria-label="t('admin.dash.totals')" tabindex="0">
            <table class="w-full border-collapse text-start">
              <caption class="px-3 py-2 text-start font-bold">{{ t('admin.dash.totals') }}</caption>
              <thead class="bg-sunken text-sm text-ink-soft"><tr><th scope="col" class="px-3 py-2 text-start">{{ t('admin.dash.event') }}</th><th scope="col" class="px-3 py-2 text-end">{{ t('admin.dash.count') }}</th><th scope="col" class="w-1/3 px-3 py-2 text-start"><span class="sr-only">{{ t('admin.dash.share') }}</span></th></tr></thead>
              <tbody class="divide-y divide-line">
                <tr v-for="r in A.totals" :key="r.name"><th scope="row" class="px-3 py-2 text-start font-medium">{{ evLabel(r.name) }}</th><td class="px-3 py-2 text-end tabular-nums" dir="ltr">{{ num(r.total) }}</td><td class="px-3 py-2" aria-hidden="true"><div class="h-2 rounded-full bg-sunken"><div class="h-2 rounded-full bg-primary" :style="{ inlineSize: `${(r.total / maxTotal) * 100}%` }" /></div></td></tr>
              </tbody>
            </table>
          </div>
          <div class="relative max-h-96 overflow-auto rounded-lg border border-line bg-surface" role="region" :aria-label="t('admin.dash.daily')" tabindex="0">
            <table class="w-full border-collapse text-start">
              <caption class="px-3 py-2 text-start font-bold">{{ t('admin.dash.daily') }}</caption>
              <thead class="bg-sunken text-sm text-ink-soft"><tr><th scope="col" class="px-3 py-2 text-start">{{ t('admin.dash.day') }}</th><th scope="col" class="px-3 py-2 text-end">{{ t('admin.dash.count') }}</th><th scope="col" class="w-1/3 px-3 py-2"><span class="sr-only">{{ t('admin.dash.share') }}</span></th></tr></thead>
              <tbody class="divide-y divide-line">
                <tr v-for="d in days" :key="d.day"><th scope="row" class="px-3 py-2 text-start font-medium" dir="ltr"><time :datetime="d.day">{{ d.day }}</time></th><td class="px-3 py-2 text-end tabular-nums" dir="ltr">{{ num(d.total) }}</td><td class="px-3 py-2" aria-hidden="true"><div class="h-2 rounded-full bg-sunken"><div class="h-2 rounded-full bg-accent" :style="{ inlineSize: `${(d.total / maxDay) * 100}%` }" /></div></td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </template>
  </div>
</template>
