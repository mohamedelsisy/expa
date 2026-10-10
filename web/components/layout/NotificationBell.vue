<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()
const { unread, startPolling } = useNotifications()
let stop: () => void = () => {}
onMounted(() => { stop = startPolling() })
onBeforeUnmount(() => stop())
const label = computed(() => (unread.value > 0 ? t('notifications.bellUnread', { count: unread.value }) : t('notifications.bell')))
</script>

<template>
  <NuxtLink
    :to="localePath('/notifications')"
    class="relative inline-flex min-h-touch min-w-touch items-center justify-center rounded-full text-ink-soft transition-colors hover:bg-sunken hover:text-ink motion-reduce:transition-none"
    :aria-label="label"
    data-testid="notification-bell"
  >
    <UiIcon name="bell" :size="22" />
    <!-- Unread is a small dot; the exact count is in the accessible label. -->
    <span v-if="unread > 0" aria-hidden="true" class="absolute end-2.5 top-2.5 size-2.5 rounded-full bg-accent ring-2 ring-surface" data-testid="notification-dot" />
  </NuxtLink>
</template>
