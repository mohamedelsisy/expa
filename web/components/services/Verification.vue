<script setup lang="ts">
import type { ProviderVerification } from '~/types/extra'
import { formatDay } from '~/utils/locale'

/** Verification state. The label text is the API's; the tone only follows the status. */
const props = defineProps<{ verification: ProviderVerification, detail?: boolean }>()
const { t, locale } = useI18n()
const tone = computed(() => ({ verified: 'success', pending: 'info', expired: 'warning', unverified: 'neutral' } as const)[props.verification.status] ?? 'neutral')
</script>

<template>
  <span class="inline-flex flex-wrap items-center gap-1.5" :data-verification="verification.status">
    <UiBadge :tone="tone"><UiIcon :name="verification.status === 'verified' ? 'check' : 'info'" :size="14" />{{ verification.label }}</UiBadge>
    <span v-if="detail && verification.status === 'verified' && verification.valid_until" class="text-sm text-muted">{{ t('services.validUntil', { date: formatDay(verification.valid_until, locale) }) }}</span>
  </span>
</template>
