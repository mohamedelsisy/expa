<script setup lang="ts">
import type { CityBlock } from '~/types/extra'
import { contentLang } from '~/utils/locale'

/**
 * One city information block. `official_info` is shown with its source and freshness; `general_guidance` is explicitly
 * labelled as not official. The label text comes from the API.
 */
defineProps<{ block: CityBlock, headingLevel?: 2 | 3 }>()
const { t } = useI18n()
</script>

<template>
  <article class="space-y-3 rounded-lg border border-line bg-surface p-5" :data-info-type="block.info_type">
    <div class="flex flex-wrap items-center gap-2">
      <UiBadge tone="primary">{{ block.label }}</UiBadge>
      <UiBadge :tone="block.info_type === 'official_info' ? 'success' : 'neutral'" data-testid="info-label"><UiIcon :name="block.info_type === 'official_info' ? 'shield' : 'info'" :size="14" />{{ block.info_label }}</UiBadge>
    </div>
    <component :is="`h${headingLevel ?? 3}`" class="text-lg font-bold" v-bind="contentLang(block)">{{ block.title }}</component>
    <ContentProse v-if="block.body" :body="block.body" :from="4" v-bind="contentLang(block)" />
    <GuideFallbackNotice v-if="block.fallback" :locale="block.locale" />
    <GuideSource v-if="block.source" :source="block.source" />
    <p v-else-if="block.info_type === 'general_guidance'" class="text-sm text-muted">{{ t('cityInfo.generalNote') }}</p>
  </article>
</template>
