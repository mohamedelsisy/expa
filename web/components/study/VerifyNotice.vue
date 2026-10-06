<script setup lang="ts">
/** Study data is third-party: always tell the user to confirm with the institution. Text comes from the API. */
defineProps<{ text?: string | null }>()
const { t } = useI18n()
</script>

<template>
  <UiAlert tone="info" :title="t('study.verifyTitle')" data-testid="study-verify">{{ text || t('study.verifyDefault') }}</UiAlert>
</template>
