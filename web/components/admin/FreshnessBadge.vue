<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from '#imports'
import Badge from '../ui/Badge.vue'

/** Source freshness: fresh / stale / outdated / unverified. */
const props = defineProps<{ freshness: string }>()
const { t } = useI18n()
const tone = computed(() => ({ fresh: 'success', stale: 'warning', outdated: 'danger', unverified: 'neutral' } as Record<string, 'success' | 'warning' | 'danger' | 'neutral'>)[props.freshness] ?? 'neutral')
</script>

<template><Badge :tone="tone" :data-freshness="freshness">{{ t(`freshness.state.${freshness}`) }}</Badge></template>
