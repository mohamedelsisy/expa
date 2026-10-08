<script setup lang="ts">
import { newBracket, parseBrackets, type BracketForm } from '~/utils/admin/form'

/** Tax brackets: ascending upper limits, the last row open-ended. The value is the rows serialized as JSON (see form.ts). */
const props = defineProps<{ modelValue: string | string[], disabled?: boolean }>()
const emit = defineEmits<{ 'update:modelValue': [value: string] }>()
const { t } = useI18n()
const rows = ref<BracketForm[]>(parseBrackets(props.modelValue))
watch(rows, v => emit('update:modelValue', JSON.stringify(v)), { deep: true })
watch(() => props.modelValue, (v) => { if (String(v) !== JSON.stringify(rows.value)) rows.value = parseBrackets(v) })
const add = () => { if (rows.value.length < 20) rows.value.push(newBracket()) }
</script>

<template>
  <div class="space-y-3" data-testid="brackets-editor">
    <p v-if="!rows.length" class="text-sm text-muted">{{ t('admin.brackets.none') }}</p>
    <ol class="space-y-3">
      <li v-for="(r, i) in rows" :key="i" class="grid items-end gap-3 rounded-md border border-line p-3 sm:grid-cols-[1fr_1fr_auto]">
        <UiFormField :label="t('admin.brackets.upTo', { n: i + 1 })" :hint="i === rows.length - 1 ? t('admin.brackets.lastHint') : undefined" optional>
          <UiTextInput v-model="r.up_to" type="number" inputmode="decimal" ltr :disabled="disabled" />
        </UiFormField>
        <UiFormField :label="t('admin.brackets.rate', { n: i + 1 })" required>
          <UiTextInput v-model="r.rate" type="number" inputmode="decimal" ltr :disabled="disabled" />
        </UiFormField>
        <UiButton v-if="!disabled" variant="ghost" :aria-label="t('admin.brackets.remove', { n: i + 1 })" @click="rows.splice(i, 1)"><UiIcon name="trash" :size="16" />{{ t('admin.blocks.remove') }}</UiButton>
      </li>
    </ol>
    <UiButton v-if="!disabled && rows.length < 20" variant="secondary" @click="add"><UiIcon name="plus" :size="16" />{{ t('admin.brackets.add') }}</UiButton>
  </div>
</template>
