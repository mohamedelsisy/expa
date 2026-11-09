import { _ as _sfc_main$1 } from './Skeleton-BTnKIEst.mjs';
import { u as useI18n, g as useApi, a as useAuthStore, i as _sfc_main$2, _ as _sfc_main$3$1, j as isApiError, l as fieldErrors } from './server.mjs';
import { _ as _sfc_main$3 } from './Alert-D-zfMDy5.mjs';
import { _ as _sfc_main$4 } from './VerifyNeeded-mxk-8UjC.mjs';
import { _ as _sfc_main$5 } from './Card-BxvVO_-_.mjs';
import { _ as _sfc_main$6 } from './FormField-DFtov8VK.mjs';
import { _ as _sfc_main$7 } from './TextInput-BI4efS3_.mjs';
import { _ as _sfc_main$8 } from './Select-BjjHKxeN.mjs';
import { _ as _sfc_main$9 } from './Nav-CnBbBeUx.mjs';
import { _ as _sfc_main$a } from './Badge-PdKIsny2.mjs';
import { defineComponent, withAsyncContext, reactive, ref, computed, mergeProps, unref, withCtx, createTextVNode, toDisplayString, createVNode, withModifiers, openBlock, createBlock, createCommentVNode, Fragment, renderList, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrInterpolate, ssrRenderComponent, ssrRenderList } from 'vue/server-renderer';
import { u as useToast } from './useToast-BX2bodPv.mjs';
import { u as useSeo } from './useSeo-BU4sLOnV.mjs';
import { u as useProviderPortal } from './useProviderPortal-BfW_CYQw.mjs';
import { u as useAsyncData } from './asyncData-bKJD5Wmv.mjs';
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
import 'perfect-debounce';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "index",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const { t, locale } = useI18n();
    const { request } = useApi();
    const auth = useAuthStore();
    const toast = useToast();
    useSeo(() => ({ title: t("provider.title"), description: t("provider.subtitle"), noindex: true }));
    const portal = useProviderPortal();
    [__temp, __restore] = withAsyncContext(async () => useAsyncData("provider-index", async () => {
      await portal.load();
      return true;
    })), await __temp, __restore();
    const { data: meta } = ([__temp, __restore] = withAsyncContext(async () => useAsyncData("provider-meta", async () => (await request("providers/meta")).data, { watch: [locale] })), __temp = await __temp, __restore(), __temp);
    const form = reactive({ category: "", display_name: "" });
    const errors = ref({});
    const applying = ref(false);
    const needVerify = ref(false);
    async function apply() {
      errors.value = {};
      needVerify.value = false;
      if (!form.display_name.trim()) errors.value.display_name = t("provider.apply.nameRequired");
      if (!form.category) errors.value.category = t("provider.apply.categoryRequired");
      if (Object.keys(errors.value).length) return;
      applying.value = true;
      try {
        const res = await request("provider/apply", { method: "POST", body: { category: form.category, display_name: form.display_name.trim() } });
        portal.set(res.data);
        await auth.ensureLoaded(true);
        toast.success(t("provider.apply.done"));
      } catch (e) {
        if (isApiError(e) && e.code === "email_not_verified") needVerify.value = true;
        else if (isApiError(e) && e.code === "provider_exists") {
          await portal.load();
        } else {
          errors.value = fieldErrors(e);
          if (!Object.keys(errors.value).length) toast.error(isApiError(e) ? e.message : t("errors.generic"));
        }
      } finally {
        applying.value = false;
      }
    }
    const submitting = ref(false);
    const problems = ref([]);
    async function submitForReview() {
      var _a;
      submitting.value = true;
      problems.value = [];
      try {
        portal.set((await request("provider/profile/submit", { method: "POST" })).data);
        toast.success(t("provider.overview.submitted"));
      } catch (e) {
        if (isApiError(e) && e.code === "listing_incomplete") problems.value = (_a = e.details.problems) != null ? _a : [];
        else toast.error(isApiError(e) ? e.message : t("errors.generic"));
      } finally {
        submitting.value = false;
      }
    }
    const p = computed(() => portal.profile.value);
    const canSubmit = computed(() => p.value && ["draft", "archived"].includes(String(p.value.status)));
    const problemList = computed(() => {
      var _a, _b;
      return problems.value.length ? problems.value : (_b = (_a = p.value) == null ? void 0 : _a.publish_problems) != null ? _b : [];
    });
    const problemText = (x) => x.field ? `${x.field}: ${x.code}` : x.code;
    return (_ctx, _push, _parent, _attrs) => {
      var _a;
      const _component_UiSkeleton = _sfc_main$1;
      const _component_UiErrorState = _sfc_main$2;
      const _component_UiAlert = _sfc_main$3;
      const _component_AuthVerifyNeeded = _sfc_main$4;
      const _component_UiCard = _sfc_main$5;
      const _component_UiFormField = _sfc_main$6;
      const _component_UiTextInput = _sfc_main$7;
      const _component_UiSelect = _sfc_main$8;
      const _component_UiButton = _sfc_main$3$1;
      const _component_ProviderNav = _sfc_main$9;
      const _component_UiBadge = _sfc_main$a;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "container-page max-w-3xl py-8 sm:py-12" }, _attrs))}><header class="mb-6 space-y-2"><h1 class="text-2xl font-bold sm:text-3xl">${ssrInterpolate(unref(t)("provider.title"))}</h1><p class="text-ink-soft">${ssrInterpolate(unref(t)("provider.subtitle"))}</p></header>`);
      if (unref(portal).state.value === "loading" || unref(portal).state.value === "idle") {
        _push(`<div aria-busy="true">`);
        _push(ssrRenderComponent(_component_UiSkeleton, {
          block: "",
          lines: 4
        }, null, _parent));
        _push(`</div>`);
      } else if (unref(portal).state.value === "error") {
        _push(ssrRenderComponent(_component_UiErrorState, {
          message: (_a = unref(portal).error.value) != null ? _a : void 0,
          retry: "",
          onRetry: ($event) => unref(portal).load()
        }, null, _parent));
      } else if (unref(portal).state.value === "none") {
        _push(`<!--[-->`);
        _push(ssrRenderComponent(_component_UiAlert, {
          tone: "info",
          class: "mb-6"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`${ssrInterpolate(unref(t)("provider.apply.intro"))}`);
            } else {
              return [
                createTextVNode(toDisplayString(unref(t)("provider.apply.intro")), 1)
              ];
            }
          }),
          _: 1
        }, _parent));
        if (unref(needVerify)) {
          _push(ssrRenderComponent(_component_AuthVerifyNeeded, { class: "mb-6" }, null, _parent));
        } else {
          _push(`<!---->`);
        }
        _push(ssrRenderComponent(_component_UiCard, null, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<form class="space-y-5" novalidate${_scopeId}><h2 class="text-xl font-bold"${_scopeId}>${ssrInterpolate(unref(t)("provider.apply.title"))}</h2>`);
              _push2(ssrRenderComponent(_component_UiFormField, {
                label: unref(t)("provider.fields.display_name"),
                hint: unref(t)("provider.fields.display_nameHint"),
                error: unref(errors).display_name,
                required: ""
              }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(ssrRenderComponent(_component_UiTextInput, {
                      modelValue: unref(form).display_name,
                      "onUpdate:modelValue": ($event) => unref(form).display_name = $event,
                      maxlength: 160
                    }, null, _parent3, _scopeId2));
                  } else {
                    return [
                      createVNode(_component_UiTextInput, {
                        modelValue: unref(form).display_name,
                        "onUpdate:modelValue": ($event) => unref(form).display_name = $event,
                        maxlength: 160
                      }, null, 8, ["modelValue", "onUpdate:modelValue"])
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
              _push2(ssrRenderComponent(_component_UiFormField, {
                label: unref(t)("provider.fields.category"),
                error: unref(errors).category,
                required: ""
              }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  var _a2, _b, _c, _d;
                  if (_push3) {
                    _push3(ssrRenderComponent(_component_UiSelect, {
                      modelValue: unref(form).category,
                      "onUpdate:modelValue": ($event) => unref(form).category = $event,
                      options: (_b = (_a2 = unref(meta)) == null ? void 0 : _a2.categories) != null ? _b : [],
                      placeholder: unref(t)("common.choose")
                    }, null, _parent3, _scopeId2));
                  } else {
                    return [
                      createVNode(_component_UiSelect, {
                        modelValue: unref(form).category,
                        "onUpdate:modelValue": ($event) => unref(form).category = $event,
                        options: (_d = (_c = unref(meta)) == null ? void 0 : _c.categories) != null ? _d : [],
                        placeholder: unref(t)("common.choose")
                      }, null, 8, ["modelValue", "onUpdate:modelValue", "options", "placeholder"])
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
              _push2(`<p class="text-sm text-ink-soft"${_scopeId}>${ssrInterpolate(unref(t)("provider.apply.next"))}</p>`);
              _push2(ssrRenderComponent(_component_UiButton, {
                type: "submit",
                loading: unref(applying)
              }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(`${ssrInterpolate(unref(t)("provider.apply.submit"))}`);
                  } else {
                    return [
                      createTextVNode(toDisplayString(unref(t)("provider.apply.submit")), 1)
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
              _push2(`</form>`);
            } else {
              return [
                createVNode("form", {
                  class: "space-y-5",
                  novalidate: "",
                  onSubmit: withModifiers(apply, ["prevent"])
                }, [
                  createVNode("h2", { class: "text-xl font-bold" }, toDisplayString(unref(t)("provider.apply.title")), 1),
                  createVNode(_component_UiFormField, {
                    label: unref(t)("provider.fields.display_name"),
                    hint: unref(t)("provider.fields.display_nameHint"),
                    error: unref(errors).display_name,
                    required: ""
                  }, {
                    default: withCtx(() => [
                      createVNode(_component_UiTextInput, {
                        modelValue: unref(form).display_name,
                        "onUpdate:modelValue": ($event) => unref(form).display_name = $event,
                        maxlength: 160
                      }, null, 8, ["modelValue", "onUpdate:modelValue"])
                    ]),
                    _: 1
                  }, 8, ["label", "hint", "error"]),
                  createVNode(_component_UiFormField, {
                    label: unref(t)("provider.fields.category"),
                    error: unref(errors).category,
                    required: ""
                  }, {
                    default: withCtx(() => {
                      var _a2, _b;
                      return [
                        createVNode(_component_UiSelect, {
                          modelValue: unref(form).category,
                          "onUpdate:modelValue": ($event) => unref(form).category = $event,
                          options: (_b = (_a2 = unref(meta)) == null ? void 0 : _a2.categories) != null ? _b : [],
                          placeholder: unref(t)("common.choose")
                        }, null, 8, ["modelValue", "onUpdate:modelValue", "options", "placeholder"])
                      ];
                    }),
                    _: 1
                  }, 8, ["label", "error"]),
                  createVNode("p", { class: "text-sm text-ink-soft" }, toDisplayString(unref(t)("provider.apply.next")), 1),
                  createVNode(_component_UiButton, {
                    type: "submit",
                    loading: unref(applying)
                  }, {
                    default: withCtx(() => [
                      createTextVNode(toDisplayString(unref(t)("provider.apply.submit")), 1)
                    ]),
                    _: 1
                  }, 8, ["loading"])
                ], 32)
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`<!--]-->`);
      } else if (unref(p)) {
        _push(`<!--[-->`);
        _push(ssrRenderComponent(_component_ProviderNav, null, null, _parent));
        _push(`<div class="space-y-6">`);
        _push(ssrRenderComponent(_component_UiCard, { class: "space-y-3" }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<h2 class="text-xl font-bold" dir="auto"${_scopeId}>${ssrInterpolate(unref(p).display_name)}</h2><dl class="grid gap-3 sm:grid-cols-2"${_scopeId}><div${_scopeId}><dt class="text-sm text-muted"${_scopeId}>${ssrInterpolate(unref(t)("provider.overview.status"))}</dt><dd${_scopeId}>`);
              _push2(ssrRenderComponent(_component_UiBadge, {
                tone: unref(p).status === "published" ? "success" : "info",
                "data-testid": "listing-status"
              }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  var _a2, _b;
                  if (_push3) {
                    _push3(`${ssrInterpolate(unref(t)(`provider.status.${(_a2 = unref(p).status) != null ? _a2 : "draft"}`))}`);
                  } else {
                    return [
                      createTextVNode(toDisplayString(unref(t)(`provider.status.${(_b = unref(p).status) != null ? _b : "draft"}`)), 1)
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
              _push2(`</dd></div><div${_scopeId}><dt class="text-sm text-muted"${_scopeId}>${ssrInterpolate(unref(t)("provider.overview.verification"))}</dt><dd${_scopeId}>`);
              _push2(ssrRenderComponent(_component_UiBadge, { "data-testid": "verification-status" }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  var _a2, _b, _c, _d;
                  if (_push3) {
                    _push3(`${ssrInterpolate(unref(t)(`provider.verification.${(_b = (_a2 = unref(p).effective_verification) != null ? _a2 : unref(p).verification_status) != null ? _b : "unverified"}`))}`);
                  } else {
                    return [
                      createTextVNode(toDisplayString(unref(t)(`provider.verification.${(_d = (_c = unref(p).effective_verification) != null ? _c : unref(p).verification_status) != null ? _d : "unverified"}`)), 1)
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
              _push2(`</dd></div></dl>`);
              if (unref(p).has_pending_changes) {
                _push2(ssrRenderComponent(_component_UiAlert, {
                  tone: "info",
                  "data-testid": "pending-changes"
                }, {
                  default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                    if (_push3) {
                      _push3(`${ssrInterpolate(unref(t)("provider.overview.pendingChanges"))}`);
                    } else {
                      return [
                        createTextVNode(toDisplayString(unref(t)("provider.overview.pendingChanges")), 1)
                      ];
                    }
                  }),
                  _: 1
                }, _parent2, _scopeId));
              } else {
                _push2(`<!---->`);
              }
              _push2(`<p class="text-sm text-ink-soft"${_scopeId}>${ssrInterpolate(unref(t)("provider.overview.statusNote"))}</p>`);
            } else {
              return [
                createVNode("h2", {
                  class: "text-xl font-bold",
                  dir: "auto"
                }, toDisplayString(unref(p).display_name), 1),
                createVNode("dl", { class: "grid gap-3 sm:grid-cols-2" }, [
                  createVNode("div", null, [
                    createVNode("dt", { class: "text-sm text-muted" }, toDisplayString(unref(t)("provider.overview.status")), 1),
                    createVNode("dd", null, [
                      createVNode(_component_UiBadge, {
                        tone: unref(p).status === "published" ? "success" : "info",
                        "data-testid": "listing-status"
                      }, {
                        default: withCtx(() => {
                          var _a2;
                          return [
                            createTextVNode(toDisplayString(unref(t)(`provider.status.${(_a2 = unref(p).status) != null ? _a2 : "draft"}`)), 1)
                          ];
                        }),
                        _: 1
                      }, 8, ["tone"])
                    ])
                  ]),
                  createVNode("div", null, [
                    createVNode("dt", { class: "text-sm text-muted" }, toDisplayString(unref(t)("provider.overview.verification")), 1),
                    createVNode("dd", null, [
                      createVNode(_component_UiBadge, { "data-testid": "verification-status" }, {
                        default: withCtx(() => {
                          var _a2, _b;
                          return [
                            createTextVNode(toDisplayString(unref(t)(`provider.verification.${(_b = (_a2 = unref(p).effective_verification) != null ? _a2 : unref(p).verification_status) != null ? _b : "unverified"}`)), 1)
                          ];
                        }),
                        _: 1
                      })
                    ])
                  ])
                ]),
                unref(p).has_pending_changes ? (openBlock(), createBlock(_component_UiAlert, {
                  key: 0,
                  tone: "info",
                  "data-testid": "pending-changes"
                }, {
                  default: withCtx(() => [
                    createTextVNode(toDisplayString(unref(t)("provider.overview.pendingChanges")), 1)
                  ]),
                  _: 1
                })) : createCommentVNode("", true),
                createVNode("p", { class: "text-sm text-ink-soft" }, toDisplayString(unref(t)("provider.overview.statusNote")), 1)
              ];
            }
          }),
          _: 1
        }, _parent));
        if (unref(problemList).length) {
          _push(ssrRenderComponent(_component_UiAlert, {
            tone: "warning",
            title: unref(t)("provider.overview.problems"),
            "data-testid": "publish-problems"
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`<ul class="list-disc ps-5"${_scopeId}><!--[-->`);
                ssrRenderList(unref(problemList), (x, i) => {
                  _push2(`<li${_scopeId}>${ssrInterpolate(problemText(x))}</li>`);
                });
                _push2(`<!--]--></ul>`);
              } else {
                return [
                  createVNode("ul", { class: "list-disc ps-5" }, [
                    (openBlock(true), createBlock(Fragment, null, renderList(unref(problemList), (x, i) => {
                      return openBlock(), createBlock("li", { key: i }, toDisplayString(problemText(x)), 1);
                    }), 128))
                  ])
                ];
              }
            }),
            _: 1
          }, _parent));
        } else {
          _push(`<!---->`);
        }
        _push(`<div class="flex flex-wrap gap-3">`);
        _push(ssrRenderComponent(_component_UiButton, {
          to: "/provider/profile",
          variant: "secondary"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`${ssrInterpolate(unref(t)("provider.overview.editProfile"))}`);
            } else {
              return [
                createTextVNode(toDisplayString(unref(t)("provider.overview.editProfile")), 1)
              ];
            }
          }),
          _: 1
        }, _parent));
        if (unref(canSubmit)) {
          _push(ssrRenderComponent(_component_UiButton, {
            loading: unref(submitting),
            onClick: submitForReview
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`${ssrInterpolate(unref(t)("provider.overview.submit"))}`);
              } else {
                return [
                  createTextVNode(toDisplayString(unref(t)("provider.overview.submit")), 1)
                ];
              }
            }),
            _: 1
          }, _parent));
        } else {
          _push(`<!---->`);
        }
        _push(ssrRenderComponent(_component_UiButton, {
          to: "/provider/verification",
          variant: "secondary"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`${ssrInterpolate(unref(t)("provider.overview.verify"))}`);
            } else {
              return [
                createTextVNode(toDisplayString(unref(t)("provider.overview.verify")), 1)
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div></div><!--]-->`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/provider/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=index-Cm2FnRsy.mjs.map
