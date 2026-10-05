<script setup lang="ts">
import { computed } from 'vue'
import { useI18n, useLocalePath } from '#imports'
import type { AiLabel, AiMessage } from '~/types/api'
import { parseMessage } from '~/utils/aiMessage'
import { mapApiAction, mapApiRoute } from '~/utils/routes'
import { safeHttpsUrl } from '~/utils/safe'
import Badge from '../ui/Badge.vue'
import Icon from '../ui/Icon.vue'
import Button from '../ui/Button.vue'
import Alert from '../ui/Alert.vue'
import SourceBadge from '../ui/SourceBadge.vue'
import FreshnessIndicator from '../ui/FreshnessIndicator.vue'

/**
 * One assistant answer. Text is rendered ONLY through interpolation (no HTML), `[n]` markers become in-page links
 * to the matching numbered source, the label badge comes from the API (never computed here), and a degraded answer
 * shows a friendly state with the search alternative.
 */
const props = defineProps<{ message: AiMessage, msgKey: string, fallbackQuery?: string }>()
const { t } = useI18n()
const localePath = useLocalePath()

const LABELS: Record<AiLabel, { tone: 'success' | 'info' | 'accent' | 'warning', icon: string }> = {
  official: { tone: 'success', icon: 'shield' },
  general_guidance: { tone: 'info', icon: 'info' },
  ai_explanation: { tone: 'accent', icon: 'sparkle' },
  third_party: { tone: 'warning', icon: 'alert' },
}
const label = computed(() => (props.message.label && LABELS[props.message.label] ? props.message.label : null))
const labelText = computed(() => props.message.label_text || (label.value ? t(`ask.labels.${label.value}`) : ''))

const sources = computed(() => props.message.sources ?? [])
const paragraphs = computed(() => parseMessage(props.message.content, sources.value.map(s => s.n)))
// The built-in disclaimer arrives as the last paragraph starting with the warning sign: show it as a distinct note.
const disclaimerIdx = computed(() => {
  const last = paragraphs.value.length - 1
  const first = paragraphs.value[last]?.[0]?.[0]
  return first && first.kind === 'text' && first.text.trimStart().startsWith('⚠') ? last : -1
})

const actions = computed(() => (props.message.actions ?? [])
  .map(a => ({ ...a, path: mapApiAction(a) }))
  .filter((a): a is typeof a & { path: string } => !!a.path))
const searchPath = computed(() => {
  const found = actions.value.find(a => a.path.startsWith('/search'))
  if (found) return found.path
  const q = (props.fallbackQuery ?? '').trim().slice(0, 100)
  return q.length >= 2 ? `/search?q=${encodeURIComponent(q)}` : '/search'
})
const otherActions = computed(() => (props.message.degraded ? actions.value.filter(a => !a.path.startsWith('/search')) : actions.value))

const srcId = (n: number) => `src-${props.msgKey}-${n}`
function focusSource(n: number) {
  const el = document.getElementById(srcId(n))
  el?.focus()
  el?.scrollIntoView?.({ block: 'nearest' })
}
const sourceRoute = (s: AiMessage['sources'][number]) => mapApiRoute(s.ref?.route)
</script>

<template>
  <article class="space-y-3" :data-label="label ?? undefined" :data-degraded="message.degraded ? 'true' : undefined">
    <Badge v-if="label" :tone="LABELS[label].tone" data-testid="ai-label"><Icon :name="LABELS[label].icon" :size="14" />{{ labelText }}</Badge>

    <Alert v-if="message.degraded" tone="warning" :title="t('ask.degradedTitle')" data-testid="ai-degraded">
      <p>{{ t('ask.degradedBody') }}</p>
      <Button :to="searchPath" variant="secondary" class="mt-3" data-testid="ai-degraded-search"><Icon name="search" :size="18" />{{ t('ask.searchInstead') }}</Button>
    </Alert>

    <div class="space-y-3 text-ink" data-testid="ai-text">
      <template v-for="(p, pi) in paragraphs" :key="pi">
        <p v-if="pi === disclaimerIdx" dir="auto" class="rounded-md border border-warning bg-warning-soft p-3 text-sm text-ink" data-testid="ai-disclaimer">
          <template v-for="(line, li) in p" :key="li"><br v-if="li > 0"><template v-for="(tok, ti) in line" :key="ti"><span v-if="tok.kind === 'text'">{{ tok.text }}</span><a v-else :href="`#${srcId(tok.n)}`" class="font-semibold text-primary-strong underline" data-cite @click.prevent="focusSource(tok.n)">[{{ tok.n }}]</a></template></template>
        </p>
        <p v-else dir="auto" class="leading-relaxed">
          <template v-for="(line, li) in p" :key="li"><br v-if="li > 0"><template v-for="(tok, ti) in line" :key="ti"><span v-if="tok.kind === 'text'">{{ tok.text }}</span><a v-else :href="`#${srcId(tok.n)}`" class="inline-flex min-h-6 items-center px-0.5 font-semibold text-primary-strong underline" data-cite :aria-label="t('ask.citation', { n: tok.n })" @click.prevent="focusSource(tok.n)">[{{ tok.n }}]</a></template></template>
        </p>
      </template>
    </div>

    <p v-if="message.disclaimer" dir="auto" class="rounded-md border border-warning bg-warning-soft p-3 text-sm text-ink" data-testid="ai-disclaimer-field">{{ message.disclaimer }}</p>

    <section v-if="sources.length" :aria-label="t('ask.sources')" class="space-y-2" data-testid="ai-sources">
      <h3 class="text-sm font-bold text-ink-soft">{{ t('ask.sources') }}</h3>
      <ol class="space-y-2">
        <li
          v-for="s in sources"
          :id="srcId(s.n)"
          :key="s.n"
          tabindex="-1"
          class="flex gap-3 rounded-md border border-line bg-sunken p-3 text-sm outline-none focus-visible:ring-2"
          data-testid="ai-source"
        >
          <span class="grid size-7 shrink-0 place-items-center rounded-full bg-primary-soft font-bold text-primary-strong tabular-nums" aria-hidden="true">{{ s.n }}</span>
          <div class="min-w-0 space-y-1.5">
            <p class="font-semibold text-ink">
              <NuxtLink v-if="sourceRoute(s)" :to="localePath(sourceRoute(s)!)" class="underline underline-offset-4">{{ s.title }}</NuxtLink>
              <span v-else>{{ s.title }}</span>
            </p>
            <p class="flex flex-wrap items-center gap-2">
              <SourceBadge :type="s.source?.type ?? null" />
              <span v-if="s.source?.name" class="text-ink-soft">{{ s.source.name }}</span>
            </p>
            <a
              v-if="safeHttpsUrl(s.source?.url)"
              :href="safeHttpsUrl(s.source?.url)!"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex min-h-touch items-center gap-1.5 font-medium text-primary-strong underline underline-offset-4"
              data-testid="ai-source-link"
            >{{ t('source.open') }}<Icon name="external" :size="14" /><span class="sr-only">{{ t('a11y.opensNewTab') }}</span></a>
            <FreshnessIndicator v-if="s.source" :last-verified-at="s.source.last_verified_at" :freshness="s.source.freshness" />
          </div>
        </li>
      </ol>
    </section>

    <nav v-if="otherActions.length" :aria-label="t('ask.actions')" class="flex flex-wrap gap-2">
      <Button v-for="a in otherActions" :key="`${a.type}-${a.target}`" :to="a.path" variant="secondary" data-testid="ai-action">{{ a.label }}<Icon name="arrow-end" :size="16" /></Button>
    </nav>

    <p v-if="message.label === 'ai_explanation' || message.label === 'third_party'" class="text-xs text-muted">{{ t('ask.verifyNote') }}</p>
  </article>
</template>
