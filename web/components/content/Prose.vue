<script setup lang="ts">
import { parseMarkdown } from '~/utils/legal'

/** Editorial text (Markdown subset) rendered through the safe block model (text nodes only). Headings start at h`from`. */
const props = withDefaults(defineProps<{ body: string, from?: 2 | 3 | 4 }>(), { from: 2 })
const blocks = computed(() => parseMarkdown(props.body))
// The shallowest heading in the text becomes level `from`, so a page never skips from its own h1/h2/h3 to a deeper level.
const base = computed(() => Math.min(4, ...blocks.value.flatMap(b => (b.type === 'h' ? [b.level] : []))))
const lvl = (n: number) => Math.min(6, Math.max(props.from, n - base.value + props.from))
</script>

<template>
  <div class="space-y-4 leading-relaxed" dir="auto">
    <template v-for="(b, i) in blocks" :key="i">
      <component :is="`h${lvl(b.level)}`" v-if="b.type === 'h'" class="pt-2 text-xl font-bold"><LegalInline :text="b.text" /></component>
      <p v-else-if="b.type === 'p'"><LegalInline :text="b.text" /></p>
      <component :is="b.type" v-else class="space-y-1 ps-6" :class="b.type === 'ul' ? 'list-disc' : 'list-decimal'">
        <li v-for="(it, j) in b.items" :key="j"><LegalInline :text="it" /></li>
      </component>
    </template>
  </div>
</template>
