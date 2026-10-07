<script setup lang="ts">
import { ENUMS, LOCALE_CODES, type Loc } from '~/utils/admin/modules'
import { newBlock, parseBlocks, type BlockForm } from '~/utils/admin/form'

/** City profile blocks. The value is the blocks array serialized as JSON (see form.ts); an official block needs an https source. */
const props = defineProps<{ modelValue: string | string[], disabled?: boolean }>()
const emit = defineEmits<{ 'update:modelValue': [value: string] }>()
const { t } = useI18n()
const blocks = ref<BlockForm[]>(parseBlocks(props.modelValue))
const loc = ref<Loc>('ar')
watch(blocks, (v) => emit('update:modelValue', JSON.stringify(v)), { deep: true })
watch(() => props.modelValue, (v) => { if (String(v) !== JSON.stringify(blocks.value)) blocks.value = parseBlocks(v) })
const keyOptions = computed(() => ENUMS.cityBlockKey!.map(v => ({ value: v, label: t(`admin.enums.cityBlockKey.${v}`) })))
const infoOptions = computed(() => ENUMS.infoType!.map(v => ({ value: v, label: t(`admin.enums.infoType.${v}`) })))
const srcOptions = computed(() => ENUMS.sourceType!.map(v => ({ value: v, label: t(`admin.enums.sourceType.${v}`) })))
const locOptions = computed(() => LOCALE_CODES.map(l => ({ value: l, label: t(`languages.${l}`) })))
const add = () => { if (blocks.value.length < 12) blocks.value.push(newBlock()) }
</script>

<template>
  <div class="space-y-4">
    <UiFormField :label="t('admin.blocks.editLocale')" class="max-w-xs"><UiSelect v-model="loc" :options="locOptions" /></UiFormField>
    <p v-if="!blocks.length" class="text-sm text-muted">{{ t('admin.blocks.none') }}</p>
    <fieldset v-for="(b, i) in blocks" :key="i" class="space-y-3 rounded-md border border-line p-3">
      <legend class="px-2 font-semibold">{{ t('admin.blocks.block', { n: i + 1 }) }}</legend>
      <div class="grid gap-3 sm:grid-cols-3">
        <UiFormField :label="t('admin.blocks.key')" required><UiSelect v-model="b.key" :options="keyOptions" :placeholder="t('admin.common.choose')" :disabled="disabled" /></UiFormField>
        <UiFormField :label="t('admin.blocks.infoType')"><UiSelect v-model="b.info_type" :options="infoOptions" :disabled="disabled" /></UiFormField>
        <UiFormField :label="t('admin.fields.sort_order')"><UiTextInput v-model="b.sort_order" type="number" ltr :disabled="disabled" /></UiFormField>
      </div>
      <UiFormField :label="t('admin.blocks.title')" required><UiTextInput v-model="b.translations[loc].title" :maxlength="200" :dir="loc === 'ar' ? 'rtl' : 'ltr'" :disabled="disabled" /></UiFormField>
      <UiFormField :label="t('admin.blocks.body')" optional><UiTextarea v-model="b.translations[loc].body" :rows="5" :maxlength="20000" :dir="loc === 'ar' ? 'rtl' : 'ltr'" :disabled="disabled" /></UiFormField>
      <p class="text-sm text-muted">{{ b.info_type === 'official_info' ? t('admin.blocks.officialNote') : t('admin.blocks.generalNote') }}</p>
      <div class="grid gap-3 sm:grid-cols-2">
        <UiFormField :label="t('admin.fields.source_name')" optional><UiTextInput v-model="b.source_name" :maxlength="255" :disabled="disabled" /></UiFormField>
        <UiFormField :label="t('admin.fields.source_url')" optional><UiTextInput v-model="b.source_url" type="url" ltr :maxlength="2048" :disabled="disabled" /></UiFormField>
        <UiFormField :label="t('admin.fields.source_type')" optional><UiSelect v-model="b.source_type" :options="srcOptions" :placeholder="t('admin.common.choose')" :disabled="disabled" /></UiFormField>
        <UiFormField :label="t('admin.fields.last_verified_at')" optional><UiTextInput v-model="b.last_verified_at" type="date" ltr :disabled="disabled" /></UiFormField>
      </div>
      <UiButton v-if="!disabled" variant="ghost" @click="blocks.splice(i, 1)"><UiIcon name="trash" :size="16" />{{ t('admin.blocks.remove') }}</UiButton>
    </fieldset>
    <UiButton v-if="!disabled && blocks.length < 12" variant="secondary" @click="add"><UiIcon name="plus" :size="16" />{{ t('admin.blocks.add') }}</UiButton>
  </div>
</template>
