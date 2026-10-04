<script setup lang="ts">
const { t } = useI18n()
</script>

<template>
  <a
    href="#main"
    class="sr-only z-[100] rounded-md bg-primary px-4 py-3 font-medium text-on-primary focus:not-sr-only focus:fixed focus:start-4 focus:top-4"
  >{{ t('a11y.skipToContent') }}</a>
</template>
