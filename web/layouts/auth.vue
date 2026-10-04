<script setup lang="ts">
const persist = usePersistLocale()
</script>

<template>
  <div class="flex min-h-screen flex-col">
    <LayoutSkipLink />
    <header class="container-page flex min-h-[64px] items-center justify-between">
      <LayoutBrandLogo />
      <UiLanguageSwitcher @switch="persist" />
    </header>
    <main id="main" tabindex="-1" class="flex flex-1 items-start justify-center px-4 pb-12 pt-4 outline-none sm:items-center">
      <div class="w-full max-w-lg">
        <UiCard elevated class="!p-6 sm:!p-8"><slot /></UiCard>
      </div>
    </main>
    <UiToastRegion />
  </div>
</template>
