<script setup lang="ts">
import { useI18n } from '#imports'
import Icon from './Icon.vue'

const props = defineProps<{ page: number, lastPage: number }>()
const emit = defineEmits<{ change: [page: number] }>()
const { t } = useI18n()
</script>

<template>
  <nav v-if="lastPage > 1" :aria-label="t('common.pagination')" class="flex items-center justify-center gap-3">
    <button type="button" class="inline-flex min-h-touch items-center gap-1 rounded-md border border-line-strong bg-surface px-4 font-medium disabled:opacity-50" :disabled="page <= 1" @click="emit('change', props.page - 1)">
      <Icon name="chevron-start" :size="18" />{{ t('common.previous') }}
    </button>
    <span class="text-sm tabular-nums text-ink-soft" aria-live="polite">{{ t('common.pageOf', { page, total: lastPage }) }}</span>
    <button type="button" class="inline-flex min-h-touch items-center gap-1 rounded-md border border-line-strong bg-surface px-4 font-medium disabled:opacity-50" :disabled="page >= lastPage" @click="emit('change', props.page + 1)">
      {{ t('common.next') }}<Icon name="chevron-end" :size="18" />
    </button>
  </nav>
</template>
