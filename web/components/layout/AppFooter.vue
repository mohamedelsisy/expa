<script setup lang="ts">
const { t } = useI18n()
</script>

<template>
  <footer class="border-t border-line bg-surface">
    <div class="container-page flex flex-col gap-3 py-6 text-sm text-muted md:flex-row md:items-center md:justify-between">
      <p>{{ t('footer.disclaimer') }}</p>
      <ul class="flex flex-wrap gap-x-5">
        <li><UiButton to="/privacy-settings" variant="ghost" class="!min-h-touch !px-2">{{ t('nav.privacy') }}</UiButton></li>
      </ul>
    </div>
  </footer>
</template>
