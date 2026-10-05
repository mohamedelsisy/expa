<script setup lang="ts">
import { useI18n } from '#imports'
import { localeDir } from '~/utils/locale'
import type { TranslatableField } from '~/utils/admin/modules'
import TextInput from '../ui/TextInput.vue'
import Textarea from '../ui/Textarea.vue'
import Icon from '../ui/Icon.vue'
import FormField from '../ui/FormField.vue'

/** Ordered list editor for JSON list fields: strings (documents), steps {title,text}, lesson items. */
type Row = string | Record<string, string>
const props = defineProps<{ field: TranslatableField, modelValue: Row[], locale: string, disabled?: boolean }>()
const emit = defineEmits<{ 'update:modelValue': [value: Row[]] }>()
const { t } = useI18n()
const dir = localeDir(props.locale)
const blankRow = (): Row => props.field.type === 'list' ? '' : props.field.type === 'steps' ? { title: '', text: '' } : Object.fromEntries((props.field.itemFields ?? []).map(i => [i.key, '']))
const full = () => props.field.maxItems !== undefined && props.modelValue.length >= props.field.maxItems
const set = (v: Row[]) => emit('update:modelValue', v)
const add = () => set([...props.modelValue, blankRow()])
const remove = (i: number) => set(props.modelValue.filter((_, x) => x !== i))
const move = (i: number, d: -1 | 1) => { const a = [...props.modelValue]; const j = i + d; if (j < 0 || j >= a.length) return; [a[i], a[j]] = [a[j]!, a[i]!]; set(a) }
const setKey = (i: number, key: string, v: string) => set(props.modelValue.map((r, x) => (x === i ? { ...(r as Record<string, string>), [key]: v } : r)))
const setStr = (i: number, v: string) => set(props.modelValue.map((r, x) => (x === i ? v : r)))
</script>

<template>
  <div class="space-y-3" :data-list="field.key">
    <p v-if="!modelValue.length" class="text-sm text-muted">{{ t('admin.editor.emptyList') }}</p>
    <ol class="space-y-3">
      <li v-for="(row, i) in modelValue" :key="i" class="rounded-md border border-line bg-canvas p-3">
        <div class="mb-2 flex items-center justify-between gap-2">
          <span class="text-sm font-semibold text-ink-soft">{{ t('admin.editor.entry', { n: i + 1 }) }}</span>
          <span class="flex">
            <button type="button" class="inline-flex min-h-touch min-w-touch items-center justify-center rounded-md hover:bg-sunken disabled:opacity-40" :disabled="disabled || i === 0" :aria-label="t('admin.editor.moveUp', { n: i + 1 })" @click="move(i, -1)"><Icon name="chevron-down" class="rotate-180" /></button>
            <button type="button" class="inline-flex min-h-touch min-w-touch items-center justify-center rounded-md hover:bg-sunken disabled:opacity-40" :disabled="disabled || i === modelValue.length - 1" :aria-label="t('admin.editor.moveDown', { n: i + 1 })" @click="move(i, 1)"><Icon name="chevron-down" /></button>
            <button type="button" class="inline-flex min-h-touch min-w-touch items-center justify-center rounded-md text-danger hover:bg-danger-soft disabled:opacity-40" :disabled="disabled" :aria-label="t('admin.editor.remove', { n: i + 1 })" @click="remove(i)"><Icon name="trash" /></button>
          </span>
        </div>
        <template v-if="field.type === 'list'">
          <FormField :label="t('admin.editor.entry', { n: i + 1 })"><TextInput :model-value="row as string" :maxlength="field.max" :dir="dir" :disabled="disabled" @update:model-value="setStr(i, $event)" /></FormField>
        </template>
        <div v-else-if="field.type === 'steps'" class="space-y-2">
          <FormField :label="t('admin.fields.step_title')"><TextInput :model-value="(row as Record<string, string>).title ?? ''" :maxlength="field.titleMax" :dir="dir" :disabled="disabled" @update:model-value="setKey(i, 'title', $event)" /></FormField>
          <FormField :label="t('admin.fields.step_text')"><Textarea :model-value="(row as Record<string, string>).text ?? ''" :rows="2" :maxlength="field.max" :dir="dir" :disabled="disabled" @update:model-value="setKey(i, 'text', $event)" /></FormField>
        </div>
        <div v-else class="grid gap-2 sm:grid-cols-2">
          <FormField v-for="f in field.itemFields" :key="f.key" :label="t(`admin.fields.item_${f.key}`)" :required="f.required">
            <TextInput :model-value="(row as Record<string, string>)[f.key] ?? ''" :maxlength="f.max" :dir="f.italian ? 'ltr' : dir" :lang="f.italian ? 'it' : undefined" :disabled="disabled" @update:model-value="setKey(i, f.key, $event)" />
          </FormField>
        </div>
      </li>
    </ol>
    <button type="button" class="inline-flex min-h-touch items-center gap-2 rounded-md border border-line-strong bg-surface px-4 font-medium hover:bg-sunken disabled:opacity-50" :disabled="disabled || full()" @click="add"><Icon name="plus" :size="18" />{{ t('admin.editor.add') }}</button>
    <p v-if="field.maxItems" class="text-xs text-muted">{{ t('admin.editor.maxItems', { count: modelValue.length, max: field.maxItems }) }}</p>
  </div>
</template>
