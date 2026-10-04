<script setup lang="ts">
const localePath = useLocalePath()
const { t } = useI18n()
</script>

<template>
  <NuxtLink :to="localePath('/')" class="inline-flex min-h-touch items-center gap-2 font-bold text-primary-strong" :aria-label="t('brand.homeLink')">
    <span class="grid size-8 place-items-center rounded-md bg-primary text-on-primary" aria-hidden="true">
      <svg viewBox="0 0 32 32" width="18" height="18" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round"><path d="M9 10h14M9 16h10M9 22h14" /></svg>
    </span>
    <span class="text-xl tracking-wide" lang="en" dir="ltr">EXPA</span>
  </NuxtLink>
</template>
