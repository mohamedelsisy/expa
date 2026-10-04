<script setup lang="ts">
import type { DocumentType, UserDocument } from '~/types/api'
import { formatDay } from '~/utils/locale'

definePageMeta({ middleware: 'auth' })
const { t, locale } = useI18n()
const route = useRoute()
const { request } = useApi()
useSeo(() => ({ title: t('documents.title'), description: t('documents.subtitle'), noindex: true }))

const status = computed(() => (typeof route.query.status === 'string' ? route.query.status : ''))
const type = computed(() => (typeof route.query.type === 'string' ? route.query.type : ''))

const { data: types } = await useAsyncData('document-types', async () => (await request<DocumentType[]>('document-types')).data, { watch: [locale] })
const { data, error, refresh, status: st } = await useAsyncData('documents', () => request<UserDocument[]>('my-documents', {
  query: { 'filter[status]': status.value, 'filter[type]': type.value, per_page: 100 },
}), { watch: [status, type, locale] })
const docs = computed(() => data.value?.data ?? [])
const hasFilters = computed(() => !!(status.value || type.value))

const setQ = (patch: Record<string, string>) => {
  const q = { status: status.value, type: type.value, ...patch }
  return navigateTo({ path: route.path, query: Object.fromEntries(Object.entries(q).filter(([, v]) => v)) })
}
const statusChips = computed(() => ['', 'valid', 'expiring_soon', 'expired', 'no_expiry'].map(v => ({ value: v, label: v ? t(`documents.status.${v}`) : t('documents.allStatuses') })))
const typeOptions = computed(() => (types.value ?? []).map(x => ({ value: x.key, label: x.name })))
const localePath = useLocalePath()
</script>

<template>
  <div class="container-page py-8 sm:py-12">
    <header class="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div class="max-w-2xl">
        <h1 class="text-2xl font-bold sm:text-3xl">{{ t('documents.title') }}</h1>
        <p class="mt-1 text-ink-soft">{{ t('documents.subtitle') }}</p>
      </div>
      <UiButton to="/documents/new"><UiIcon name="plus" :size="18" />{{ t('documents.new') }}</UiButton>
    </header>
    <UiAlert tone="info" class="mb-6"><UiIcon name="lock" :size="16" class="me-1 inline" />{{ t('documents.privacy') }}</UiAlert>

    <div class="mb-6 grid gap-4 rounded-lg border border-line bg-surface p-4 md:grid-cols-[2fr_1fr] md:items-end">
      <UiChips :model-value="status" :options="statusChips" :label="t('documents.filterStatus')" @update:model-value="setQ({ status: $event })" />
      <UiFormField :label="t('documents.filterType')">
        <UiSelect :model-value="type" :options="typeOptions" :placeholder="t('documents.allTypes')" @update:model-value="setQ({ type: $event })" />
      </UiFormField>
    </div>

    <ul v-if="st === 'pending' && !data" aria-busy="true" class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"><li v-for="n in 3" :key="n"><UiCard><UiSkeleton :lines="3" /></UiCard></li></ul>
    <UiErrorState v-else-if="error" :message="isApiError(error) ? error.message : undefined" retry @retry="refresh()" />
    <UiEmptyState v-else-if="!docs.length" :title="hasFilters ? t('documents.noResultsTitle') : t('documents.emptyTitle')" :description="hasFilters ? t('documents.noResults') : t('documents.empty')" icon="file">
      <UiButton v-if="!hasFilters" to="/documents/new">{{ t('documents.new') }}</UiButton>
      <UiButton v-else variant="secondary" @click="navigateTo({ path: route.path })">{{ t('guides.clear') }}</UiButton>
    </UiEmptyState>
    <ul v-else class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <li v-for="d in docs" :key="d.id">
        <UiCard as="article" class="relative flex h-full flex-col gap-3 transition-shadow focus-within:shadow-3 hover:shadow-2">
          <DocumentsStatusBadge :status="d.status" :days="d.days_remaining" />
          <h2 class="text-lg font-bold"><NuxtLink :to="localePath(`/documents/${d.id}`)" class="after:absolute after:inset-0 after:content-['']">{{ d.display_name }}</NuxtLink></h2>
          <p v-if="d.label" class="text-sm text-muted">{{ d.type.name }}</p>
          <p class="mt-auto flex items-center gap-1.5 text-sm text-ink-soft"><UiIcon name="calendar" :size="16" />
            <span v-if="d.expiry_date">{{ t('documents.expiresOn') }}: <time :datetime="d.expiry_date">{{ formatDay(d.expiry_date, locale) }}</time></span>
            <span v-else>{{ t('documents.status.no_expiry') }}</span>
          </p>
          <p v-if="d.attachments.length" class="flex items-center gap-1.5 text-sm text-muted"><UiIcon name="file" :size="16" />{{ t('documents.filesCount', { count: d.attachments.length }) }}</p>
        </UiCard>
      </li>
    </ul>
  </div>
</template>
