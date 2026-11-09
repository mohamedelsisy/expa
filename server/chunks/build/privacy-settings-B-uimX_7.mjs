import { _ as _sfc_main$1 } from './Skeleton-BTnKIEst.mjs';
import { u as useI18n, g as useApi, a as useAuthStore, c as useLocalePath, i as _sfc_main$2, j as isApiError, _ as _sfc_main$3$1, d as _sfc_main$5$1, n as navigateTo, l as fieldErrors } from './server.mjs';
import { _ as _sfc_main$3 } from './Links-BHP4RLan.mjs';
import { _ as _sfc_main$4 } from './ConsentPurposeItem-CPAtz3HV.mjs';
import { _ as _sfc_main$5 } from './Card-BxvVO_-_.mjs';
import { _ as _sfc_main$6 } from './Alert-D-zfMDy5.mjs';
import { _ as _sfc_main$7 } from './FormField-DFtov8VK.mjs';
import { _ as _sfc_main$8 } from './PasswordInput-ClImJukS.mjs';
import { _ as _sfc_main$9 } from './Checkbox-PDAPbGXG.mjs';
import { defineComponent, withAsyncContext, ref, computed, mergeProps, unref, withCtx, createVNode, createTextVNode, toDisplayString, isRef, openBlock, createBlock, withModifiers, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrInterpolate, ssrRenderComponent, ssrRenderList } from 'vue/server-renderer';
import { u as useToast } from './useToast-BX2bodPv.mjs';
import { u as useSeo } from './useSeo-BU4sLOnV.mjs';
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
import './legal-vAxOkaZS.mjs';
import './AutoItalian-BD4PyQ-n.mjs';
import './Badge-PdKIsny2.mjs';
import './TextInput-BI4efS3_.mjs';
import './safe-B2eSdAXJ.mjs';
import 'perfect-debounce';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "privacy-settings",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const { t, locale } = useI18n();
    const { request } = useApi();
    const auth = useAuthStore();
    const toast = useToast();
    const localePath = useLocalePath();
    useSeo(() => ({ title: t("privacy.title"), description: t("privacy.subtitle"), noindex: true }));
    const { data, error, refresh, status } = ([__temp, __restore] = withAsyncContext(async () => useAsyncData("privacy", async () => {
      const [purposes2, consents] = await Promise.all([request("privacy/purposes"), request("profile/consents")]);
      return { purposes: purposes2.data, consents: consents.data };
    }, { watch: [locale] })), __temp = await __temp, __restore(), __temp);
    const savingKey = ref(null);
    async function toggle(key, granted) {
      if (!data.value) return;
      const before = data.value;
      data.value = { ...before, consents: { ...before.consents, consents: { ...before.consents.consents, [key]: { ...before.consents.consents[key], granted, decided: true } } } };
      savingKey.value = key;
      try {
        const res = await request("profile/consents", { method: "PUT", body: { consents: { [key]: granted } } });
        data.value = { ...before, consents: res.data };
        toast.success(t("privacy.consentSaved"));
      } catch (e) {
        data.value = before;
        toast.error(isApiError(e) ? e.message : t("errors.generic"));
      } finally {
        savingKey.value = null;
      }
    }
    const exporting = ref(false);
    async function exportData() {
      exporting.value = true;
      try {
        const res = await request("profile/export");
        const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = (void 0).createElement("a");
        a.href = url;
        a.download = "expa-data-export.json";
        (void 0).body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
        toast.success(t("privacy.exportReady"));
      } catch (e) {
        toast.error(isApiError(e) ? e.message : t("errors.generic"));
      } finally {
        exporting.value = false;
      }
    }
    const deleting = ref(false);
    const confirmOpen = ref(false);
    const understand = ref(false);
    const password = ref("");
    const delErrors = ref({});
    async function deleteAccount() {
      deleting.value = true;
      delErrors.value = {};
      try {
        await request("profile", { method: "DELETE", body: { password: password.value } });
        await auth.logout();
        toast.info(t("privacy.deleteStarted"));
        await navigateTo(localePath("/"));
      } catch (e) {
        delErrors.value = fieldErrors(e);
        if (!Object.keys(delErrors.value).length) toast.error(isApiError(e) ? e.message : t("errors.generic"));
      } finally {
        deleting.value = false;
      }
    }
    const purposes = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.purposes.purposes) != null ? _b : [];
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UiSkeleton = _sfc_main$1;
      const _component_UiErrorState = _sfc_main$2;
      const _component_LegalLinks = _sfc_main$3;
      const _component_ProfileConsentPurposeItem = _sfc_main$4;
      const _component_UiCard = _sfc_main$5;
      const _component_UiButton = _sfc_main$3$1;
      const _component_UiIcon = _sfc_main$5$1;
      const _component_UiAlert = _sfc_main$6;
      const _component_UiFormField = _sfc_main$7;
      const _component_UiPasswordInput = _sfc_main$8;
      const _component_UiCheckbox = _sfc_main$9;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "container-page max-w-3xl py-8 sm:py-12" }, _attrs))}><h1 class="text-2xl font-bold sm:text-3xl">${ssrInterpolate(unref(t)("privacy.title"))}</h1><p class="mt-1 text-ink-soft">${ssrInterpolate(unref(t)("privacy.subtitle"))}</p>`);
      if (unref(status) === "pending" && !unref(data)) {
        _push(`<div class="mt-8" aria-busy="true">`);
        _push(ssrRenderComponent(_component_UiSkeleton, {
          block: "",
          lines: 5
        }, null, _parent));
        _push(`</div>`);
      } else if (unref(error) || !unref(data)) {
        _push(ssrRenderComponent(_component_UiErrorState, {
          class: "mt-8",
          message: ("isApiError" in _ctx ? _ctx.isApiError : unref(isApiError))(unref(error)) ? unref(error).message : void 0,
          retry: "",
          onRetry: ($event) => unref(refresh)()
        }, null, _parent));
      } else {
        _push(`<div class="mt-8 space-y-10"><section aria-labelledby="cons-h" class="space-y-4"><h2 id="cons-h" class="text-xl font-bold">${ssrInterpolate(unref(t)("privacy.consentsTitle"))}</h2><p class="text-sm text-muted">${ssrInterpolate(unref(t)("privacy.policyVersion", { version: unref(data).consents.policy_version }))}</p>`);
        _push(ssrRenderComponent(_component_LegalLinks, {
          version: unref(data).consents.policy_version
        }, null, _parent));
        _push(`<ul class="space-y-3"><!--[-->`);
        ssrRenderList(unref(purposes), (p) => {
          var _a, _b;
          _push(`<li>`);
          _push(ssrRenderComponent(_component_ProfileConsentPurposeItem, {
            purpose: p,
            "model-value": p.required ? true : !!((_a = unref(data).consents.consents[p.key]) == null ? void 0 : _a.granted),
            disabled: p.required || unref(savingKey) === p.key,
            "onUpdate:modelValue": ($event) => toggle(p.key, $event)
          }, null, _parent));
          if ((_b = unref(data).consents.consents[p.key]) == null ? void 0 : _b.outdated) {
            _push(`<p class="mt-1 text-sm font-medium text-warning">${ssrInterpolate(unref(t)("privacy.outdated"))}</p>`);
          } else {
            _push(`<!---->`);
          }
          if (p.required) {
            _push(`<p class="mt-1 text-sm text-muted">${ssrInterpolate(unref(t)("privacy.requiredNote"))}</p>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</li>`);
        });
        _push(`<!--]--></ul></section>`);
        _push(ssrRenderComponent(_component_UiCard, {
          as: "section",
          "aria-labelledby": "exp-h",
          class: "space-y-3"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<h2 id="exp-h" class="text-xl font-bold"${_scopeId}>${ssrInterpolate(unref(t)("privacy.exportTitle"))}</h2><p class="text-ink-soft"${_scopeId}>${ssrInterpolate(unref(t)("privacy.exportBody"))}</p>`);
              _push2(ssrRenderComponent(_component_UiButton, {
                variant: "secondary",
                loading: unref(exporting),
                onClick: exportData
              }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(ssrRenderComponent(_component_UiIcon, {
                      name: "download",
                      size: 18
                    }, null, _parent3, _scopeId2));
                    _push3(`${ssrInterpolate(unref(t)("privacy.exportButton"))}`);
                  } else {
                    return [
                      createVNode(_component_UiIcon, {
                        name: "download",
                        size: 18
                      }),
                      createTextVNode(toDisplayString(unref(t)("privacy.exportButton")), 1)
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
            } else {
              return [
                createVNode("h2", {
                  id: "exp-h",
                  class: "text-xl font-bold"
                }, toDisplayString(unref(t)("privacy.exportTitle")), 1),
                createVNode("p", { class: "text-ink-soft" }, toDisplayString(unref(t)("privacy.exportBody")), 1),
                createVNode(_component_UiButton, {
                  variant: "secondary",
                  loading: unref(exporting),
                  onClick: exportData
                }, {
                  default: withCtx(() => [
                    createVNode(_component_UiIcon, {
                      name: "download",
                      size: 18
                    }),
                    createTextVNode(toDisplayString(unref(t)("privacy.exportButton")), 1)
                  ]),
                  _: 1
                }, 8, ["loading"])
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(ssrRenderComponent(_component_UiCard, {
          as: "section",
          "aria-labelledby": "del-h",
          class: "space-y-4 !border-danger"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<h2 id="del-h" class="text-xl font-bold text-danger"${_scopeId}>${ssrInterpolate(unref(t)("privacy.deleteTitle"))}</h2>`);
              _push2(ssrRenderComponent(_component_UiAlert, {
                tone: "danger",
                title: unref(t)("privacy.deleteWarningTitle")
              }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(`${ssrInterpolate(unref(t)("privacy.deleteWarning"))}`);
                  } else {
                    return [
                      createTextVNode(toDisplayString(unref(t)("privacy.deleteWarning")), 1)
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
              if (!unref(confirmOpen)) {
                _push2(ssrRenderComponent(_component_UiButton, {
                  variant: "danger",
                  onClick: ($event) => confirmOpen.value = true
                }, {
                  default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                    if (_push3) {
                      _push3(ssrRenderComponent(_component_UiIcon, {
                        name: "trash",
                        size: 18
                      }, null, _parent3, _scopeId2));
                      _push3(`${ssrInterpolate(unref(t)("privacy.deleteStart"))}`);
                    } else {
                      return [
                        createVNode(_component_UiIcon, {
                          name: "trash",
                          size: 18
                        }),
                        createTextVNode(toDisplayString(unref(t)("privacy.deleteStart")), 1)
                      ];
                    }
                  }),
                  _: 1
                }, _parent2, _scopeId));
              } else {
                _push2(`<form class="space-y-4" novalidate${_scopeId}>`);
                _push2(ssrRenderComponent(_component_UiFormField, {
                  label: unref(t)("privacy.deletePassword"),
                  hint: unref(t)("privacy.deletePasswordHint"),
                  error: unref(delErrors).password,
                  required: ""
                }, {
                  default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                    if (_push3) {
                      _push3(ssrRenderComponent(_component_UiPasswordInput, {
                        modelValue: unref(password),
                        "onUpdate:modelValue": ($event) => isRef(password) ? password.value = $event : null,
                        autocomplete: "current-password"
                      }, null, _parent3, _scopeId2));
                    } else {
                      return [
                        createVNode(_component_UiPasswordInput, {
                          modelValue: unref(password),
                          "onUpdate:modelValue": ($event) => isRef(password) ? password.value = $event : null,
                          autocomplete: "current-password"
                        }, null, 8, ["modelValue", "onUpdate:modelValue"])
                      ];
                    }
                  }),
                  _: 1
                }, _parent2, _scopeId));
                _push2(ssrRenderComponent(_component_UiCheckbox, {
                  modelValue: unref(understand),
                  "onUpdate:modelValue": ($event) => isRef(understand) ? understand.value = $event : null,
                  label: unref(t)("privacy.deleteUnderstand")
                }, null, _parent2, _scopeId));
                _push2(`<div class="flex flex-wrap gap-3"${_scopeId}>`);
                _push2(ssrRenderComponent(_component_UiButton, {
                  type: "submit",
                  variant: "danger",
                  disabled: !unref(understand) || !unref(password),
                  loading: unref(deleting)
                }, {
                  default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                    if (_push3) {
                      _push3(`${ssrInterpolate(unref(t)("privacy.deleteConfirm"))}`);
                    } else {
                      return [
                        createTextVNode(toDisplayString(unref(t)("privacy.deleteConfirm")), 1)
                      ];
                    }
                  }),
                  _: 1
                }, _parent2, _scopeId));
                _push2(ssrRenderComponent(_component_UiButton, {
                  variant: "secondary",
                  onClick: ($event) => {
                    confirmOpen.value = false;
                    password.value = "";
                    understand.value = false;
                  }
                }, {
                  default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                    if (_push3) {
                      _push3(`${ssrInterpolate(unref(t)("common.cancel"))}`);
                    } else {
                      return [
                        createTextVNode(toDisplayString(unref(t)("common.cancel")), 1)
                      ];
                    }
                  }),
                  _: 1
                }, _parent2, _scopeId));
                _push2(`</div></form>`);
              }
            } else {
              return [
                createVNode("h2", {
                  id: "del-h",
                  class: "text-xl font-bold text-danger"
                }, toDisplayString(unref(t)("privacy.deleteTitle")), 1),
                createVNode(_component_UiAlert, {
                  tone: "danger",
                  title: unref(t)("privacy.deleteWarningTitle")
                }, {
                  default: withCtx(() => [
                    createTextVNode(toDisplayString(unref(t)("privacy.deleteWarning")), 1)
                  ]),
                  _: 1
                }, 8, ["title"]),
                !unref(confirmOpen) ? (openBlock(), createBlock(_component_UiButton, {
                  key: 0,
                  variant: "danger",
                  onClick: ($event) => confirmOpen.value = true
                }, {
                  default: withCtx(() => [
                    createVNode(_component_UiIcon, {
                      name: "trash",
                      size: 18
                    }),
                    createTextVNode(toDisplayString(unref(t)("privacy.deleteStart")), 1)
                  ]),
                  _: 1
                }, 8, ["onClick"])) : (openBlock(), createBlock("form", {
                  key: 1,
                  class: "space-y-4",
                  novalidate: "",
                  onSubmit: withModifiers(deleteAccount, ["prevent"])
                }, [
                  createVNode(_component_UiFormField, {
                    label: unref(t)("privacy.deletePassword"),
                    hint: unref(t)("privacy.deletePasswordHint"),
                    error: unref(delErrors).password,
                    required: ""
                  }, {
                    default: withCtx(() => [
                      createVNode(_component_UiPasswordInput, {
                        modelValue: unref(password),
                        "onUpdate:modelValue": ($event) => isRef(password) ? password.value = $event : null,
                        autocomplete: "current-password"
                      }, null, 8, ["modelValue", "onUpdate:modelValue"])
                    ]),
                    _: 1
                  }, 8, ["label", "hint", "error"]),
                  createVNode(_component_UiCheckbox, {
                    modelValue: unref(understand),
                    "onUpdate:modelValue": ($event) => isRef(understand) ? understand.value = $event : null,
                    label: unref(t)("privacy.deleteUnderstand")
                  }, null, 8, ["modelValue", "onUpdate:modelValue", "label"]),
                  createVNode("div", { class: "flex flex-wrap gap-3" }, [
                    createVNode(_component_UiButton, {
                      type: "submit",
                      variant: "danger",
                      disabled: !unref(understand) || !unref(password),
                      loading: unref(deleting)
                    }, {
                      default: withCtx(() => [
                        createTextVNode(toDisplayString(unref(t)("privacy.deleteConfirm")), 1)
                      ]),
                      _: 1
                    }, 8, ["disabled", "loading"]),
                    createVNode(_component_UiButton, {
                      variant: "secondary",
                      onClick: ($event) => {
                        confirmOpen.value = false;
                        password.value = "";
                        understand.value = false;
                      }
                    }, {
                      default: withCtx(() => [
                        createTextVNode(toDisplayString(unref(t)("common.cancel")), 1)
                      ]),
                      _: 1
                    }, 8, ["onClick"])
                  ])
                ], 32))
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div>`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/privacy-settings.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=privacy-settings-B-uimX_7.mjs.map
