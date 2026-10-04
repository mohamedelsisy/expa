<script setup lang="ts">
/** Numbered vertical timeline (guide steps). Ordered list, logical borders so it mirrors in RTL. */
export interface TimelineItem { title: string, text?: string | null }
defineProps<{ items: TimelineItem[] }>()
</script>

<template>
  <ol class="space-y-0">
    <li v-for="(item, i) in items" :key="i" class="relative flex gap-4 pb-6 last:pb-0">
      <div class="flex flex-col items-center">
        <span class="grid size-9 shrink-0 place-items-center rounded-full bg-primary font-bold text-on-primary" aria-hidden="true">{{ i + 1 }}</span>
        <span v-if="i < items.length - 1" class="mt-1 w-0.5 flex-1 bg-line" aria-hidden="true" />
      </div>
      <div class="min-w-0 pt-1">
        <h3 class="text-base font-semibold"><span class="sr-only">{{ i + 1 }}. </span>{{ item.title }}</h3>
        <p v-if="item.text" class="prose-plain mt-1 text-ink-soft">{{ item.text }}</p>
      </div>
    </li>
  </ol>
</template>
