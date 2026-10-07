<script setup lang="ts">
/** Portal sub-navigation shared by the provider pages. */
const { t } = useI18n()
const route = useRoute()
const localePath = useLocalePath()
const items = [
  { to: '/provider', key: 'overview' }, { to: '/provider/profile', key: 'profile' }, { to: '/provider/verification', key: 'verification' },
  { to: '/provider/leads', key: 'leads' }, { to: '/provider/reviews', key: 'reviews' },
]
const active = (to: string) => route.path === localePath(to) || route.path === `${localePath(to)}/`
</script>

<template>
  <nav :aria-label="t('provider.nav.label')" class="mb-6">
    <ul class="flex flex-wrap gap-1">
      <li v-for="i in items" :key="i.key"><NuxtLink :to="localePath(i.to)" class="inline-flex min-h-touch items-center rounded-md px-3 font-medium" :class="active(i.to) ? 'bg-primary-soft text-primary-strong' : 'text-ink-soft hover:bg-sunken'" :aria-current="active(i.to) ? 'page' : undefined">{{ t(`provider.nav.${i.key}`) }}</NuxtLink></li>
    </ul>
  </nav>
</template>
