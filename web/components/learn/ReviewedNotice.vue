<script setup lang="ts">
import type { ReviewMeta } from '~/types/extra'

/** Teacher review state of a vocabulary item or exercise. Unreviewed content says so, in the API's own words. */
defineProps<{ item: ReviewMeta, compact?: boolean }>()
const { t } = useI18n()
</script>

<template>
  <UiBadge v-if="item.reviewed" tone="success" data-testid="reviewed"><UiIcon name="check" :size="14" />{{ t('practice.reviewed') }}</UiBadge>
  <template v-else>
    <UiBadge v-if="compact" tone="warning" data-testid="not-reviewed"><UiIcon name="info" :size="14" />{{ t('practice.notReviewed') }}</UiBadge>
    <UiAlert v-else tone="warning" data-testid="not-reviewed">{{ item.review_notice ?? t('practice.reviewPending') }}</UiAlert>
  </template>
</template>
