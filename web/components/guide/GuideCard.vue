<script setup lang="ts">
import type { Guide } from '~/types/api'
import { contentLang } from '~/utils/locale'
defineProps<{ guide: Guide }>()
const { t } = useI18n()
const localePath = useLocalePath()
</script>

<template>
  <UiCard as="article" class="relative flex h-full flex-col gap-3 transition-shadow focus-within:shadow-3 hover:shadow-2">
    <div class="flex flex-wrap items-center gap-2">
      <UiBadge tone="primary">{{ guide.category_label }}</UiBadge>
      <UiSourceBadge :type="guide.source.type" />
      <UiItalianTerm v-if="guide.italian_term">{{ guide.italian_term }}</UiItalianTerm>
    </div>
    <h2 class="text-lg font-bold">
      <NuxtLink :to="localePath(`/guides/${guide.slug}`)" v-bind="contentLang(guide)" class="after:absolute after:inset-0 after:content-[''] focus-visible:outline-offset-4">
        <UiAutoItalian :text="guide.title" />
      </NuxtLink>
    </h2>
    <p v-if="guide.summary" class="line-clamp-3 text-ink-soft" v-bind="contentLang(guide)">{{ guide.summary }}</p>
    <div class="mt-auto space-y-1 pt-2 text-sm text-muted">
      <p v-if="guide.city || guide.region" class="flex items-center gap-1.5"><UiIcon name="map" :size="16" />{{ guide.city?.name ?? guide.region?.name }}</p>
      <p v-else class="flex items-center gap-1.5"><UiIcon name="map" :size="16" />{{ t('guides.national') }}</p>
      <p v-if="guide.source.freshness !== 'fresh'" class="font-medium" :class="guide.source.freshness === 'stale' ? 'text-warning' : 'text-danger'">
        {{ t(`freshness.state.${guide.source.freshness}`) }}
      </p>
      <p v-if="guide.fallback">{{ t('guides.shownIn', { language: t(`languages.${guide.locale}`) }) }}</p>
    </div>
  </UiCard>
</template>
