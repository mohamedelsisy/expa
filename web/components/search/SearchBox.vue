<script setup lang="ts">
import type { Suggestion } from '~/types/api'

/** Header search: debounced suggestions from GET /search/suggest, Enter goes to /search?q=. */
const { t, locale } = useI18n()
const { request } = useApi()
const localePath = useLocalePath()
const q = ref('')
const suggestions = ref<Suggestion[]>([])
let timer: ReturnType<typeof setTimeout> | null = null
let seq = 0

watch(q, (v) => {
  if (timer) clearTimeout(timer)
  const term = v.trim()
  if (term.length < 2) { suggestions.value = []; return }
  timer = setTimeout(async () => {
    const my = ++seq
    try {
      const res = await request<Suggestion[]>('search/suggest', { query: { q: term }, handle401: false })
      if (my === seq) suggestions.value = res.data ?? []
    } catch {
      if (my === seq) suggestions.value = [] // suggestions are a convenience: fail silently
    }
  }, 250)
})
onBeforeUnmount(() => { if (timer) clearTimeout(timer) })

const typeLabel = (type: string) => t(`search.types.${type}`)
function go(query: string) {
  if (query.length < 2) return navigateTo(localePath('/search'))
  suggestions.value = []
  return navigateTo({ path: localePath('/search'), query: { q: query } })
}
watch(locale, () => { suggestions.value = [] })
</script>

<template>
  <form role="search" :aria-label="t('search.title')" class="w-full" @submit.prevent>
    <SearchCombobox v-model="q" :suggestions="suggestions" :label="t('search.label')" :placeholder="t('search.placeholder')" :type-label="typeLabel" @submit="go" @select="go($event.title)" />
  </form>
</template>
