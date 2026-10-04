<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from '#imports'
import type { Freshness } from '~/types/api'
import { formatDate } from '~/utils/locale'
import Icon from './Icon.vue'

/** "Last verified" date + freshness state. stale/outdated/unverified show a visible warning. */
const props = defineProps<{ lastVerifiedAt: string | null, freshness: Freshness }>()
const { t, locale } = useI18n()
const date = computed(() => formatDate(props.lastVerifiedAt, locale.value))
const warn = computed(() => props.freshness !== 'fresh')
const tone = computed(() => (props.freshness === 'outdated' || props.freshness === 'unverified' ? 'text-danger bg-danger-soft' : props.freshness === 'stale' ? 'text-warning bg-warning-soft' : 'text-success bg-success-soft'))
</script>

<template>
  <div class="space-y-1.5 text-sm" :data-freshness="freshness">
    <p class="flex flex-wrap items-center gap-x-2 gap-y-1 text-ink-soft">
      <Icon name="calendar" :size="16" />
      <span v-if="lastVerifiedAt">{{ t('freshness.lastVerified') }}: <time :datetime="lastVerifiedAt">{{ date }}</time></span>
      <span v-else>{{ t('freshness.neverVerified') }}</span>
      <span class="rounded-full px-2 py-0.5 text-xs font-semibold" :class="tone">{{ t(`freshness.state.${freshness}`) }}</span>
    </p>
    <p v-if="warn" role="status" class="flex items-start gap-2 rounded-md px-3 py-2" :class="tone" data-testid="freshness-warning">
      <Icon name="alert" :size="18" class="mt-0.5" />
      <span>{{ t(`freshness.warning.${freshness}`) }}</span>
    </p>
  </div>
</template>
