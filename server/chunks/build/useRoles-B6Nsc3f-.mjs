import { g as useApi, s as useState } from './server.mjs';
import { ref } from 'vue';

function useRoles() {
  const { request } = useApi();
  const roles = useState("admin-roles", () => null);
  const failed = ref(false);
  const pending = ref(false);
  async function load(force = false) {
    var _a;
    if (roles.value && !force) return;
    pending.value = true;
    failed.value = false;
    try {
      roles.value = (_a = (await request("admin/roles")).data) != null ? _a : [];
    } catch {
      failed.value = true;
    } finally {
      pending.value = false;
    }
  }
  return { roles, failed, pending, load };
}

export { useRoles as u };
//# sourceMappingURL=useRoles-B6Nsc3f-.mjs.map
