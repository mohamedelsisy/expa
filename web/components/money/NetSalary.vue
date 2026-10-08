<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { useI18n } from '#imports'
import type { NetSalaryResponse } from '~/types/extra'
import { formatMoney } from '~/utils/money'
import { MONTHS, netBody, needsFreshnessWarning, validateNet, type NetField } from '~/utils/netSalary'
import { isApiError } from '~/utils/errors'
import { formatNumber } from '~/utils/locale'

/** Gross to net estimator. The API does the arithmetic from a published, sourced tax table; this component only collects input and shows the result honestly. */
const { t, locale } = useI18n()
const { request } = useApi()
const form = reactive({ gross: '', months: '12', taxYear: '' })
const errors = ref<Partial<Record<NetField, string>>>({})
const loading = ref(false)
const failure = ref<string | null>(null)
const result = ref<NetSalaryResponse | null>(null)
const live = ref('')

const monthOptions = MONTHS.map(m => ({ value: String(m), label: t('net.monthsOption', { n: m }) }))
const eur = (n: number, frac = 2) => formatMoney(n, 'EUR', locale.value, frac)
const pct = (n: number) => `${formatNumber(n, locale.value, { maximumFractionDigits: 2 })}%`

async function submit() {
  failure.value = null
  const v = validateNet(form)
  errors.value = Object.fromEntries(Object.entries(v).map(([k, c]) => [k, t(`net.errors.${c}`, { max: formatNumber(10000000, locale.value) })]))
  if (Object.keys(v).length) return
  loading.value = true
  try {
    result.value = (await request<NetSalaryResponse>('money/net-salary', { method: 'POST', body: netBody(form) })).data
    live.value = result.value.available ? t('net.doneAnnounce') : t('net.unavailableTitle')
  } catch (e) {
    result.value = null
    if (isApiError(e) && e.status === 422 && e.details) {
      const d = e.details as Record<string, unknown>
      errors.value = { ...(d.gross_annual ? { gross: String((d.gross_annual as string[])[0]) } : {}), ...(d.tax_year ? { taxYear: String((d.tax_year as string[])[0]) } : {}) }
    }
    failure.value = isApiError(e) ? e.message : t('errors.generic')
  } finally {
    loading.value = false
  }
}
const ok = computed(() => (result.value && result.value.available ? result.value : null))
const rows = computed(() => {
  const e = ok.value?.estimate
  if (!e) return []
  return [
    { key: 'gross', v: e.gross_annual }, { key: 'contributions', v: -e.contributions }, { key: 'deduction', v: e.deduction },
    { key: 'taxable', v: e.taxable_income }, { key: 'incomeTax', v: -e.income_tax },
  ]
})
</script>

<template>
  <div class="grid gap-8 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)]">
    <form class="space-y-4 self-start rounded-lg border border-line bg-surface p-5" novalidate data-testid="net-form" @submit.prevent="submit">
      <UiFormField :label="t('net.gross')" :hint="t('net.grossHelp')" :error="errors.gross" required>
        <UiTextInput v-model="form.gross" inputmode="decimal" ltr autocomplete="off" />
      </UiFormField>
      <UiFormField :label="t('net.months')" :hint="t('net.monthsHelp')">
        <UiSelect v-model="form.months" :options="monthOptions" />
      </UiFormField>
      <UiFormField :label="t('net.taxYear')" :hint="t('net.taxYearHelp')" :error="errors.taxYear" optional>
        <UiTextInput v-model="form.taxYear" inputmode="numeric" :maxlength="4" ltr autocomplete="off" />
      </UiFormField>
      <UiButton type="submit" block :loading="loading"><UiIcon name="euro" :size="18" />{{ t('net.calculate') }}</UiButton>
      <p class="text-xs text-muted">{{ t('net.privacy') }}</p>
    </form>

    <div class="min-w-0 space-y-5" :aria-busy="loading ? 'true' : undefined">
      <p class="sr-only" role="status" aria-live="polite">{{ live }}</p>
      <UiAlert v-if="failure" tone="danger" :title="t('net.errorTitle')" data-testid="net-error">{{ failure }}</UiAlert>

      <UiEmptyState v-if="!result && !failure && !loading" :title="t('net.idleTitle')" :description="t('net.idle')" icon="euro" />
      <UiSkeleton v-else-if="loading" block :lines="4" />

      <UiAlert v-else-if="result && !result.available" tone="info" :title="t('net.unavailableTitle')" data-testid="net-unavailable">
        <p>{{ t('net.unavailableBody') }}</p>
        <p v-if="result.message" class="mt-2 text-sm">{{ result.message }}</p>
      </UiAlert>

      <template v-else-if="ok">
        <section aria-labelledby="net-res-h" class="space-y-4" data-testid="net-result">
          <h2 id="net-res-h" class="text-xl font-bold">{{ t('net.resultTitle', { year: ok.tax_year }) }}</h2>
          <dl class="grid gap-3 sm:grid-cols-2">
            <div class="rounded-lg bg-primary-soft p-4">
              <dt class="text-sm font-medium text-primary-strong">{{ t('net.netMonthly', { n: ok.estimate.months }) }}</dt>
              <dd class="mt-1 text-2xl font-bold text-primary-strong" data-testid="net-monthly"><bdi>{{ eur(ok.estimate.net_monthly) }}</bdi></dd>
            </div>
            <div class="rounded-lg bg-sunken p-4">
              <dt class="text-sm font-medium text-ink-soft">{{ t('net.netAnnual') }}</dt>
              <dd class="mt-1 text-2xl font-bold" data-testid="net-annual"><bdi>{{ eur(ok.estimate.net_annual) }}</bdi></dd>
            </div>
          </dl>
          <UiAlert tone="warning" data-testid="net-estimate-note">{{ t('net.estimateNote') }}</UiAlert>

          <div class="overflow-x-auto rounded-lg border border-line" role="region" tabindex="0" :aria-label="t('net.breakdown')">
            <table class="w-full text-start">
              <caption class="p-3 text-start font-bold">{{ t('net.breakdown') }}</caption>
              <thead class="bg-sunken text-sm"><tr><th scope="col" class="px-3 py-2 text-start">{{ t('net.item') }}</th><th scope="col" class="px-3 py-2 text-end">{{ t('net.amount') }}</th></tr></thead>
              <tbody class="divide-y divide-line">
                <tr v-for="r in rows" :key="r.key"><th scope="row" class="px-3 py-2 text-start font-normal">{{ t(`net.rows.${r.key}`) }}</th><td class="px-3 py-2 text-end tabular-nums"><bdi>{{ eur(r.v) }}</bdi></td></tr>
                <tr class="font-bold"><th scope="row" class="px-3 py-2 text-start">{{ t('net.rows.netAnnual') }}</th><td class="px-3 py-2 text-end tabular-nums"><bdi>{{ eur(ok.estimate.net_annual) }}</bdi></td></tr>
              </tbody>
            </table>
          </div>

          <div v-if="ok.estimate.brackets.length" class="overflow-x-auto rounded-lg border border-line" role="region" tabindex="0" :aria-label="t('net.brackets')">
            <table class="w-full text-start">
              <caption class="p-3 text-start font-bold">{{ t('net.brackets') }}</caption>
              <thead class="bg-sunken text-sm">
                <tr>
                  <th scope="col" class="px-3 py-2 text-start">{{ t('net.from') }}</th><th scope="col" class="px-3 py-2 text-start">{{ t('net.to') }}</th>
                  <th scope="col" class="px-3 py-2 text-end">{{ t('net.rate') }}</th><th scope="col" class="px-3 py-2 text-end">{{ t('net.taxable') }}</th><th scope="col" class="px-3 py-2 text-end">{{ t('net.tax') }}</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-line">
                <tr v-for="(b, i) in ok.estimate.brackets" :key="i">
                  <td class="px-3 py-2 tabular-nums"><bdi>{{ eur(b.from, 0) }}</bdi></td>
                  <td class="px-3 py-2 tabular-nums"><bdi v-if="b.to !== null">{{ eur(b.to, 0) }}</bdi><span v-else>{{ t('net.noLimit') }}</span></td>
                  <td class="px-3 py-2 text-end tabular-nums"><bdi>{{ pct(b.rate) }}</bdi></td>
                  <td class="px-3 py-2 text-end tabular-nums"><bdi>{{ eur(b.taxable) }}</bdi></td>
                  <td class="px-3 py-2 text-end tabular-nums"><bdi>{{ eur(b.tax) }}</bdi></td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <UiAlert v-if="needsFreshnessWarning(ok.table.source.freshness)" tone="warning" :title="t('net.staleTitle')" data-testid="net-stale">{{ t('net.stale') }}</UiAlert>
        <div class="space-y-2">
          <p v-if="ok.table.name" class="text-sm text-muted">{{ t('net.tableName') }}: <span dir="auto">{{ ok.table.name }}</span></p>
          <GuideSource :source="ok.table.source" />
        </div>
        <UiAlert tone="warning" data-testid="net-disclaimer">{{ ok.disclaimer }}</UiAlert>
      </template>
    </div>
  </div>
</template>
