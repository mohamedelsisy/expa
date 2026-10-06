<script setup lang="ts">
import type { Scholarship } from '~/types/api'
import { formatDay } from '~/utils/locale'
import { safeHttpsUrl } from '~/utils/safe'

const { t, locale } = useI18n()
const route = useRoute()
const { request } = useApi()
const slug = computed(() => String(route.params.slug))
const { data, error, refresh, status } = await useAsyncData(() => `study-scholarship-${slug.value}`, async () => (await request<Scholarship>(`study/scholarships/${encodeURIComponent(slug.value)}`)).data, { watch: [locale] })
if (isApiError(error.value) && error.value.status === 404) throw createError({ statusCode: 404, statusMessage: 'Not Found', fatal: true })
const s = computed(() => data.value)
useSeo(() => ({ title: s.value?.name ?? t('study.scholarships.title'), description: s.value?.summary ?? t('study.scholarships.subtitle'), fallback: !!s.value?.fallback }))
const apply = computed(() => safeHttpsUrl(s.value?.apply_url))
const crumbs = computed(() => [{ label: t('nav.home'), to: '/' }, { label: t('study.title'), to: '/study' }, { label: t('study.scholarships.title'), to: '/study/scholarships' }, { label: s.value?.name ?? '' }])
</script>

<template>
  <div class="container-page max-w-4xl py-8 sm:py-12">
    <UiBreadcrumbs :items="crumbs" class="mb-6" />
    <h1 v-if="!s" class="sr-only">{{ t('study.scholarships.title') }}</h1>
    <div v-if="status === 'pending' && !s" aria-busy="true"><UiSkeleton block :lines="6" /></div>
    <UiErrorState v-else-if="error || !s" :message="isApiError(error) ? error.message : undefined" retry @retry="refresh()" />
    <article v-else class="space-y-6">
      <header class="space-y-3">
        <h1 class="text-3xl font-bold">{{ s.name }}</h1>
        <p v-if="s.summary" class="max-w-prose text-lg text-ink-soft">{{ s.summary }}</p>
        <p class="text-sm text-muted">{{ t('study.deadline') }}: <span class="font-medium text-ink">{{ s.deadline.date ? formatDay(s.deadline.date, locale) : t('study.notStated') }}</span><span v-if="s.deadline.status === 'passed'" class="text-danger"> · {{ t('study.passed') }}</span></p>
        <GuideFallbackNotice v-if="s.fallback" :locale="s.locale" />
      </header>
      <StudyVerifyNotice :text="s.verify_notice" />
      <section v-if="s.eligibility" aria-labelledby="el-h"><h2 id="el-h" class="mb-2 text-xl font-bold">{{ t('study.eligibility') }}</h2><p class="prose-plain">{{ s.eligibility }}</p></section>
      <section v-if="s.how_to_apply" aria-labelledby="ha-h"><h2 id="ha-h" class="mb-2 text-xl font-bold">{{ t('study.howToApply') }}</h2><p class="prose-plain">{{ s.how_to_apply }}</p></section>
      <UiButton v-if="apply" :href="apply" new-tab variant="secondary">{{ t('study.officialPage') }}<UiIcon name="external" :size="16" /><span class="sr-only">{{ t('a11y.opensNewTab') }}</span></UiButton>
      <GuideSource :source="s.source" />
    </article>
  </div>
</template>
