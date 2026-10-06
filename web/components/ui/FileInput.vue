<script setup lang="ts">
import { computed, inject, ref, useId } from 'vue'
import { FORM_FIELD_KEY } from '~/utils/formFieldKey'

/** Native file input wired to the surrounding UiFormField (id, aria-describedby, aria-invalid). */
defineProps<{ accept?: string, disabled?: boolean }>()
const emit = defineEmits<{ change: [event: Event] }>()
const ctx = inject(FORM_FIELD_KEY, null)
const ownId = `fi-${useId()}`
const id = computed(() => ctx?.id ?? ownId)
const el = ref<HTMLInputElement | null>(null)
defineExpose({ reset: () => { if (el.value) el.value.value = '' } })
</script>

<template>
  <input
    :id="id"
    ref="el"
    type="file"
    :accept="accept"
    :disabled="disabled"
    :aria-invalid="ctx?.invalid.value ? 'true' : undefined"
    :aria-describedby="ctx?.describedBy.value"
    class="block min-h-touch w-full rounded-md border bg-surface p-2 text-ink file:me-3 file:rounded-md file:border-0 file:bg-primary-soft file:px-3 file:py-2 file:font-medium file:text-primary-strong"
    :class="ctx?.invalid.value ? 'border-danger' : 'border-line-strong'"
    @change="emit('change', $event)"
  >
</template>
