<script setup lang="ts">
/** A live provider listing edited by its owner: approve or reject the pending edits (providers.publish). */
const props = defineProps<{ endpoint: string, id: number }>()
const emit = defineEmits<{ changed: [] }>()
const { t } = useI18n()
const { request } = useApi()
const toast = useToast()
const { can } = usePermissions()
const busy = ref<string | null>(null)
async function decide(action: 'approve' | 'reject') {
  busy.value = action
  try { await request(`${props.endpoint}/${props.id}/changes`, { method: 'POST', body: { action } }); toast.success(t(`admin.pending.${action}Done`)); emit('changed') } catch (e) { toast.error(isApiError(e) ? e.message : t('errors.generic')) } finally { busy.value = null }
}
</script>

<template>
  <UiAlert tone="warning" :title="t('admin.pending.title')" data-testid="pending-changes">
    <p>{{ t('admin.pending.body') }}</p>
    <div v-if="can('providers.publish')" class="mt-3 flex flex-wrap gap-2"><UiButton :loading="busy === 'approve'" @click="decide('approve')">{{ t('admin.pending.approve') }}</UiButton><UiButton variant="secondary" :loading="busy === 'reject'" @click="decide('reject')">{{ t('admin.pending.reject') }}</UiButton></div>
  </UiAlert>
</template>
