<script setup lang="ts">
import type { ArticleSummary } from '~/types/extra'
import { formatDate } from '~/utils/locale'

defineProps<{ article: ArticleSummary }>()
const { t, locale } = useI18n()
const localePath = useLocalePath()
</script>

<template>
  <UiCard as="article" class="relative flex h-full flex-col gap-3 transition-shadow focus-within:shadow-3 hover:shadow-2">
    <div class="flex flex-wrap items-center gap-2"><UiBadge tone="primary">{{ article.category_label }}</UiBadge><UiBadge>{{ t('articles.editorial') }}</UiBadge></div>
    <h2 class="text-lg font-bold"><NuxtLink :to="localePath(`/articles/${article.slug}`)" class="after:absolute after:inset-0 after:content-['']">{{ article.title }}</NuxtLink></h2>
    <p v-if="article.excerpt" class="line-clamp-3 text-ink-soft">{{ article.excerpt }}</p>
    <div class="mt-auto space-y-1 pt-2 text-sm text-muted">
      <p v-if="article.published_at"><time :datetime="article.published_at">{{ formatDate(article.published_at, locale) }}</time><template v-if="article.reading_minutes"> · {{ t('articles.readingMinutes', { count: article.reading_minutes }) }}</template></p>
      <p v-if="article.city" class="flex items-center gap-1.5"><UiIcon name="map" :size="16" />{{ article.city.name }}</p>
      <p v-if="article.fallback">{{ t('guides.shownIn', { language: t(`languages.${article.locale}`) }) }}</p>
    </div>
  </UiCard>
</template>
