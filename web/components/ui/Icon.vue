<script setup lang="ts">
import { computed } from 'vue'

/** Inline 24px stroke icons. `directional` icons mirror in RTL. Decorative unless `label` is given. */
const PATHS: Record<string, string> = {
  'chevron-end': 'M9 6l6 6-6 6',
  'chevron-start': 'M15 6l-6 6 6 6',
  'chevron-down': 'M6 9l6 6 6-6',
  'arrow-end': 'M5 12h14M13 6l6 6-6 6',
  'arrow-start': 'M19 12H5M11 6l-6 6 6 6',
  check: 'M5 12.5l4.5 4.5L19 7.5',
  x: 'M6 6l12 12M18 6L6 18',
  info: 'M12 8v.01M11 12h1v5h1M12 21a9 9 0 100-18 9 9 0 000 18z',
  alert: 'M12 9v4M12 17v.01M10.3 4.2L2.8 17.5A2 2 0 004.5 20.5h15a2 2 0 001.7-3L13.7 4.2a2 2 0 00-3.4 0z',
  home: 'M4 11l8-7 8 7M6 10v10h12V10',
  compass: 'M12 21a9 9 0 100-18 9 9 0 000 18zM15.5 8.5l-2 5-5 2 2-5 5-2z',
  sparkle: 'M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3zM19 17l.7 1.8L21.5 19.5l-1.8.7L19 22l-.7-1.8-1.8-.7 1.8-.7L19 17z',
  tasks: 'M9 6h11M9 12h11M9 18h11M4 6l1 1 2-2M4 12l1 1 2-2M4 18l1 1 2-2',
  user: 'M12 12a4 4 0 100-8 4 4 0 000 8zM4 20c0-3.5 3.6-6 8-6s8 2.5 8 6',
  globe: 'M12 21a9 9 0 100-18 9 9 0 000 18zM3 12h18M12 3c2.5 2.5 3.5 5.5 3.5 9S14.500 18.500 12 21c-2.5-2.5-3.5-5.5-3.5-9S9.500 5.500 12 3z',
  eye: 'M2 12s3.500-7 10-7 10 7 10 7-3.500 7-10 7S2 12 2 12zM12 15a3 3 0 100-6 3 3 0 000 6z',
  'eye-off': 'M3 3l18 18M10.6 5.1A9.800 9.800 0 0112 5c6.500 0 10 7 10 7a17 17 0 01-3.200 4M6.700 6.700A17 17 0 002 12s3.500 7 10 7c1.600 0 3-.4 4.300-1M9.900 9.900a3 3 0 004.200 4.200',
  shield: 'M12 3l8 3v6c0 4.500-3.200 8-8 9-4.800-1-8-4.500-8-9V6l8-3zM9 12l2 2 4-4',
  download: 'M12 4v11M7 11l5 5 5-5M5 20h14',
  trash: 'M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3',
  external: 'M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 01-1 1H5a1 1 0 01-1-1V7a1 1 0 011-1h5',
  book: 'M5 4h10a3 3 0 013 3v13H8a3 3 0 01-3-3V4zM5 17a3 3 0 013-3h10',
  calendar: 'M4 7a2 2 0 012-2h12a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V7zM4 10h16M8 3v4M16 3v4',
  refresh: 'M20 11a8 8 0 00-14.500-3M4 4v4h4M4 13a8 8 0 0014.500 3M20 20v-4h-4',
  logout: 'M15 4h3a2 2 0 012 2v12a2 2 0 01-2 2h-3M10 8l-4 4 4 4M6 12h10',
  search: 'M11 18a7 7 0 100-14 7 7 0 000 14zM21 21l-5-5',
  clock: 'M12 21a9 9 0 100-18 9 9 0 000 18zM12 7v5l3 2',
  file: 'M7 3h7l5 5v12a1 1 0 01-1 1H7a1 1 0 01-1-1V4a1 1 0 011-1zM14 3v5h5M9 13h6M9 17h6',
  map: 'M9 4L3 6v14l6-2 6 2 6-2V4l-6 2-6-2zM9 4v14M15 6v14',
  euro: 'M17 6.500A6 6 0 007 9.500v5a6 6 0 0010 3M5 11h8M5 14h8',
  list: 'M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01',
  lock: 'M6 11h12v9H6zM8 11V8a4 4 0 118 0v3',
  menu: 'M4 6h16M4 12h16M4 18h16',
  bell: 'M6 9a6 6 0 1112 0c0 5 2 6.500 2 6.500H4S6 14 6 9zM10 19a2 2 0 004 0',
  send: 'M4 12l16-8-6 16-3-7-7-1z',
  upload: 'M12 16V4M7 9l5-5 5 5M5 20h14',
  plus: 'M12 5v14M5 12h14',
  volume: 'M4 9v6h4l5 4V5L8 9H4zM16.500 9a4 4 0 010 6M19 7a7 7 0 010 10',
  bookmark: 'M7 4h10a1 1 0 011 1v15l-6-4-6 4V5a1 1 0 011-1z',
  briefcase: 'M4 8h16a1 1 0 011 1v10a1 1 0 01-1 1H4a1 1 0 01-1-1V9a1 1 0 011-1zM9 8V5a1 1 0 011-1h4a1 1 0 011 1v3M3 13h18',
  car: 'M5 16V11l2-5h10l2 5v5M3 16h18v2H3zM7 13h.01M17 13h.01M5 11h14',
  edit: 'M4 20h4L19 9a2.800 2.800 0 00-4-4L4 16v4zM13.500 6.500l4 4',
  phone: 'M6 3h3l2 5-2.500 1.500a11 11 0 006 6L16 13l5 2v3a2 2 0 01-2 2A16 16 0 014 5a2 2 0 012-2z',
  mail: 'M4 6h16a1 1 0 011 1v10a1 1 0 01-1 1H4a1 1 0 01-1-1V7a1 1 0 011-1zM3 7l9 6 9-6',
  building: 'M5 21V5a1 1 0 011-1h8a1 1 0 011 1v16M15 10h3a1 1 0 011 1v10M3 21h18M9 8h2M9 12h2M9 16h2',
  flame: 'M12 3c1 3 5 5 5 10a5 5 0 01-10 0c0-2 1-3 2-4 0 2 1 3 2 3 0-3-1-6 1-9z',
  help: 'M12 21a9 9 0 100-18 9 9 0 000 18zM9.500 9.500a2.500 2.500 0 114 2c-1 .7-1.500 1.200-1.500 2.500M12 17v.01',
  'x-circle': 'M12 21a9 9 0 100-18 9 9 0 000 18zM9 9l6 6M15 9l-6 6',
  'check-circle': 'M12 21a9 9 0 100-18 9 9 0 000 18zM8 12.500l3 3 5-6',
  minus: 'M5 12h14',
  triangle: 'M12 4l9 16H3L12 4z',
}
const DIRECTIONAL = new Set(['chevron-end', 'chevron-start', 'arrow-end', 'arrow-start', 'logout'])

const props = withDefaults(defineProps<{ name: string, size?: number, label?: string }>(), { size: 20 })
const d = computed(() => PATHS[props.name] ?? '')
const flip = computed(() => DIRECTIONAL.has(props.name))
</script>

<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.8"
    stroke-linecap="round"
    stroke-linejoin="round"
    :width="size"
    :height="size"
    class="shrink-0"
    :class="{ 'rtl:-scale-x-100': flip }"
    :role="label ? 'img' : undefined"
    :aria-label="label"
    :aria-hidden="label ? undefined : 'true'"
    focusable="false"
  >
    <path :d="d" />
  </svg>
</template>
