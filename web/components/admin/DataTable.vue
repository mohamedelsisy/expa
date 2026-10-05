<script setup lang="ts" generic="Row extends Record<string, any>">
import { useI18n } from '#imports'
import { sortDirection } from '~/utils/admin/listState'

export interface Column { key: string, label: string, sortable?: boolean, class?: string }
/** Real <table>: caption, `scope` headers, first column is the row header, `aria-sort` on sortable columns. */
defineProps<{ columns: Column[], rows: Row[], rowKey: string, caption: string, sort?: string }>()
const emit = defineEmits<{ sort: [column: string] }>()
const { t } = useI18n()
</script>

<template>
  <div class="relative overflow-x-auto rounded-lg border border-line bg-surface shadow-1" role="region" :aria-label="caption" tabindex="0">
    <table class="w-full min-w-[40rem] border-collapse text-start">
      <caption class="sr-only">{{ caption }}</caption>
      <thead class="bg-sunken text-sm text-ink-soft">
        <tr>
          <th
            v-for="c in columns"
            :key="c.key"
            scope="col"
            class="px-3 py-2 text-start font-semibold"
            :class="c.class"
            :aria-sort="c.sortable && sort ? sortDirection(sort, c.key) : undefined"
          >
            <button v-if="c.sortable" type="button" class="inline-flex min-h-touch items-center gap-1 font-semibold hover:text-ink" :aria-label="t('admin.common.sortBy', { column: c.label })" @click="emit('sort', c.key)">
              {{ c.label }}
              <span aria-hidden="true" class="text-xs">{{ sort === c.key ? '▲' : sort === `-${c.key}` ? '▼' : '↕' }}</span>
            </button>
            <template v-else>{{ c.label }}</template>
          </th>
        </tr>
      </thead>
      <tbody class="divide-y divide-line">
        <tr v-for="row in rows" :key="row[rowKey]" class="align-top hover:bg-canvas">
          <template v-for="(c, i) in columns" :key="c.key">
            <th v-if="i === 0" scope="row" class="px-3 py-2 text-start font-medium" :class="c.class"><slot :name="`cell-${c.key}`" :row="row">{{ row[c.key] }}</slot></th>
            <td v-else class="px-3 py-2" :class="c.class"><slot :name="`cell-${c.key}`" :row="row">{{ row[c.key] }}</slot></td>
          </template>
        </tr>
      </tbody>
    </table>
  </div>
</template>
