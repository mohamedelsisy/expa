<script setup lang="ts">
import type { University } from '~/types/api'
import { safeHttpsUrl } from '~/utils/safe'

const { t, locale } = useI18n()
const route = useRoute()
const { request } = useApi()
const slug = computed(() => String(route.params.slug))
const { data, error, refresh, status } = await useAsyncData(() => `study-university-${slug.value}`, async () => (await request<University>(`study/universities/${encodeURIComponent(slug.value)}`)).data, { watch: [locale] })
if (isApiError(error.value) && error.value.status === 404) throw createError({ statusCode: 404, statusMessage: 'Not Found', fatal: true })
const u = computed(() => data.value)
useSeo(() => ({ title: u.value?.name ?? t('study.universities.title'), description: u.value?.summary ?? t('study.universities.subtitle'), fallback: !!u.value?.fallback }))
const site = computed(() => safeHttpsUrl(u.value?.website))
const crumbs = computed(() => [{ label: t('nav.home'), to: '/' }, { label: t('study.title'), to: '/study' }, { label: t('study.universities.title'), to: '/study/universities' }, { label: u.value?.name ?? '' }])
</script>

<template>
  <div class="container-page max-w-5xl py-8 sm:py-12">
    <UiBreadcrumbs :items="crumbs" class="mb-6" />
    <h1 v-if="!u" class="sr-only">{{ t('study.universities.title') }}</h1>
    <div v-if="status === 'pending' && !u" aria-busy="true"><UiSkeleton block :lines="6" /></div>
    <UiErrorState v-else-if="error || !u" :message="isApiError(error) ? error.message : undefined" retry @retry="refresh()" />
    <article v-else class="space-y-6">
      <header class="space-y-3">
        <div class="flex flex-wrap gap-2"><UiBadge tone="primary">{{ u.kind_label }}</UiBadge><UiBadge v-if="u.city"><UiIcon name="map" :size="14" />{{ u.city.name }}</UiBadge></div>
        <h1 class="text-3xl font-bold">{{ u.name }}</h1>
        <p v-if="u.summary" class="max-w-prose text-lg text-ink-soft">{{ u.summary }}</p>
        <GuideFallbackNotice v-if="u.fallback" :locale="u.locale" />
      </header>
      <StudyVerifyNotice :text="u.programs?.[0]?.verify_notice" />
      <p v-if="u.notes" class="prose-plain">{{ u.notes }}</p>
      <UiButton v-if="site" :href="site" new-tab variant="secondary">{{ t('study.officialSite') }}<UiIcon name="external" :size="16" /><span class="sr-only">{{ t('a11y.opensNewTab') }}</span></UiButton>
      <section aria-labelledby="progs-h">
        <h2 id="progs-h" class="mb-3 text-xl font-bold">{{ t('study.programs.title') }}</h2>
        <p v-if="!u.programs?.length" class="text-muted">{{ t('study.universities.noPrograms') }}</p>
        <ul v-else class="grid gap-4 sm:grid-cols-2"><li v-for="p in u.programs" :key="p.id"><StudyProgramCard :program="p" /></li></ul>
      </section>
      <GuideSource :source="u.source" />
    </article>
  </div>
</template>
