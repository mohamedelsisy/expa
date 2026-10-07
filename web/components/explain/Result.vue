<script setup lang="ts">
import type { ExplainResult } from '~/types/extra'
import { actionViews, confidencePercent, keyDateViews } from '~/utils/explain'
import { formatDay } from '~/utils/locale'
import { safeHttpsUrl } from '~/utils/safe'

/** Explainer result: classification, summary, dates (never invented), safe links, separate disclaimer. */
const props = defineProps<{ result: ExplainResult }>()
const { t, te, locale } = useI18n()
const localePath = useLocalePath()
const dates = computed(() => keyDateViews(props.result.key_dates))
const actions = computed(() => actionViews(props.result.suggested_actions))
const conf = computed(() => {
  const c = props.result.classification.confidence
  const p = confidencePercent(c)
  if (p !== null) return `${p}%`
  return typeof c === 'string' && te(`explain.confidenceText.${c}`) ? t(`explain.confidenceText.${c}`) : null
})
const sources = computed(() => props.result.sources.map(s => ({ ...s, safe: safeHttpsUrl(s.url) })))
</script>

<template>
  <div class="space-y-8" data-testid="explain-result">
    <UiAlert v-if="result.degraded" tone="info" data-testid="explain-degraded">{{ t('explain.degraded') }}</UiAlert>

    <section aria-labelledby="ex-class" class="space-y-2">
      <h2 id="ex-class" class="text-xl font-bold">{{ t('explain.classification') }}</h2>
      <p class="flex flex-wrap items-center gap-2">
        <span class="text-lg font-semibold" data-testid="explain-type">{{ result.classification.type_label }}</span>
        <UiBadge v-if="conf" data-testid="explain-confidence">{{ t('explain.confidence', { value: conf }) }}</UiBadge>
        <UiBadge tone="info">{{ result.label_text }}</UiBadge>
      </p>
      <p class="text-sm text-muted">{{ t('explain.classificationNote') }}</p>
    </section>

    <section aria-labelledby="ex-sum" class="space-y-2">
      <h2 id="ex-sum" class="text-xl font-bold">{{ t('explain.summary') }}</h2>
      <p v-if="result.summary" class="prose-plain" dir="auto" data-testid="explain-summary">{{ result.summary }}</p>
      <p v-else class="text-ink-soft">{{ t('explain.degraded') }}</p>
    </section>

    <section aria-labelledby="ex-dates" class="space-y-2">
      <h2 id="ex-dates" class="text-xl font-bold">{{ t('explain.dates') }}</h2>
      <p v-if="!dates.length" class="text-ink-soft">{{ t('explain.datesNone') }}</p>
      <ul v-else class="divide-y divide-line rounded-md border border-line bg-surface" data-testid="explain-dates">
        <li v-for="(d, i) in dates" :key="i" class="space-y-1 p-3">
          <p class="font-medium" dir="auto">{{ d.label }}</p>
          <p v-if="d.date" class="flex flex-wrap items-center gap-2"><time :datetime="d.date"><bdi>{{ formatDay(d.date, locale) }}</bdi></time><UiBadge v-if="d.past" tone="warning">{{ t('explain.datePast') }}</UiBadge><UiBadge v-if="d.yearMissing">{{ t('explain.yearMissing') }}</UiBadge></p>
          <p v-else class="text-warning" data-testid="date-unclear">{{ t('explain.dateUnclear') }}</p>
          <p v-if="d.text" class="text-sm text-ink-soft" dir="auto">{{ t('explain.dateText', { text: d.text }) }}</p>
        </li>
      </ul>
    </section>

    <section aria-labelledby="ex-act" class="space-y-2">
      <h2 id="ex-act" class="text-xl font-bold">{{ t('explain.actions') }}</h2>
      <p v-if="!actions.length" class="text-ink-soft">{{ t('explain.actionsNone') }}</p>
      <template v-else>
        <p class="text-sm text-ink-soft">{{ t('explain.actionsNote') }}</p>
        <ul class="space-y-2" data-testid="explain-actions">
          <li v-for="(a, i) in actions" :key="i" class="flex flex-wrap items-center gap-2 rounded-md border border-line bg-surface p-3">
            <UiBadge>{{ t(`explain.actionTypes.${a.type}`) }}</UiBadge>
            <NuxtLink v-if="a.path" :to="localePath(a.path)" class="inline-flex min-h-touch items-center font-medium text-primary-strong underline underline-offset-4">{{ a.label }}</NuxtLink>
            <span v-else class="font-medium">{{ a.label }}</span>
            <span v-if="a.date" class="text-sm text-muted">{{ t('explain.actionDate', { date: formatDay(a.date, locale) }) }}</span>
          </li>
        </ul>
      </template>
    </section>

    <section v-if="sources.length" aria-labelledby="ex-src" class="space-y-2">
      <h2 id="ex-src" class="text-xl font-bold">{{ t('explain.sources') }}</h2>
      <ul class="space-y-2">
        <li v-for="(s, i) in sources" :key="i" class="flex flex-wrap items-center gap-2 rounded-md border border-line bg-surface p-3">
          <UiSourceBadge :type="s.type" />
          <a v-if="s.safe" :href="s.safe" target="_blank" rel="noopener noreferrer" class="inline-flex min-h-touch items-center gap-1 font-medium text-primary-strong underline underline-offset-4">{{ s.title }}<UiIcon name="external" :size="14" /><span class="sr-only">{{ t('a11y.opensNewTab') }}</span></a>
          <span v-else class="font-medium">{{ s.title }}</span>
          <span v-if="s.name" class="text-sm text-muted">{{ s.name }}</span>
        </li>
      </ul>
    </section>

    <UiAlert tone="warning" :title="t('explain.disclaimerTitle')" data-testid="explain-disclaimer">{{ result.disclaimer }}</UiAlert>
    <p class="text-sm text-muted" data-testid="explain-stored">{{ t('explain.stored') }}</p>
  </div>
</template>
