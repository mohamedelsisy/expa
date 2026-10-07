<script setup lang="ts">
import type { City } from '~/types/api'
import type { ProvidersMeta } from '~/types/extra'

definePageMeta({ middleware: 'auth' })
const { t } = useI18n()
const { request } = useApi()
useSeo(() => ({ title: t('provider.profile.title'), description: t('provider.subtitle'), noindex: true }))
const portal = useProviderPortal()
const { data, error, refresh } = await useAsyncData('provider-profile-page', async () => {
  await portal.load()
  const [meta, cities] = await Promise.all([request<ProvidersMeta>('providers/meta'), request<City[]>('cities')])
  return { categories: meta.data.categories, cities: cities.data }
})
const pending = ref(false)
</script>

<template>
  <div class="container-page max-w-3xl py-8 sm:py-12">
    <h1 class="mb-6 text-2xl font-bold sm:text-3xl">{{ t('provider.profile.title') }}</h1>
    <ProviderNav />
    <div v-if="portal.state.value === 'loading'" aria-busy="true"><UiSkeleton block :lines="6" /></div>
    <UiErrorState v-else-if="error || portal.state.value === 'error' || !data" :message="isApiError(error) ? error.message : (portal.error.value ?? undefined)" retry @retry="refresh()" />
    <UiEmptyState v-else-if="portal.state.value === 'none' || !portal.profile.value" :title="t('provider.noListingTitle')" :description="t('provider.noListing')" icon="user"><UiButton to="/provider">{{ t('provider.apply.title') }}</UiButton></UiEmptyState>
    <template v-else>
      <UiAlert v-if="pending" tone="info" class="mb-6" data-testid="pending-approval">{{ t('provider.overview.pendingChanges') }}</UiAlert>
      <ProviderProfileForm :profile="portal.profile.value" :categories="data.categories" :cities="data.cities" @saved="(p, pend) => { portal.set(p); pending = pend }" />
    </template>
  </div>
</template>
