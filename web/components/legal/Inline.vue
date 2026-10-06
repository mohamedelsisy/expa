<script setup lang="ts">
import { parseInline } from '~/utils/legal'

defineProps<{ text: string }>()
</script>

<template>
  <template v-for="(n, i) in parseInline(text)" :key="i">
    <strong v-if="n.t === 'strong'">{{ n.v }}</strong>
    <em v-else-if="n.t === 'em'">{{ n.v }}</em>
    <a v-else-if="n.t === 'link'" :href="n.href" rel="noopener noreferrer" class="text-primary-strong underline underline-offset-4">{{ n.v }}</a>
    <template v-else>{{ n.v }}</template>
  </template>
</template>
