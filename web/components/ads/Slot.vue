<script setup lang="ts">
/**
 * One AdSense ad unit. Renders nothing until ads are allowed (consent given, plan not ad-free, public page, slot
 * configured), so there is never an empty "Advertisement" box. Placed deliberately on public content pages only.
 */
const props = defineProps<{ name: string }>()
const { t } = useI18n()
const route = useRoute()
const { config, canShow, slotId } = useAds()
const show = computed(() => canShow(props.name, route.path))
const unit = ref<HTMLElement | null>(null)
const pushedFor = ref<string | null>(null)

watch([show, unit, () => route.fullPath], () => {
  if (!show.value || !unit.value || pushedFor.value === route.fullPath) return
  pushedFor.value = route.fullPath
  try {
    const w = window as unknown as { adsbygoogle?: unknown[] }
    ;(w.adsbygoogle = w.adsbygoogle || []).push({})
  } catch { /* an ad failure never affects the page */ }
}, { flush: 'post' })
</script>

<template>
  <aside v-if="show" :key="route.fullPath" :aria-label="t('ads.label')" class="my-8 min-h-[120px] rounded-lg border border-line p-3" data-testid="ad-slot">
    <p class="mb-2 text-xs text-muted">{{ t('ads.label') }}</p>
    <ins
      ref="unit"
      class="adsbygoogle block"
      :data-ad-client="config.clientId"
      :data-ad-slot="slotId(name)"
      data-ad-format="auto"
      data-full-width-responsive="true"
    />
  </aside>
</template>
