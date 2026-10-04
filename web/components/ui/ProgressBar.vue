<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ value: number | null, label: string, showValue?: boolean }>()
const pct = computed(() => Math.max(0, Math.min(100, props.value ?? 0)))
</script>

<template>
  <div>
    <div v-if="showValue" class="mb-1 flex justify-between text-sm">
      <span class="text-ink-soft">{{ label }}</span>
      <span class="font-semibold tabular-nums text-ink">{{ value === null ? '–' : `${pct}%` }}</span>
    </div>
    <div
      role="progressbar"
      :aria-label="label"
      aria-valuemin="0"
      aria-valuemax="100"
      :aria-valuenow="value === null ? undefined : pct"
      class="h-2.5 overflow-hidden rounded-full bg-sunken"
    >
      <div class="h-full rounded-full bg-primary transition-[width] duration-500" :style="{ width: `${pct}%` }" />
    </div>
  </div>
</template>
