<script setup lang="ts">
import type { Job } from '~/types/api'

definePageMeta({ middleware: 'auth' })
const { t, locale } = useI18n()
const { request } = useApi()
useSeo(() => ({ title: t('jobs.saved'), description: t('jobs.subtitle'), noindex: true }))
const { data, error, refresh, status } = await useAsyncData('jobs-saved', () => request<Job[]>('jobs/saved'), { watch: [locale] })
const jobs = computed(() => data.value?.data ?? [])
</script>

<template>
  <div class="container-page py-8 sm:py-12">
    <header class="mb-6 flex flex-wrap items-end justify-between gap-3"><h1 class="text-2xl font-bold sm:text-3xl">{{ t('jobs.saved') }}</h1><UiButton to="/jobs" variant="secondary">{{ t('jobs.backToJobs') }}</UiButton></header>
    
    <ul v-if="status === 'pending' && !data" class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true"><li v-for="n in 3" :key="n"><UiCard><UiSkeleton :lines="4" /></UiCard></li></ul>
    <UiErrorState v-else-if="error" :message="isApiError(error) ? error.message : undefined" retry @retry="refresh()" />
    <UiEmptyState v-else-if="!jobs.length" :title="t('jobs.savedEmptyTitle')" :description="t('jobs.savedEmpty')" icon="briefcase" />
    <ul v-else class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"><li v-for="j in jobs" :key="j.id"><JobsJobCard :job="j" /></li></ul>
  </div>
</template>
