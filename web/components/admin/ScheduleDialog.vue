<script setup lang="ts">
import { ref, watch } from 'vue'
import { useI18n } from '#imports'
import Dialog from './Dialog.vue'
import FormField from '../ui/FormField.vue'
import TextInput from '../ui/TextInput.vue'
import Button from '../ui/Button.vue'

/** Schedules an approved item: `POST .../schedule { publish_at }` (must be in the future). */
const props = defineProps<{ open: boolean, busy?: boolean, error?: string }>()
const emit = defineEmits<{ close: [], submit: [iso: string] }>()
const { t } = useI18n()
const value = ref('')
const local = ref('')
watch(() => props.open, (o) => { if (o) { value.value = ''; local.value = '' } })
function submit() {
  const d = new Date(value.value)
  if (!value.value || Number.isNaN(d.getTime())) { local.value = t('admin.workflow.scheduleInvalid'); return }
  if (d.getTime() <= Date.now()) { local.value = t('admin.workflow.schedulePast'); return }
  local.value = ''
  emit('submit', d.toISOString())
}
</script>

<template>
  <Dialog :open="open" :title="t('admin.workflow.scheduleTitle')" @close="emit('close')">
    <form id="schedule-form" class="space-y-3" @submit.prevent="submit">
      <p class="text-ink-soft">{{ t('admin.workflow.scheduleHelp') }}</p>
      <FormField :label="t('admin.workflow.publishAt')" :error="local || error" required>
        <TextInput v-model="value" type="datetime-local" ltr data-autofocus />
      </FormField>
    </form>
    <template #footer>
      <Button variant="secondary" @click="emit('close')">{{ t('common.cancel') }}</Button>
      <Button type="submit" :loading="busy" @click="submit">{{ t('admin.workflow.schedule') }}</Button>
    </template>
  </Dialog>
</template>
