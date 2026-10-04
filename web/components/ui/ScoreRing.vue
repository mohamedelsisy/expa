<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from '#imports'

/** Accessible ring: a text alternative announces value + label; the SVG itself is a decorative graphic. */
const props = withDefaults(defineProps<{ value: number | null, label: string, size?: number }>(), { size: 160 })
const { t } = useI18n()
const R = 52
const C = 2 * Math.PI * R
const pct = computed(() => (props.value === null ? 0 : Math.max(0, Math.min(100, props.value))))
const offset = computed(() => C * (1 - pct.value / 100))
const text = computed(() => (props.value === null ? t('score.notEnoughData') : t('score.aria', { label: props.label, value: pct.value })))
</script>

<template>
  <div class="relative inline-grid place-items-center" :style="{ width: `${size}px`, height: `${size}px` }" role="img" :aria-label="text">
    <div class="rtl:-scale-x-100" aria-hidden="true">
    <svg viewBox="0 0 120 120" class="-rotate-90" :width="size" :height="size" focusable="false">
      <circle cx="60" cy="60" :r="R" fill="none" stroke="rgb(var(--c-sunken))" stroke-width="10" />
      <circle
        cx="60" cy="60" :r="R" fill="none" stroke="rgb(var(--c-primary))" stroke-width="10" stroke-linecap="round"
        :stroke-dasharray="C" :stroke-dashoffset="offset" class="transition-[stroke-dashoffset] duration-700"
      />
    </svg>
    </div>
    <div class="absolute inset-0 grid place-items-center text-center" aria-hidden="true">
      <div>
        <div class="text-3xl font-bold tabular-nums text-ink">{{ value === null ? '–' : pct }}<span v-if="value !== null" class="text-lg font-medium text-muted">%</span></div>
        <div class="px-4 text-xs text-muted">{{ label }}</div>
      </div>
    </div>
  </div>
</template>
