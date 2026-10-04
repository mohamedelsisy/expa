<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useI18n } from '#imports'

/** Inline destructive-action confirmation: focus lands on Cancel, Escape cancels. */
defineProps<{ message: string, confirmLabel: string, loading?: boolean }>()
const emit = defineEmits<{ confirm: [], cancel: [] }>()
const { t } = useI18n()
const cancelBtn = ref<HTMLButtonElement | null>(null)
onMounted(() => cancelBtn.value?.focus())
</script>

<template>
  <div role="alertdialog" aria-modal="false" :aria-label="message" class="space-y-3 rounded-md border border-danger bg-danger-soft p-4" @keydown.esc.stop="emit('cancel')">
    <p class="font-medium text-ink">{{ message }}</p>
    <div class="flex flex-wrap gap-2">
      <button ref="cancelBtn" type="button" class="inline-flex min-h-touch items-center justify-center rounded-md border border-line-strong bg-surface px-5 py-2 font-medium" @click="emit('cancel')">{{ t('common.cancel') }}</button>
      <button type="button" class="inline-flex min-h-touch items-center justify-center rounded-md bg-danger px-5 py-2 font-medium text-surface disabled:opacity-60" :disabled="loading" :aria-busy="loading ? 'true' : undefined" @click="emit('confirm')">{{ confirmLabel }}</button>
    </div>
  </div>
</template>
