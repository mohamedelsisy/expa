import { u as useAdminSeo, _ as _sfc_main$1 } from './useAdminSeo-DuRYEU0h.mjs';
import { _ as _sfc_main$2 } from './Alert-D-zfMDy5.mjs';
import { _ as _sfc_main$3 } from './FormField-DFtov8VK.mjs';
import { _ as _sfc_main$4 } from './Select-BjjHKxeN.mjs';
import { _ as _sfc_main$5 } from './Skeleton-BTnKIEst.mjs';
import { u as useI18n, g as useApi, j as isApiError, i as _sfc_main$2$1, z as formatDay, _ as _sfc_main$3$1 } from './server.mjs';
import { _ as _sfc_main$6 } from './EmptyState-N2xvHts8.mjs';
import { _ as _sfc_main$7 } from './Badge-PdKIsny2.mjs';
import { _ as _sfc_main$8 } from './TextInput-BI4efS3_.mjs';
import { _ as _sfc_main$9 } from './Pagination-DA28GIFv.mjs';
import { defineComponent, ref, withAsyncContext, computed, reactive, unref, withCtx, createTextVNode, toDisplayString, createVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderList } from 'vue/server-renderer';
import { u as useToast } from './useToast-BX2bodPv.mjs';
import { u as usePermissions } from './usePermissions-C4HCMWJS.mjs';
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
import './permissions-CcyNKBx7.mjs';
import 'perfect-debounce';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "index",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const { t, locale } = useI18n();
    const { request } = useApi();
    const toast = useToast();
    const { can } = usePermissions();
    useAdminSeo(() => t("admin.community.title"));
    const type = ref("question");
    const state = ref("pending");
    const page = ref(1);
    const { data, error, refresh, status } = ([__temp, __restore] = withAsyncContext(() => useAsyncData("admin-community", () => request("admin/community/queue", { query: { type: type.value, status: state.value, page: page.value, per_page: 20 } }), { watch: [type, state, page] })), __temp = await __temp, __restore(), __temp);
    const { data: reports, refresh: refreshReports } = ([__temp, __restore] = withAsyncContext(async () => useAsyncData("admin-community-reports", async () => {
      try {
        return (await request("admin/community/reports")).data;
      } catch {
        return [];
      }
    })), __temp = await __temp, __restore(), __temp);
    const disabled = computed(() => isApiError(error.value) && error.value.status === 404);
    const rows = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.data) != null ? _b : [];
    });
    const reason = reactive({});
    const busy = ref(null);
    async function moderate(r, action) {
      var _a;
      const key = `${r.type}${r.id}`;
      if (action !== "approve" && !((_a = reason[key]) != null ? _a : "").trim()) {
        toast.error(t("admin.market.reasonRequired"));
        return;
      }
      busy.value = key;
      try {
        await request(`admin/community/${r.type}/${r.id}/moderate`, { method: "POST", body: { action, ...action !== "approve" ? { reason: reason[key].trim() } : {} } });
        toast.success(t("admin.market.decided"));
        await refresh();
      } catch (e) {
        toast.error(isApiError(e) ? e.message : t("errors.generic"));
      } finally {
        busy.value = null;
      }
    }
    async function resolve(r, st) {
      busy.value = `r${r.id}`;
      try {
        await request(`admin/community/reports/${r.id}/resolve`, { method: "POST", body: { status: st } });
        toast.success(t("admin.market.decided"));
        await refreshReports();
      } catch (e) {
        toast.error(isApiError(e) ? e.message : t("errors.generic"));
      } finally {
        busy.value = null;
      }
    }
    return (_ctx, _push, _parent, _attrs) => {
      var _a, _b, _c, _d, _e;
      const _component_AdminPageHeader = _sfc_main$1;
      const _component_UiAlert = _sfc_main$2;
      const _component_UiFormField = _sfc_main$3;
      const _component_UiSelect = _sfc_main$4;
      const _component_UiSkeleton = _sfc_main$5;
      const _component_UiErrorState = _sfc_main$2$1;
      const _component_UiEmptyState = _sfc_main$6;
      const _component_UiBadge = _sfc_main$7;
      const _component_UiTextInput = _sfc_main$8;
      const _component_UiButton = _sfc_main$3$1;
      const _component_UiPagination = _sfc_main$9;
      _push(`<div${ssrRenderAttrs(_attrs)}>`);
      _push(ssrRenderComponent(_component_AdminPageHeader, {
        title: unref(t)("admin.community.title"),
        description: unref(t)("admin.community.help"),
        crumbs: [{ label: unref(t)("admin.title"), to: "/admin" }, { label: unref(t)("admin.community.title") }]
      }, null, _parent));
      if (unref(disabled)) {
        _push(ssrRenderComponent(_component_UiAlert, {
          tone: "info",
          "data-testid": "community-off"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`${ssrInterpolate(unref(t)("admin.community.off"))}`);
            } else {
              return [
                createTextVNode(toDisplayString(unref(t)("admin.community.off")), 1)
              ];
            }
          }),
          _: 1
        }, _parent));
      } else {
        _push(`<!--[--><div class="mb-6 grid gap-4 sm:grid-cols-2">`);
        _push(ssrRenderComponent(_component_UiFormField, {
          label: unref(t)("admin.community.type")
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_UiSelect, {
                "model-value": unref(type),
                options: ["question", "answer", "comment"].map((v) => ({ value: v, label: unref(t)(`admin.community.types.${v}`) })),
                "onUpdate:modelValue": ($event) => {
                  type.value = $event;
                  page.value = 1;
                }
              }, null, _parent2, _scopeId));
            } else {
              return [
                createVNode(_component_UiSelect, {
                  "model-value": unref(type),
                  options: ["question", "answer", "comment"].map((v) => ({ value: v, label: unref(t)(`admin.community.types.${v}`) })),
                  "onUpdate:modelValue": ($event) => {
                    type.value = $event;
                    page.value = 1;
                  }
                }, null, 8, ["model-value", "options", "onUpdate:modelValue"])
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(ssrRenderComponent(_component_UiFormField, {
          label: unref(t)("admin.fields.status")
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_UiSelect, {
                "model-value": unref(state),
                options: ["pending", "approved", "hidden", "removed"].map((v) => ({ value: v, label: unref(t)(`admin.community.states.${v}`) })),
                "onUpdate:modelValue": ($event) => {
                  state.value = $event;
                  page.value = 1;
                }
              }, null, _parent2, _scopeId));
            } else {
              return [
                createVNode(_component_UiSelect, {
                  "model-value": unref(state),
                  options: ["pending", "approved", "hidden", "removed"].map((v) => ({ value: v, label: unref(t)(`admin.community.states.${v}`) })),
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
        _push(`</div>`);
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
          _push(`<ul class="space-y-3"><!--[-->`);
          ssrRenderList(unref(rows), (r) => {
            _push(`<li class="space-y-2 rounded-md border border-line bg-surface p-4"><p class="flex flex-wrap items-center gap-2">`);
            if (r.flagged) {
              _push(ssrRenderComponent(_component_UiBadge, { tone: "warning" }, {
                default: withCtx((_, _push2, _parent2, _scopeId) => {
                  if (_push2) {
                    _push2(`${ssrInterpolate(unref(t)("admin.community.flagged"))}`);
                  } else {
                    return [
                      createTextVNode(toDisplayString(unref(t)("admin.community.flagged")), 1)
                    ];
                  }
                }),
                _: 2
              }, _parent));
            } else {
              _push(`<!---->`);
            }
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
            _push(`<span class="text-sm text-muted">${ssrInterpolate(unref(t)("admin.community.author", { id: r.author_id }))} \xB7 <bdi>${ssrInterpolate(unref(formatDay)(r.created_at, unref(locale)))}</bdi></span></p>`);
            if (r.title) {
              _push(`<p class="font-semibold" dir="auto">${ssrInterpolate(r.title)}</p>`);
            } else {
              _push(`<!---->`);
            }
            _push(`<p class="prose-plain" dir="auto">${ssrInterpolate(r.body)}</p>`);
            if (unref(can)("community.moderate")) {
              _push(`<div class="space-y-2">`);
              _push(ssrRenderComponent(_component_UiFormField, {
                label: unref(t)("admin.market.rejectReason"),
                optional: ""
              }, {
                default: withCtx((_, _push2, _parent2, _scopeId) => {
                  if (_push2) {
                    _push2(ssrRenderComponent(_component_UiTextInput, {
                      modelValue: unref(reason)[`${r.type}${r.id}`],
                      "onUpdate:modelValue": ($event) => unref(reason)[`${r.type}${r.id}`] = $event,
                      maxlength: 255
                    }, null, _parent2, _scopeId));
                  } else {
                    return [
                      createVNode(_component_UiTextInput, {
                        modelValue: unref(reason)[`${r.type}${r.id}`],
                        "onUpdate:modelValue": ($event) => unref(reason)[`${r.type}${r.id}`] = $event,
                        maxlength: 255
                      }, null, 8, ["modelValue", "onUpdate:modelValue"])
                    ];
                  }
                }),
                _: 2
              }, _parent));
              _push(`<div class="flex flex-wrap gap-2">`);
              _push(ssrRenderComponent(_component_UiButton, {
                loading: unref(busy) === `${r.type}${r.id}`,
                onClick: ($event) => moderate(r, "approve")
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
                loading: unref(busy) === `${r.type}${r.id}`,
                onClick: ($event) => moderate(r, "hide")
              }, {
                default: withCtx((_, _push2, _parent2, _scopeId) => {
                  if (_push2) {
                    _push2(`${ssrInterpolate(unref(t)("admin.community.hide"))}`);
                  } else {
                    return [
                      createTextVNode(toDisplayString(unref(t)("admin.community.hide")), 1)
                    ];
                  }
                }),
                _: 2
              }, _parent));
              _push(ssrRenderComponent(_component_UiButton, {
                variant: "ghost",
                loading: unref(busy) === `${r.type}${r.id}`,
                onClick: ($event) => moderate(r, "remove")
              }, {
                default: withCtx((_, _push2, _parent2, _scopeId) => {
                  if (_push2) {
                    _push2(`${ssrInterpolate(unref(t)("admin.community.remove"))}`);
                  } else {
                    return [
                      createTextVNode(toDisplayString(unref(t)("admin.community.remove")), 1)
                    ];
                  }
                }),
                _: 2
              }, _parent));
              _push(`</div></div>`);
            } else {
              _push(`<!---->`);
            }
            _push(`</li>`);
          });
          _push(`<!--]--></ul>`);
        }
        _push(`<div class="mt-6">`);
        _push(ssrRenderComponent(_component_UiPagination, {
          page: (_b = (_a = unref(data)) == null ? void 0 : _a.meta.page) != null ? _b : 1,
          "last-page": (_d = (_c = unref(data)) == null ? void 0 : _c.meta.last_page) != null ? _d : 1,
          onChange: ($event) => page.value = $event
        }, null, _parent));
        _push(`</div><section aria-labelledby="cr-h" class="mt-10 space-y-3"><h2 id="cr-h" class="text-xl font-bold">${ssrInterpolate(unref(t)("admin.community.reports"))}</h2>`);
        if (!((_e = unref(reports)) == null ? void 0 : _e.length)) {
          _push(`<p class="text-muted">${ssrInterpolate(unref(t)("admin.market.queueEmpty"))}</p>`);
        } else {
          _push(`<ul class="space-y-2"><!--[-->`);
          ssrRenderList(unref(reports), (r) => {
            _push(`<li class="flex flex-wrap items-center justify-between gap-2 rounded-md border border-line bg-surface p-3"><p>`);
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
            _push(` <span class="text-sm text-muted">${ssrInterpolate(unref(t)(`admin.community.types.${r.type}`))} #${ssrInterpolate(r.target_id)}</span>`);
            if (r.note) {
              _push(`<span class="ms-2 text-sm" dir="auto">${ssrInterpolate(r.note)}</span>`);
            } else {
              _push(`<!---->`);
            }
            _push(`</p><div class="flex gap-2">`);
            _push(ssrRenderComponent(_component_UiButton, {
              variant: "secondary",
              loading: unref(busy) === `r${r.id}`,
              onClick: ($event) => resolve(r, "resolved")
            }, {
              default: withCtx((_, _push2, _parent2, _scopeId) => {
                if (_push2) {
                  _push2(`${ssrInterpolate(unref(t)("admin.community.resolve"))}`);
                } else {
                  return [
                    createTextVNode(toDisplayString(unref(t)("admin.community.resolve")), 1)
                  ];
                }
              }),
              _: 2
            }, _parent));
            _push(ssrRenderComponent(_component_UiButton, {
              variant: "ghost",
              loading: unref(busy) === `r${r.id}`,
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
            _push(`</div></li>`);
          });
          _push(`<!--]--></ul>`);
        }
        _push(`</section><!--]-->`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/admin/community/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=index-B5aquZy4.mjs.map
