<script setup lang="ts">
import type { AppointmentGuide, AppointmentHub, City } from '~/types/api'

const { t, locale } = useI18n()
const route = useRoute()
const localePath = useLocalePath()
const { request } = useApi()
useSeo(() => ({ title: t('appt.title'), description: t('appt.subtitle') }))

const TYPES = ['questura', 'prefettura', 'comune', 'anagrafe', 'asl', 'inps', 'agenzia_entrate', 'poste', 'motorizzazione', 'university', 'other']
const typeOptions = computed(() => TYPES.map(v => ({ value: v, label: t(`appt.officeTypes.${v}`) })))
const type = ref(typeof route.query.type === 'string' ? route.query.type : '')
const city = ref(typeof route.query.city === 'string' ? route.query.city : '')

const { data: lookups, error: lookupError } = await useAsyncData('appt-lookups', async () => {
  const [cities, guides] = await Promise.all([request<City[]>('cities'), request<AppointmentGuide[]>('appointments/guides', { query: { per_page: 50 } })])
  return { cities: cities.data, guides: guides.data }
}, { watch: [locale] })
const cityOptions = computed(() => (lookups.value?.cities ?? []).map(c => ({ value: c.slug, label: c.name })))

const hub = ref<AppointmentHub | null>(null)
const loading = ref(false)
const hubError = ref<string | null>(null)
const touched = ref(false)
async function find() {
  touched.value = true
  if (!type.value || !city.value) return
  loading.value = true
  hubError.value = null
  try {
    hub.value = (await request<AppointmentHub>('appointments/hub', { query: { type: type.value, city: city.value } })).data
    navigateTo({ path: route.path, query: { type: type.value, city: city.value } }, { replace: true })
  } catch (e) {
    hub.value = null
    hubError.value = isApiError(e) ? e.message : t('errors.generic')
  } finally {
    loading.value = false
  }
}
onMounted(() => { if (type.value && city.value) void find() })
</script>

<template>
  <div class="container-page py-8 sm:py-12">
    <header class="mb-6 max-w-2xl">
      <h1 class="text-2xl font-bold sm:text-3xl">{{ t('appt.title') }}</h1>
      <p class="mt-1 text-ink-soft">{{ t('appt.subtitle') }}</p>
    </header>
    <UiAlert tone="info" class="mb-6">{{ t('appt.notice') }}</UiAlert>

    <form class="mb-8 grid gap-4 rounded-lg border border-line bg-surface p-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end" novalidate @submit.prevent="find">
      <UiFormField :label="t('appt.officeType')" :error="touched && !type ? t('appt.chooseType') : undefined" required><UiSelect v-model="type" :options="typeOptions" :placeholder="t('common.choose')" /></UiFormField>
      <UiFormField :label="t('guides.city')" :error="touched && !city ? t('appt.chooseCity') : undefined" required><UiSelect v-model="city" :options="cityOptions" :placeholder="t('common.choose')" /></UiFormField>
      <UiButton type="submit" :loading="loading"><UiIcon name="search" :size="18" />{{ t('appt.find') }}</UiButton>
    </form>
    <UiAlert v-if="lookupError" tone="warning" class="mb-6">{{ t('guides.filtersUnavailable') }}</UiAlert>

    <div aria-live="polite">
      <UiErrorState v-if="hubError" :message="hubError" retry @retry="find" />
      <div v-else-if="hub" class="space-y-8" data-testid="appointment-hub">
        <h2 class="text-xl font-bold">{{ t('appt.resultsFor', { type: hub.office_type_label, city: hub.city.name }) }}</h2>
        <UiAlert tone="info" data-testid="hub-notice">{{ hub.notice }}</UiAlert>
        <section v-if="hub.guide" aria-labelledby="hub-guide" class="space-y-4">
          <h3 id="hub-guide" class="text-lg font-bold"><UiAutoItalian :text="hub.guide.title" /></h3>
          <p v-if="hub.guide.summary" class="text-ink-soft">{{ hub.guide.summary }}</p>
          <GuideFallbackNotice v-if="hub.guide.fallback" :locale="hub.guide.locale" />
          <GovGuideSteps :guide="hub.guide" />
          <GuideSource :source="hub.guide.source" />
        </section>
        <UiAlert v-else tone="warning">{{ t('appt.noGuide') }}</UiAlert>
        <section aria-labelledby="hub-offices" class="space-y-4">
          <h3 id="hub-offices" class="text-lg font-bold">{{ t('gov.offices') }}</h3>
          <p v-if="!hub.offices.length" class="text-muted">{{ t('appt.noOffices') }}</p>
          <ul v-else class="grid gap-4 md:grid-cols-2"><li v-for="o in hub.offices" :key="o.id"><GovOfficeCard :office="o" link /></li></ul>
        </section>
      </div>
    </div>

    <section v-if="lookups?.guides.length" aria-labelledby="all-guides" class="mt-12 space-y-4">
      <h2 id="all-guides" class="text-xl font-bold">{{ t('appt.allGuides') }}</h2>
      <ul class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <li v-for="g in lookups.guides" :key="g.id">
          <UiCard as="article" class="relative flex h-full flex-col gap-2 hover:shadow-2">
            <div class="flex flex-wrap gap-2"><UiBadge tone="primary">{{ g.office_type_label }}</UiBadge><UiSourceBadge :type="g.source.type" /></div>
            <h3 class="font-bold"><NuxtLink :to="localePath(`/appointments/${g.slug}`)" class="after:absolute after:inset-0 after:content-['']"><UiAutoItalian :text="g.title" /></NuxtLink></h3>
            <p v-if="g.summary" class="line-clamp-3 text-ink-soft">{{ g.summary }}</p>
          </UiCard>
        </li>
      </ul>
    </section>
  </div>
</template>
