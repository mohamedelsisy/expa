<script setup lang="ts">
import { ratingLabel } from '~/utils/services'

/** Average of approved reviews only. No reviews: says so instead of showing zero stars. */
const props = defineProps<{ average: number | null, count: number }>()
const { t } = useI18n()
const r = computed(() => ratingLabel(props.average, props.count))
</script>

<template>
  <p v-if="r.average" class="inline-flex items-center gap-1 text-sm" data-testid="rating"><UiIcon name="sparkle" :size="14" class="text-accent-strong" /><span class="font-semibold tabular-nums"><bdi>{{ r.average }}</bdi></span><span class="text-muted">{{ t('services.reviewsCount', { count: r.count }) }}</span></p>
  <p v-else class="text-sm text-muted" data-testid="rating">{{ t('services.noReviews') }}</p>
</template>
