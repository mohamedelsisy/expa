<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { useI18n } from '#imports'
import type { CountryOption, TravelResponse } from '~/types/extra'
import { countryOptions } from '~/utils/countries'
import { RESIDENCE_STATUSES, toOptions, travelQuery, validateTravel } from '~/utils/travel'
import { isApiError } from '~/utils/errors'

/** Lookup of published, sourced travel entries. "No entry" is shown as "no verified information", never as allowed or not allowed. */
const { t, locale } = useI18n()
const { request } = useApi()
const route = useRoute()

const { data: countries, error: countriesError, refresh: refreshCountries } = await useAsyncData('countries', async () => (await request<CountryOption[]>('countries')).data, { watch: [locale] })
const options = computed(() => (countries.value?.length ? toOptions(countries.value, locale.value) : countryOptions(locale.value)))
const placeholder = computed(() => t('travel.choose'))
const statusOptions = computed(() => [{ value: '', label: t('travel.statusAny') }, ...RESIDENCE_STATUSES.map(s => ({ value: s, label: t(`travel.statuses.${s}`) }))])

const pick = (q: unknown) => (typeof q === 'string' && /^[A-Za-z]{2}$/.test(q) ? q.toUpperCase() : '')
const form = reactive({ nationality: pick(route.query.nationality), destination: pick(route.query.destination), status: '' })
const errors = ref<Partial<Record<'nationality' | 'destination', string>>>({})
const loading = ref(false)
const failure = ref<string | null>(null)
const result = ref<TravelResponse | null>(null)
const asked = ref<{ nationality: string, destination: string } | null>(null)
const live = ref('')

const name = (code: string) => options.value.find(o => o.value === code)?.label ?? code

async function submit() {
  failure.value = null
  const v = validateTravel(form)
  errors.value = Object.fromEntries(Object.entries(v).map(([k, c]) => [k, t(`travel.errors.${c}`)]))
  if (Object.keys(v).length) return
  loading.value = true
  try {
    result.value = (await request<TravelResponse>('travel/requirements', { query: travelQuery(form) })).data
    asked.value = { nationality: form.nationality, destination: form.destination }
    live.value = result.value.items.length ? t('travel.foundAnnounce', { n: result.value.items.length }) : t('travel.noInfoTitle')
  } catch (e) {
    result.value = null
    failure.value = isApiError(e) ? e.message : t('errors.generic')
  } finally {
    loading.value = false
  }
}
const lines = (s: string | null) => (s ?? '').split(/\r?\n/).map(x => x.trim()).filter(Boolean)
</script>

<template>
  <div class="grid gap-8 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)]">
    <form class="space-y-4 self-start rounded-lg border border-line bg-surface p-5" novalidate data-testid="travel-form" @submit.prevent="submit">
      <UiAlert v-if="countriesError" tone="warning">
        <p>{{ t('travel.countriesFallback') }}</p>
        <UiButton variant="secondary" class="mt-2" @click="refreshCountries()">{{ t('common.retry') }}</UiButton>
      </UiAlert>
      <UiFormField :label="t('travel.nationality')" :hint="t('travel.nationalityHelp')" :error="errors.nationality" required>
        <UiSelect v-model="form.nationality" :options="options" :placeholder="placeholder" />
      </UiFormField>
      <UiFormField :label="t('travel.destination')" :error="errors.destination" required>
        <UiSelect v-model="form.destination" :options="options" :placeholder="placeholder" />
      </UiFormField>
      <UiFormField :label="t('travel.status')" :hint="t('travel.statusHelp')" optional>
        <UiSelect v-model="form.status" :options="statusOptions" />
      </UiFormField>
      <UiButton type="submit" block :loading="loading"><UiIcon name="search" :size="18" />{{ t('travel.search') }}</UiButton>
      <p class="text-xs text-muted">{{ t('travel.privacy') }}</p>
    </form>

    <div class="min-w-0 space-y-5" :aria-busy="loading ? 'true' : undefined">
      <p class="sr-only" role="status" aria-live="polite">{{ live }}</p>
      <UiAlert v-if="failure" tone="danger" :title="t('travel.errorTitle')" data-testid="travel-error">{{ failure }}</UiAlert>
      <UiEmptyState v-if="!result && !failure && !loading" :title="t('travel.idleTitle')" :description="t('travel.idle')" icon="globe" />
      <UiSkeleton v-else-if="loading" block :lines="4" />

      <template v-else-if="result">
        <h2 class="text-xl font-bold" data-testid="travel-heading">{{ t('travel.resultsFor', { nationality: name(asked?.nationality ?? result.nationality), destination: name(asked?.destination ?? result.destination) }) }}</h2>

        <UiAlert v-if="!result.items.length" tone="info" :title="t('travel.noInfoTitle')" data-testid="travel-empty">
          <p>{{ t('travel.noInfoBody') }}</p>
          <p v-if="result.message" class="mt-2 text-sm">{{ result.message }}</p>
          <p class="mt-3"><UiButton to="/ask" variant="secondary"><UiIcon name="sparkle" :size="18" />{{ t('travel.askCta') }}</UiButton></p>
        </UiAlert>

        <ul v-else class="space-y-5">
          <li v-for="it in result.items" :key="it.slug" class="space-y-3 rounded-lg border border-line bg-surface p-5" data-testid="travel-item">
            <div class="flex flex-wrap items-center gap-2">
              <h3 class="text-lg font-bold" dir="auto">{{ it.title }}</h3>
              <UiBadge v-if="it.nationality === '*'">{{ t('travel.anyNationality') }}</UiBadge>
              <UiBadge v-if="it.residence_status !== 'any'" tone="primary">{{ t(`travel.statuses.${it.residence_status}`, it.residence_status) }}</UiBadge>
            </div>
            <p v-if="it.summary" class="text-ink-soft" dir="auto">{{ it.summary }}</p>
            <div v-if="lines(it.requirements).length" class="space-y-1">
              <h4 class="font-semibold">{{ t('travel.requirements') }}</h4>
              <ul class="list-disc space-y-1 ps-6" dir="auto"><li v-for="(l, i) in lines(it.requirements)" :key="i">{{ l }}</li></ul>
            </div>
            <div v-if="it.notes" class="space-y-1"><h4 class="font-semibold">{{ t('travel.notes') }}</h4><p class="prose-plain" dir="auto">{{ it.notes }}</p></div>
            <GuideSource :source="it.source" />
          </li>
        </ul>

        <UiAlert tone="warning" data-testid="travel-disclaimer">{{ result.disclaimer || t('travel.disclaimer') }}</UiAlert>
      </template>
    </div>
  </div>
</template>
