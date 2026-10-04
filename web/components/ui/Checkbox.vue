<script setup lang="ts">
import { computed, useId } from 'vue'

const props = defineProps<{ modelValue: boolean, label?: string, description?: string, disabled?: boolean, invalid?: boolean, describedby?: string }>()
const emit = defineEmits<{ 'update:modelValue': [value: boolean] }>()
const id = `cb-${useId()}`
const descId = computed(() => (props.description ? `${id}-d` : undefined))
</script>

<template>
  <div class="flex min-h-touch items-start gap-3 rounded-md py-2">
    <input
      :id="id"
      type="checkbox"
      :checked="modelValue"
      :disabled="disabled"
      :aria-invalid="invalid ? 'true' : undefined"
      :aria-describedby="[descId, describedby].filter(Boolean).join(' ') || undefined"
      class="mt-1 size-5 shrink-0 cursor-pointer accent-primary disabled:cursor-not-allowed"
      @change="emit('update:modelValue', ($event.target as HTMLInputElement).checked)"
    >
    <div class="min-w-0">
      <label :for="id" class="cursor-pointer font-medium text-ink"><slot>{{ label }}</slot></label>
      <p v-if="description" :id="descId" class="text-sm text-muted">{{ description }}</p>
    </div>
  </div>
</template>
