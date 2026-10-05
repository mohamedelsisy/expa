<script setup lang="ts">
import type { Crumb } from '../ui/Breadcrumbs.vue'
defineProps<{ title: string, description?: string, crumbs?: Crumb[] }>()
</script>

<template>
  <header class="mb-6 space-y-2">
    <UiBreadcrumbs v-if="crumbs?.length" :items="crumbs" />
    <div class="flex flex-wrap items-end justify-between gap-3">
      <div class="min-w-0 max-w-3xl">
        <h1 class="text-2xl font-bold sm:text-3xl">{{ title }}</h1>
        <p v-if="description" class="mt-1 text-ink-soft">{{ description }}</p>
      </div>
      <div v-if="$slots.default" class="flex flex-wrap items-center gap-2"><slot /></div>
    </div>
  </header>
</template>
