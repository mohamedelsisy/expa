<script setup lang="ts">
import { computed, inject, useId } from 'vue'
import { FORM_FIELD_KEY } from '~/utils/formFieldKey'

const props = withDefaults(defineProps<{
  modelValue: string
  type?: string
  autocomplete?: string
  inputmode?: 'text' | 'email' | 'numeric' | 'decimal' | 'search' | 'tel' | 'url'
  placeholder?: string
  disabled?: boolean
  maxlength?: number
  /** Latin-only values (email, codes) stay LTR inside RTL pages. */
  ltr?: boolean
  dir?: 'rtl' | 'ltr'
}>(), { type: 'text' })
const emit = defineEmits<{ 'update:modelValue': [value: string] }>()

const ctx = inject(FORM_FIELD_KEY, null)
const ownId = `ti-${useId()}`
const id = computed(() => ctx?.id ?? ownId)
defineExpose({ id })
</script>

<template>
  <input
    :id="id"
    :value="modelValue"
    :type="type"
    :autocomplete="autocomplete"
    :inputmode="inputmode"
    :placeholder="placeholder"
    :disabled="disabled"
    :maxlength="maxlength"
    :required="ctx?.required.value"
    :aria-invalid="ctx?.invalid.value ? 'true' : undefined"
    :aria-describedby="ctx?.describedBy.value"
    :dir="dir ?? (ltr ? 'ltr' : undefined)"
    class="block min-h-touch w-full rounded-md border bg-surface px-3 py-2 text-ink placeholder:text-muted disabled:cursor-not-allowed disabled:bg-sunken"
    :class="[ctx?.invalid.value ? 'border-danger' : 'border-line-strong', ltr ? 'text-start' : '']"
    @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
  >
</template>
