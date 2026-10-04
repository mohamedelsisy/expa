<script setup lang="ts">
</script>

<template>
  <div class="flex min-h-screen flex-col">
    <LayoutSkipLink />
    <LayoutAppHeader />
    <LayoutVerificationBanner />
    <main id="main" tabindex="-1" class="flex-1 pb-[calc(var(--bottom-nav-h)+1.5rem)] outline-none md:pb-12">
      <slot />
    </main>
    <LayoutAppFooter />
    <LayoutBottomNav />
    <UiToastRegion />
  </div>
</template>
