import { s as useState, g as useApi } from './server.mjs';

const MIN_GAP_MS = 6e4;
function useNotifications() {
  const unread = useState("notif-unread", () => 0);
  const lastFetch = useState("notif-last", () => 0);
  const { request } = useApi();
  async function refreshCount(force = false) {
    var _a;
    const now = Date.now();
    if (!force && now - lastFetch.value < MIN_GAP_MS) return;
    lastFetch.value = now;
    try {
      const res = await request("notifications", { query: { per_page: 1 }, handle401: false });
      unread.value = (_a = res.meta.unread) != null ? _a : 0;
    } catch {
    }
  }
  function setUnread(n) {
    unread.value = Math.max(0, n);
    lastFetch.value = Date.now();
  }
  function startPolling() {
    return () => {
    };
  }
  return { unread, refreshCount, setUnread, startPolling };
}

export { useNotifications as u };
//# sourceMappingURL=useNotifications-epL0jSED.mjs.map
