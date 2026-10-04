<script setup lang="ts">
export interface Chip { value: string, label: string, count?: number }

/** Single-select filter chips (toggle buttons with aria-pressed). Empty value = "all". */
defineProps<{ modelValue: string, options: Chip[], label: string }>()
const emit = defineEmits<{ 'update:modelValue': [value: string] }>()
</script>

<template>
  <div role="group" :aria-label="label" class="flex flex-wrap gap-2">
    <button
      v-for="o in options"
      :key="o.value"
      type="button"
      :aria-pressed="modelValue === o.value"
      class="inline-flex min-h-touch items-center gap-1.5 rounded-full border px-4 text-sm font-medium transition-colors"
      :class="modelValue === o.value ? 'border-primary bg-primary text-on-primary' : 'border-line-strong bg-surface text-ink hover:bg-sunken'"
      @click="emit('update:modelValue', o.value)"
    >
      {{ o.label }}<span v-if="o.count !== undefined" class="tabular-nums opacity-80">({{ o.count }})</span>
    </button>
  </div>
</template>
