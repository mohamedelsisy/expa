<script setup lang="ts">
withDefaults(defineProps<{ lines?: number, block?: boolean }>(), { lines: 3 })
</script>

<template>
  <div aria-hidden="true" class="animate-pulse space-y-3">
    <div v-if="block" class="h-28 rounded-lg bg-sunken" />
    <div v-for="n in lines" :key="n" class="h-4 rounded-sm bg-sunken" :style="{ width: n === lines && lines > 1 ? '60%' : '100%' }" />
  </div>
</template>
