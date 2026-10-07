<script setup lang="ts">
import { statusKey, type OwnStatus } from '~/utils/community'

/** Honest labelling: every community item says it is a member's contribution and not verified information. */
const props = defineProps<{ label: string, status?: OwnStatus, notice?: string | null, mine?: boolean }>()
const { t } = useI18n()
const sk = computed(() => statusKey(props.status ?? null))
</script>

<template>
  <span class="inline-flex flex-wrap items-center gap-2">
    <UiBadge tone="warning" data-testid="community-label"><UiIcon name="info" :size="14" />{{ label }}</UiBadge>
    <UiBadge v-if="mine">{{ t('community.mine') }}</UiBadge>
    <UiBadge v-if="sk" tone="info">{{ t(sk) }}</UiBadge>
  </span>
</template>
