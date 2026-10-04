<script setup lang="ts">
import Icon from './Icon.vue'
withDefaults(defineProps<{ title: string, description?: string, icon?: string }>(), { icon: 'compass' })
</script>

<template>
  <div class="mx-auto flex max-w-md flex-col items-center gap-3 px-4 py-10 text-center">
    <span class="grid size-14 place-items-center rounded-full bg-primary-soft text-primary-strong"><Icon :name="icon" :size="28" /></span>
    <h2 class="text-lg font-bold">{{ title }}</h2>
    <p v-if="description" class="text-ink-soft">{{ description }}</p>
    <div class="mt-2"><slot /></div>
  </div>
</template>
