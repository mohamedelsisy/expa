import { g as useApi } from './server.mjs';
import { ref } from 'vue';

function useConsent(purpose) {
  const { request } = useApi();
  const granted = ref(null);
  async function load() {
    var _a;
    try {
      const res = await request("profile/consents", { handle401: false });
      granted.value = !!((_a = res.data.consents[purpose]) == null ? void 0 : _a.granted);
    } catch {
      granted.value = null;
    }
  }
  return { granted, load };
}

export { useConsent as u };
//# sourceMappingURL=useConsent-mKBmxtRH.mjs.map
