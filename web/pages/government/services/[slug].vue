<script setup lang="ts">
import type { City, GovServiceFull } from '~/types/api'

const { t, locale } = useI18n()
const route = useRoute()
const { request } = useApi()
const slug = computed(() => String(route.params.slug))
const cityQ = computed(() => (typeof route.query.city === 'string' ? route.query.city : ''))

const { data: cities } = await useAsyncData('gov-cities', async () => (await request<City[]>('cities')).data, { watch: [locale] })
const { data: s, error, refresh, status } = await useAsyncData(() => `gov-service-${slug.value}-${cityQ.value}`, async () => (await request<GovServiceFull>(`government/services/${encodeURIComponent(slug.value)}`, { query: { city: cityQ.value } })).data, { watch: [locale, cityQ] })
if (isApiError(error.value) && error.value.status === 404) throw createError({ statusCode: 404, statusMessage: 'Not Found', fatal: true })
useSeo(() => ({ title: s.value ? `${s.value.name} | EXPA` : t('gov.title'), description: s.value?.summary ?? t('gov.subtitle'), type: 'article' }))
const crumbs = computed(() => [{ label: t('nav.home'), to: '/' }, { label: t('gov.title'), to: '/government' }, { label: s.value?.name ?? '' }])
const cityOptions = computed(() => (cities.value ?? []).map(c => ({ value: c.slug, label: c.name })))
const setCity = (v: string) => navigateTo({ path: route.path, query: v ? { city: v } : {} })
</script>

<template>
  <div class="container-page max-w-4xl py-8 sm:py-12">
    <UiBreadcrumbs :items="crumbs" class="mb-6" />
    <div v-if="status === 'pending' && !s" aria-busy="true"><UiSkeleton block :lines="6" /></div>
    <UiErrorState v-else-if="error || !s" :message="isApiError(error) ? error.message : undefined" retry @retry="refresh()" />
    <article v-else class="space-y-8">
      <header class="space-y-3">
        <div class="flex flex-wrap items-center gap-2">
          <UiBadge tone="primary">{{ s.domain_label }}</UiBadge>
          <UiItalianTerm v-if="s.italian_term">{{ s.italian_term }}</UiItalianTerm>
          <UiBadge><UiIcon name="map" :size="14" />{{ s.city?.name ?? s.region?.name ?? t('guides.national') }}</UiBadge>
        </div>
        <h1 class="text-3xl font-bold sm:text-4xl"><UiAutoItalian :text="s.name" /></h1>
        <p v-if="s.summary" class="text-lg text-ink-soft">{{ s.summary }}</p>
      </header>
      <GuideFallbackNotice v-if="s.fallback" :locale="s.locale" />

      <section v-if="s.how_to_apply" aria-labelledby="how-h" class="space-y-2"><h2 id="how-h" class="text-xl font-bold">{{ t('gov.howToApply') }}</h2><p class="prose-plain text-lg"><UiAutoItalian :text="s.how_to_apply" /></p></section>
      <section v-if="s.required_documents?.length" aria-labelledby="req-h" class="space-y-2">
        <h2 id="req-h" class="text-xl font-bold">{{ t('gov.requiredDocuments') }}</h2>
        <ul class="list-disc space-y-1 ps-6"><li v-for="(d, i) in s.required_documents" :key="i"><UiAutoItalian :text="d" /></li></ul>
      </section>
      <section v-if="s.notes" class="space-y-2"><h2 class="text-xl font-bold">{{ t('gov.notes') }}</h2><p class="prose-plain">{{ s.notes }}</p></section>
      <UiCard v-if="s.guide" tone="soft" class="flex flex-wrap items-center justify-between gap-3">
        <p class="font-medium">{{ t('gov.linkedGuide') }}: <UiAutoItalian :text="s.guide.title" /></p>
        <UiButton :to="`/guides/${s.guide.slug}`" variant="secondary">{{ t('dashboard.readGuide') }}<UiIcon name="arrow-end" :size="16" /></UiButton>
      </UiCard>

      <section aria-labelledby="off-h" class="space-y-4">
        <h2 id="off-h" class="text-xl font-bold">{{ t('gov.offices') }}</h2>
        <UiFormField :label="t('gov.filterOfficesByCity')" class="max-w-sm"><UiSelect :model-value="cityQ" :options="cityOptions" :placeholder="t('guides.allCities')" @update:model-value="setCity" /></UiFormField>
        <p v-if="!s.offices.length" class="text-muted">{{ t('gov.noOffices') }}</p>
        <ul v-else class="grid gap-4 md:grid-cols-2"><li v-for="o in s.offices" :key="o.id"><GovOfficeCard :office="o" link /></li></ul>
      </section>
      <GuideSource :source="s.source" />
    </article>
  </div>
</template>
