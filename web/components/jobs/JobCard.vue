<script setup lang="ts">
import type { Job } from '~/types/api'
import { formatSalary } from '~/utils/money'

const props = defineProps<{ job: Job }>()
const { t, locale } = useI18n()
const localePath = useLocalePath()
const salary = computed(() => formatSalary(props.job.salary, locale.value, p => t(`jobs.period.${p}`)))
</script>

<template>
  <UiCard as="article" class="relative flex h-full flex-col gap-3 transition-shadow focus-within:shadow-3 hover:shadow-2">
    <div class="flex flex-wrap items-center gap-2">
      <UiBadge tone="primary">{{ job.category_label }}</UiBadge><UiBadge>{{ job.employment_type_label }}</UiBadge><UiBadge>{{ job.remote_mode_label }}</UiBadge>
      <UiBadge v-if="job.match?.score != null" tone="success">{{ t('jobs.matchPercent', { value: job.match.score }) }}</UiBadge>
    </div>
    <h2 class="text-lg font-bold"><NuxtLink :to="localePath(`/jobs/${job.id}`)" class="after:absolute after:inset-0 after:content-['']">{{ job.title }}</NuxtLink></h2>
    <p class="text-ink-soft">{{ job.company }}<template v-if="job.city || job.location"> · {{ job.city?.name ?? job.location }}</template></p>
    <p v-if="salary" class="text-sm font-medium tabular-nums"><bdi>{{ salary }}</bdi></p>
    <p class="mt-auto text-sm text-muted">{{ job.visa_sponsorship.label }}<template v-if="job.source"> · {{ t('jobs.via', { source: job.source }) }}</template></p>
  </UiCard>
</template>
