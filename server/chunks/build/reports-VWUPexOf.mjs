import { u as useAdminSeo, _ as _sfc_main$1 } from './useAdminSeo-DuRYEU0h.mjs';
import { _ as _sfc_main$2 } from './FormField-DFtov8VK.mjs';
import { _ as _sfc_main$3 } from './Select-BjjHKxeN.mjs';
import { _ as _sfc_main$4 } from './Skeleton-BTnKIEst.mjs';
import { u as useI18n, g as useApi, i as _sfc_main$2$1, j as isApiError, z as formatDay, _ as _sfc_main$3$1 } from './server.mjs';
import { _ as _sfc_main$5 } from './EmptyState-N2xvHts8.mjs';
import { _ as _sfc_main$6 } from './Badge-PdKIsny2.mjs';
import { defineComponent, ref, withAsyncContext, unref, withCtx, isRef, createVNode, createTextVNode, toDisplayString, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderList, ssrInterpolate } from 'vue/server-renderer';
import { u as useToast } from './useToast-BX2bodPv.mjs';
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
  __name: "reports",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const { t, locale } = useI18n();
    const { request } = useApi();
    const toast = useToast();
    useAdminSeo(() => t("admin.market.reports"));
    const state = ref("open");
    const { data, error, refresh, status } = ([__temp, __restore] = withAsyncContext(async () => useAsyncData("admin-reports", async () => (await request("admin/marketplace/reports", { query: { status: state.value } })).data, { watch: [state] })), __temp = await __temp, __restore(), __temp);
    const busy = ref(null);
    async function resolve(r, st, rejectReview = false) {
      busy.value = r.id;
      try {
        await request(`admin/marketplace/reports/${r.id}/resolve`, { method: "POST", body: { status: st, ...rejectReview ? { reject_review: true, reason: "report upheld" } : {} } });
        toast.success(t("admin.market.decided"));
        await refresh();
      } catch (e) {
        toast.error(isApiError(e) ? e.message : t("errors.generic"));
      } finally {
        busy.value = null;
      }
    }
    return (_ctx, _push, _parent, _attrs) => {
      var _a;
      const _component_AdminPageHeader = _sfc_main$1;
      const _component_UiFormField = _sfc_main$2;
      const _component_UiSelect = _sfc_main$3;
      const _component_UiSkeleton = _sfc_main$4;
      const _component_UiErrorState = _sfc_main$2$1;
      const _component_UiEmptyState = _sfc_main$5;
      const _component_UiBadge = _sfc_main$6;
      const _component_UiButton = _sfc_main$3$1;
      _push(`<div${ssrRenderAttrs(_attrs)}>`);
      _push(ssrRenderComponent(_component_AdminPageHeader, {
        title: unref(t)("admin.market.reports"),
        description: unref(t)("admin.market.reportsHelp"),
        crumbs: [{ label: unref(t)("admin.title"), to: "/admin" }, { label: unref(t)("admin.market.reports") }]
      }, null, _parent));
      _push(ssrRenderComponent(_component_UiFormField, {
        label: unref(t)("admin.fields.status"),
        class: "mb-6 max-w-xs"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_UiSelect, {
              modelValue: unref(state),
              "onUpdate:modelValue": ($event) => isRef(state) ? state.value = $event : null,
              options: ["open", "resolved", "dismissed"].map((v) => ({ value: v, label: unref(t)(`admin.market.reportState.${v}`) }))
            }, null, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_UiSelect, {
                modelValue: unref(state),
                "onUpdate:modelValue": ($event) => isRef(state) ? state.value = $event : null,
                options: ["open", "resolved", "dismissed"].map((v) => ({ value: v, label: unref(t)(`admin.market.reportState.${v}`) }))
              }, null, 8, ["modelValue", "onUpdate:modelValue", "options"])
            ];
          }
        }),
        _: 1
      }, _parent));
      if (unref(status) === "pending" && !unref(data)) {
        _push(ssrRenderComponent(_component_UiSkeleton, { lines: 5 }, null, _parent));
      } else if (unref(error)) {
        _push(ssrRenderComponent(_component_UiErrorState, {
          message: ("isApiError" in _ctx ? _ctx.isApiError : unref(isApiError))(unref(error)) ? unref(error).message : void 0,
          retry: "",
          onRetry: ($event) => unref(refresh)()
        }, null, _parent));
      } else if (!((_a = unref(data)) == null ? void 0 : _a.length)) {
        _push(ssrRenderComponent(_component_UiEmptyState, {
          title: unref(t)("admin.market.queueEmpty"),
          icon: "check"
        }, null, _parent));
      } else {
        _push(`<ul class="space-y-3"><!--[-->`);
        ssrRenderList(unref(data), (r) => {
          _push(`<li class="space-y-2 rounded-md border border-line bg-surface p-4"><p class="flex flex-wrap items-center gap-2">`);
          _push(ssrRenderComponent(_component_UiBadge, { tone: "warning" }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`${ssrInterpolate(unref(t)(`report.reasons.${r.reason}`))}`);
              } else {
                return [
                  createTextVNode(toDisplayString(unref(t)(`report.reasons.${r.reason}`)), 1)
                ];
              }
            }),
            _: 2
          }, _parent));
          _push(`<span class="text-sm text-muted">${ssrInterpolate(unref(t)("admin.market.reviewNo", { id: r.review_id }))} \xB7 <bdi>${ssrInterpolate(unref(formatDay)(r.created_at, unref(locale)))}</bdi></span></p>`);
          if (r.note) {
            _push(`<p class="text-ink-soft" dir="auto">${ssrInterpolate(r.note)}</p>`);
          } else {
            _push(`<!---->`);
          }
          if (r.status === "open") {
            _push(`<div class="flex flex-wrap gap-2">`);
            _push(ssrRenderComponent(_component_UiButton, {
              loading: unref(busy) === r.id,
              onClick: ($event) => resolve(r, "resolved", true)
            }, {
              default: withCtx((_, _push2, _parent2, _scopeId) => {
                if (_push2) {
                  _push2(`${ssrInterpolate(unref(t)("admin.market.uphold"))}`);
                } else {
                  return [
                    createTextVNode(toDisplayString(unref(t)("admin.market.uphold")), 1)
                  ];
                }
              }),
              _: 2
            }, _parent));
            _push(ssrRenderComponent(_component_UiButton, {
              variant: "secondary",
              loading: unref(busy) === r.id,
              onClick: ($event) => resolve(r, "dismissed")
            }, {
              default: withCtx((_, _push2, _parent2, _scopeId) => {
                if (_push2) {
                  _push2(`${ssrInterpolate(unref(t)("admin.market.dismiss"))}`);
                } else {
                  return [
                    createTextVNode(toDisplayString(unref(t)("admin.market.dismiss")), 1)
                  ];
                }
              }),
              _: 2
            }, _parent));
            _push(`</div>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</li>`);
        });
        _push(`<!--]--></ul>`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/admin/marketplace/reports.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=reports-VWUPexOf.mjs.map
