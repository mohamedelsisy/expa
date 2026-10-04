<script setup lang="ts">
const { t } = useI18n()
useSeo(() => ({ title: t('ask.title'), description: t('ask.body'), noindex: true }))
</script>

<template>
  <div class="container-page py-12">
    <UiEmptyState :title="t('ask.title')" :description="t('ask.body')" icon="sparkle">
      <UiBadge tone="accent">{{ t('common.comingSoon') }}</UiBadge>
      <div class="mt-4"><UiButton to="/guides" variant="secondary">{{ t('landing.cta.explore') }}</UiButton></div>
    </UiEmptyState>
  </div>
</template>
