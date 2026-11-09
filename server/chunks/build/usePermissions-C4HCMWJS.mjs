import { computed } from 'vue';
import { a as useAuthStore } from './server.mjs';
import { h as hasAdminAccess, c as canAny, a as can } from './permissions-CcyNKBx7.mjs';

function usePermissions(source) {
  const auth = useAuthStore();
  const subject = () => auth.user;
  return {
    can: (permission) => can(subject(), permission),
    canAny: (permissions) => canAny(subject(), permissions),
    isSuperAdmin: computed(() => {
      var _a;
      return ((_a = subject()) == null ? void 0 : _a.is_super_admin) === true;
    }),
    hasAdminAccess: computed(() => hasAdminAccess(subject())),
    roles: computed(() => {
      var _a, _b;
      return [...(_b = (_a = subject()) == null ? void 0 : _a.roles) != null ? _b : []];
    })
  };
}

export { usePermissions as u };
//# sourceMappingURL=usePermissions-C4HCMWJS.mjs.map
