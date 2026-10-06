<script setup lang="ts">
import { LEGAL_SLUGS } from '~/utils/legal'

/** Links to the public legal documents (new tab so a half-filled form is never lost), with the policy version if known. */
defineProps<{ version?: string | null }>()
const { t } = useI18n()
const localePath = useLocalePath()
</script>

<template>
  <p class="text-sm text-ink-soft" data-testid="legal-links">
    {{ t('legal.readBefore') }}
    <template v-for="(s, i) in LEGAL_SLUGS" :key="s">
      <NuxtLink :to="localePath(`/${s}`)" target="_blank" rel="noopener" class="inline-flex min-h-touch items-center font-medium text-primary-strong underline underline-offset-4">{{ t(`legal.${s}.title`) }}<span class="sr-only"> {{ t('a11y.opensNewTab') }}</span></NuxtLink><span v-if="i < LEGAL_SLUGS.length - 1" aria-hidden="true">, </span>
    </template>
    <span v-if="version"> ({{ t('legal.policyVersion', { version }) }})</span>.
  </p>
</template>
