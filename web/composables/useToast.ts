export type ToastTone = 'success' | 'danger' | 'info'
export interface ToastItem { id: number, message: string, tone: ToastTone }

let seq = 0
export function useToast() {
  const items = useState<ToastItem[]>('toasts', () => [])
  function dismiss(id: number) {
    items.value = items.value.filter(i => i.id !== id)
  }
  function push(message: string, tone: ToastTone = 'info', ttl = 6000) {
    const id = ++seq
    items.value = [...items.value, { id, message, tone }]
    if (import.meta.client && ttl > 0) setTimeout(() => dismiss(id), ttl)
    return id
  }
  return {
    items,
    dismiss,
    success: (m: string) => push(m, 'success'),
    // Errors stay until dismissed (WCAG 2.2.1): they usually describe something the user must act on.
    error: (m: string) => push(m, 'danger', 0),
    info: (m: string) => push(m, 'info'),
  }
}
