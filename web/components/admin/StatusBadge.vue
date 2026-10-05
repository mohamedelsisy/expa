<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from '#imports'
import Badge from '../ui/Badge.vue'

/** Workflow status (always text, never colour alone). */
const props = defineProps<{ status: string }>()
const { t } = useI18n()
const tone = computed(() => ({ draft: 'neutral', review: 'info', approved: 'accent', published: 'success', archived: 'neutral' } as Record<string, 'neutral' | 'info' | 'accent' | 'success'>)[props.status] ?? 'neutral')
</script>

<template><Badge :tone="tone" :data-status="status">{{ t(`admin.status.${status}`) }}</Badge></template>
