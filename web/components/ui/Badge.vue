<script setup lang="ts">
withDefaults(defineProps<{ tone?: 'neutral' | 'primary' | 'accent' | 'success' | 'warning' | 'danger' | 'info' }>(), { tone: 'neutral' })
const tones: Record<string, string> = {
  neutral: 'bg-sunken text-ink-soft',
  primary: 'bg-primary-soft text-primary-strong',
  accent: 'bg-accent-soft text-accent-strong',
  success: 'bg-success-soft text-success',
  warning: 'bg-warning-soft text-warning',
  danger: 'bg-danger-soft text-danger',
  info: 'bg-info-soft text-info',
}
</script>

<template>
  <span class="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold" :class="tones[tone]"><slot /></span>
</template>
