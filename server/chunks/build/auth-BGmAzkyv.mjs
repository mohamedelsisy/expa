import { V as executeAsync } from '../nitro/nitro.mjs';
import { s as safeRedirect } from './safe-B2eSdAXJ.mjs';
import { C as defineNuxtRouteMiddleware, a as useAuthStore, c as useLocalePath, n as navigateTo } from './server.mjs';
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

const auth = defineNuxtRouteMiddleware(async (to) => {
  let __temp, __restore;
  const auth2 = useAuthStore();
  [__temp, __restore] = executeAsync(() => auth2.ensureLoaded()), await __temp, __restore();
  if (!auth2.isAuthenticated) {
    const localePath = useLocalePath();
    return navigateTo(`${localePath("/login")}?redirect=${encodeURIComponent(safeRedirect(to.fullPath, ""))}`);
  }
});

export { auth as default };
//# sourceMappingURL=auth-BGmAzkyv.mjs.map
