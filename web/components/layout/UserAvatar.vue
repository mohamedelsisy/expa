<script setup lang="ts">
import { initialsOf } from '~/utils/initials'

/** Decorative initials avatar (the name is always shown or announced next to it). */
const props = withDefaults(defineProps<{ name?: string | null, email?: string | null, size?: 'sm' | 'lg' }>(), { size: 'sm' })
const initials = computed(() => initialsOf(props.name, props.email ?? ''))
</script>

<template>
  <span
    class="grid shrink-0 select-none place-items-center rounded-full bg-primary font-bold text-on-primary"
    :class="size === 'lg' ? 'size-11 text-base' : 'size-9 text-sm'"
    aria-hidden="true"
  >
    <template v-if="initials">{{ initials }}</template>
    <UiIcon v-else name="user" :size="size === 'lg' ? 22 : 18" />
  </span>
</template>
