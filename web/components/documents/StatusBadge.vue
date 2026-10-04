<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from '#imports'
import { STATUS_ICON, STATUS_TONE, type DocStatus } from '~/utils/documents'
import Badge from '../ui/Badge.vue'
import Icon from '../ui/Icon.vue'

/** Status badge (colour + icon + text, never colour alone) with days remaining. */
const props = defineProps<{ status: DocStatus, days: number | null }>()
const { t } = useI18n()
const text = computed(() => {
  if (props.days === null) return ''
  if (props.status === 'expired') return t('documents.expiredAgo', { count: Math.abs(props.days) })
  return t('documents.daysLeft', { count: props.days })
})
</script>

<template>
  <span class="inline-flex flex-wrap items-center gap-2" :data-status="status">
    <Badge :tone="STATUS_TONE[status]"><Icon :name="STATUS_ICON[status]" :size="14" />{{ t(`documents.status.${status}`) }}</Badge>
    <span v-if="text" class="text-sm text-ink-soft tabular-nums">{{ text }}</span>
  </span>
</template>
