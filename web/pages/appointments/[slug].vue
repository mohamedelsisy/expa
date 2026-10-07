<script setup lang="ts">
import type { AppointmentGuide } from '~/types/api'

const { t, locale } = useI18n()
const route = useRoute()
const { request } = useApi()
const slug = computed(() => String(route.params.slug))
const { data: g, error, refresh, status } = await useAsyncData(() => `appt-${slug.value}`, async () => (await request<AppointmentGuide>(`appointments/guides/${encodeURIComponent(slug.value)}`)).data, { watch: [locale] })
if (isApiError(error.value) && error.value.status === 404) throw createError({ statusCode: 404, statusMessage: 'Not Found', fatal: true })
useSeo(() => ({ title: g.value ? `${g.value.title} | EXPA` : t('appt.title'), description: g.value?.summary ?? t('appt.subtitle'), type: 'article' }))
const crumbs = computed(() => [{ label: t('appt.title'), to: '/appointments' }, { label: g.value?.title ?? '' }])
</script>

<template>
  <div class="container-page max-w-3xl py-8 sm:py-12">
    <UiBreadcrumbs :items="crumbs" class="mb-6" />
    <div v-if="status === 'pending' && !g" aria-busy="true"><UiSkeleton block :lines="5" /></div>
    <UiErrorState :heading-level="1" v-else-if="error || !g" :message="isApiError(error) ? error.message : undefined" retry @retry="refresh()" />
    <article v-else class="space-y-6">
      <header class="space-y-3"><UiBadge tone="primary">{{ g.office_type_label }}</UiBadge><h1 class="text-3xl font-bold"><UiAutoItalian :text="g.title" /></h1><p v-if="g.summary" class="text-lg text-ink-soft">{{ g.summary }}</p></header>
      <GuideFallbackNotice v-if="g.fallback" :locale="g.locale" />
      <GovBookingBlock :booking="g.booking" :subject="g.slug" />
      <GovGuideSteps :guide="g" />
      <GuideSource :source="g.source" />
    </article>
  </div>
</template>
