<script setup lang="ts">
import { useI18n } from '#imports'
import Icon from './Icon.vue'

defineProps<{ message: string, tone: 'success' | 'danger' | 'info' }>()
const emit = defineEmits<{ dismiss: [] }>()
const { t } = useI18n()
const styles: Record<string, string> = {
  success: 'border-success bg-success-soft',
  danger: 'border-danger bg-danger-soft',
  info: 'border-info bg-info-soft',
}
const icons: Record<string, string> = { success: 'check', danger: 'alert', info: 'info' }
const iconTone: Record<string, string> = { success: 'text-success', danger: 'text-danger', info: 'text-info' }
</script>

<template>
  <div class="pointer-events-auto flex items-start gap-3 rounded-md border border-s-4 p-3 text-ink shadow-3" :class="styles[tone]">
    <Icon :name="icons[tone]" class="mt-0.5" :class="iconTone[tone]" />
    <p class="min-w-0 flex-1">{{ message }}</p>
    <button type="button" class="-m-2 grid min-h-touch min-w-touch place-items-center text-ink-soft" :aria-label="t('common.dismiss')" @click="emit('dismiss')">
      <Icon name="x" :size="18" />
    </button>
  </div>
</template>
