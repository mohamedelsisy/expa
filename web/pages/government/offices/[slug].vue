<script setup lang="ts">
import type { GovOffice } from '~/types/api'

const { t, locale } = useI18n()
const route = useRoute()
const { request } = useApi()
const slug = computed(() => String(route.params.slug))
const { data: o, error, refresh, status } = await useAsyncData(() => `gov-office-${slug.value}`, async () => (await request<GovOffice>(`government/offices/${encodeURIComponent(slug.value)}`)).data, { watch: [locale] })
if (isApiError(error.value) && error.value.status === 404) throw createError({ statusCode: 404, statusMessage: 'Not Found', fatal: true })
useSeo(() => ({ title: o.value ? `${o.value.name} | EXPA` : t('gov.title'), description: o.value?.office_type_label ?? t('gov.subtitle') }))
const crumbs = computed(() => [{ label: t('gov.title'), to: '/government' }, { label: o.value?.name ?? '' }])
</script>

<template>
  <div class="container-page max-w-3xl py-8 sm:py-12">
    <UiBreadcrumbs :items="crumbs" class="mb-6" />
    <div v-if="status === 'pending' && !o" aria-busy="true"><UiSkeleton block :lines="5" /></div>
    <UiErrorState v-else-if="error || !o" :message="isApiError(error) ? error.message : undefined" retry @retry="refresh()" />
    <div v-else class="space-y-6">
      <h1 class="text-3xl font-bold"><UiAutoItalian :text="o.name" /></h1>
      <GovOfficeCard :office="o" />
    </div>
  </div>
</template>
