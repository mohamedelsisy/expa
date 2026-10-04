<script setup lang="ts">
withDefaults(defineProps<{ as?: string, padded?: boolean, elevated?: boolean, tone?: 'plain' | 'soft' }>(), { as: 'div', padded: true, tone: 'plain' })
</script>

<template>
  <component
    :is="as"
    class="rounded-lg border border-line"
    :class="[padded ? 'p-5 sm:p-6' : '', elevated ? 'shadow-2' : 'shadow-1', tone === 'soft' ? 'bg-primary-soft' : 'bg-surface']"
  >
    <slot />
  </component>
</template>
