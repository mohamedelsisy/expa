<script setup lang="ts">
import type { AppointmentGuide } from '~/types/api'
/** Steps / tips / cautions of an appointment guide (plain text only). */
defineProps<{ guide: AppointmentGuide }>()
const { t } = useI18n()
</script>

<template>
  <div class="space-y-5">
    <section v-if="guide.steps?.length" aria-labelledby="ag-steps" class="space-y-2">
      <h3 id="ag-steps" class="text-lg font-bold">{{ t('gov.steps') }}</h3>
      <ol class="space-y-3">
        <li v-for="(st, i) in guide.steps" :key="i" class="flex gap-3">
          <span class="grid size-8 shrink-0 place-items-center rounded-full bg-primary-soft font-bold text-primary-strong tabular-nums" aria-hidden="true">{{ i + 1 }}</span>
          <div><p class="font-semibold"><UiAutoItalian :text="st.title" /></p><p v-if="st.text" class="prose-plain text-ink-soft"><UiAutoItalian :text="st.text" /></p></div>
        </li>
      </ol>
    </section>
    <UiAlert v-if="guide.tips" tone="info" :title="t('gov.tips')"><p class="prose-plain">{{ guide.tips }}</p></UiAlert>
    <UiAlert v-if="guide.cautions" tone="warning" :title="t('gov.cautions')"><p class="prose-plain">{{ guide.cautions }}</p></UiAlert>
  </div>
</template>
