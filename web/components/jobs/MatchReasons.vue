<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from '#imports'
import type { JobMatch, MatchStatus } from '~/types/api'
import ScoreRing from '../ui/ScoreRing.vue'

/** Match score ring + localized reasons (API labels) with ✓ / △ / ✗ / ? icons and the confidence hint. Unknown never counts against the user. */
const props = defineProps<{ match: JobMatch, compact?: boolean }>()
const { t } = useI18n()
const ICON: Record<MatchStatus, { glyph: string, cls: string }> = {
  match: { glyph: '✓', cls: 'bg-success-soft text-success' },
  partial: { glyph: '△', cls: 'bg-warning-soft text-warning' },
  mismatch: { glyph: '✗', cls: 'bg-danger-soft text-danger' },
  unknown: { glyph: '?', cls: 'bg-sunken text-muted' },
}
const low = computed(() => props.match.confidence < 40)
</script>

<template>
  <section class="space-y-3" :aria-label="t('jobs.match.title')" data-testid="job-match">
    <div class="flex flex-wrap items-center gap-4">
      <ScoreRing v-if="match.score !== null" :value="match.score" :label="t('jobs.match.label')" :size="compact ? 88 : 120" />
      <p v-else class="min-w-0 basis-full font-medium text-ink" data-testid="match-none">{{ t('jobs.match.noScore') }}</p>
      <p class="min-w-0 flex-1 basis-40 text-sm text-ink-soft" data-testid="match-confidence">{{ t('jobs.match.confidence', { value: match.confidence }) }}<template v-if="low"> {{ t('jobs.match.lowConfidence') }}</template></p>
    </div>
    <ul class="space-y-1.5">
      <li v-for="r in match.reasons" :key="r.key" class="flex items-start gap-2" :data-status="r.status" data-testid="match-reason">
        <span class="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full text-sm font-bold" :class="ICON[r.status]?.cls ?? ICON.unknown.cls" aria-hidden="true">{{ (ICON[r.status] ?? ICON.unknown).glyph }}</span>
        <span class="sr-only">{{ t(`jobs.match.status.${r.status}`) }}:</span>
        <span class="text-ink">{{ r.label }}</span>
      </li>
    </ul>
  </section>
</template>
