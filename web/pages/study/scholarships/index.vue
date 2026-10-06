<script setup lang="ts">
import type { Scholarship, StudyMeta } from '~/types/api'
import { formatDay } from '~/utils/locale'

const { t, locale } = useI18n()
const route = useRoute()
const localePath = useLocalePath()
const { request } = useApi()
useSeo(() => ({ title: t('study.scholarships.title'), description: t('study.scholarships.subtitle') }))
const degree = computed(() => (typeof route.query.degree === 'string' ? route.query.degree : ''))
const openOnly = computed(() => route.query.open_only === '1')
const page = computed(() => Math.max(1, Number(route.query.page) || 1))
const { data: meta0 } = await useAsyncData('study-sch-meta', async () => (await request<StudyMeta>('study/meta')).data, { watch: [locale] })
const { data, error, refresh, status } = await useAsyncData('study-scholarships', () => request<Scholarship[]>('study/scholarships', { query: { degree: degree.value, open_only: openOnly.value ? 1 : undefined, page: page.value, per_page: 12 } }), { watch: [degree, openOnly, page, locale] })
const items = computed(() => data.value?.data ?? [])
const meta = computed(() => data.value?.meta)
function setQuery(patch: Record<string, string | number | undefined>) {
  const merged: Record<string, unknown> = { degree: degree.value, open_only: openOnly.value ? '1' : '', ...patch }
  const next: Record<string, string> = {}
  for (const [k, v] of Object.entries(merged)) if (v !== undefined && v !== '' && v !== null) next[k] = String(v)
  if (!('page' in patch)) delete next.page
  return navigateTo({ path: route.path, query: next })
}
const crumbs = computed(() => [{ label: t('nav.home'), to: '/' }, { label: t('study.title'), to: '/study' }, { label: t('study.scholarships.title') }])
</script>

<template>
  <div class="container-page py-8 sm:py-12">
    <UiBreadcrumbs :items="crumbs" class="mb-6" />
    <header class="mb-6 max-w-2xl">
      <h1 class="text-2xl font-bold sm:text-3xl">{{ t('study.scholarships.title') }}</h1>
      <p class="mt-1 text-ink-soft">{{ t('study.scholarships.subtitle') }}</p>
    </header>
    <StudyVerifyNotice :text="items[0]?.verify_notice ?? meta0?.verify_notice" class="mb-6" />
    <form role="search" class="mb-8 grid gap-4 rounded-lg border border-line bg-surface p-4 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_auto] lg:items-end" @submit.prevent>
      <UiFormField :label="t('study.degree')"><UiSelect :model-value="degree" :options="meta0?.degree_levels ?? []" :placeholder="t('study.any')" @update:model-value="setQuery({ degree: $event })" /></UiFormField>
      <UiCheckbox :model-value="openOnly" @update:model-value="setQuery({ open_only: $event ? '1' : '' })">{{ t('study.openOnly') }}</UiCheckbox>
    </form>
    <div aria-live="polite" class="sr-only">{{ meta ? t('guides.resultsCount', { count: meta.total ?? items.length }) : '' }}</div>
    <ul v-if="status === 'pending' && !data" class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true"><li v-for="n in 6" :key="n"><UiCard><UiSkeleton :lines="3" /></UiCard></li></ul>
    <UiErrorState v-else-if="error" :message="isApiError(error) ? error.message : undefined" retry @retry="refresh()" />
    <UiEmptyState v-else-if="!items.length" :title="t('study.scholarships.emptyTitle')" :description="t('study.scholarships.empty')" icon="euro" />
    <template v-else>
      <ul class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <li v-for="s in items" :key="s.slug">
          <UiCard as="article" class="relative flex h-full flex-col gap-2 transition-shadow focus-within:shadow-3 hover:shadow-2">
            <div class="flex flex-wrap gap-2"><UiSourceBadge :type="s.source.type" /></div>
            <h2 class="text-lg font-bold"><NuxtLink :to="localePath(`/study/scholarships/${s.slug}`)" class="after:absolute after:inset-0 after:content-['']">{{ s.name }}</NuxtLink></h2>
            <p v-if="s.summary" class="line-clamp-3 text-ink-soft">{{ s.summary }}</p>
            <p class="mt-auto pt-2 text-sm text-muted">{{ t('study.deadline') }}: <span class="font-medium text-ink">{{ s.deadline.date ? formatDay(s.deadline.date, locale) : t('study.notStated') }}</span><span v-if="s.deadline.status === 'passed'" class="text-danger"> · {{ t('study.passed') }}</span></p>
          </UiCard>
        </li>
      </ul>
      <div class="mt-8"><UiPagination :page="meta?.page ?? 1" :last-page="meta?.last_page ?? 1" @change="setQuery({ page: $event })" /></div>
    </template>
  </div>
</template>
