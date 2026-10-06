<script setup lang="ts">
import type { StudyProgram } from '~/types/api'
import { formatDay } from '~/utils/locale'
import { formatMoney } from '~/utils/money'

const props = defineProps<{ program: StudyProgram, showMatch?: boolean }>()
const { t, locale } = useI18n()
const localePath = useLocalePath()
const tuition = computed(() => {
  const x = props.program.tuition
  if (!x || (x.min == null && x.max == null)) return null
  const f = (n: number) => formatMoney(n, x.currency, locale.value)
  return x.min != null && x.max != null && x.min !== x.max ? `${f(x.min)}–${f(x.max)}` : f((x.min ?? x.max) as number)
})
</script>

<template>
  <UiCard as="article" class="relative flex h-full flex-col gap-3 transition-shadow focus-within:shadow-3 hover:shadow-2">
    <div class="flex flex-wrap items-center gap-2">
      <UiBadge tone="primary">{{ program.degree_level_label }}</UiBadge>
      <UiBadge>{{ program.field_label }}</UiBadge>
      <UiBadge>{{ program.instruction_language_label }}</UiBadge>
      <UiBadge v-if="showMatch && program.match?.score != null" tone="success">{{ t('study.matchPercent', { value: program.match.score }) }}</UiBadge>
    </div>
    <h2 class="text-lg font-bold"><NuxtLink :to="localePath(`/study/programs/${program.slug}`)" class="after:absolute after:inset-0 after:content-['']">{{ program.title }}</NuxtLink></h2>
    <p class="text-ink-soft">{{ program.university.name }}<template v-if="program.university.city"> · {{ program.university.city.name }}</template></p>
    <p v-if="program.summary" class="line-clamp-3 text-ink-soft">{{ program.summary }}</p>
    <dl class="mt-auto grid grid-cols-2 gap-x-3 gap-y-1 pt-2 text-sm">
      <div><dt class="text-muted">{{ t('study.tuition') }}</dt><dd class="font-medium tabular-nums"><bdi>{{ tuition ?? t('study.notStated') }}</bdi></dd></div>
      <div><dt class="text-muted">{{ t('study.deadline') }}</dt><dd class="font-medium">{{ program.deadline.date ? formatDay(program.deadline.date, locale) : t('study.notStated') }}<span v-if="program.deadline.status === 'passed'" class="text-danger"> · {{ t('study.passed') }}</span></dd></div>
    </dl>
  </UiCard>
</template>
