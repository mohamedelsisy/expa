import { B as useCookie, a as useAuthStore, g as useApi } from './server.mjs';

const ANALYTICS_COOKIE = "expa_analytics";
function cleanSubject(subject) {
  return typeof subject === "string" && subject.length <= 120 && /^[a-z0-9][a-z0-9\-_/]*$/i.test(subject) ? subject : void 0;
}
function mayReport(authenticated, consent) {
  return authenticated ? consent !== "denied" : consent === "granted";
}
function createDeduper(windowMs = 3e3, now = Date.now) {
  const seen = /* @__PURE__ */ new Map();
  return (key) => {
    const t = now();
    const last = seen.get(key);
    if (last !== void 0 && t - last < windowMs) return false;
    seen.set(key, t);
    return true;
  };
}
const once = createDeduper();
function useAnalyticsConsent() {
  return useCookie(ANALYTICS_COOKIE, { maxAge: 60 * 60 * 24 * 365, sameSite: "lax", path: "/", default: () => null });
}
function useAnalytics() {
  const auth = useAuthStore();
  const consent = useAnalyticsConsent();
  const { request } = useApi();
  async function track(name, subject) {
    if (!mayReport(auth.isAuthenticated, consent.value)) return;
    const s = cleanSubject(subject);
    if (!once(`${name}:${s != null ? s : ""}`)) return;
    try {
      await request(`analytics/events`, { method: "POST", body: { name, ...s ? { subject: s } : {} }, handle401: false, timeoutMs: 4e3 });
    } catch {
    }
  }
  return { track };
}

export { useAnalyticsConsent as a, useAnalytics as u };
//# sourceMappingURL=useAnalytics-Dh-8IvGy.mjs.map
