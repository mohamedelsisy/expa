import { u as useAdminSeo, _ as _sfc_main$1 } from './useAdminSeo-DuRYEU0h.mjs';
import { _ as _sfc_main$2 } from './FormField-DFtov8VK.mjs';
import { _ as _sfc_main$3 } from './Select-BjjHKxeN.mjs';
import { _ as _sfc_main$4 } from './Skeleton-BTnKIEst.mjs';
import { u as useI18n, g as useApi, i as _sfc_main$2$1, j as isApiError, z as formatDay, _ as _sfc_main$3$1 } from './server.mjs';
import { _ as _sfc_main$5 } from './EmptyState-N2xvHts8.mjs';
import { _ as _sfc_main$6 } from './Badge-PdKIsny2.mjs';
import { _ as _sfc_main$7 } from './TextInput-BI4efS3_.mjs';
import { _ as _sfc_main$8 } from './Pagination-DA28GIFv.mjs';
import { defineComponent, ref, withAsyncContext, computed, reactive, unref, withCtx, createVNode, createTextVNode, toDisplayString, useSSRContext } from 'vue';
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
  __name: "reviews",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const { t, locale } = useI18n();
    const { request } = useApi();
    const toast = useToast();
    useAdminSeo(() => t("admin.market.reviews"));
    const state = ref("pending");
    const page = ref(1);
    const { data, error, refresh, status } = ([__temp, __restore] = withAsyncContext(() => useAsyncData("admin-reviews", () => request("admin/marketplace/reviews", { query: { status: state.value, page: page.value, per_page: 20 } }), { watch: [state, page] })), __temp = await __temp, __restore(), __temp);
    const rows = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.data) != null ? _b : [];
    });
    const reason = reactive({});
    const busy = ref(null);
    const states = ["pending", "approved", "rejected", "reply_pending"];
    async function review(r, decision) {
      var _a;
      if (decision === "rejected" && !((_a = reason[r.id]) != null ? _a : "").trim()) {
        toast.error(t("admin.market.reasonRequired"));
        return;
      }
      busy.value = r.id;
      try {
        await request(`admin/marketplace/reviews/${r.id}/moderate`, { method: "POST", body: { decision, ...decision === "rejected" ? { reason: reason[r.id].trim() } : {} } });
        toast.success(t("admin.market.decided"));
        await refresh();
      } catch (e) {
        toast.error(isApiError(e) ? e.message : t("errors.generic"));
      } finally {
        busy.value = null;
      }
    }
    async function reply(r, decision) {
      busy.value = r.id;
      try {
        await request(`admin/marketplace/reviews/${r.id}/reply-moderate`, { method: "POST", body: { decision } });
        toast.success(t("admin.market.decided"));
        await refresh();
      } catch (e) {
        toast.error(isApiError(e) ? e.message : t("errors.generic"));
      } finally {
        busy.value = null;
      }
    }
    return (_ctx, _push, _parent, _attrs) => {
      var _a, _b, _c, _d;
      const _component_AdminPageHeader = _sfc_main$1;
      const _component_UiFormField = _sfc_main$2;
      const _component_UiSelect = _sfc_main$3;
      const _component_UiSkeleton = _sfc_main$4;
      const _component_UiErrorState = _sfc_main$2$1;
      const _component_UiEmptyState = _sfc_main$5;
      const _component_UiBadge = _sfc_main$6;
      const _component_UiTextInput = _sfc_main$7;
      const _component_UiButton = _sfc_main$3$1;
      const _component_UiPagination = _sfc_main$8;
      _push(`<div${ssrRenderAttrs(_attrs)}>`);
      _push(ssrRenderComponent(_component_AdminPageHeader, {
        title: unref(t)("admin.market.reviews"),
        description: unref(t)("admin.market.reviewsHelp"),
        crumbs: [{ label: unref(t)("admin.title"), to: "/admin" }, { label: unref(t)("admin.market.reviews") }]
      }, null, _parent));
      _push(ssrRenderComponent(_component_UiFormField, {
        label: unref(t)("admin.fields.status"),
        class: "mb-6 max-w-xs"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_UiSelect, {
              "model-value": unref(state),
              options: states.map((v) => ({ value: v, label: unref(t)(`admin.market.reviewState.${v}`) })),
              "onUpdate:modelValue": ($event) => {
                state.value = $event;
                page.value = 1;
              }
            }, null, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_UiSelect, {
                "model-value": unref(state),
                options: states.map((v) => ({ value: v, label: unref(t)(`admin.market.reviewState.${v}`) })),
                "onUpdate:modelValue": ($event) => {
                  state.value = $event;
                  page.value = 1;
                }
              }, null, 8, ["model-value", "options", "onUpdate:modelValue"])
            ];
          }
        }),
        _: 1
      }, _parent));
      if (unref(status) === "pending" && !unref(data)) {
        _push(ssrRenderComponent(_component_UiSkeleton, { lines: 6 }, null, _parent));
      } else if (unref(error)) {
        _push(ssrRenderComponent(_component_UiErrorState, {
          message: ("isApiError" in _ctx ? _ctx.isApiError : unref(isApiError))(unref(error)) ? unref(error).message : void 0,
          retry: "",
          onRetry: ($event) => unref(refresh)()
        }, null, _parent));
      } else if (!unref(rows).length) {
        _push(ssrRenderComponent(_component_UiEmptyState, {
          title: unref(t)("admin.market.queueEmpty"),
          icon: "check"
        }, null, _parent));
      } else {
        _push(`<!--[--><ul class="space-y-3"><!--[-->`);
        ssrRenderList(unref(rows), (r) => {
          _push(`<li class="space-y-2 rounded-md border border-line bg-surface p-4"><p class="flex flex-wrap items-center gap-2"><span class="font-semibold" dir="auto">${ssrInterpolate(r.provider.display_name)}</span><span class="tabular-nums"><bdi>${ssrInterpolate(unref(t)("services.review.outOf", { rating: r.rating }))}</bdi></span>`);
          if (r.open_reports) {
            _push(ssrRenderComponent(_component_UiBadge, { tone: "warning" }, {
              default: withCtx((_, _push2, _parent2, _scopeId) => {
                if (_push2) {
                  _push2(`${ssrInterpolate(unref(t)("admin.market.reportsOpen", { count: r.open_reports }))}`);
                } else {
                  return [
                    createTextVNode(toDisplayString(unref(t)("admin.market.reportsOpen", { count: r.open_reports })), 1)
                  ];
                }
              }),
              _: 2
            }, _parent));
          } else {
            _push(`<!---->`);
          }
          _push(`<span class="text-sm text-muted"><bdi>${ssrInterpolate(unref(formatDay)(r.created_at, unref(locale)))}</bdi></span></p>`);
          if (r.body) {
            _push(`<p class="prose-plain" dir="auto">${ssrInterpolate(r.body)}</p>`);
          } else {
            _push(`<!---->`);
          }
          if (r.reply) {
            _push(`<p class="rounded-md bg-sunken p-2 text-sm" dir="auto"><span class="font-semibold">${ssrInterpolate(unref(t)("services.review.reply"))} (${ssrInterpolate(r.reply_status)}):</span> ${ssrInterpolate(r.reply)}</p>`);
          } else {
            _push(`<!---->`);
          }
          if (unref(state) === "pending") {
            _push(`<div class="space-y-2">`);
            _push(ssrRenderComponent(_component_UiFormField, {
              label: unref(t)("admin.market.rejectReason"),
              optional: ""
            }, {
              default: withCtx((_, _push2, _parent2, _scopeId) => {
                if (_push2) {
                  _push2(ssrRenderComponent(_component_UiTextInput, {
                    modelValue: unref(reason)[r.id],
                    "onUpdate:modelValue": ($event) => unref(reason)[r.id] = $event,
                    maxlength: 255
                  }, null, _parent2, _scopeId));
                } else {
                  return [
                    createVNode(_component_UiTextInput, {
                      modelValue: unref(reason)[r.id],
                      "onUpdate:modelValue": ($event) => unref(reason)[r.id] = $event,
                      maxlength: 255
                    }, null, 8, ["modelValue", "onUpdate:modelValue"])
                  ];
                }
              }),
              _: 2
            }, _parent));
            _push(`<div class="flex gap-2">`);
            _push(ssrRenderComponent(_component_UiButton, {
              loading: unref(busy) === r.id,
              onClick: ($event) => review(r, "approved")
            }, {
              default: withCtx((_, _push2, _parent2, _scopeId) => {
                if (_push2) {
                  _push2(`${ssrInterpolate(unref(t)("admin.market.approve"))}`);
                } else {
                  return [
                    createTextVNode(toDisplayString(unref(t)("admin.market.approve")), 1)
                  ];
                }
              }),
              _: 2
            }, _parent));
            _push(ssrRenderComponent(_component_UiButton, {
              variant: "secondary",
              loading: unref(busy) === r.id,
              onClick: ($event) => review(r, "rejected")
            }, {
              default: withCtx((_, _push2, _parent2, _scopeId) => {
                if (_push2) {
                  _push2(`${ssrInterpolate(unref(t)("admin.market.reject"))}`);
                } else {
                  return [
                    createTextVNode(toDisplayString(unref(t)("admin.market.reject")), 1)
                  ];
                }
              }),
              _: 2
            }, _parent));
            _push(`</div></div>`);
          } else if (unref(state) === "reply_pending") {
            _push(`<div class="flex gap-2">`);
            _push(ssrRenderComponent(_component_UiButton, {
              loading: unref(busy) === r.id,
              onClick: ($event) => reply(r, "approved")
            }, {
              default: withCtx((_, _push2, _parent2, _scopeId) => {
                if (_push2) {
                  _push2(`${ssrInterpolate(unref(t)("admin.market.approveReply"))}`);
                } else {
                  return [
                    createTextVNode(toDisplayString(unref(t)("admin.market.approveReply")), 1)
                  ];
                }
              }),
              _: 2
            }, _parent));
            _push(ssrRenderComponent(_component_UiButton, {
              variant: "secondary",
              loading: unref(busy) === r.id,
              onClick: ($event) => reply(r, "rejected")
            }, {
              default: withCtx((_, _push2, _parent2, _scopeId) => {
                if (_push2) {
                  _push2(`${ssrInterpolate(unref(t)("admin.market.rejectReply"))}`);
                } else {
                  return [
                    createTextVNode(toDisplayString(unref(t)("admin.market.rejectReply")), 1)
                  ];
                }
              }),
              _: 2
            }, _parent));
            _push(`</div>`);
          } else if (r.moderation_reason) {
            _push(`<p class="text-sm text-muted">${ssrInterpolate(unref(t)("services.mine.reason", { reason: r.moderation_reason }))}</p>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</li>`);
        });
        _push(`<!--]--></ul><div class="mt-6">`);
        _push(ssrRenderComponent(_component_UiPagination, {
          page: (_b = (_a = unref(data)) == null ? void 0 : _a.meta.page) != null ? _b : 1,
          "last-page": (_d = (_c = unref(data)) == null ? void 0 : _c.meta.last_page) != null ? _d : 1,
          onChange: ($event) => page.value = $event
        }, null, _parent));
        _push(`</div><!--]-->`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/admin/marketplace/reviews.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=reviews-BZwMlmuL.mjs.map
