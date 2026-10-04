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
    class="relative inline-flex min-h-touch min-w-touch items-center justify-center rounded-md text-ink-soft hover:bg-sunken"
    :aria-label="label"
    data-testid="notification-bell"
  >
    <UiIcon name="bell" :size="22" />
    <span v-if="unread > 0" aria-hidden="true" class="absolute end-1 top-1 grid min-w-5 place-items-center rounded-full bg-accent px-1 text-xs font-bold leading-5 text-on-accent tabular-nums">{{ unread > 99 ? '99+' : unread }}</span>
  </NuxtLink>
</template>
