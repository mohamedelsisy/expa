import { s as useState } from './server.mjs';

let seq = 0;
function useToast() {
  const items = useState("toasts", () => []);
  function dismiss(id) {
    items.value = items.value.filter((i) => i.id !== id);
  }
  function push(message, tone = "info", ttl = 6e3) {
    const id = ++seq;
    items.value = [...items.value, { id, message, tone }];
    return id;
  }
  return {
    items,
    dismiss,
    success: (m) => push(m, "success"),
    // Errors stay until dismissed (WCAG 2.2.1): they usually describe something the user must act on.
    error: (m) => push(m, "danger", 0),
    info: (m) => push(m, "info")
  };
}

export { useToast as u };
//# sourceMappingURL=useToast-BX2bodPv.mjs.map
