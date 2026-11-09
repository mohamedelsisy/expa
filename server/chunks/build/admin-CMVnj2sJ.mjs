import { V as executeAsync } from '../nitro/nitro.mjs';
import { h as hasAdminAccess, c as canAny } from './permissions-CcyNKBx7.mjs';
import { p as permsForPath } from './nav-BcPwSH6h.mjs';
import { m as moduleByKey } from './modules-CgmwLVRo.mjs';
import { s as safeRedirect } from './safe-B2eSdAXJ.mjs';
import { C as defineNuxtRouteMiddleware, a as useAuthStore, c as useLocalePath, n as navigateTo, D as useTwoFactorGate, o as createError } from './server.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'node:url';
import 'vue';
import '../routes/renderer.mjs';
import 'vue-bundle-renderer/runtime';
import 'vue/server-renderer';
import 'unhead/server';
import 'devalue';
import 'unhead/plugins';
import 'unhead/utils';
import 'pinia';
import 'vue-router';

const admin = defineNuxtRouteMiddleware(async (to) => {
  let __temp, __restore;
  const auth = useAuthStore();
  [__temp, __restore] = executeAsync(() => auth.ensureLoaded()), await __temp, __restore();
  if (!auth.isAuthenticated) {
    const localePath = useLocalePath();
    return navigateTo(`${localePath("/login")}?redirect=${encodeURIComponent(safeRedirect(to.fullPath, ""))}`);
  }
  const u = auth.user;
  useTwoFactorGate().value = (u == null ? void 0 : u.two_factor_setup_required) === true;
  if (!hasAdminAccess(u)) throw createError({ statusCode: 403, fatal: true });
  const key = to.params.module;
  const mod = moduleByKey(Array.isArray(key) ? key[0] : key);
  if (to.path.includes("/admin/content/") && !mod) throw createError({ statusCode: 404, fatal: true });
  const needed = mod ? [`${mod.permission}.view`] : permsForPath(to.path);
  if (needed.length && !canAny(u, needed)) throw createError({ statusCode: 403, fatal: true });
});

export { admin as default };
//# sourceMappingURL=admin-CMVnj2sJ.mjs.map
