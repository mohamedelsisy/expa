<script setup lang="ts">
import { useToast } from '#imports'
import Toast from './Toast.vue'

// Two live regions so errors interrupt (assertive) and everything else is polite.
const toast = useToast()
</script>

<template>
  <div class="pointer-events-none fixed inset-x-0 bottom-[calc(var(--bottom-nav-h)+0.75rem)] z-50 mx-auto flex max-w-md flex-col gap-2 px-4 lg:bottom-6">
    <div aria-live="polite" role="status" class="flex flex-col gap-2">
      <Toast v-for="i in toast.items.value.filter(x => x.tone !== 'danger')" :key="i.id" :message="i.message" :tone="i.tone" @dismiss="toast.dismiss(i.id)" />
    </div>
    <div aria-live="assertive" role="alert" class="flex flex-col gap-2">
      <Toast v-for="i in toast.items.value.filter(x => x.tone === 'danger')" :key="i.id" :message="i.message" :tone="i.tone" @dismiss="toast.dismiss(i.id)" />
    </div>
  </div>
</template>
