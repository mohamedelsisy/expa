<script setup lang="ts">
import type { StudyProgram } from '~/types/api'
import { formatDay } from '~/utils/locale'
import { formatMoney } from '~/utils/money'
import { safeHttpsUrl } from '~/utils/safe'

const { t, locale } = useI18n()
const route = useRoute()
const localePath = useLocalePath()
const { request } = useApi()
const slug = computed(() => String(route.params.slug))
const { data, error, refresh, status } = await useAsyncData(() => `study-program-${slug.value}`, async () => (await request<StudyProgram>(`study/programs/${encodeURIComponent(slug.value)}`)).data, { watch: [locale] })
if (isApiError(error.value) && error.value.status === 404) throw createError({ statusCode: 404, statusMessage: 'Not Found', fatal: true })
const p = computed(() => data.value)
useSeo(() => ({ title: p.value?.title ?? t('study.programs.title'), description: p.value?.summary ?? t('study.programs.subtitle'), fallback: !!p.value?.fallback }))
const tuition = computed(() => {
  const x = p.value?.tuition
  if (!x || (x.min == null && x.max == null)) return null
  const f = (n: number) => formatMoney(n, x.currency, locale.value)
  return `${x.min != null && x.max != null && x.min !== x.max ? `${f(x.min)}–${f(x.max)}` : f((x.min ?? x.max) as number)} / ${t('study.perYear')}`
})
const url = computed(() => safeHttpsUrl(p.value?.program_url))
const crumbs = computed(() => [{ label: t('nav.home'), to: '/' }, { label: t('study.title'), to: '/study' }, { label: t('study.programs.title'), to: '/study/programs' }, { label: p.value?.title ?? '' }])
</script>

<template>
  <div class="container-page max-w-4xl py-8 sm:py-12">
    <UiBreadcrumbs :items="crumbs" class="mb-6" />
    <h1 v-if="!p" class="sr-only">{{ t('study.programs.title') }}</h1>
    <div v-if="status === 'pending' && !p" aria-busy="true"><UiSkeleton block :lines="6" /></div>
    <UiErrorState v-else-if="error || !p" :message="isApiError(error) ? error.message : undefined" retry @retry="refresh()" />
    <article v-else class="space-y-6">
      <header class="space-y-3">
        <div class="flex flex-wrap gap-2"><UiBadge tone="primary">{{ p.degree_level_label }}</UiBadge><UiBadge>{{ p.field_label }}</UiBadge><UiBadge>{{ p.instruction_language_label }}</UiBadge></div>
        <h1 class="text-3xl font-bold">{{ p.title }}</h1>
        <p class="text-lg text-ink-soft"><NuxtLink :to="localePath(`/study/universities/${p.university.slug}`)" class="text-primary-strong underline underline-offset-4">{{ p.university.name }}</NuxtLink><template v-if="p.university.city"> · {{ p.university.city.name }}</template></p>
        <p v-if="p.summary" class="max-w-prose text-ink-soft">{{ p.summary }}</p>
        <GuideFallbackNotice v-if="p.fallback" :locale="p.locale" />
      </header>
      <StudyVerifyNotice :text="p.verify_notice" />
      <dl class="grid gap-3 sm:grid-cols-2">
        <div><dt class="text-sm text-muted">{{ t('study.tuition') }}</dt><dd class="font-semibold tabular-nums"><bdi>{{ tuition ?? t('study.notStated') }}</bdi></dd></div>
        <div><dt class="text-sm text-muted">{{ t('study.deadline') }}</dt><dd class="font-semibold">{{ p.deadline.date ? formatDay(p.deadline.date, locale) : t('study.notStated') }}<span v-if="p.deadline.status === 'passed'" class="text-danger"> · {{ t('study.passed') }}</span></dd></div>
        <div v-if="p.duration_years"><dt class="text-sm text-muted">{{ t('study.duration') }}</dt><dd class="font-semibold">{{ t('study.years', { count: p.duration_years }) }}</dd></div>
        <div v-if="p.required_italian_level"><dt class="text-sm text-muted">{{ t('study.italianLevel') }}</dt><dd class="font-semibold">{{ p.required_italian_level.toUpperCase() }}</dd></div>
        <div v-if="p.required_english_level"><dt class="text-sm text-muted">{{ t('study.englishLevel') }}</dt><dd class="font-semibold">{{ p.required_english_level.toUpperCase() }}</dd></div>
      </dl>
      <section v-if="p.admission_requirements" aria-labelledby="adm-h"><h2 id="adm-h" class="mb-2 text-xl font-bold">{{ t('study.admission') }}</h2><p class="prose-plain">{{ p.admission_requirements }}</p></section>
      <section v-if="p.notes" aria-labelledby="notes-h"><h2 id="notes-h" class="mb-2 text-xl font-bold">{{ t('study.notes') }}</h2><p class="prose-plain">{{ p.notes }}</p></section>
      <UiButton v-if="url" :href="url" new-tab variant="secondary">{{ t('study.officialPage') }}<UiIcon name="external" :size="16" /><span class="sr-only">{{ t('a11y.opensNewTab') }}</span></UiButton>
      <GuideSource :source="p.source" />
    </article>
  </div>
</template>
