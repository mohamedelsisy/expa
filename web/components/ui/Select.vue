<script setup lang="ts">
import { computed, inject, useId } from 'vue'
import { FORM_FIELD_KEY } from '~/utils/formFieldKey'

export interface SelectOption { value: string, label: string }
defineProps<{ modelValue: string, options: SelectOption[], placeholder?: string, disabled?: boolean }>()
const emit = defineEmits<{ 'update:modelValue': [value: string] }>()
const ctx = inject(FORM_FIELD_KEY, null)
const ownId = `sel-${useId()}`
const id = computed(() => ctx?.id ?? ownId)
</script>

<template>
  <select
    :id="id"
    :value="modelValue"
    :disabled="disabled"
    :required="ctx?.required.value"
    :aria-invalid="ctx?.invalid.value ? 'true' : undefined"
    :aria-describedby="ctx?.describedBy.value"
    class="block min-h-touch w-full rounded-md border bg-surface px-3 py-2 text-ink disabled:bg-sunken"
    :class="ctx?.invalid.value ? 'border-danger' : 'border-line-strong'"
    @change="emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
  >
    <option v-if="placeholder !== undefined" value="">{{ placeholder }}</option>
    <option v-for="o in options" :key="o.value" :value="o.value">{{ o.label }}</option>
  </select>
</template>
