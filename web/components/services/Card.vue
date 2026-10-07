<script setup lang="ts">
import type { ProviderSummary } from '~/types/extra'
import { languageName } from '~/utils/services'

/** Directory card. Verification label and third-party notice are rendered exactly as the API returns them. */
defineProps<{ provider: ProviderSummary }>()
const { t, locale } = useI18n()
const localePath = useLocalePath()
</script>

<template>
  <UiCard as="article" class="relative flex h-full flex-col gap-3 transition-shadow focus-within:shadow-3 hover:shadow-2">
    <div class="flex flex-wrap items-center gap-2">
      <UiBadge tone="primary">{{ provider.category_label }}</UiBadge>
      <ServicesVerification :verification="provider.verification" />
    </div>
    <h2 class="text-lg font-bold"><NuxtLink :to="localePath(`/services/${provider.slug}`)" class="after:absolute after:inset-0 after:content-['']" dir="auto">{{ provider.display_name }}</NuxtLink></h2>
    <p v-if="provider.headline" class="line-clamp-3 text-ink-soft" dir="auto">{{ provider.headline }}</p>
    <ServicesRating :average="provider.rating.average" :count="provider.rating.count" />
    <div class="mt-auto space-y-1 pt-2 text-sm text-muted">
      <p v-if="provider.city || provider.region" class="flex items-center gap-1.5"><UiIcon name="map" :size="16" />{{ provider.city?.name ?? provider.region?.name }}</p>
      <p v-if="provider.serves_online" class="flex items-center gap-1.5"><UiIcon name="globe" :size="16" />{{ t('services.online') }}</p>
      <p v-if="provider.languages.length"><bdi>{{ provider.languages.map(l => languageName(l, locale)).join(' · ') }}</bdi></p>
      <p class="font-medium text-ink-soft">{{ t('services.thirdParty') }}</p>
    </div>
  </UiCard>
</template>
