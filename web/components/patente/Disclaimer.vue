<script setup lang="ts">
const { t } = useI18n()
</script>

<template>
  <UiAlert tone="info" :title="t('patente.mockTitle')"><p>{{ t('patente.mockNotice') }}</p></UiAlert>
</template>
