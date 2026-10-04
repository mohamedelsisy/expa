<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from '#imports'
import type { SourceType } from '~/types/api'
import Badge from './Badge.vue'
import Icon from './Icon.vue'

const props = defineProps<{ type: SourceType | null }>()
const { t } = useI18n()
const tone = computed(() => ({ official: 'success', institutional: 'info', verified_partner: 'primary', third_party: 'warning' } as const)[props.type ?? 'third_party'])
const icon = computed(() => (props.type === 'official' ? 'shield' : props.type === 'third_party' ? 'info' : 'check'))
</script>

<template>
  <Badge v-if="type" :tone="tone" :data-source-type="type"><Icon :name="icon" :size="14" />{{ t(`source.types.${type}`) }}</Badge>
</template>
