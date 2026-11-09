import { u as useAdminSeo, _ as _sfc_main$1 } from './useAdminSeo-DuRYEU0h.mjs';
import { _ as _sfc_main$2 } from './Skeleton-BTnKIEst.mjs';
import { u as useI18n, g as useApi, i as _sfc_main$2$1, j as isApiError, _ as _sfc_main$3$1, z as formatDay, d as _sfc_main$5, l as fieldErrors } from './server.mjs';
import { _ as _sfc_main$3 } from './Badge-PdKIsny2.mjs';
import { _ as _sfc_main$4 } from './Alert-D-zfMDy5.mjs';
import { _ as _sfc_main$6 } from './FormField-DFtov8VK.mjs';
import { _ as _sfc_main$7 } from './Textarea-C8QsGxT0.mjs';
import { _ as _sfc_main$8 } from './TextInput-BI4efS3_.mjs';
import { defineComponent, withAsyncContext, ref, reactive, computed, unref, withCtx, createTextVNode, toDisplayString, createVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderList, ssrRenderAttr, ssrInterpolate } from 'vue/server-renderer';
import { f as formatBytes } from './documents-DL9ve8rH.mjs';
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
  __name: "verification",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const { t, locale } = useI18n();
    const { request, download } = useApi();
    const toast = useToast();
    useAdminSeo(() => t("admin.market.verification"));
    const { data, error, refresh, status } = ([__temp, __restore] = withAsyncContext(async () => useAsyncData("admin-verification", async () => (await request("admin/marketplace/verification-queue")).data)), __temp = await __temp, __restore(), __temp);
    const open = ref(null);
    const evidence = ref([]);
    const evError = ref("");
    const form = reactive({ basis: "", expires_at: "", reason: "" });
    const errs = ref({});
    const busy = ref(false);
    async function openRow(r) {
      open.value = r.id;
      Object.assign(form, { basis: "", expires_at: "", reason: "" });
      errs.value = {};
      evidence.value = [];
      evError.value = "";
      try {
        evidence.value = (await request(`admin/marketplace/providers/${r.id}/evidence`)).data;
      } catch (e) {
        evError.value = isApiError(e) ? e.message : t("errors.generic");
      }
    }
    async function getDoc(id, d) {
      try {
        const blob = await download(`admin/marketplace/providers/${id}/evidence/${d.id}`);
        const url = URL.createObjectURL(blob);
        const a = (void 0).createElement("a");
        a.href = url;
        a.download = d.original_name;
        a.rel = "noopener";
        (void 0).body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1e4);
      } catch (e) {
        toast.error(isApiError(e) ? e.message : t("errors.generic"));
      }
    }
    async function decide(id, action) {
      errs.value = {};
      if (action === "approve" && form.basis.trim().length < 10) {
        errs.value.basis = t("admin.market.basisRequired");
        return;
      }
      if (action === "reject" && !form.reason.trim()) {
        errs.value.reason = t("admin.market.reasonRequired");
        return;
      }
      busy.value = true;
      try {
        await request(`admin/marketplace/providers/${id}/verification`, { method: "POST", body: action === "approve" ? { action, basis: form.basis.trim(), ...form.expires_at ? { expires_at: form.expires_at } : {} } : { action, reason: form.reason.trim() } });
        toast.success(t("admin.market.decided"));
        open.value = null;
        await refresh();
      } catch (e) {
        errs.value = fieldErrors(e);
        if (!Object.keys(errs.value).length) toast.error(isApiError(e) ? e.message : t("errors.generic"));
      } finally {
        busy.value = false;
      }
    }
    const groups = computed(() => {
      var _a, _b, _c, _d;
      return [{ key: "pending", rows: (_b = (_a = data.value) == null ? void 0 : _a.pending) != null ? _b : [] }, { key: "expiring", rows: (_d = (_c = data.value) == null ? void 0 : _c.expiring) != null ? _d : [] }];
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_AdminPageHeader = _sfc_main$1;
      const _component_UiSkeleton = _sfc_main$2;
      const _component_UiErrorState = _sfc_main$2$1;
      const _component_UiBadge = _sfc_main$3;
      const _component_UiButton = _sfc_main$3$1;
      const _component_UiAlert = _sfc_main$4;
      const _component_UiIcon = _sfc_main$5;
      const _component_UiFormField = _sfc_main$6;
      const _component_UiTextarea = _sfc_main$7;
      const _component_UiTextInput = _sfc_main$8;
      _push(`<div${ssrRenderAttrs(_attrs)}>`);
      _push(ssrRenderComponent(_component_AdminPageHeader, {
        title: unref(t)("admin.market.verification"),
        description: unref(t)("admin.market.verificationHelp"),
        crumbs: [{ label: unref(t)("admin.title"), to: "/admin" }, { label: unref(t)("admin.market.verification") }]
      }, null, _parent));
      if (unref(status) === "pending" && !unref(data)) {
        _push(ssrRenderComponent(_component_UiSkeleton, { lines: 6 }, null, _parent));
      } else if (unref(error)) {
        _push(ssrRenderComponent(_component_UiErrorState, {
          message: ("isApiError" in _ctx ? _ctx.isApiError : unref(isApiError))(unref(error)) ? unref(error).message : void 0,
          retry: "",
          onRetry: ($event) => unref(refresh)()
        }, null, _parent));
      } else {
        _push(`<div class="space-y-8"><!--[-->`);
        ssrRenderList(unref(groups), (g) => {
          _push(`<section${ssrRenderAttr("aria-labelledby", `vq-${g.key}`)} class="space-y-3"><h2${ssrRenderAttr("id", `vq-${g.key}`)} class="text-xl font-bold">${ssrInterpolate(unref(t)(`admin.market.queue.${g.key}`))}</h2>`);
          if (!g.rows.length) {
            _push(`<p class="text-muted">${ssrInterpolate(unref(t)("admin.market.queueEmpty"))}</p>`);
          } else {
            _push(`<ul class="space-y-3"><!--[-->`);
            ssrRenderList(g.rows, (r) => {
              _push(`<li class="space-y-3 rounded-md border border-line bg-surface p-4"><div class="flex flex-wrap items-center justify-between gap-2"><p class="font-semibold" dir="auto">${ssrInterpolate(r.display_name)} `);
              _push(ssrRenderComponent(_component_UiBadge, null, {
                default: withCtx((_, _push2, _parent2, _scopeId) => {
                  if (_push2) {
                    _push2(`${ssrInterpolate(r.category)}`);
                  } else {
                    return [
                      createTextVNode(toDisplayString(r.category), 1)
                    ];
                  }
                }),
                _: 2
              }, _parent));
              _push(`</p>`);
              _push(ssrRenderComponent(_component_UiButton, {
                variant: "secondary",
                "aria-expanded": unref(open) === r.id,
                onClick: ($event) => unref(open) === r.id ? open.value = null : openRow(r)
              }, {
                default: withCtx((_, _push2, _parent2, _scopeId) => {
                  if (_push2) {
                    _push2(`${ssrInterpolate(unref(t)("admin.market.review"))}`);
                  } else {
                    return [
                      createTextVNode(toDisplayString(unref(t)("admin.market.review")), 1)
                    ];
                  }
                }),
                _: 2
              }, _parent));
              _push(`</div><p class="text-sm text-muted">`);
              if (r.verification_requested_at) {
                _push(`<!--[-->${ssrInterpolate(unref(t)("admin.market.requested", { date: unref(formatDay)(r.verification_requested_at, unref(locale)) }))}<!--]-->`);
              } else {
                _push(`<!---->`);
              }
              if (r.verification_expires_at) {
                _push(`<!--[--> \xB7 ${ssrInterpolate(unref(t)("admin.market.expires", { date: unref(formatDay)(r.verification_expires_at, unref(locale)) }))}<!--]-->`);
              } else {
                _push(`<!---->`);
              }
              _push(`</p>`);
              if (unref(open) === r.id) {
                _push(`<div class="space-y-3 border-t border-line pt-3"><p class="text-sm text-ink-soft">${ssrInterpolate(unref(t)("admin.market.evidenceNote"))}</p>`);
                if (unref(evError)) {
                  _push(ssrRenderComponent(_component_UiAlert, { tone: "warning" }, {
                    default: withCtx((_, _push2, _parent2, _scopeId) => {
                      if (_push2) {
                        _push2(`${ssrInterpolate(unref(evError))}`);
                      } else {
                        return [
                          createTextVNode(toDisplayString(unref(evError)), 1)
                        ];
                      }
                    }),
                    _: 2
                  }, _parent));
                } else if (!unref(evidence).length) {
                  _push(`<p class="text-muted">${ssrInterpolate(unref(t)("admin.market.noEvidence"))}</p>`);
                } else {
                  _push(`<ul class="space-y-1"><!--[-->`);
                  ssrRenderList(unref(evidence), (d) => {
                    _push(`<li class="flex flex-wrap items-center gap-2"><span dir="auto">${ssrInterpolate(d.original_name)}</span><span class="text-xs text-muted"><bdi>${ssrInterpolate(unref(formatBytes)(d.size, unref(locale)))}</bdi></span>`);
                    _push(ssrRenderComponent(_component_UiButton, {
                      variant: "ghost",
                      onClick: ($event) => getDoc(r.id, d)
                    }, {
                      default: withCtx((_, _push2, _parent2, _scopeId) => {
                        if (_push2) {
                          _push2(ssrRenderComponent(_component_UiIcon, {
                            name: "download",
                            size: 16
                          }, null, _parent2, _scopeId));
                          _push2(`${ssrInterpolate(unref(t)("documents.attachments.download"))}`);
                        } else {
                          return [
                            createVNode(_component_UiIcon, {
                              name: "download",
                              size: 16
                            }),
                            createTextVNode(toDisplayString(unref(t)("documents.attachments.download")), 1)
                          ];
                        }
                      }),
                      _: 2
                    }, _parent));
                    _push(`</li>`);
                  });
                  _push(`<!--]--></ul>`);
                }
                _push(ssrRenderComponent(_component_UiFormField, {
                  label: unref(t)("admin.market.basis"),
                  hint: unref(t)("admin.market.basisHint"),
                  error: unref(errs).basis
                }, {
                  default: withCtx((_, _push2, _parent2, _scopeId) => {
                    if (_push2) {
                      _push2(ssrRenderComponent(_component_UiTextarea, {
                        modelValue: unref(form).basis,
                        "onUpdate:modelValue": ($event) => unref(form).basis = $event,
                        rows: 3,
                        maxlength: 2e3
                      }, null, _parent2, _scopeId));
                    } else {
                      return [
                        createVNode(_component_UiTextarea, {
                          modelValue: unref(form).basis,
                          "onUpdate:modelValue": ($event) => unref(form).basis = $event,
                          rows: 3,
                          maxlength: 2e3
                        }, null, 8, ["modelValue", "onUpdate:modelValue"])
                      ];
                    }
                  }),
                  _: 2
                }, _parent));
                _push(ssrRenderComponent(_component_UiFormField, {
                  label: unref(t)("admin.market.expiresAt"),
                  error: unref(errs).expires_at,
                  optional: ""
                }, {
                  default: withCtx((_, _push2, _parent2, _scopeId) => {
                    if (_push2) {
                      _push2(ssrRenderComponent(_component_UiTextInput, {
                        modelValue: unref(form).expires_at,
                        "onUpdate:modelValue": ($event) => unref(form).expires_at = $event,
                        type: "date",
                        ltr: ""
                      }, null, _parent2, _scopeId));
                    } else {
                      return [
                        createVNode(_component_UiTextInput, {
                          modelValue: unref(form).expires_at,
                          "onUpdate:modelValue": ($event) => unref(form).expires_at = $event,
                          type: "date",
                          ltr: ""
                        }, null, 8, ["modelValue", "onUpdate:modelValue"])
                      ];
                    }
                  }),
                  _: 2
                }, _parent));
                _push(ssrRenderComponent(_component_UiFormField, {
                  label: unref(t)("admin.market.rejectReason"),
                  error: unref(errs).reason,
                  optional: ""
                }, {
                  default: withCtx((_, _push2, _parent2, _scopeId) => {
                    if (_push2) {
                      _push2(ssrRenderComponent(_component_UiTextInput, {
                        modelValue: unref(form).reason,
                        "onUpdate:modelValue": ($event) => unref(form).reason = $event,
                        maxlength: 255
                      }, null, _parent2, _scopeId));
                    } else {
                      return [
                        createVNode(_component_UiTextInput, {
                          modelValue: unref(form).reason,
                          "onUpdate:modelValue": ($event) => unref(form).reason = $event,
                          maxlength: 255
                        }, null, 8, ["modelValue", "onUpdate:modelValue"])
                      ];
                    }
                  }),
                  _: 2
                }, _parent));
                _push(`<div class="flex flex-wrap gap-2">`);
                _push(ssrRenderComponent(_component_UiButton, {
                  loading: unref(busy),
                  onClick: ($event) => decide(r.id, "approve")
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
                  loading: unref(busy),
                  onClick: ($event) => decide(r.id, "reject")
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
              } else {
                _push(`<!---->`);
              }
              _push(`</li>`);
            });
            _push(`<!--]--></ul>`);
          }
          _push(`</section>`);
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/admin/marketplace/verification.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=verification-CfXLuJhX.mjs.map
