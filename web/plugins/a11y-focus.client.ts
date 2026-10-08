/**
 * After a form submit, move keyboard/screen-reader focus to the first field the app marked `aria-invalid="true"`
 * (WCAG 3.3.1 / 3.3.3). Works for synchronous validation and for errors that arrive after an API call (up to 8 s).
 * The error text itself is announced by the field's `role="alert"` message.
 */
export default defineNuxtPlugin(() => {
  let stop: (() => void) | null = null
  document.addEventListener('submit', (e) => {
    const form = e.target
    if (!(form instanceof HTMLFormElement)) return
    stop?.()
    const focusFirst = () => {
      const el = form.querySelector<HTMLElement>('[aria-invalid="true"]')
      if (!el) return false
      if (document.activeElement !== el) el.focus()
      return true
    }
    const mo = new MutationObserver(() => { if (focusFirst()) stop?.() })
    mo.observe(form, { subtree: true, childList: true, attributes: true, attributeFilter: ['aria-invalid'] })
    const timer = setTimeout(() => stop?.(), 8000)
    stop = () => { mo.disconnect(); clearTimeout(timer); stop = null }
    setTimeout(() => { if (stop && focusFirst()) stop() }, 0)
  }, true)
})
