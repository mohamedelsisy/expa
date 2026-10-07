<script setup lang="ts">
import type { PortalLead } from '~/types/extra'
import { LEAD_STATUS_TONE, languageName } from '~/utils/services'
import { formatDateTime } from '~/utils/locale'

definePageMeta({ middleware: 'auth' })
const { t, locale } = useI18n()
const { request } = useApi()
const toast = useToast()
useSeo(() => ({ title: t('provider.leads.title'), description: t('provider.leads.intro'), noindex: true }))
const page = ref(1)
const { data, error, refresh, status } = await useAsyncData(() => `provider-leads-${page.value}`, () => request<PortalLead[]>('provider/leads', { query: { page: page.value, per_page: 20 } }), { watch: [page] })
const notProvider = computed(() => isApiError(error.value) && (error.value.code === 'provider_account_required' || error.value.status === 403))
const busy = ref<number | null>(null)
async function mark(l: PortalLead, s: 'seen' | 'closed') {
  busy.value = l.id
  try { await request(`provider/leads/${l.id}`, { method: 'PATCH', body: { status: s } }); await refresh() } catch (e) { toast.error(isApiError(e) ? e.message : t('errors.generic')) } finally { busy.value = null }
}
</script>

<template>
  <div class="container-page max-w-3xl py-8 sm:py-12">
    <h1 class="mb-6 text-2xl font-bold sm:text-3xl">{{ t('provider.leads.title') }}</h1>
    <ProviderNav />
    <p class="mb-4 text-ink-soft">{{ t('provider.leads.intro') }}</p>
    <div v-if="status === 'pending' && !data" aria-busy="true"><UiSkeleton block :lines="4" /></div>
    <UiEmptyState v-else-if="notProvider" :title="t('provider.noListingTitle')" :description="t('provider.noListing')" icon="user"><UiButton to="/provider">{{ t('provider.apply.title') }}</UiButton></UiEmptyState>
    <UiErrorState v-else-if="error" :message="isApiError(error) ? error.message : undefined" retry @retry="refresh()" />
    <UiEmptyState v-else-if="!data?.data.length" :title="t('provider.leads.emptyTitle')" :description="t('provider.leads.empty')" icon="send" />
    <template v-else>
      <ul class="space-y-3">
        <li v-for="l in data.data" :key="l.id" class="space-y-2 rounded-md border border-line bg-surface p-4">
          <p class="flex flex-wrap items-center gap-2"><UiBadge :tone="LEAD_STATUS_TONE[l.status] ?? 'neutral'">{{ t(`services.leadStatus.${l.status}`) }}</UiBadge><UiBadge>{{ t(`services.lead.types.${l.request_type ?? 'contact'}`) }}</UiBadge><span class="text-sm text-muted"><bdi>{{ formatDateTime(l.created_at, locale) }}</bdi></span></p>
          <p class="prose-plain" dir="auto">{{ l.message }}</p>
          <dl class="grid gap-2 text-sm sm:grid-cols-2">
            <div v-if="l.contact.name"><dt class="text-muted">{{ t('services.lead.name') }}</dt><dd dir="auto">{{ l.contact.name }}</dd></div>
            <div v-if="l.contact.email"><dt class="text-muted">{{ t('services.lead.email') }}</dt><dd><a :href="`mailto:${l.contact.email}`" dir="ltr" class="break-all underline underline-offset-4">{{ l.contact.email }}</a></dd></div>
            <div v-if="l.contact.phone"><dt class="text-muted">{{ t('services.lead.phone') }}</dt><dd><a :href="`tel:${l.contact.phone.replace(/[^+\d]/g, '')}`" dir="ltr" class="underline underline-offset-4">{{ l.contact.phone }}</a></dd></div>
            <div v-if="l.preferred_language"><dt class="text-muted">{{ t('services.lead.language') }}</dt><dd>{{ languageName(l.preferred_language, locale) }}</dd></div>
          </dl>
          <p class="text-xs text-muted">{{ t('provider.leads.consentNote') }}</p>
          <div class="flex flex-wrap gap-2"><UiButton v-if="l.status === 'new'" variant="secondary" :loading="busy === l.id" @click="mark(l, 'seen')">{{ t('provider.leads.markSeen') }}</UiButton><UiButton v-if="l.status !== 'closed'" variant="ghost" :loading="busy === l.id" @click="mark(l, 'closed')">{{ t('provider.leads.close') }}</UiButton></div>
        </li>
      </ul>
      <div class="mt-6"><UiPagination :page="data.meta.page ?? 1" :last-page="data.meta.last_page ?? 1" @change="page = $event" /></div>
    </template>
  </div>
</template>
