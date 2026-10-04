<script setup lang="ts">
import { useI18n, useLocalePath } from '#imports'
import Icon from './Icon.vue'

export interface Crumb { label: string, to?: string }
defineProps<{ items: Crumb[] }>()
const { t } = useI18n()
const localePath = useLocalePath()
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
