<script setup lang="ts">
import type { GovOffice } from '~/types/api'
import { safeHttpsUrl } from '~/utils/safe'

/** Office with address, contact, official link, booking block, source/freshness and fallback notice. */
defineProps<{ office: GovOffice, link?: boolean }>()
const { t } = useI18n()
const localePath = useLocalePath()
</script>

<template>
  <UiCard as="article" class="space-y-3">
    <div class="flex flex-wrap items-center gap-2">
      <UiBadge tone="primary">{{ office.office_type_label }}</UiBadge>
      <UiSourceBadge :type="office.source.type" />
    </div>
    <h3 class="text-lg font-bold">
      <NuxtLink v-if="link" :to="localePath(`/government/offices/${office.slug}`)" class="underline-offset-4 hover:underline"><UiAutoItalian :text="office.name" /></NuxtLink>
      <UiAutoItalian v-else :text="office.name" />
    </h3>
    <ul class="space-y-1 text-ink-soft">
      <li v-if="office.address" class="flex items-start gap-2"><UiIcon name="map" :size="16" class="mt-1" /><span dir="auto">{{ office.address }}<template v-if="office.postal_code"> · {{ office.postal_code }}</template><template v-if="office.city"> · {{ office.city.name }}</template></span></li>
      <li v-if="office.phone" class="flex items-center gap-2"><UiIcon name="phone" :size="16" /><a :href="`tel:${office.phone.replace(/[^+\d]/g, '')}`" dir="ltr" class="underline underline-offset-4">{{ office.phone }}</a></li>
      <li v-if="office.email" class="flex items-center gap-2"><UiIcon name="mail" :size="16" /><a :href="`mailto:${office.email}`" dir="ltr" class="break-all underline underline-offset-4">{{ office.email }}</a></li>
      <li v-if="office.opening_hours" class="flex items-start gap-2"><UiIcon name="clock" :size="16" class="mt-1" /><span class="prose-plain">{{ office.opening_hours }}</span></li>
    </ul>
    <a v-if="safeHttpsUrl(office.official_url)" :href="safeHttpsUrl(office.official_url)!" target="_blank" rel="noopener noreferrer" class="inline-flex min-h-touch items-center gap-2 font-medium text-primary-strong underline underline-offset-4">{{ t('gov.officialSite') }}<UiIcon name="external" :size="16" /><span class="sr-only">{{ t('a11y.opensNewTab') }}</span></a>
    <GovBookingBlock :booking="office.booking" :subject="office.slug" />
    <p v-if="office.notes" class="prose-plain text-sm text-ink-soft">{{ office.notes }}</p>
    <GuideFallbackNotice v-if="office.fallback" :locale="office.locale" />
    <GuideSource :source="office.source" />
  </UiCard>
</template>
