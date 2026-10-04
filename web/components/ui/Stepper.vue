<script setup lang="ts">
export interface StepperItem { key: string, label: string, state: 'done' | 'current' | 'upcoming' | 'skipped' }
defineProps<{ steps: StepperItem[], label: string }>()
</script>

<template>
  <nav :aria-label="label">
    <ol class="flex items-center gap-1.5">
      <li
        v-for="(s, i) in steps"
        :key="s.key"
        class="flex min-w-0 flex-1 items-center"
        :aria-current="s.state === 'current' ? 'step' : undefined"
      >
        <span class="sr-only">{{ i + 1 }}/{{ steps.length }} {{ s.label }}</span>
        <span
          class="h-2 flex-1 rounded-full"
          :class="s.state === 'done' ? 'bg-primary' : s.state === 'current' ? 'bg-accent' : s.state === 'skipped' ? 'bg-line-strong' : 'bg-sunken'"
          aria-hidden="true"
        />
      </li>
    </ol>
  </nav>
</template>
