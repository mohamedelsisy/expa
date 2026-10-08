<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useI18n } from '#imports'
import { ENUMS, type AttrField } from '~/utils/admin/modules'
import { useRelationOptions, type RelKind } from '~/composables/useRelations'

/** One attribute input of a content module, rendered from its schema entry. */
const props = defineProps<{ field: AttrField, modelValue: string | string[], error?: string, disabled?: boolean, today?: string }>()
const emit = defineEmits<{ 'update:modelValue': [value: string | string[]] }>()
const { t, te } = useI18n()
const label = computed(() => t(`admin.fields.${props.field.key}`))
const hint = computed(() => (props.field.help ? t(`admin.help.${props.field.key}`) : undefined))
const enumOptions = computed(() => (props.field.enum ? ENUMS[props.field.enum]!.map(v => ({ value: v, label: te(`admin.enums.${props.field.enum}.${v}`) ? t(`admin.enums.${props.field.enum}.${v}`) : v })) : []))
const boolOptions = computed(() => [{ value: 'true', label: t('admin.common.true') }, { value: 'false', label: t('admin.common.false') }])
const rel = props.field.relation ? useRelationOptions(props.field.relation as RelKind) : null
onMounted(() => { rel?.load() })
const q = ref('')
const shownOffices = computed(() => (rel?.options.value ?? []).filter(o => !q.value || o.label.toLowerCase().includes(q.value.toLowerCase())))
const arr = computed(() => (Array.isArray(props.modelValue) ? props.modelValue : []))
const str = computed(() => (Array.isArray(props.modelValue) ? '' : props.modelValue))
const toggle = (v: string, on: boolean) => emit('update:modelValue', on ? [...arr.value, v] : arr.value.filter(x => x !== v))
const inputType = computed(() => ({ number: 'number', date: 'date', url: 'url', email: 'email' } as Record<string, string>)[props.field.type] ?? 'text')
</script>

<template>
  <div :data-admin-field="field.key">
    <!-- group controls: checkbox lists -->
    <UiFormField v-if="field.type === 'multiselect' || field.relation === 'offices'" group :label="label" :hint="hint" :error="error" :optional="!field.required">
      <template v-if="field.relation === 'offices'">
        <UiTextInput v-model="q" type="search" :placeholder="t('admin.common.filterList')" class="mb-2" />
        <p v-if="rel?.pending.value" class="text-sm text-muted">{{ t('common.loading') }}</p>
        <p v-else-if="rel?.failed.value" class="text-sm text-danger" role="alert">{{ t('admin.common.relationFailed') }}</p>
        <div class="max-h-56 overflow-y-auto rounded-md border border-line p-2">
          <UiCheckbox v-for="o in shownOffices" :key="o.value" :model-value="arr.includes(o.value)" :label="o.label" :disabled="disabled" @update:model-value="toggle(o.value, $event)" />
        </div>
        <p class="mt-1 text-xs text-muted">{{ t('admin.common.selectedCount', { count: arr.length }) }}</p>
      </template>
      <div v-else class="flex flex-wrap gap-x-4">
        <UiCheckbox v-for="o in enumOptions" :key="o.value" :model-value="arr.includes(o.value)" :label="o.label" :disabled="disabled" @update:model-value="toggle(o.value, $event)" />
      </div>
    </UiFormField>

    <UiFormField v-else-if="field.type === 'blocks'" group :label="label" :hint="hint" :error="error" optional>
      <AdminBlocksEditor :model-value="str" :disabled="disabled" @update:model-value="emit('update:modelValue', $event)" />
    </UiFormField>

    <UiFormField v-else-if="field.type === 'brackets'" group :label="label" :hint="hint" :error="error" :optional="!field.required">
      <AdminBracketsEditor :model-value="str" :disabled="disabled" @update:model-value="emit('update:modelValue', $event)" />
    </UiFormField>

    <UiFormField v-else :label="label" :hint="hint" :error="error" :required="field.required" :optional="!field.required">
      <UiSelect v-if="field.type === 'select'" :model-value="str" :options="enumOptions" :placeholder="t('admin.common.choose')" :disabled="disabled" @update:model-value="emit('update:modelValue', $event)" />
      <UiSelect v-else-if="field.type === 'bool'" :model-value="str" :options="boolOptions" :placeholder="t('admin.common.choose')" :disabled="disabled" @update:model-value="emit('update:modelValue', $event)" />
      <template v-else-if="field.type === 'relation'">
        <UiSelect v-if="rel && !rel.failed.value" :model-value="str" :options="rel.options.value" :placeholder="rel.pending.value ? t('common.loading') : t('admin.common.choose')" :disabled="disabled" @update:model-value="emit('update:modelValue', $event)" />
        <template v-else>
          <UiTextInput :model-value="str" type="number" inputmode="numeric" ltr :disabled="disabled" @update:model-value="emit('update:modelValue', $event)" />
          <p class="mt-1 text-xs text-muted">{{ t('admin.common.relationFailed') }}</p>
        </template>
      </template>
      <UiTextarea v-else-if="field.type === 'textarea' || field.type === 'json'" :model-value="str" :rows="field.type === 'json' ? 8 : (field.rows ?? 3)" :maxlength="field.maxLength" :ltr="field.type === 'json' || field.ltr" :disabled="disabled" @update:model-value="emit('update:modelValue', $event)" />
      <UiTextInput
        v-else
        :model-value="str"
        :type="inputType"
        :inputmode="field.type === 'number' ? 'numeric' : undefined"
        :maxlength="field.maxLength"
        :ltr="field.ltr || ['number', 'date', 'url', 'email'].includes(field.type)"
        :disabled="disabled"
        @update:model-value="emit('update:modelValue', $event)"
      />
    </UiFormField>
  </div>
</template>
