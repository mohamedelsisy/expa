<script setup lang="ts">
import { computed, inject, useId } from 'vue'
import { FORM_FIELD_KEY } from '~/utils/formFieldKey'

const props = withDefaults(defineProps<{
  modelValue: string
  rows?: number
  placeholder?: string
  disabled?: boolean
  maxlength?: number
  /** Latin-only content stays LTR inside RTL pages. */
  ltr?: boolean
}>(), { rows: 4 })
const emit = defineEmits<{ 'update:modelValue': [value: string] }>()

const ctx = inject(FORM_FIELD_KEY, null)
const ownId = `ta-${useId()}`
const id = computed(() => ctx?.id ?? ownId)
</script>

<template>
  <textarea
    :id="id"
    :value="modelValue"
    :rows="rows"
    :placeholder="placeholder"
    :disabled="disabled"
    :maxlength="maxlength"
    :required="ctx?.required.value"
    :aria-invalid="ctx?.invalid.value ? 'true' : undefined"
    :aria-describedby="ctx?.describedBy.value"
    :dir="ltr ? 'ltr' : 'auto'"
    class="block w-full rounded-md border bg-surface px-3 py-2 text-ink placeholder:text-muted disabled:cursor-not-allowed disabled:bg-sunken"
    :class="[ctx?.invalid.value ? 'border-danger' : 'border-line-strong']"
    @input="emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
  />
</template>
