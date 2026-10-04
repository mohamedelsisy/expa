<script setup lang="ts">
import { localeDir } from '~/utils/locale'

// Server-rendered <html lang dir>: no flash when Arabic loads in RTL.
const { locale } = useI18n()
useHead({ htmlAttrs: { lang: () => locale.value, dir: () => localeDir(locale.value) } })
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
