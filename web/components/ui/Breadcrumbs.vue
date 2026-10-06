<script setup lang="ts">
import { useHead, useI18n, useLocalePath, useRoute, useRuntimeConfig } from '#imports'
import { breadcrumbLd } from '~/utils/seo'
import { jsonLd } from '~/utils/safe'
import Icon from './Icon.vue'

export interface Crumb { label: string, to?: string }
const props = defineProps<{ items: Crumb[] }>()
const { t } = useI18n()
const localePath = useLocalePath()
const route = useRoute()
const siteUrl = String(useRuntimeConfig().public.siteUrl ?? '').replace(/\/$/, '')

// schema.org BreadcrumbList mirrors the visible trail.
useHead(() => ({
  script: [{
    type: 'application/ld+json',
    innerHTML: jsonLd(breadcrumbLd(
      props.items.filter(c => c.label).map(c => ({ name: c.label, url: c.to ? siteUrl + localePath(c.to) : undefined })),
      siteUrl + route.path,
    )),
  }],
}))
</script>

<template>
  <nav :aria-label="t('nav.breadcrumbs')" class="text-sm">
    <ol class="flex flex-wrap items-center gap-x-1.5">
      <li v-for="(c, i) in items" :key="i" class="flex items-center gap-1.5">
        <NuxtLink v-if="c.to" :to="localePath(c.to)" class="inline-flex min-h-touch items-center text-primary-strong underline underline-offset-4">{{ c.label }}</NuxtLink>
        <span v-else aria-current="page" class="text-ink-soft">{{ c.label }}</span>
        <Icon v-if="i < items.length - 1" name="chevron-end" :size="14" class="text-muted" />
      </li>
    </ol>
  </nav>
</template>
