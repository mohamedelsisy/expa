import { g as useApi, s as useState, j as isApiError } from './server.mjs';
import { ref } from 'vue';

function useProviderPortal() {
  const { request } = useApi();
  const state = useState("provider-state", () => "idle");
  const profile = useState("provider-profile", () => null);
  const error = ref(null);
  async function load() {
    state.value = "loading";
    error.value = null;
    try {
      profile.value = (await request("provider/profile")).data;
      state.value = "ready";
    } catch (e) {
      profile.value = null;
      if (isApiError(e) && (e.code === "provider_account_required" || e.status === 403 && e.code === "forbidden" || e.status === 404)) state.value = "none";
      else {
        state.value = "error";
        error.value = isApiError(e) ? e.message : null;
      }
    }
  }
  return { state, profile, error, load, set: (p) => {
    profile.value = p;
    state.value = p ? "ready" : "none";
  } };
}

export { useProviderPortal as u };
//# sourceMappingURL=useProviderPortal-BfW_CYQw.mjs.map
