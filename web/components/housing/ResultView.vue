<script setup lang="ts">
import type { HousingResult } from '~/types/extra'
import { formatMoney } from '~/utils/money'
import { SEVERITY_TONE, sortFlags } from '~/utils/housing'

/**
 * Housing check result. Everything shown is what the API returned (or an explicit "not detected"): nothing is
 * inferred here. The disclaimer is a separate notice, never merged into the findings.
 */
const props = defineProps<{ result: HousingResult }>()
const { t, te, locale } = useI18n()
const money = (n: number) => formatMoney(n, props.result.cost.currency, locale.value, 2)
const flags = computed(() => sortFlags(props.result.red_flags))

// Detected facts only (null / false are "not detected", listed separately as could_not_detect).
const facts = computed(() => {
  const f = props.result.facts as Record<string, unknown>
  const rows: { key: string, label: string, value: string }[] = []
  for (const [k, v] of Object.entries(f)) {
    if (v === null || v === undefined || v === false || (Array.isArray(v) && !v.length)) continue
    const label = te(`housing.facts.${k}`) ? t(`housing.facts.${k}`) : k
    let value: string
    if (typeof v === 'number') value = k.endsWith('_months') ? t('housing.months', { count: v }) : money(v)
    else if (typeof v === 'boolean') value = t('housing.mentioned')
    else if (Array.isArray(v)) value = v.join(', ')
    else value = te(`housing.factValues.${String(v)}`) ? t(`housing.factValues.${String(v)}`) : String(v)
    rows.push({ key: k, label, value })
  }
  return rows
})
const componentLabel = (k: string) => (te(`housing.cost.${k}`) ? t(`housing.cost.${k}`) : k)
const confidenceTone = computed(() => ({ low: 'warning', medium: 'info', high: 'success' } as const)[props.result.confidence])
</script>

<template>
  <div class="space-y-8" data-testid="housing-result">
    <UiAlert :tone="confidenceTone === 'warning' ? 'warning' : 'info'" :title="t('housing.confidence.title')" data-testid="housing-confidence">
      <p><UiBadge :tone="confidenceTone">{{ t(`housing.confidence.${result.confidence}`) }}</UiBadge></p>
      <p class="mt-1 text-sm">{{ t('housing.confidence.explain') }}</p>
    </UiAlert>

    <section aria-labelledby="hr-facts" class="space-y-3">
      <h2 id="hr-facts" class="text-xl font-bold">{{ t('housing.terms.title') }}</h2>
      <p v-if="!facts.length" class="text-ink-soft">{{ t('housing.terms.none') }}</p>
      <dl v-else class="grid gap-3 sm:grid-cols-2">
        <div v-for="f in facts" :key="f.key" class="rounded-md border border-line bg-surface p-3"><dt class="text-sm text-muted">{{ f.label }}</dt><dd class="font-semibold"><bdi>{{ f.value }}</bdi></dd></div>
      </dl>
      <p v-if="result.facts.contract_keywords && (result.facts.contract_keywords as string[]).length" class="text-sm text-ink-soft">{{ t('housing.terms.keywordsNote') }}</p>
    </section>

    <section aria-labelledby="hr-flags" class="space-y-3">
      <h2 id="hr-flags" class="text-xl font-bold">{{ t('housing.flags.title') }}</h2>
      <p class="text-sm text-ink-soft">{{ t('housing.flags.note') }}</p>
      <p v-if="!flags.length" class="rounded-md border border-line bg-sunken p-3" data-testid="no-flags">{{ t('housing.flags.none') }}</p>
      <ul v-else class="space-y-3">
        <li v-for="f in flags" :key="f.id">
          <UiAlert :tone="SEVERITY_TONE[f.severity] === 'danger' ? 'warning' : SEVERITY_TONE[f.severity]" :title="f.title">
            <p v-if="f.explanation">{{ f.explanation }}</p>
            <p class="mt-1 flex flex-wrap items-center gap-2 text-sm"><UiBadge>{{ t(`housing.severity.${f.severity}`) }}</UiBadge><UiBadge :tone="f.basis === 'sourced' ? 'info' : 'neutral'">{{ t(`housing.basis.${f.basis}`) }}</UiBadge></p>
            <GuideSource v-if="f.source" :source="f.source" class="mt-2" />
          </UiAlert>
        </li>
      </ul>
    </section>

    <section aria-labelledby="hr-q" class="space-y-3">
      <h2 id="hr-q" class="text-xl font-bold">{{ t('housing.questions.title') }}</h2>
      <p v-if="!result.questions.length" class="text-ink-soft">{{ t('housing.questions.none') }}</p>
      <ul v-else class="space-y-2">
        <li v-for="q in result.questions" :key="q.id" class="rounded-md border border-line bg-surface p-3"><p class="font-medium">{{ q.question ?? q.title }}</p><p v-if="q.explanation" class="mt-1 text-sm text-ink-soft">{{ q.explanation }}</p></li>
      </ul>
    </section>

    <section aria-labelledby="hr-cost" class="space-y-3">
      <h2 id="hr-cost" class="text-xl font-bold">{{ t('housing.cost.title') }}</h2>
      <UiAlert v-if="result.cost.monthly_total === null" tone="warning" data-testid="no-total">{{ t('housing.cost.noTotal') }}</UiAlert>
      <template v-else>
        <p class="text-3xl font-bold tabular-nums" data-testid="monthly-total"><bdi>{{ money(result.cost.monthly_total) }}</bdi> <span class="text-base font-normal text-muted">{{ t('housing.cost.perMonth') }}</span></p>
        <ul class="divide-y divide-line rounded-md border border-line bg-surface">
          <li v-for="c in result.cost.components" :key="c.key" class="flex flex-wrap items-center justify-between gap-2 p-3"><span>{{ componentLabel(c.key) }} <UiBadge>{{ t(`housing.cost.source.${c.source}`) }}</UiBadge></span><span class="font-semibold tabular-nums"><bdi>{{ money(c.amount) }}</bdi></span></li>
        </ul>
      </template>
      <div v-if="result.cost.one_time.length" class="space-y-2"><h3 class="font-semibold">{{ t('housing.cost.oneTime') }}</h3><p class="text-sm text-ink-soft">{{ t('housing.cost.oneTimeNote') }}</p>
        <ul class="divide-y divide-line rounded-md border border-line bg-surface"><li v-for="c in result.cost.one_time" :key="c.key" class="flex flex-wrap items-center justify-between gap-2 p-3"><span>{{ componentLabel(c.key) }}<template v-if="c.derived"> ({{ t('housing.cost.derived') }})</template></span><span class="font-semibold tabular-nums"><bdi>{{ money(c.amount) }}</bdi></span></li></ul>
      </div>
      <div v-if="result.cost.assumptions.length"><h3 class="mb-1 font-semibold">{{ t('housing.cost.assumptions') }}</h3><ul class="list-disc space-y-1 ps-5 text-ink-soft" data-testid="assumptions"><li v-for="a in result.cost.assumptions" :key="a.code">{{ a.text }}</li></ul></div>
    </section>

    <section aria-labelledby="hr-missing" class="space-y-3">
      <h2 id="hr-missing" class="text-xl font-bold">{{ t('housing.missing.title') }}</h2>
      <p v-if="!result.could_not_detect.length" class="text-ink-soft">{{ t('housing.missing.none') }}</p>
      <template v-else><p class="text-sm text-ink-soft">{{ t('housing.missing.note') }}</p><ul class="flex flex-wrap gap-2" data-testid="could-not-detect"><li v-for="m in result.could_not_detect" :key="m.key"><UiBadge tone="warning">{{ m.label }}</UiBadge></li></ul></template>
    </section>

    <section v-if="result.notes?.length" aria-labelledby="hr-notes" class="space-y-2"><h2 id="hr-notes" class="text-xl font-bold">{{ t('housing.notes') }}</h2><ul class="list-disc space-y-1 ps-5 text-ink-soft"><li v-for="n in result.notes" :key="n.code">{{ n.text }}</li></ul></section>

    <section v-if="result.explanation" aria-labelledby="hr-ai" class="space-y-2">
      <h2 id="hr-ai" class="text-xl font-bold">{{ t('housing.explanation.title') }}</h2>
      <UiBadge tone="info">{{ t('housing.explanation.label') }}</UiBadge>
      <p class="prose-plain" dir="auto">{{ result.explanation.text }}</p>
    </section>
    <UiAlert v-else-if="result.explanation_status === 'unavailable'" tone="info">{{ t('housing.explanation.unavailable') }}</UiAlert>

    <UiAlert tone="warning" :title="t('housing.disclaimerTitle')" data-testid="housing-disclaimer">{{ result.disclaimer }}</UiAlert>
    <p class="text-sm text-muted" data-testid="housing-saved-note">{{ result.persisted ? t('housing.savedYes') : t('housing.savedNo') }}</p>
  </div>
</template>
