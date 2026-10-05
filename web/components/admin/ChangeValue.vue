<script setup lang="ts">
import { useI18n } from '#imports'
import type { Disp } from '~/utils/admin/changes'
defineProps<{ v: Disp }>()
const { t } = useI18n()
</script>

<template>
  <span v-if="v.type === 'redacted'" class="text-muted">{{ t('admin.audit.redacted') }}</span>
  <span v-else-if="v.type === 'null'" class="text-muted">{{ t('admin.audit.empty') }}</span>
  <span v-else-if="v.type === 'bool'">{{ t(v.value ? 'admin.common.true' : 'admin.common.false') }}</span>
  <span v-else dir="auto" class="rounded-sm bg-sunken px-1">{{ v.text }}</span>
</template>
