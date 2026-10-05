<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from '#imports'
import { describeProblem, type ProblemTarget, type PublishProblem } from '~/utils/admin/problems'

/** Readable checklist of why an item cannot be published; each entry can jump to the offending field/tab. */
const props = defineProps<{ problems: PublishProblem[], firstRequiredField?: string }>()
const emit = defineEmits<{ jump: [target: ProblemTarget] }>()
const { t, te } = useI18n()
const views = computed(() => props.problems.map(p => describeProblem(p, t, {
  fieldLabel: f => (te(`admin.fields.${f}`) ? t(`admin.fields.${f}`) : f),
  localeLabel: l => (te(`languages.${l}`) ? t(`languages.${l}`) : l),
  firstRequiredField: props.firstRequiredField,
})))
</script>

<template>
  <section role="alert" class="rounded-md border border-danger bg-danger-soft p-4" data-testid="problems">
    <h3 class="font-bold text-danger">{{ t('admin.problems.title') }}</h3>
    <ul class="mt-2 space-y-1">
      <li v-for="(v, i) in views" :key="i" class="flex flex-wrap items-center gap-x-3 gap-y-1" :data-code="v.code">
        <span aria-hidden="true">✗</span>
        <span class="text-ink">{{ v.message }}</span>
        <button v-if="v.target.kind !== 'none'" type="button" class="inline-flex min-h-touch items-center text-sm font-medium text-primary-strong underline underline-offset-4" @click="emit('jump', v.target)">{{ t('admin.problems.goTo') }}</button>
      </li>
    </ul>
  </section>
</template>
