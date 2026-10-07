<script setup lang="ts">
import type { Vocabulary } from '~/types/extra'

const { t, locale } = useI18n()
const { request } = useApi()
useSeo(() => ({ title: t('patente.glossary.seo.title'), description: t('patente.glossary.seo.description') }))
const { data, error, refresh, status } = await useAsyncData('patente-glossary', async () => (await request<Vocabulary[]>('patente/glossary')).data, { watch: [locale] })
const q = ref('')
const items = computed(() => {
  const term = q.value.trim().toLowerCase()
  const all = data.value ?? []
  return term ? all.filter(v => v.lemma.toLowerCase().includes(term) || (v.gloss ?? '').toLowerCase().includes(term)) : all
})
const crumbs = computed(() => [{ label: t('patente.title'), to: '/patente' }, { label: t('patente.glossary.title') }])
</script>

<template>
  <div class="container-page max-w-3xl py-8 sm:py-12">
    <UiBreadcrumbs :items="crumbs" class="mb-6" />
    <h1 class="mb-2 text-2xl font-bold sm:text-3xl">{{ t('patente.glossary.title') }}</h1>
    <p class="mb-6 text-ink-soft">{{ t('patente.glossary.subtitle') }}</p>
    <PatenteDisclaimer class="mb-6" />
    <div v-if="status === 'pending' && !data" aria-busy="true"><UiSkeleton block :lines="5" /></div>
    <UiErrorState v-else-if="error" :message="isApiError(error) ? error.message : undefined" retry @retry="refresh()" />
    <UiEmptyState v-else-if="!data?.length" :title="t('patente.glossary.emptyTitle')" :description="t('patente.glossary.empty')" icon="car"><UiButton to="/patente" variant="secondary">{{ t('patente.title') }}</UiButton></UiEmptyState>
    <template v-else>
      <UiFormField :label="t('patente.glossary.filter')" class="mb-4 max-w-sm"><UiTextInput v-model="q" type="search" inputmode="search" :maxlength="60" /></UiFormField>
      <p v-if="!items.length" class="text-muted" data-testid="glossary-none">{{ t('guides.noResults') }}</p>
      <ul v-else class="divide-y divide-line rounded-lg border border-line bg-surface" data-testid="glossary-list">
        <li v-for="v in items" :key="v.slug" class="space-y-1 p-4">
          <div class="flex flex-wrap items-center gap-2"><span class="text-lg font-bold" lang="it" dir="ltr">{{ v.lemma }}</span><LearnListenButton :text="v.lemma" /><LearnReviewedNotice :item="v" compact /></div>
          <p v-if="v.gloss" dir="auto">{{ v.gloss }}</p>
          <p v-if="v.example_it" class="text-sm text-ink-soft"><span lang="it" dir="ltr">{{ v.example_it }}</span><template v-if="v.example_gloss"> — <span dir="auto">{{ v.example_gloss }}</span></template></p>
        </li>
      </ul>
    </template>
  </div>
</template>
