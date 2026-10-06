<script setup lang="ts">
import type { ApiEnvelope } from '~/types/api'
import { type LegalSlug, normalizeLegal } from '~/utils/legal'
import { formatDate } from '~/utils/locale'

/**
 * One public legal document from `GET /legal/{slug}`. Honest states: until the API publishes the document the page says
 * so and is noindex. EXPA never ships placeholder legal text.
 */
const props = defineProps<{ slug: LegalSlug }>()
const { t, locale } = useI18n()
const { request } = useApi()

const { data, error, refresh, status } = await useAsyncData(
  () => `legal-${props.slug}`,
  async () => {
    try {
      return normalizeLegal((await request<unknown>(`legal/${props.slug}`, { handle401: false })).data)
    } catch (e) {
      if (isApiError(e) && (e.status === 404 || e.status === 410)) return null // not published (yet)
      throw e
    }
  },
  { watch: [locale] },
)
const doc = computed(() => data.value)
const notPublished = computed(() => status.value === 'success' && !doc.value)

useSeo(() => ({
  title: doc.value?.title ?? t(`legal.${props.slug}.title`),
  description: t(`legal.${props.slug}.description`),
  noindex: !doc.value,
}))
const crumbs = computed(() => [{ label: t('nav.home'), to: '/' }, { label: doc.value?.title ?? t(`legal.${props.slug}.title`) }])
</script>

<template>
  <div class="container-page max-w-3xl py-8 sm:py-12">
    <UiBreadcrumbs :items="crumbs" class="mb-6" />
    <h1 v-if="!doc" class="text-3xl font-bold">{{ t(`legal.${slug}.title`) }}</h1>

    <div v-if="status === 'pending' && !doc" aria-busy="true"><UiSkeleton block :lines="6" /></div>
    <UiErrorState v-else-if="error" :message="isApiError(error) ? error.message : undefined" retry @retry="refresh()" />
    <UiAlert v-else-if="notPublished" tone="info" :title="t('legal.notPublishedTitle')" data-testid="legal-unpublished">
      <p>{{ t('legal.notPublished') }}</p>
      <p class="mt-2">{{ t('legal.contactHint') }}</p>
      <UiButton to="/" variant="secondary" class="mt-3">{{ t('errors.backHome') }}</UiButton>
    </UiAlert>

    <article v-else-if="doc" data-testid="legal-document">
      <header class="mb-6">
        <h1 class="text-3xl font-bold">{{ doc.title }}</h1>
        <p class="mt-2 text-sm text-muted">
          <span v-if="doc.version">{{ t('legal.version', { version: doc.version }) }}</span>
          <span v-if="doc.version && doc.published_at"> · </span>
          <span v-if="doc.published_at">{{ t('legal.publishedOn', { date: formatDate(doc.published_at, locale) }) }}</span>
        </p>
      </header>
      <div class="space-y-4 leading-relaxed">
        <template v-for="(b, i) in doc.blocks" :key="i">
          <component :is="`h${b.level}`" v-if="b.type === 'h'" class="pt-2 text-xl font-bold"><LegalInline :text="b.text" /></component>
          <p v-else-if="b.type === 'p'"><LegalInline :text="b.text" /></p>
          <component :is="b.type" v-else class="space-y-1 ps-6" :class="b.type === 'ul' ? 'list-disc' : 'list-decimal'">
            <li v-for="(it, j) in b.items" :key="j"><LegalInline :text="it" /></li>
          </component>
        </template>
      </div>
      <p v-if="doc.source?.url" class="mt-8 text-sm text-muted">
        {{ t('legal.source') }}:
        <a :href="doc.source.url" rel="noopener noreferrer" class="text-primary-strong underline underline-offset-4">{{ doc.source.name ?? doc.source.url }}</a>
      </p>
    </article>
  </div>
</template>
