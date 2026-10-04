<script setup lang="ts">
import Icon from './Icon.vue'

/** Icon-only button: `label` is mandatory (accessible name). 44px target. */
withDefaults(defineProps<{ icon: string, label: string, pressed?: boolean, disabled?: boolean }>(), {})
</script>

<template>
  <button
    type="button"
    :aria-label="label"
    :title="label"
    :aria-pressed="pressed"
    :disabled="disabled"
    class="inline-flex min-h-touch min-w-touch items-center justify-center rounded-md text-ink-soft transition-colors hover:bg-sunken disabled:opacity-50"
  >
    <Icon :name="icon" />
  </button>
</template>
