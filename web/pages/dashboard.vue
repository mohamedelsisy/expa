<script setup lang="ts">
import type { Dashboard, NextAction } from '~/types/api'

definePageMeta({ middleware: 'auth' })
const { t, locale } = useI18n()
const { request } = useApi()
const toast = useToast()
useSeo(() => ({ title: t('dashboard.title'), description: t('dashboard.subtitle'), noindex: true }))

const { data, error, refresh, status } = await useAsyncData('dashboard', () => request<Dashboard>('dashboard'), { watch: [locale] })
const dash = computed(() => data.value?.data)
const showHow = ref(false)

// API targets (`my-documents/12`, `learn-italian/daily`, `jobs`, ...) map to real web routes; unknown ones fall back to no link.
function linkFor(a: NextAction): string | null {
  return mapApiAction(a.cta)
}

const doneKeys = ref<Set<string>>(new Set())
const busyKeys = ref<Set<string>>(new Set())
const actions = computed(() => (dash.value?.next_actions ?? []).filter(a => !doneKeys.value.has(a.key)))

async function markDone(a: NextAction) {
  busyKeys.value = new Set(busyKeys.value).add(a.key)
  doneKeys.value = new Set(doneKeys.value).add(a.key) // optimistic
  try {
    await request(`dashboard/tasks/${encodeURIComponent(a.cta.target)}`, { method: 'PUT', body: { status: 'done' } })
    toast.success(t('tasks.markedDone'))
    await refresh()
  } catch (e) {
    const rollback = new Set(doneKeys.value)
    rollback.delete(a.key)
    doneKeys.value = rollback // rollback
    toast.error(isApiError(e) ? e.message : t('errors.generic'))
  } finally {
    const next = new Set(busyKeys.value)
    next.delete(a.key)
    busyKeys.value = next
    doneKeys.value = new Set()
  }
}
</script>

<template>
  <div class="container-page py-8 sm:py-12">
    <div v-if="status === 'pending' && !data" aria-busy="true" class="grid gap-6 lg:grid-cols-3">
      <UiSkeleton block class="lg:col-span-1" /><UiSkeleton block class="lg:col-span-2" :lines="5" />
    </div>
    <UiErrorState :heading-level="1" v-else-if="error || !dash" :message="isApiError(error) ? error.message : undefined" :code="isApiError(error) ? error.code : undefined" retry @retry="refresh()" />

    <template v-else>
      <header class="mb-8">
        <h1 class="text-2xl font-bold sm:text-3xl">{{ t('dashboard.greeting', { name: dash.greeting.name }) }}</h1>
        <p class="mt-1 text-ink-soft">{{ t('dashboard.subtitle') }}</p>
      </header>

      <UiAlert v-if="!dash.personalization.enabled" tone="info" class="mb-6" :title="t('dashboard.personalizationOffTitle')">
        <p>{{ dash.score.note ?? t('dashboard.personalizationOff') }}</p>
        <UiButton to="/privacy-settings" variant="secondary" class="mt-3">{{ t('dashboard.personalizationOffCta') }}</UiButton>
      </UiAlert>

      <div class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
        <!-- Score -->
        <UiCard as="section" :aria-labelledby="'score-h'" class="space-y-5">
          <h2 id="score-h" class="text-xl font-bold">{{ t('score.title') }}</h2>
          <div class="flex justify-center"><UiScoreRing :value="dash.score.overall" :label="t('score.label')" :size="176" /></div>
          <p v-if="dash.score.overall !== null" class="text-center text-sm text-muted">{{ t('score.summary', { done: dash.score.done_tasks, total: dash.score.applicable_tasks }) }}</p>
          <p v-else class="text-center text-sm text-muted">{{ t('score.notEnoughData') }}</p>
          <ul class="space-y-4">
            <li v-for="c in dash.score.categories" :key="c.key">
              <UiProgressBar :value="c.percent" :label="c.label" show-value />
              <p v-if="c.percent === null" class="mt-1 text-xs text-muted">{{ t('score.notApplicable') }}</p>
              <p v-else class="mt-1 text-xs text-muted">{{ t('score.categoryCount', { done: c.done, total: c.total }) }}</p>
            </li>
          </ul>
          <div>
            <button
              type="button"
              class="inline-flex min-h-touch items-center gap-2 font-medium text-primary-strong"
              :aria-expanded="showHow"
              aria-controls="how-calc"
              @click="showHow = !showHow"
            >
              <UiIcon name="chevron-down" :size="18" :class="showHow ? 'rotate-180' : ''" />{{ t('score.howTitle') }}
            </button>
            <p v-show="showHow" id="how-calc" class="prose-plain mt-2 rounded-md bg-sunken p-3 text-ink-soft">{{ dash.score.how_calculated }}</p>
          </div>
        </UiCard>

        <!-- Next actions -->
        <UiCard as="section" :aria-labelledby="'next-h'" class="space-y-4">
          <div class="flex items-center justify-between gap-3">
            <h2 id="next-h" class="text-xl font-bold">{{ t('dashboard.nextTitle') }}</h2>
            <UiButton to="/tasks" variant="ghost">{{ t('dashboard.allTasks') }}<UiIcon name="chevron-end" :size="18" /></UiButton>
          </div>
          <UiEmptyState v-if="!actions.length" :title="t('dashboard.nextEmptyTitle')" :description="t('dashboard.nextEmpty')" icon="check" />
          <ul v-else class="divide-y divide-line">
            <li v-for="a in actions" :key="a.key" class="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div class="min-w-0">
                <p class="font-semibold"><UiAutoItalian :text="a.title" /></p>
                <p v-if="a.description" class="text-sm text-ink-soft">{{ a.description }}</p>
              </div>
              <div class="shrink-0">
                <UiButton v-if="a.cta.type === 'task'" variant="secondary" :loading="busyKeys.has(a.key)" @click="markDone(a)"><UiIcon name="check" :size="18" />{{ t('tasks.markDone') }}</UiButton>
                <UiButton v-else-if="linkFor(a)" :to="linkFor(a)!" variant="secondary">
                  {{ a.cta.type === 'guide' ? t('dashboard.readGuide') : t('dashboard.open') }}<UiIcon name="arrow-end" :size="18" />
                </UiButton>
                <UiBadge v-else>{{ t('common.comingSoon') }}</UiBadge>
              </div>
            </li>
          </ul>
        </UiCard>
      </div>
    </template>
  </div>
</template>
