import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute } from '#imports'

/**
 * Disclosure-style dropdown behaviour for header menus: toggles on click, closes on Escape (returning focus to the
 * trigger), on an outside click, when focus leaves the menu, and on navigation. The trigger must carry
 * `data-dropdown-trigger`; the panel is toggled with v-show so its links stay in the HTML for crawlers.
 */
export function useDropdown() {
  const open = ref(false)
  const root = ref<HTMLElement | null>(null)
  const route = useRoute()

  function close(returnFocus = false) {
    const wasOpen = open.value
    open.value = false
    if (returnFocus && wasOpen) nextTick(() => root.value?.querySelector<HTMLElement>('[data-dropdown-trigger]')?.focus())
  }
  const toggle = () => { open.value = !open.value }

  function onPointerDown(e: Event) {
    if (open.value && root.value && !root.value.contains(e.target as Node)) close()
  }
  function onKeydown(e: KeyboardEvent) {
    if (open.value && e.key === 'Escape') {
      e.stopPropagation()
      close(true)
    }
  }
  function onFocusOut(e: FocusEvent) {
    const next = e.relatedTarget as Node | null
    if (open.value && next && root.value && !root.value.contains(next)) close()
  }

  onMounted(() => {
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeydown)
  })
  onBeforeUnmount(() => {
    document.removeEventListener('pointerdown', onPointerDown)
    document.removeEventListener('keydown', onKeydown)
  })
  watch(() => route.fullPath, () => close())

  return { open, root, toggle, close, onFocusOut }
}
