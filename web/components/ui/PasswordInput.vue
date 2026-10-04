<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from '#imports'
import TextInput from './TextInput.vue'
import Icon from './Icon.vue'

defineProps<{ modelValue: string, autocomplete?: 'current-password' | 'new-password' }>()
const emit = defineEmits<{ 'update:modelValue': [value: string] }>()
const { t } = useI18n()
const visible = ref(false)
</script>

<template>
  <div class="relative">
    <TextInput
      :model-value="modelValue"
      :type="visible ? 'text' : 'password'"
      :autocomplete="autocomplete"
      ltr
      class="pe-12"
      @update:model-value="emit('update:modelValue', $event)"
    />
    <button
      type="button"
      class="absolute inset-y-0 end-0 flex min-w-touch items-center justify-center text-ink-soft"
      :aria-label="visible ? t('common.hidePassword') : t('common.showPassword')"
      :aria-pressed="visible"
      @click="visible = !visible"
    >
      <Icon :name="visible ? 'eye-off' : 'eye'" />
    </button>
  </div>
</template>
