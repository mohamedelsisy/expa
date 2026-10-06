<script setup lang="ts">
import type { ConsentPurposeInfo } from '~/types/api'

/** One consent purpose, rendered from the API text: title, required/optional, why, data collected. */
defineProps<{ purpose: ConsentPurposeInfo, modelValue?: boolean, disabled?: boolean, errorText?: string }>()
const emit = defineEmits<{ 'update:modelValue': [value: boolean] }>()
const { t } = useI18n()
</script>

<template>
  <div class="rounded-md border border-line bg-surface p-4">
    <div class="flex flex-wrap items-start justify-between gap-x-3 gap-y-1">
      <UiCheckbox
        :model-value="!!modelValue"
        :disabled="disabled"
        :invalid="!!errorText"
        class="min-w-0 flex-1 basis-48"
        @update:model-value="emit('update:modelValue', $event)"
      >
        <UiAutoItalian :text="purpose.title" />
      </UiCheckbox>
      <UiBadge :tone="purpose.required ? 'accent' : 'neutral'">{{ purpose.required ? t('privacy.required') : t('privacy.optional') }}</UiBadge>
    </div>
    <p class="ms-8 text-ink-soft">{{ purpose.why }}</p>
    <details class="ms-8 mt-2 text-sm">
      <summary class="inline-flex min-h-touch cursor-pointer items-center font-medium text-primary-strong">{{ t('privacy.dataCollected') }}</summary>
      <p class="mt-1 text-ink-soft">{{ purpose.data }}</p>
    </details>
    <p v-if="errorText" class="ms-8 mt-1 text-sm font-medium text-danger" role="alert">{{ errorText }}</p>
  </div>
</template>
