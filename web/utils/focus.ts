/** Shared focus-containment logic for dialogs, drawers and menus. */
export const FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]):not([type="hidden"]),select:not([disabled]),textarea:not([disabled]),summary,[tabindex]:not([tabindex="-1"])'

/** Visible, focusable descendants (and `extra` elements that take part in the same loop) in DOM order. */
export function focusables(root: HTMLElement | null | undefined, extra: (HTMLElement | null | undefined)[] = []): HTMLElement[] {
  const list = [...extra, ...(root ? Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE)) : [])]
  return list.filter((el): el is HTMLElement => !!el && (el.offsetParent !== null || el === document.activeElement))
}

/** Index to focus when Tab / Shift+Tab is pressed inside a trap; wraps at both ends. -1 means "nothing focusable". */
export function nextTrapIndex(current: number, length: number, shift: boolean): number {
  if (!length) return -1
  if (shift) return current <= 0 ? length - 1 : current - 1
  return current === -1 || current === length - 1 ? 0 : current + 1
}

/** Handles a keydown for a trap. Returns true when it consumed the event. */
export function trapTab(e: KeyboardEvent, items: HTMLElement[]): boolean {
  if (e.key !== 'Tab') return false
  e.preventDefault()
  const next = nextTrapIndex(items.indexOf(document.activeElement as HTMLElement), items.length, e.shiftKey)
  if (next >= 0) items[next]!.focus()
  return true
}
