<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from '#imports'
import type { GuideSource } from '~/types/api'
import { safeHttpsUrl } from '~/utils/safe'
import SourceBadge from '../ui/SourceBadge.vue'
import FreshnessIndicator from '../ui/FreshnessIndicator.vue'
import Icon from '../ui/Icon.vue'

/** Provenance block: name, https-only link, type badge, last-verified + freshness. Never invents a source. */
const props = defineProps<{ source: GuideSource }>()
const { t } = useI18n()
const url = computed(() => safeHttpsUrl(props.source.url))
</script>

<template>
  <section class="space-y-3 rounded-lg border border-line bg-surface p-5" :aria-label="t('source.title')">
    <h2 class="text-base font-bold">{{ t('source.title') }}</h2>
    <div class="flex flex-wrap items-center gap-2">
      <SourceBadge :type="source.type" />
      <span v-if="source.name" class="font-medium" data-testid="source-name">{{ source.name }}</span>
      <span v-else class="text-muted">{{ t('source.unknown') }}</span>
    </div>
    <a
      v-if="url"
      :href="url"
      target="_blank"
      rel="noopener noreferrer"
      class="inline-flex min-h-touch items-center gap-2 font-medium text-primary-strong underline underline-offset-4"
      data-testid="source-link"
    >
      {{ t('source.open') }}<Icon name="external" :size="16" />
      <span class="sr-only">{{ t('a11y.opensNewTab') }}</span>
    </a>
    <FreshnessIndicator :last-verified-at="source.last_verified_at" :freshness="source.freshness" />
  </section>
</template>
