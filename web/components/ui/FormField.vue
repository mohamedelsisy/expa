<script setup lang="ts">
import { computed, provide, useId } from 'vue'
import { useI18n } from '#imports'
import { FORM_FIELD_KEY } from '~/utils/formFieldKey'

/** Label + hint + error wired to the control through id / aria-describedby / aria-invalid (via provide/inject). */
const props = defineProps<{
  label: string
  hint?: string
  error?: string
  required?: boolean
  /** Show the "optional" marker next to the label. */
  optional?: boolean
  /** Use for groups (checkbox lists): renders fieldset/legend instead of label. */
  group?: boolean
}>()
const { t } = useI18n()
const id = `ff-${useId()}`
const hintId = `${id}-hint`
const errorId = `${id}-error`
const describedBy = computed(() => {
  const ids = [props.hint ? hintId : '', props.error ? errorId : ''].filter(Boolean)
  return ids.length ? ids.join(' ') : undefined
})
provide(FORM_FIELD_KEY, {
  id,
  describedBy,
  invalid: computed(() => !!props.error),
  required: computed(() => !!props.required),
})
</script>

<template>
  <component :is="group ? 'fieldset' : 'div'" class="min-w-0 space-y-1.5" :aria-describedby="group ? describedBy : undefined">
    <component
      :is="group ? 'legend' : 'label'"
      :for="group ? undefined : id"
      class="flex flex-wrap items-baseline gap-x-2 text-sm font-medium text-ink"
    >
      <span>{{ label }}</span>
      <span v-if="required" class="text-xs font-normal text-accent-strong">{{ t('common.required') }}</span>
      <span v-else-if="optional" class="text-xs font-normal text-muted">{{ t('common.optional') }}</span>
    </component>
    <p v-if="hint" :id="hintId" class="text-sm text-muted">{{ hint }}</p>
    <slot />
    <p v-if="error" :id="errorId" class="flex items-start gap-1.5 text-sm font-medium text-danger" role="alert">
      <span aria-hidden="true">!</span>
      <span>{{ error }}</span>
    </p>
  </component>
</template>
