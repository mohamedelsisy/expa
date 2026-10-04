<script setup lang="ts">
import type { City, GovService } from '~/types/api'

const { t, locale } = useI18n()
const route = useRoute()
const localePath = useLocalePath()
const { request } = useApi()
useSeo(() => ({ title: t('gov.title'), description: t('gov.subtitle') }))

const q = computed(() => (typeof route.query.q === 'string' ? route.query.q : ''))
const domain = computed(() => (typeof route.query.domain === 'string' ? route.query.domain : ''))
const region = computed(() => (typeof route.query.region === 'string' ? route.query.region : ''))
const city = computed(() => (typeof route.query.city === 'string' ? route.query.city : ''))
const page = computed(() => Math.max(1, Number(route.query.page) || 1))
const search = ref(q.value)
watch(q, v => { search.value = v })

const DOMAINS = ['immigration', 'tax', 'health', 'civil_registry', 'social_security', 'identity', 'transport', 'postal', 'education', 'labor', 'other']
const domainOptions = computed(() => DOMAINS.map(d => ({ value: d, label: t(`gov.domains.${d}`) })))

const { data: cities, error: citiesError } = await useAsyncData('gov-cities', async () => (await request<City[]>('cities')).data, { watch: [locale] })
const regions = computed(() => {
  const m = new Map<string, string>()
  for (const c of cities.value ?? []) m.set(c.region.slug, c.region.name)
  return [...m.entries()].map(([value, label]) => ({ value, label })).sort((a, b) => a.label.localeCompare(b.label, locale.value))
})
const cityOptions = computed(() => (cities.value ?? []).filter(c => !region.value || c.region.slug === region.value).map(c => ({ value: c.slug, label: c.name })))

const { data, error, refresh, status } = await useAsyncData('gov-services', () => request<GovService[]>('government/services', {
  query: { q: q.value, domain: domain.value, region: city.value ? '' : region.value, city: city.value, page: page.value, per_page: 12 },
}), { watch: [q, domain, region, city, page, locale] })
const items = computed(() => data.value?.data ?? [])
const meta = computed(() => data.value?.meta)
const hasFilters = computed(() => !!(q.value || domain.value || region.value || city.value))

function setQuery(patch: Record<string, string | number | undefined>) {
  const merged: Record<string, unknown> = { q: q.value, domain: domain.value, region: region.value, city: city.value, ...patch }
  const next: Record<string, string> = {}
  for (const [k, v] of Object.entries(merged)) if (v !== undefined && v !== '' && v !== null) next[k] = String(v)
  if (!('page' in patch)) delete next.page
  return navigateTo({ path: route.path, query: next })
}
const clear = () => { search.value = ''; return navigateTo({ path: route.path }) }
</script>

<template>
  <div class="container-page py-8 sm:py-12">
    <header class="mb-6 max-w-2xl">
      <h1 class="text-2xl font-bold sm:text-3xl">{{ t('gov.title') }}</h1>
      <p class="mt-1 text-ink-soft">{{ t('gov.subtitle') }}</p>
    </header>
    <div class="mb-6 flex flex-wrap gap-2">
      <UiButton to="/appointments" variant="secondary"><UiIcon name="calendar" :size="18" />{{ t('gov.toAppointments') }}</UiButton>
    </div>
    <form role="search" class="mb-8 grid gap-4 rounded-lg border border-line bg-surface p-4 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr_auto] lg:items-end" @submit.prevent="setQuery({ q: search })">
      <UiFormField :label="t('guides.search')"><UiTextInput v-model="search" type="search" inputmode="search" :maxlength="100" :placeholder="t('gov.searchPlaceholder')" /></UiFormField>
      <UiFormField :label="t('gov.domain')"><UiSelect :model-value="domain" :options="domainOptions" :placeholder="t('gov.allDomains')" @update:model-value="setQuery({ domain: $event })" /></UiFormField>
      <UiFormField :label="t('guides.region')"><UiSelect :model-value="region" :options="regions" :placeholder="t('guides.allRegions')" @update:model-value="setQuery({ region: $event, city: '' })" /></UiFormField>
      <UiFormField :label="t('guides.city')"><UiSelect :model-value="city" :options="cityOptions" :placeholder="t('guides.allCities')" @update:model-value="setQuery({ city: $event })" /></UiFormField>
      <div class="flex gap-2 sm:col-span-2 lg:col-span-1">
        <UiButton type="submit"><UiIcon name="search" :size="18" />{{ t('guides.searchButton') }}</UiButton>
        <UiButton v-if="hasFilters" variant="ghost" @click="clear">{{ t('guides.clear') }}</UiButton>
      </div>
    </form>
    <UiAlert v-if="citiesError" tone="warning" class="mb-6">{{ t('guides.filtersUnavailable') }}</UiAlert>
    <div aria-live="polite" class="sr-only">{{ meta ? t('guides.resultsCount', { count: meta.total ?? items.length }) : '' }}</div>

    <ul v-if="status === 'pending' && !data" class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true"><li v-for="n in 6" :key="n"><UiCard><UiSkeleton :lines="4" /></UiCard></li></ul>
    <UiErrorState v-else-if="error" :message="isApiError(error) ? error.message : undefined" retry @retry="refresh()" />
    <UiEmptyState v-else-if="!items.length" :title="hasFilters ? t('guides.noResultsTitle') : t('gov.emptyTitle')" :description="hasFilters ? t('guides.noResults') : t('gov.empty')" icon="building">
      <UiButton v-if="hasFilters" variant="secondary" @click="clear">{{ t('guides.clear') }}</UiButton>
    </UiEmptyState>
    <template v-else>
      <ul class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <li v-for="s in items" :key="s.id">
          <UiCard as="article" class="relative flex h-full flex-col gap-3 transition-shadow focus-within:shadow-3 hover:shadow-2">
            <div class="flex flex-wrap items-center gap-2">
              <UiBadge tone="primary">{{ s.domain_label }}</UiBadge>
              <UiSourceBadge :type="s.source.type" />
              <UiItalianTerm v-if="s.italian_term">{{ s.italian_term }}</UiItalianTerm>
            </div>
            <h2 class="text-lg font-bold"><NuxtLink :to="localePath(`/government/services/${s.slug}`)" class="after:absolute after:inset-0 after:content-['']"><UiAutoItalian :text="s.name" /></NuxtLink></h2>
            <p v-if="s.summary" class="line-clamp-3 text-ink-soft">{{ s.summary }}</p>
            <div class="mt-auto space-y-1 pt-2 text-sm text-muted">
              <p class="flex items-center gap-1.5"><UiIcon name="map" :size="16" />{{ s.city?.name ?? s.region?.name ?? t('guides.national') }}</p>
              <p v-if="s.source.freshness !== 'fresh'" class="font-medium" :class="s.source.freshness === 'stale' ? 'text-warning' : 'text-danger'">{{ t(`freshness.state.${s.source.freshness}`) }}</p>
              <p v-if="s.fallback">{{ t('guides.shownIn', { language: t(`languages.${s.locale}`) }) }}</p>
            </div>
          </UiCard>
        </li>
      </ul>
      <div class="mt-8"><UiPagination :page="meta?.page ?? 1" :last-page="meta?.last_page ?? 1" @change="setQuery({ page: $event })" /></div>
    </template>
  </div>
</template>
