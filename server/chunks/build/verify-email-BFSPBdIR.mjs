import { _ as _sfc_main$1 } from './Skeleton-BTnKIEst.mjs';
import { _ as _sfc_main$2 } from './Alert-D-zfMDy5.mjs';
import { u as useI18n, f as useRoute, a as useAuthStore, g as useApi, _ as _sfc_main$3 } from './server.mjs';
import { defineComponent, ref, mergeProps, unref, withCtx, createTextVNode, toDisplayString, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrInterpolate, ssrRenderComponent } from 'vue/server-renderer';
import { u as useSeo } from './useSeo-BU4sLOnV.mjs';
import '../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'node:url';
import '../routes/renderer.mjs';
import 'vue-bundle-renderer/runtime';
import 'unhead/server';
import 'devalue';
import 'unhead/plugins';
import 'unhead/utils';
import 'pinia';
import 'vue-router';
import './safe-B2eSdAXJ.mjs';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "verify-email",
  __ssrInlineRender: true,
  setup(__props) {
    const { t } = useI18n();
    useRoute();
    const auth = useAuthStore();
    useApi();
    useSeo(() => ({ title: t("verify.title"), description: t("verify.subtitle"), noindex: true }));
    const state = ref("working");
    const message = ref("");
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UiSkeleton = _sfc_main$1;
      const _component_UiAlert = _sfc_main$2;
      const _component_UiButton = _sfc_main$3;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "text-center" }, _attrs))}><h1 class="text-2xl font-bold">${ssrInterpolate(unref(t)("verify.title"))}</h1><div class="mt-6" aria-live="polite">`);
      if (unref(state) === "working") {
        _push(`<div class="space-y-3">`);
        _push(ssrRenderComponent(_component_UiSkeleton, { lines: 2 }, null, _parent));
        _push(`<span class="sr-only">${ssrInterpolate(unref(t)("common.loading"))}</span></div>`);
      } else if (unref(state) === "ok") {
        _push(ssrRenderComponent(_component_UiAlert, { tone: "success" }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`${ssrInterpolate(unref(t)("verify.success"))}`);
            } else {
              return [
                createTextVNode(toDisplayString(unref(t)("verify.success")), 1)
              ];
            }
          }),
          _: 1
        }, _parent));
      } else {
        _push(ssrRenderComponent(_component_UiAlert, { tone: "danger" }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`${ssrInterpolate(unref(message))}`);
            } else {
              return [
                createTextVNode(toDisplayString(unref(message)), 1)
              ];
            }
          }),
          _: 1
        }, _parent));
      }
      _push(`</div><div class="mt-6">`);
      if (unref(state) === "ok") {
        _push(ssrRenderComponent(_component_UiButton, {
          to: unref(auth).isAuthenticated ? "/dashboard" : "/login",
          block: ""
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`${ssrInterpolate(unref(auth).isAuthenticated ? unref(t)("landing.cta.dashboard") : unref(t)("auth.login"))}`);
            } else {
              return [
                createTextVNode(toDisplayString(unref(auth).isAuthenticated ? unref(t)("landing.cta.dashboard") : unref(t)("auth.login")), 1)
              ];
            }
          }),
          _: 1
        }, _parent));
      } else if (unref(state) === "error") {
        _push(ssrRenderComponent(_component_UiButton, {
          to: unref(auth).isAuthenticated ? "/dashboard" : "/login",
          variant: "secondary",
          block: ""
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`${ssrInterpolate(unref(auth).isAuthenticated ? unref(t)("verify.resendFromDashboard") : unref(t)("auth.login"))}`);
            } else {
              return [
                createTextVNode(toDisplayString(unref(auth).isAuthenticated ? unref(t)("verify.resendFromDashboard") : unref(t)("auth.login")), 1)
              ];
            }
          }),
          _: 1
        }, _parent));
      } else {
        _push(`<!---->`);
      }
      _push(`</div></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/verify-email.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=verify-email-BFSPBdIR.mjs.map
