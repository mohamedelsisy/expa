import { V as executeAsync } from '../nitro/nitro.mjs';
import { C as defineNuxtRouteMiddleware, a as useAuthStore, n as navigateTo, c as useLocalePath } from './server.mjs';
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

const guest = defineNuxtRouteMiddleware(async () => {
  let __temp, __restore;
  const auth = useAuthStore();
  [__temp, __restore] = executeAsync(() => auth.ensureLoaded()), await __temp, __restore();
  if (auth.isAuthenticated) return navigateTo(useLocalePath()("/dashboard"));
});

export { guest as default };
//# sourceMappingURL=guest-hoJ1pG19.mjs.map
