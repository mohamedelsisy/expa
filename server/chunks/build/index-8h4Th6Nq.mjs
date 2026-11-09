import { u as useAdminSeo, _ as _sfc_main$1 } from './useAdminSeo-DuRYEU0h.mjs';
import { _ as _sfc_main$2 } from './Alert-D-zfMDy5.mjs';
import { _ as _sfc_main$3 } from './Card-BxvVO_-_.mjs';
import { _ as _sfc_main$4 } from './Skeleton-BTnKIEst.mjs';
import { u as useI18n, g as useApi, i as _sfc_main$2$1, j as isApiError } from './server.mjs';
import { defineComponent, withAsyncContext, computed, unref, withCtx, createTextVNode, toDisplayString, createVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderList, ssrRenderAttr } from 'vue/server-renderer';
import { u as useAsyncData } from './asyncData-bKJD5Wmv.mjs';
import './Breadcrumbs-C7SaJcTR.mjs';
import './useSeo-BU4sLOnV.mjs';
import './safe-B2eSdAXJ.mjs';
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
import 'perfect-debounce';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "index",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const { t } = useI18n();
    const { request } = useApi();
    useAdminSeo(() => t("admin.settings.title"));
    const { data, error, refresh, status: st } = ([__temp, __restore] = withAsyncContext(() => useAsyncData("admin-settings", () => request("admin/settings"))), __temp = await __temp, __restore(), __temp);
    function entries(obj) {
      if (!obj || typeof obj !== "object") return [];
      return Object.entries(obj).map(([key, v]) => ({
        key,
        value: typeof v === "boolean" ? t(v ? "admin.common.true" : "admin.common.false") : Array.isArray(v) ? v.join(", ") : v !== null && typeof v === "object" ? JSON.stringify(v) : String(v != null ? v : "\u2014")
      }));
    }
    const sections = computed(() => {
      var _a, _b;
      return Object.entries((_b = (_a = data.value) == null ? void 0 : _a.data) != null ? _b : {}).map(([key, v]) => v !== null && typeof v === "object" && !Array.isArray(v) ? { key, rows: entries(v) } : { key: "general", rows: [{ key, value: typeof v === "boolean" ? t(v ? "admin.common.true" : "admin.common.false") : Array.isArray(v) ? v.join(", ") : String(v != null ? v : "\u2014") }] }).reduce((acc, s) => {
        const hit = acc.find((a) => a.key === s.key);
        if (hit) hit.rows.push(...s.rows);
        else acc.push(s);
        return acc;
      }, []);
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_AdminPageHeader = _sfc_main$1;
      const _component_UiAlert = _sfc_main$2;
      const _component_UiCard = _sfc_main$3;
      const _component_UiSkeleton = _sfc_main$4;
      const _component_UiErrorState = _sfc_main$2$1;
      _push(`<div${ssrRenderAttrs(_attrs)}>`);
      _push(ssrRenderComponent(_component_AdminPageHeader, {
        title: unref(t)("admin.settings.title"),
        description: unref(t)("admin.settings.help"),
        crumbs: [{ label: unref(t)("admin.title"), to: "/admin" }, { label: unref(t)("admin.settings.title") }]
      }, null, _parent));
      _push(ssrRenderComponent(_component_UiAlert, {
        tone: "info",
        class: "mb-6",
        "data-testid": "settings-readonly"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`${ssrInterpolate(unref(t)("admin.settings.readonly"))}`);
          } else {
            return [
              createTextVNode(toDisplayString(unref(t)("admin.settings.readonly")), 1)
            ];
          }
        }),
        _: 1
      }, _parent));
      if (unref(st) === "pending" && !unref(data)) {
        _push(`<ul aria-busy="true"><li>`);
        _push(ssrRenderComponent(_component_UiCard, null, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_UiSkeleton, { lines: 6 }, null, _parent2, _scopeId));
            } else {
              return [
                createVNode(_component_UiSkeleton, { lines: 6 })
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</li></ul>`);
      } else if (unref(error)) {
        _push(ssrRenderComponent(_component_UiErrorState, {
          message: unref(isApiError)(unref(error)) ? unref(error).message : void 0,
          retry: "",
          onRetry: ($event) => unref(refresh)()
        }, null, _parent));
      } else {
        _push(`<div class="grid gap-6 lg:grid-cols-2"><!--[-->`);
        ssrRenderList(unref(sections), (s) => {
          _push(`<section${ssrRenderAttr("aria-labelledby", `set-${s.key}`)} class="rounded-lg border border-line bg-surface p-4"><h2${ssrRenderAttr("id", `set-${s.key}`)} class="mb-3 text-lg font-bold">${ssrInterpolate(unref(t)(`admin.settings.sections.${s.key}`))}</h2><dl class="grid grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] gap-x-4 gap-y-2 text-sm"><!--[-->`);
          ssrRenderList(s.rows, (r) => {
            _push(`<!--[--><dt class="break-words text-ink-soft" dir="ltr">${ssrInterpolate(r.key)}</dt><dd class="break-words font-medium" dir="auto">${ssrInterpolate(r.value)}</dd><!--]-->`);
          });
          _push(`<!--]--></dl></section>`);
        });
        _push(`<!--]--></div>`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/admin/settings/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=index-8h4Th6Nq.mjs.map
