<script setup lang="ts">
import type { City, StudyMeta, StudyProgram } from '~/types/api'

const { t, locale } = useI18n()
const route = useRoute()
const auth = useAuthStore()
const { request } = useApi()
useSeo(() => ({ title: t('study.finder.title'), description: t('study.finder.subtitle'), noindex: true }))

const LEVELS = ['a0', 'a1', 'a2', 'b1', 'b2', 'c1', 'c2']
const levelOptions = LEVELS.map(l => ({ value: l, label: l.toUpperCase() }))
const KEYS = ['field', 'degree', 'language', 'budget', 'city', 'italian_level', 'english_level'] as const
const fromQuery = () => Object.fromEntries(KEYS.map(k => [k, typeof route.query[k] === 'string' ? (route.query[k] as string) : ''])) as Record<typeof KEYS[number], string>
const form = reactive({ ...fromQuery(), use_profile: route.query.use_profile === '1' })
const budgetError = ref('')

const { data: lookups } = await useAsyncData('study-finder-lookups', async () => {
  const [meta, cities] = await Promise.all([request<StudyMeta>('study/meta'), request<City[]>('cities')])
  return { meta: meta.data, cities: cities.data }
}, { watch: [locale] })
const cityOptions = computed(() => (lookups.value?.cities ?? []).map(c => ({ value: c.slug, label: c.name })))
const languageOptions = computed(() => [...(lookups.value?.meta.languages ?? []).filter(l => l.value !== 'both'), { value: 'any', label: t('study.finder.anyLanguage') }])

const searched = computed(() => KEYS.some(k => typeof route.query[k] === 'string') || route.query.use_profile === '1')
const page = computed(() => Math.max(1, Number(route.query.page) || 1))
const { data, error, refresh, status } = await useAsyncData('study-finder', async () => {
  if (!searched.value) return null
  const query: Record<string, string | number | undefined> = { page: page.value }
  for (const k of KEYS) { const v = route.query[k]; if (typeof v === 'string' && v) query[k] = v }
  if (route.query.use_profile === '1') query.use_profile = 1
  return request<StudyProgram[]>('study/finder', { query })
}, { watch: [() => route.fullPath, locale] })
const items = computed(() => data.value?.data ?? [])
const meta = computed(() => data.value?.meta)

function submit() {
  budgetError.value = ''
  if (form.budget && !/^\d{1,6}$/.test(form.budget)) { budgetError.value = t('study.finder.budgetInvalid'); return }
  const next: Record<string, string> = {}
  for (const k of KEYS) if (form[k]) next[k] = form[k]
  if (form.use_profile) next.use_profile = '1'
  if (!Object.keys(next).length) next.language = 'any'
  return navigateTo({ path: route.path, query: next })
}
const changePage = (p: number) => navigateTo({ path: route.path, query: { ...route.query, page: String(p) } })
const crumbs = computed(() => [{ label: t('nav.home'), to: '/' }, { label: t('study.title'), to: '/study' }, { label: t('study.finder.title') }])
</script>

<template>
  <div class="container-page py-8 sm:py-12">
    <UiBreadcrumbs :items="crumbs" class="mb-6" />
    <header class="mb-6 max-w-2xl">
      <h1 class="text-2xl font-bold sm:text-3xl">{{ t('study.finder.title') }}</h1>
      <p class="mt-1 text-ink-soft">{{ t('study.finder.subtitle') }}</p>
    </header>
    <StudyVerifyNotice :text="meta?.verify_notice ?? lookups?.meta.verify_notice" class="mb-6" />
    <form class="mb-8 grid gap-4 rounded-lg border border-line bg-surface p-4 sm:grid-cols-2 lg:grid-cols-3" novalidate @submit.prevent="submit">
      <UiFormField :label="t('study.field')" optional><UiSelect v-model="form.field" :options="lookups?.meta.fields ?? []" :placeholder="t('study.any')" /></UiFormField>
      <UiFormField :label="t('study.degree')" optional><UiSelect v-model="form.degree" :options="lookups?.meta.degree_levels ?? []" :placeholder="t('study.any')" /></UiFormField>
      <UiFormField :label="t('study.language')" optional><UiSelect v-model="form.language" :options="languageOptions" :placeholder="t('study.any')" /></UiFormField>
      <UiFormField :label="t('study.finder.budget')" :hint="t('study.finder.budgetHint')" :error="budgetError" optional><UiTextInput v-model="form.budget" inputmode="numeric" :maxlength="6" ltr /></UiFormField>
      <UiFormField :label="t('guides.city')" optional><UiSelect v-model="form.city" :options="cityOptions" :placeholder="t('guides.allCities')" /></UiFormField>
      <UiFormField :label="t('study.italianLevel')" optional><UiSelect v-model="form.italian_level" :options="levelOptions" :placeholder="t('study.any')" /></UiFormField>
      <UiFormField :label="t('study.englishLevel')" optional><UiSelect v-model="form.english_level" :options="levelOptions" :placeholder="t('study.any')" /></UiFormField>
      <UiCheckbox v-if="auth.isAuthenticated" v-model="form.use_profile" :description="t('study.finder.useProfileHint')">{{ t('study.finder.useProfile') }}</UiCheckbox>
      <div class="flex items-end sm:col-span-2 lg:col-span-3"><UiButton type="submit" :loading="status === 'pending'"><UiIcon name="search" :size="18" />{{ t('study.finder.submit') }}</UiButton></div>
    </form>

    <div aria-live="polite" class="sr-only">{{ searched && meta ? t('guides.resultsCount', { count: meta.total ?? items.length }) : '' }}</div>
    <UiEmptyState v-if="!searched" :title="t('study.finder.startTitle')" :description="t('study.finder.start')" icon="sparkle" />
    <ul v-else-if="status === 'pending' && !data" class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true"><li v-for="n in 3" :key="n"><UiCard><UiSkeleton :lines="4" /></UiCard></li></ul>
    <UiErrorState v-else-if="error" :message="isApiError(error) ? error.message : undefined" retry @retry="refresh()" />
    <UiEmptyState v-else-if="!items.length" :title="t('study.finder.noResultsTitle')" :description="t('study.finder.noResults')" icon="book" />
    <template v-else>
      <ul class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <li v-for="p in items" :key="p.id" class="space-y-3">
          <StudyProgramCard :program="p" show-match />
          <details v-if="p.match" class="rounded-md border border-line bg-surface p-3 text-sm">
            <summary class="inline-flex min-h-touch cursor-pointer items-center font-medium text-primary-strong">{{ t('study.finder.why') }}</summary>
            <JobsMatchReasons :match="p.match" compact :heading="t('study.finder.why')" class="mt-2" />
          </details>
        </li>
      </ul>
      <div class="mt-8"><UiPagination :page="meta?.page ?? 1" :last-page="meta?.last_page ?? 1" @change="changePage" /></div>
    </template>
  </div>
</template>
