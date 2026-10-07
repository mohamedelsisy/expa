<script setup lang="ts">
import { computed } from 'vue'
import { useAnalytics, useI18n } from '#imports'
import type { Booking } from '~/types/api'
import { safeHttpsUrl } from '~/utils/safe'
import Icon from '../ui/Icon.vue'

/**
 * Booking info. The API `notice` ("EXPA does not book for you") is ALWAYS rendered; the link only leads to the
 * official site and is never labelled as a completed booking.
 */
const props = defineProps<{ booking: Booking, /** Slug of the guide/office the link belongs to (analytics subject). */ subject?: string }>()
const { t } = useI18n()
const { track } = useAnalytics()
const url = computed(() => safeHttpsUrl(props.booking.url))
</script>

<template>
  <div class="space-y-2 rounded-md border border-line bg-sunken p-3" data-testid="booking-block">
    <p class="flex flex-wrap items-center gap-2 font-medium"><Icon name="calendar" :size="16" />{{ t('gov.bookingMethod') }}: <span data-testid="booking-method">{{ booking.method_label }}</span></p>
    <a v-if="url" :href="url" target="_blank" rel="noopener noreferrer" class="inline-flex min-h-touch items-center gap-2 font-medium text-primary-strong underline underline-offset-4" data-testid="booking-link" @click="track('appointment_clicked', subject)">
      {{ t('gov.bookingGo') }}<Icon name="external" :size="16" /><span class="sr-only">{{ t('a11y.opensNewTab') }}</span>
    </a>
    <p class="flex items-start gap-2 text-sm text-ink" data-testid="booking-notice"><Icon name="info" :size="16" class="mt-0.5 text-info" />{{ booking.notice }}</p>
  </div>
</template>
