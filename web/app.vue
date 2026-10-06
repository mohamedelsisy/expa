<script setup lang="ts">
import { localeDir } from '~/utils/locale'

// Server-rendered <html lang dir>: no flash when Arabic loads in RTL.
const { locale } = useI18n()
const upstreamFailed = useState('upstream-failed', () => false)
useHead({
  htmlAttrs: { lang: () => locale.value, dir: () => localeDir(locale.value) },
  // One title pattern everywhere: "Page | EXPA" (titles that already carry the brand are left alone).
  titleTemplate: t => (t && !t.includes('EXPA') ? `${t} | EXPA` : t || 'EXPA'),
  meta: () => (upstreamFailed.value ? [{ name: 'robots', content: 'noindex' }] : []),
})
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
