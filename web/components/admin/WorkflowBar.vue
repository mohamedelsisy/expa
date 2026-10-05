<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from '#imports'
import { canSchedule as canScheduleFn, classifyTransitionError, workflowActions, type ContentStatus, type TransitionFailure } from '~/utils/admin/workflow'
import type { ProblemTarget } from '~/utils/admin/problems'
import StatusBadge from './StatusBadge.vue'
import ProblemsChecklist from './ProblemsChecklist.vue'
import ScheduleDialog from './ScheduleDialog.vue'
import Alert from '../ui/Alert.vue'
import Button from '../ui/Button.vue'
import { formatDateTime } from '~/utils/locale'

/** Current status, the transitions the API allows (`allowed_transitions`) filtered by permission, schedule dialog, failure feedback. */
const props = defineProps<{
  status: ContentStatus
  allowed: string[]
  prefix: string
  can: (permission: string) => boolean
  publishAt?: string | null
  createdByMe?: boolean
  firstRequiredField?: string
  /** Performs the call; rejects with the ApiError. */
  transition: (to: ContentStatus) => Promise<void>
  schedule: (iso: string) => Promise<void>
  dirty?: boolean
}>()
const emit = defineEmits<{ jump: [target: ProblemTarget] }>()
const { t, locale } = useI18n()
const busy = ref<string | null>(null)
const failure = ref<TransitionFailure | null>(null)
const scheduleOpen = ref(false)
const scheduleError = ref('')

const actions = computed(() => workflowActions({ status: props.status, allowedTransitions: props.allowed, prefix: props.prefix, can: props.can }))
const showSchedule = computed(() => canScheduleFn({ status: props.status, prefix: props.prefix, can: props.can }))

async function run(to: ContentStatus) {
  busy.value = to
  failure.value = null
  try { await props.transition(to) } catch (e) { failure.value = classifyTransitionError(e, { to, prefix: props.prefix, can: props.can }) } finally { busy.value = null }
}
async function doSchedule(iso: string) {
  busy.value = 'schedule'
  scheduleError.value = ''
  try { await props.schedule(iso); scheduleOpen.value = false } catch (e) {
    const f = classifyTransitionError(e, { to: 'published', prefix: props.prefix, can: props.can })
    if (f.kind === 'problems') { scheduleOpen.value = false; failure.value = f } else scheduleError.value = f.message || t('errors.generic')
  } finally { busy.value = null }
}
</script>

<template>
  <section :aria-label="t('admin.workflow.title')" class="space-y-3 rounded-lg border border-line bg-surface p-4" data-testid="workflow-bar">
    <div class="flex flex-wrap items-center gap-3">
      <p class="flex items-center gap-2 font-medium">{{ t('admin.workflow.status') }}: <StatusBadge :status="status" /></p>
      <p v-if="status === 'approved' && publishAt" class="text-sm text-ink-soft">{{ t('admin.workflow.scheduledFor', { date: formatDateTime(publishAt, locale) }) }}</p>
    </div>
    <div class="flex flex-wrap gap-2">
      <Button
        v-for="a in actions"
        :key="a.to"
        :variant="a.tone"
        :loading="busy === a.to"
        :disabled="!!busy"
        :data-action="a.to"
        @click="run(a.to)"
      >{{ t(a.labelKey) }}</Button>
      <Button v-if="showSchedule" variant="secondary" :disabled="!!busy" data-action="schedule" @click="scheduleOpen = true">{{ t('admin.workflow.schedule') }}</Button>
      <p v-if="!actions.length && !showSchedule" class="text-sm text-muted">{{ t('admin.workflow.noActions') }}</p>
    </div>
    <p v-if="dirty" class="text-sm text-muted">{{ t('admin.workflow.unsavedFirst') }}</p>
    <p v-if="createdByMe && status === 'review' && can(`${prefix}.review`)" class="text-sm text-muted">{{ t('admin.workflow.fourEyesHint') }}</p>
    <div aria-live="polite">
      <ProblemsChecklist v-if="failure?.kind === 'problems'" :problems="failure.problems" :first-required-field="firstRequiredField" @jump="emit('jump', $event)" />
      <Alert v-else-if="failure?.kind === 'four_eyes'" tone="warning" :title="t('admin.workflow.fourEyesTitle')">{{ t('admin.workflow.fourEyes') }}</Alert>
      <Alert v-else-if="failure?.kind === 'forbidden'" tone="danger">{{ failure.message || t('admin.common.forbidden') }}</Alert>
      <Alert v-else-if="failure" tone="danger">{{ failure.message || t('errors.generic') }}</Alert>
    </div>
    <ScheduleDialog :open="scheduleOpen" :busy="busy === 'schedule'" :error="scheduleError" @close="scheduleOpen = false" @submit="doSchedule" />
  </section>
</template>
