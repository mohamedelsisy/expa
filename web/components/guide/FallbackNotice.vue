<script setup lang="ts">
import { useI18n } from '#imports'
import Alert from '../ui/Alert.vue'

/** Shown when the API served the guide in another language than requested. */
defineProps<{ locale: string }>()
const { t } = useI18n()
</script>

<template>
  <Alert tone="info" data-testid="fallback-notice">{{ t('guides.shownIn', { language: t(`languages.${locale}`) }) }}</Alert>
</template>
