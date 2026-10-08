<script setup lang="ts">
import { computed } from 'vue'
import { useI18n, useLocalePath } from '#imports'
import type { Recommendations } from '~/types/extra'
import { mapApiRoute } from '~/utils/routes'
import Badge from '../ui/Badge.vue'
import Alert from '../ui/Alert.vue'
import Button from '../ui/Button.vue'
import EmptyState from '../ui/EmptyState.vue'
import Icon from '../ui/Icon.vue'

/**
 * "Recommended for you": guides, lessons, third-party services and reminders, each with the reason the API gives.
 * Services always carry the third-party label (EXPA does not recommend or guarantee providers). Nothing is invented here.
 */
const props = withDefaults(defineProps<{ recs: Recommendations, headingLevel?: 2 | 3, idPrefix?: string, notice?: boolean }>(), { notice: true })
const { t } = useI18n()
const localePath = useLocalePath()
const H = computed(() => `h${props.headingLevel ?? 2}`)
const pfx = computed(() => props.idPrefix ?? 'recs')

const sections = computed(() => [
  { key: 'guides', icon: 'book', items: props.recs.guides },
  { key: 'lessons', icon: 'sparkle', items: props.recs.lessons },
  { key: 'services', icon: 'user', items: props.recs.services },
  { key: 'reminders', icon: 'bell', items: props.recs.reminders },
] as const)
const visible = computed(() => sections.value.filter(s => s.items.length > 0))
const empty = computed(() => visible.value.length === 0)
const to = (route: string) => { const p = mapApiRoute(route); return p ? localePath(p) : null }
</script>

<template>
  <div class="space-y-6" data-testid="recs">
    <Alert v-if="notice && !recs.personalization.enabled" tone="info" :title="t('recs.offTitle')" data-testid="recs-off">
      <p>{{ t('recs.off') }}</p>
      <Button to="/privacy-settings" variant="secondary" class="mt-3">{{ t('recs.offCta') }}</Button>
    </Alert>

    <EmptyState v-if="empty" :title="t('recs.emptyTitle')" :description="recs.personalization.enabled ? t('recs.empty') : t('recs.emptyOff')" icon="compass" />

    <section v-for="s in visible" :key="s.key" :aria-labelledby="`${pfx}-${s.key}`" class="space-y-3" :data-testid="`recs-${s.key}`">
      <component :is="H" :id="`${pfx}-${s.key}`" class="flex items-center gap-2 text-lg font-bold">
        <span class="grid size-8 place-items-center rounded-full bg-primary-soft text-primary-strong"><Icon :name="s.icon" :size="18" /></span>{{ t(`recs.sections.${s.key}`) }}
      </component>
      <p v-if="s.key === 'services'" class="text-sm text-muted">{{ t('recs.servicesNote') }}</p>
      <ul class="grid gap-3 sm:grid-cols-2">
        <li v-for="it in s.items" :key="`${it.type}-${'slug' in it ? it.slug : it.document_id}`" class="flex flex-col gap-2 rounded-lg border border-line bg-surface p-4" data-testid="rec-item">
          <p class="flex flex-wrap items-center gap-2 font-semibold">
            <NuxtLink v-if="to(it.route)" :to="to(it.route)!" class="underline-offset-4 hover:underline" dir="auto">{{ it.title }}</NuxtLink>
            <span v-else dir="auto">{{ it.title }}</span>
            <template v-if="it.type === 'service'">
              <Badge tone="warning" data-testid="rec-third-party">{{ t('recs.thirdParty') }}</Badge>
              <Badge tone="neutral">{{ t(`recs.verification.${it.verification}`) }}</Badge>
            </template>
          </p>
          <p class="text-sm text-ink-soft" data-testid="rec-reason"><span class="font-medium">{{ t('recs.why') }}:</span> {{ it.reason.text }}</p>
        </li>
      </ul>
    </section>
  </div>
</template>
