import { onBeforeUnmount, onMounted, ref } from 'vue'

/**
 * True once the window has scrolled past `threshold` px. SSR-safe (false on the server and until mounted) and uses a
 * passive listener; the header uses it only to restyle border/shadow, never to change its size.
 */
export function useScrolled(threshold = 8) {
  const scrolled = ref(false)
  const update = () => { scrolled.value = window.scrollY > threshold }
  onMounted(() => {
    update()
    window.addEventListener('scroll', update, { passive: true })
  })
  onBeforeUnmount(() => window.removeEventListener('scroll', update))
  return scrolled
}
