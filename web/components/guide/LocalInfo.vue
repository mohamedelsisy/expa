<script setup lang="ts">
import type { City } from '~/types/api'
import type { LocalInfo } from '~/types/extra'

/**
 * "Local information" for a guide: the city block that complements the guide's topic
 * (GET /guides/{slug}/local-info?city=). The city comes from `?city=` and can be changed here.
 * No profile for the city, or no matching block, is an honest empty state, never invented content.
 */
const props = defineProps<{ slug: string }>()
const { t, locale } = useI18n()
const route = useRoute()
const { request } = useApi()
const city = computed(() => (typeof route.query.city === 'string' ? route.query.city : ''))

const { data: cities } = await useAsyncData(() => `local-cities-${locale.value}`, async () => (await request<City[]>('cities')).data.map(c => ({ value: c.slug, label: c.name })).sort((a, b) => a.label.localeCompare(b.label, locale.value)), { watch: [locale] })
const { data, error, status, refresh } = await useAsyncData(() => `local-info-${props.slug}-${city.value}`, async () => {
  if (!city.value) return null
  try {
    return (await request<LocalInfo>(`guides/${encodeURIComponent(props.slug)}/local-info`, { query: { city: city.value } })).data
  } catch (e) {
    if (isApiError(e) && (e.status === 404 || e.status === 422)) return { guide: props.slug, city: city.value, block: null } as LocalInfo // no published profile for this city
    throw e
  }
}, { watch: [city, locale] })
const pick = (v: string) => navigateTo({ path: route.path, query: { ...route.query, city: v || undefined } }, { replace: true })
</script>

<template>
  <section class="space-y-3" aria-labelledby="li-h" data-testid="local-info">
    <h2 id="li-h" class="text-xl font-bold">{{ t('cityInfo.title') }}</h2>
    <p class="text-sm text-ink-soft">{{ t('cityInfo.intro') }}</p>
    <UiFormField :label="t('cityInfo.pick')"><UiSelect :model-value="city" :options="cities ?? []" :placeholder="t('cityInfo.none')" @update:model-value="pick" /></UiFormField>
    <div v-if="city && status === 'pending' && !data" aria-busy="true"><UiSkeleton :lines="3" /></div>
    <UiErrorState v-else-if="error" :message="isApiError(error) ? error.message : undefined" retry @retry="refresh()" />
    <ContentInfoBlock v-else-if="data?.block" :block="data.block" />
    <p v-else-if="city" class="rounded-md border border-line bg-sunken p-3 text-ink-soft" data-testid="local-info-empty">{{ t('cityInfo.empty') }}</p>
  </section>
</template>
