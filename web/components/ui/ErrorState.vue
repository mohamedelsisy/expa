<script setup lang="ts">
import { useI18n } from '#imports'
import Icon from './Icon.vue'
import Button from './Button.vue'

/** Shows the API's localized message. `retry` shows a button; email_not_verified gets an extra hint slot. */
withDefaults(defineProps<{ message?: string, title?: string, code?: string, retry?: boolean, headingLevel?: 1 | 2 }>(), { headingLevel: 2 })
const emit = defineEmits<{ retry: [] }>()
const { t } = useI18n()
</script>

<template>
  <div role="alert" class="mx-auto flex max-w-md flex-col items-center gap-3 px-4 py-10 text-center">
    <span class="grid size-14 place-items-center rounded-full bg-danger-soft text-danger"><Icon name="alert" :size="28" /></span>
    <component :is="`h${headingLevel}`" class="text-lg font-bold">{{ title ?? t('errors.title') }}</component>
    <p class="text-ink-soft">{{ message ?? t('errors.generic') }}</p>
    <slot />
    <Button v-if="retry" variant="secondary" @click="emit('retry')">
      <Icon name="refresh" :size="18" />{{ t('common.retry') }}
    </Button>
  </div>
</template>
