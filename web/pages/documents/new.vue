<script setup lang="ts">
import type { DocumentType } from '~/types/api'

definePageMeta({ middleware: 'auth' })
const { t, locale } = useI18n()
const { request } = useApi()
const localePath = useLocalePath()
useSeo(() => ({ title: t('documents.new'), description: t('documents.subtitle'), noindex: true }))
const { data: types, error, refresh } = await useAsyncData('document-types', async () => (await request<DocumentType[]>('document-types')).data, { watch: [locale] })
const crumbs = computed(() => [{ label: t('documents.title'), to: '/documents' }, { label: t('documents.new') }])
const { granted, load } = useConsent('document_storage')
onMounted(load)
const done = (d: { id: number }) => navigateTo(localePath(`/documents/${d.id}`))
</script>

<template>
  <div class="container-page max-w-2xl py-8 sm:py-12">
    <UiBreadcrumbs :items="crumbs" class="mb-6" />
    <h1 class="mb-2 text-2xl font-bold sm:text-3xl">{{ t('documents.new') }}</h1>
    <UiAlert tone="info" class="mb-6">{{ t('documents.privacy') }}</UiAlert>
    <ConsentGate v-if="granted === false" purpose="document_storage" class="mb-6" @granted="granted = true" />
    <UiErrorState v-if="error || !types" :message="isApiError(error) ? error.message : undefined" retry @retry="refresh()" />
    <UiCard v-else><DocumentsForm :types="types" @saved="done" /></UiCard>
  </div>
</template>
