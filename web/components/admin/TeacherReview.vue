<script setup lang="ts">
/** Teacher review state of Italian vocabulary / exercises: mark as reviewed, or clear the mark. */
import { formatDateTime } from '~/utils/locale'
const props = defineProps<{ endpoint: string, id: number, reviewed: boolean, reviewedAt: string | null }>()
const emit = defineEmits<{ changed: [] }>()
const { t, locale } = useI18n()
const { request } = useApi()
const toast = useToast()
const { can } = usePermissions()
const busy = ref(false)
async function toggle() {
  busy.value = true
  try {
    await request(`${props.endpoint}/${props.id}/teacher-review`, { method: props.reviewed ? 'DELETE' : 'POST' })
    toast.success(props.reviewed ? t('admin.teacher.cleared') : t('admin.teacher.marked'))
    emit('changed')
  } catch (e) { toast.error(isApiError(e) ? e.message : t('errors.generic')) } finally { busy.value = false }
}
</script>

<template>
  <UiCard as="section" class="flex flex-wrap items-center justify-between gap-3" aria-labelledby="tr-rev-h" data-testid="teacher-review">
    <div><h2 id="tr-rev-h" class="font-bold">{{ t('admin.teacher.title') }}</h2><p class="text-sm text-ink-soft">{{ reviewed ? t('admin.teacher.reviewedOn', { date: formatDateTime(reviewedAt, locale) }) : t('admin.teacher.notReviewed') }}</p></div>
    <UiButton v-if="can('italian_lessons.review') || can('italian_lessons.update')" :variant="reviewed ? 'secondary' : 'primary'" :loading="busy" @click="toggle">{{ reviewed ? t('admin.teacher.clear') : t('admin.teacher.mark') }}</UiButton>
  </UiCard>
</template>
