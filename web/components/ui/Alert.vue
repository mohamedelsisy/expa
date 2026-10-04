<script setup lang="ts">
import { computed } from 'vue'
import Icon from './Icon.vue'

const props = withDefaults(defineProps<{ tone?: 'info' | 'success' | 'warning' | 'danger', title?: string }>(), { tone: 'info' })
const styles: Record<string, string> = {
  info: 'bg-info-soft text-info border-info',
  success: 'bg-success-soft text-success border-success',
  warning: 'bg-warning-soft text-warning border-warning',
  danger: 'bg-danger-soft text-danger border-danger',
}
const titleStyles: Record<string, string> = { info: 'text-info', success: 'text-success', warning: 'text-warning', danger: 'text-danger' }
const icon = computed(() => ({ info: 'info', success: 'check', warning: 'alert', danger: 'alert' })[props.tone])
// Danger/warning interrupt (alert); info/success are polite.
const role = computed(() => (props.tone === 'danger' ? 'alert' : 'status'))
</script>

<template>
  <div :role="role" class="flex items-start gap-3 rounded-md border border-s-4 p-3 sm:p-4" :class="styles[tone]">
    <Icon :name="icon" class="mt-1" />
    <div class="min-w-0 flex-1 text-ink">
      <p v-if="title" class="font-semibold" :class="titleStyles[tone]">{{ title }}</p>
      <div><slot /></div>
    </div>
  </div>
</template>
