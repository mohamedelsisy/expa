<script setup lang="ts">
const { t } = useI18n()
const nav = useNav()
</script>

<template>
  <nav :aria-label="t('nav.primary')" class="pb-safe fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface lg:hidden">
    <ul class="grid h-bottom-nav grid-cols-5">
      <li v-for="item in nav" :key="item.key">
        <NuxtLink
          :to="item.to"
          class="flex h-full min-w-0 flex-col items-center justify-center gap-0.5 px-1 text-xs font-medium"
          :class="item.active ? 'text-primary-strong' : 'text-ink-soft'"
          :aria-current="item.active ? 'page' : undefined"
        >
          <span class="grid h-7 w-12 place-items-center rounded-full" :class="item.active ? 'bg-primary-soft' : ''"><UiIcon :name="item.icon" :size="22" /></span>
          <span class="max-w-full truncate leading-tight">{{ item.label }}</span>
        </NuxtLink>
      </li>
    </ul>
  </nav>
</template>
