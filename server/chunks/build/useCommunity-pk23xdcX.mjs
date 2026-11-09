import { g as useApi, s as useState, j as isApiError } from './server.mjs';
import { computed } from 'vue';

function useCommunityMeta() {
  const { request } = useApi();
  const state = useState("community-meta", () => ({ checked: false, meta: null }));
  async function load(force = false) {
    if (state.value.checked && !force) return state.value.meta;
    try {
      const res = await request("community/meta", { handle401: false });
      state.value = { checked: true, meta: res.data };
    } catch (e) {
      state.value = { checked: isApiError(e) && e.status === 404, meta: null };
    }
    return state.value.meta;
  }
  return { meta: computed(() => state.value.meta), enabled: computed(() => state.value.meta !== null), load };
}

export { useCommunityMeta as u };
//# sourceMappingURL=useCommunity-pk23xdcX.mjs.map
