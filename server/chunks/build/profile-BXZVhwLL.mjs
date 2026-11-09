import { _ as _sfc_main$2 } from './Skeleton-BTnKIEst.mjs';
import { u as useI18n, m as useSwitchLocalePath, g as useApi, a as useAuthStore, c as useLocalePath, i as _sfc_main$2$1, j as isApiError, _ as _sfc_main$3$1, d as _sfc_main$5$1, l as fieldErrors, n as navigateTo } from './server.mjs';
import { _ as _sfc_main$3 } from './Card-BxvVO_-_.mjs';
import { _ as _sfc_main$4 } from './FormField-DFtov8VK.mjs';
import { _ as _sfc_main$5 } from './TextInput-BI4efS3_.mjs';
import { _ as _sfc_main$6 } from './Badge-PdKIsny2.mjs';
import { _ as _sfc_main$7 } from './Select-BjjHKxeN.mjs';
import { _ as _sfc_main$8 } from './Alert-D-zfMDy5.mjs';
import { e as emptyProfileForm, _ as _sfc_main$9, f as formFromProfile, S as STEP_FIELDS, p as patchBody } from './useProfileForm-B3Xk-pQq.mjs';
import { _ as _sfc_main$a } from './PasswordInput-ClImJukS.mjs';
import { defineComponent, withAsyncContext, reactive, ref, watch, computed, mergeProps, unref, withCtx, isRef, createVNode, createTextVNode, toDisplayString, withModifiers, openBlock, createBlock, createCommentVNode, Fragment, renderList, useSSRContext } from 'vue';
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
import './Checkbox-PDAPbGXG.mjs';
import './countries-e88Gbu9b.mjs';
import './safe-B2eSdAXJ.mjs';
import 'perfect-debounce';

const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "ChangePassword",
  __ssrInlineRender: true,
  setup(__props) {
    const { t } = useI18n();
    const { request } = useApi();
    const toast = useToast();
    const form = reactive({ current: "", next: "", confirm: "" });
    const errors = ref({});
    const saving = ref(false);
    const done = ref(false);
    async function submit() {
      errors.value = {};
      done.value = false;
      if (form.next !== form.confirm) {
        errors.value = { password_confirmation: t("auth.passwordMismatch") };
        return;
      }
      saving.value = true;
      try {
        await request("auth/change-password", { method: "POST", body: { current_password: form.current, password: form.next, password_confirmation: form.confirm } });
        form.current = form.next = form.confirm = "";
        done.value = true;
        toast.success(t("profile.passwordChanged"));
      } catch (e) {
        errors.value = fieldErrors(e);
        if (!Object.keys(errors.value).length) toast.error(isApiError(e) ? e.message : t("errors.generic"));
      } finally {
        saving.value = false;
      }
    }
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UiCard = _sfc_main$3;
      const _component_UiFormField = _sfc_main$4;
      const _component_UiPasswordInput = _sfc_main$a;
      const _component_UiButton = _sfc_main$3$1;
      _push(ssrRenderComponent(_component_UiCard, mergeProps({
        as: "section",
        "aria-labelledby": "pw-h",
        class: "space-y-5"
      }, _attrs), {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<h2 id="pw-h" class="text-xl font-bold"${_scopeId}>${ssrInterpolate(unref(t)("profile.changePassword"))}</h2><p class="text-ink-soft"${_scopeId}>${ssrInterpolate(unref(t)("profile.changePasswordHint"))}</p><form class="space-y-5" novalidate${_scopeId}>`);
            _push2(ssrRenderComponent(_component_UiFormField, {
              label: unref(t)("profile.currentPassword"),
              error: unref(errors).current_password,
              required: ""
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(ssrRenderComponent(_component_UiPasswordInput, {
                    modelValue: unref(form).current,
                    "onUpdate:modelValue": ($event) => unref(form).current = $event,
                    autocomplete: "current-password"
                  }, null, _parent3, _scopeId2));
                } else {
                  return [
                    createVNode(_component_UiPasswordInput, {
                      modelValue: unref(form).current,
                      "onUpdate:modelValue": ($event) => unref(form).current = $event,
                      autocomplete: "current-password"
                    }, null, 8, ["modelValue", "onUpdate:modelValue"])
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(ssrRenderComponent(_component_UiFormField, {
              label: unref(t)("auth.newPassword"),
              hint: unref(t)("auth.passwordHint"),
              error: unref(errors).password,
              required: ""
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(ssrRenderComponent(_component_UiPasswordInput, {
                    modelValue: unref(form).next,
                    "onUpdate:modelValue": ($event) => unref(form).next = $event,
                    autocomplete: "new-password"
                  }, null, _parent3, _scopeId2));
                } else {
                  return [
                    createVNode(_component_UiPasswordInput, {
                      modelValue: unref(form).next,
                      "onUpdate:modelValue": ($event) => unref(form).next = $event,
                      autocomplete: "new-password"
                    }, null, 8, ["modelValue", "onUpdate:modelValue"])
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(ssrRenderComponent(_component_UiFormField, {
              label: unref(t)("auth.passwordConfirm"),
              error: unref(errors).password_confirmation,
              required: ""
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(ssrRenderComponent(_component_UiPasswordInput, {
                    modelValue: unref(form).confirm,
                    "onUpdate:modelValue": ($event) => unref(form).confirm = $event,
                    autocomplete: "new-password"
                  }, null, _parent3, _scopeId2));
                } else {
                  return [
                    createVNode(_component_UiPasswordInput, {
                      modelValue: unref(form).confirm,
                      "onUpdate:modelValue": ($event) => unref(form).confirm = $event,
                      autocomplete: "new-password"
                    }, null, 8, ["modelValue", "onUpdate:modelValue"])
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(ssrRenderComponent(_component_UiButton, {
              type: "submit",
              loading: unref(saving)
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`${ssrInterpolate(unref(t)("profile.changePassword"))}`);
                } else {
                  return [
                    createTextVNode(toDisplayString(unref(t)("profile.changePassword")), 1)
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(`</form>`);
          } else {
            return [
              createVNode("h2", {
                id: "pw-h",
                class: "text-xl font-bold"
              }, toDisplayString(unref(t)("profile.changePassword")), 1),
              createVNode("p", { class: "text-ink-soft" }, toDisplayString(unref(t)("profile.changePasswordHint")), 1),
              createVNode("form", {
                class: "space-y-5",
                novalidate: "",
                onSubmit: withModifiers(submit, ["prevent"])
              }, [
                createVNode(_component_UiFormField, {
                  label: unref(t)("profile.currentPassword"),
                  error: unref(errors).current_password,
                  required: ""
                }, {
                  default: withCtx(() => [
                    createVNode(_component_UiPasswordInput, {
                      modelValue: unref(form).current,
                      "onUpdate:modelValue": ($event) => unref(form).current = $event,
                      autocomplete: "current-password"
                    }, null, 8, ["modelValue", "onUpdate:modelValue"])
                  ]),
                  _: 1
                }, 8, ["label", "error"]),
                createVNode(_component_UiFormField, {
                  label: unref(t)("auth.newPassword"),
                  hint: unref(t)("auth.passwordHint"),
                  error: unref(errors).password,
                  required: ""
                }, {
                  default: withCtx(() => [
                    createVNode(_component_UiPasswordInput, {
                      modelValue: unref(form).next,
                      "onUpdate:modelValue": ($event) => unref(form).next = $event,
                      autocomplete: "new-password"
                    }, null, 8, ["modelValue", "onUpdate:modelValue"])
                  ]),
                  _: 1
                }, 8, ["label", "hint", "error"]),
                createVNode(_component_UiFormField, {
                  label: unref(t)("auth.passwordConfirm"),
                  error: unref(errors).password_confirmation,
                  required: ""
                }, {
                  default: withCtx(() => [
                    createVNode(_component_UiPasswordInput, {
                      modelValue: unref(form).confirm,
                      "onUpdate:modelValue": ($event) => unref(form).confirm = $event,
                      autocomplete: "new-password"
                    }, null, 8, ["modelValue", "onUpdate:modelValue"])
                  ]),
                  _: 1
                }, 8, ["label", "error"]),
                createVNode(_component_UiButton, {
                  type: "submit",
                  loading: unref(saving)
                }, {
                  default: withCtx(() => [
                    createTextVNode(toDisplayString(unref(t)("profile.changePassword")), 1)
                  ]),
                  _: 1
                }, 8, ["loading"])
              ], 32)
            ];
          }
        }),
        _: 1
      }, _parent));
    };
  }
});
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/profile/ChangePassword.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "profile",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const { t, locale, locales } = useI18n();
    const switchLocalePath = useSwitchLocalePath();
    const { request } = useApi();
    const auth = useAuthStore();
    const toast = useToast();
    const localePath = useLocalePath();
    useSeo(() => ({ title: t("profile.title"), description: t("profile.subtitle"), noindex: true }));
    const { data, error, refresh, status } = ([__temp, __restore] = withAsyncContext(async () => useAsyncData("profile-page", async () => {
      const [options, profile, cities] = await Promise.all([request("profile/options"), request("profile"), request("cities")]);
      return { options: options.data, profile: profile.data, cities: cities.data };
    }, { watch: [locale] })), __temp = await __temp, __restore(), __temp);
    const form = reactive(emptyProfileForm());
    const name = ref("");
    const errors = ref({});
    const consentMissing = ref(false);
    const savingAccount = ref(false);
    const savingProfile = ref(false);
    const accountErrors = ref({});
    function applyProfile(d) {
      if (!d) return;
      Object.assign(form, formFromProfile(d.profile));
      name.value = d.profile.user.name;
    }
    applyProfile(data.value);
    watch(data, applyProfile);
    const localeOptions = computed(() => locales.value.map((l) => {
      var _a;
      return { value: l.code, label: (_a = l.name) != null ? _a : l.code };
    }));
    const allSteps = Object.keys(STEP_FIELDS);
    async function saveAccount() {
      savingAccount.value = true;
      accountErrors.value = {};
      try {
        const res = await request("profile", { method: "PATCH", body: { name: name.value } });
        auth.setUser(res.data.user);
        toast.success(t("profile.saved"));
      } catch (e) {
        accountErrors.value = fieldErrors(e);
        if (!Object.keys(accountErrors.value).length) toast.error(isApiError(e) ? e.message : t("errors.generic"));
      } finally {
        savingAccount.value = false;
      }
    }
    async function changeLanguage(code) {
      try {
        const res = await request("profile", { method: "PATCH", body: { locale: code } });
        auth.setUser(res.data.user);
      } catch (e) {
        toast.error(isApiError(e) ? e.message : t("errors.generic"));
      }
      await navigateTo(switchLocalePath(code));
    }
    async function saveProfile() {
      savingProfile.value = true;
      errors.value = {};
      consentMissing.value = false;
      try {
        const fields = Object.values(STEP_FIELDS).flat();
        await request("profile", { method: "PATCH", body: patchBody(form, fields) });
        toast.success(t("profile.saved"));
        await refresh();
      } catch (e) {
        errors.value = fieldErrors(e);
        if (isApiError(e) && e.code === "consent_required") consentMissing.value = true;
        else if (!Object.keys(errors.value).length) toast.error(isApiError(e) ? e.message : t("errors.generic"));
      } finally {
        savingProfile.value = false;
      }
    }
    async function logout() {
      await auth.logout();
      await navigateTo(localePath("/"));
    }
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UiSkeleton = _sfc_main$2;
      const _component_UiErrorState = _sfc_main$2$1;
      const _component_UiCard = _sfc_main$3;
      const _component_UiFormField = _sfc_main$4;
      const _component_UiTextInput = _sfc_main$5;
      const _component_UiBadge = _sfc_main$6;
      const _component_UiButton = _sfc_main$3$1;
      const _component_UiSelect = _sfc_main$7;
      const _component_UiAlert = _sfc_main$8;
      const _component_ProfileStepFields = _sfc_main$9;
      const _component_ProfileChangePassword = _sfc_main$1;
      const _component_UiIcon = _sfc_main$5$1;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "container-page max-w-3xl py-8 sm:py-12" }, _attrs))}><h1 class="text-2xl font-bold sm:text-3xl">${ssrInterpolate(unref(t)("profile.title"))}</h1><p class="mt-1 text-ink-soft">${ssrInterpolate(unref(t)("profile.subtitle"))}</p>`);
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
        _push(`<div class="mt-8 space-y-8">`);
        _push(ssrRenderComponent(_component_UiCard, {
          as: "section",
          "aria-labelledby": "acc-h",
          class: "space-y-5"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<h2 id="acc-h" class="text-xl font-bold"${_scopeId}>${ssrInterpolate(unref(t)("profile.account"))}</h2><form class="space-y-5" novalidate${_scopeId}>`);
              _push2(ssrRenderComponent(_component_UiFormField, {
                label: unref(t)("auth.name"),
                error: unref(accountErrors).name,
                required: ""
              }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(ssrRenderComponent(_component_UiTextInput, {
                      modelValue: unref(name),
                      "onUpdate:modelValue": ($event) => isRef(name) ? name.value = $event : null,
                      autocomplete: "name",
                      maxlength: 100
                    }, null, _parent3, _scopeId2));
                  } else {
                    return [
                      createVNode(_component_UiTextInput, {
                        modelValue: unref(name),
                        "onUpdate:modelValue": ($event) => isRef(name) ? name.value = $event : null,
                        autocomplete: "name",
                        maxlength: 100
                      }, null, 8, ["modelValue", "onUpdate:modelValue"])
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
              _push2(`<div${_scopeId}><p class="text-sm font-medium"${_scopeId}>${ssrInterpolate(unref(t)("auth.email"))}</p><p class="flex flex-wrap items-center gap-2"${_scopeId}><span dir="ltr"${_scopeId}>${ssrInterpolate(unref(data).profile.user.email)}</span>`);
              _push2(ssrRenderComponent(_component_UiBadge, {
                tone: unref(data).profile.user.email_verified ? "success" : "warning"
              }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(`${ssrInterpolate(unref(data).profile.user.email_verified ? unref(t)("profile.verified") : unref(t)("profile.unverified"))}`);
                  } else {
                    return [
                      createTextVNode(toDisplayString(unref(data).profile.user.email_verified ? unref(t)("profile.verified") : unref(t)("profile.unverified")), 1)
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
              _push2(`</p></div>`);
              _push2(ssrRenderComponent(_component_UiButton, {
                type: "submit",
                loading: unref(savingAccount)
              }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(`${ssrInterpolate(unref(t)("common.save"))}`);
                  } else {
                    return [
                      createTextVNode(toDisplayString(unref(t)("common.save")), 1)
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
              _push2(`</form>`);
            } else {
              return [
                createVNode("h2", {
                  id: "acc-h",
                  class: "text-xl font-bold"
                }, toDisplayString(unref(t)("profile.account")), 1),
                createVNode("form", {
                  class: "space-y-5",
                  novalidate: "",
                  onSubmit: withModifiers(saveAccount, ["prevent"])
                }, [
                  createVNode(_component_UiFormField, {
                    label: unref(t)("auth.name"),
                    error: unref(accountErrors).name,
                    required: ""
                  }, {
                    default: withCtx(() => [
                      createVNode(_component_UiTextInput, {
                        modelValue: unref(name),
                        "onUpdate:modelValue": ($event) => isRef(name) ? name.value = $event : null,
                        autocomplete: "name",
                        maxlength: 100
                      }, null, 8, ["modelValue", "onUpdate:modelValue"])
                    ]),
                    _: 1
                  }, 8, ["label", "error"]),
                  createVNode("div", null, [
                    createVNode("p", { class: "text-sm font-medium" }, toDisplayString(unref(t)("auth.email")), 1),
                    createVNode("p", { class: "flex flex-wrap items-center gap-2" }, [
                      createVNode("span", { dir: "ltr" }, toDisplayString(unref(data).profile.user.email), 1),
                      createVNode(_component_UiBadge, {
                        tone: unref(data).profile.user.email_verified ? "success" : "warning"
                      }, {
                        default: withCtx(() => [
                          createTextVNode(toDisplayString(unref(data).profile.user.email_verified ? unref(t)("profile.verified") : unref(t)("profile.unverified")), 1)
                        ]),
                        _: 1
                      }, 8, ["tone"])
                    ])
                  ]),
                  createVNode(_component_UiButton, {
                    type: "submit",
                    loading: unref(savingAccount)
                  }, {
                    default: withCtx(() => [
                      createTextVNode(toDisplayString(unref(t)("common.save")), 1)
                    ]),
                    _: 1
                  }, 8, ["loading"])
                ], 32)
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(ssrRenderComponent(_component_UiCard, {
          as: "section",
          "aria-labelledby": "lang-h",
          class: "space-y-4"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<h2 id="lang-h" class="text-xl font-bold"${_scopeId}>${ssrInterpolate(unref(t)("profile.language"))}</h2>`);
              _push2(ssrRenderComponent(_component_UiFormField, {
                label: unref(t)("profile.languageHint")
              }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(ssrRenderComponent(_component_UiSelect, {
                      "model-value": unref(locale),
                      options: unref(localeOptions),
                      "onUpdate:modelValue": changeLanguage
                    }, null, _parent3, _scopeId2));
                  } else {
                    return [
                      createVNode(_component_UiSelect, {
                        "model-value": unref(locale),
                        options: unref(localeOptions),
                        "onUpdate:modelValue": changeLanguage
                      }, null, 8, ["model-value", "options"])
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
            } else {
              return [
                createVNode("h2", {
                  id: "lang-h",
                  class: "text-xl font-bold"
                }, toDisplayString(unref(t)("profile.language")), 1),
                createVNode(_component_UiFormField, {
                  label: unref(t)("profile.languageHint")
                }, {
                  default: withCtx(() => [
                    createVNode(_component_UiSelect, {
                      "model-value": unref(locale),
                      options: unref(localeOptions),
                      "onUpdate:modelValue": changeLanguage
                    }, null, 8, ["model-value", "options"])
                  ]),
                  _: 1
                }, 8, ["label"])
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(ssrRenderComponent(_component_UiCard, {
          as: "section",
          "aria-labelledby": "prof-h",
          class: "space-y-5"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<h2 id="prof-h" class="text-xl font-bold"${_scopeId}>${ssrInterpolate(unref(t)("profile.about"))}</h2><p class="text-ink-soft"${_scopeId}>${ssrInterpolate(unref(t)("profile.aboutHint"))}</p>`);
              if (unref(consentMissing)) {
                _push2(ssrRenderComponent(_component_UiAlert, { tone: "warning" }, {
                  default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                    if (_push3) {
                      _push3(`<p${_scopeId2}>${ssrInterpolate(unref(t)("profile.consentMissing"))}</p>`);
                      _push3(ssrRenderComponent(_component_UiButton, {
                        to: "/privacy-settings",
                        variant: "secondary",
                        class: "mt-3"
                      }, {
                        default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                          if (_push4) {
                            _push4(`${ssrInterpolate(unref(t)("dashboard.personalizationOffCta"))}`);
                          } else {
                            return [
                              createTextVNode(toDisplayString(unref(t)("dashboard.personalizationOffCta")), 1)
                            ];
                          }
                        }),
                        _: 1
                      }, _parent3, _scopeId2));
                    } else {
                      return [
                        createVNode("p", null, toDisplayString(unref(t)("profile.consentMissing")), 1),
                        createVNode(_component_UiButton, {
                          to: "/privacy-settings",
                          variant: "secondary",
                          class: "mt-3"
                        }, {
                          default: withCtx(() => [
                            createTextVNode(toDisplayString(unref(t)("dashboard.personalizationOffCta")), 1)
                          ]),
                          _: 1
                        })
                      ];
                    }
                  }),
                  _: 1
                }, _parent2, _scopeId));
              } else {
                _push2(`<!---->`);
              }
              _push2(`<form class="space-y-6" novalidate${_scopeId}><!--[-->`);
              ssrRenderList(unref(allSteps), (s) => {
                _push2(ssrRenderComponent(_component_ProfileStepFields, {
                  key: s,
                  step: s,
                  form: unref(form),
                  options: unref(data).options,
                  cities: unref(data).cities,
                  errors: unref(errors)
                }, null, _parent2, _scopeId));
              });
              _push2(`<!--]-->`);
              _push2(ssrRenderComponent(_component_UiButton, {
                type: "submit",
                loading: unref(savingProfile)
              }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(`${ssrInterpolate(unref(t)("common.save"))}`);
                  } else {
                    return [
                      createTextVNode(toDisplayString(unref(t)("common.save")), 1)
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
              _push2(`</form>`);
            } else {
              return [
                createVNode("h2", {
                  id: "prof-h",
                  class: "text-xl font-bold"
                }, toDisplayString(unref(t)("profile.about")), 1),
                createVNode("p", { class: "text-ink-soft" }, toDisplayString(unref(t)("profile.aboutHint")), 1),
                unref(consentMissing) ? (openBlock(), createBlock(_component_UiAlert, {
                  key: 0,
                  tone: "warning"
                }, {
                  default: withCtx(() => [
                    createVNode("p", null, toDisplayString(unref(t)("profile.consentMissing")), 1),
                    createVNode(_component_UiButton, {
                      to: "/privacy-settings",
                      variant: "secondary",
                      class: "mt-3"
                    }, {
                      default: withCtx(() => [
                        createTextVNode(toDisplayString(unref(t)("dashboard.personalizationOffCta")), 1)
                      ]),
                      _: 1
                    })
                  ]),
                  _: 1
                })) : createCommentVNode("", true),
                createVNode("form", {
                  class: "space-y-6",
                  novalidate: "",
                  onSubmit: withModifiers(saveProfile, ["prevent"])
                }, [
                  (openBlock(true), createBlock(Fragment, null, renderList(unref(allSteps), (s) => {
                    return openBlock(), createBlock(_component_ProfileStepFields, {
                      key: s,
                      step: s,
                      form: unref(form),
                      options: unref(data).options,
                      cities: unref(data).cities,
                      errors: unref(errors)
                    }, null, 8, ["step", "form", "options", "cities", "errors"]);
                  }), 128)),
                  createVNode(_component_UiButton, {
                    type: "submit",
                    loading: unref(savingProfile)
                  }, {
                    default: withCtx(() => [
                      createTextVNode(toDisplayString(unref(t)("common.save")), 1)
                    ]),
                    _: 1
                  }, 8, ["loading"])
                ], 32)
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(ssrRenderComponent(_component_ProfileChangePassword, null, null, _parent));
        _push(`<div class="flex flex-wrap gap-3">`);
        _push(ssrRenderComponent(_component_UiButton, {
          to: "/privacy-settings",
          variant: "secondary"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_UiIcon, {
                name: "shield",
                size: 18
              }, null, _parent2, _scopeId));
              _push2(`${ssrInterpolate(unref(t)("nav.privacy"))}`);
            } else {
              return [
                createVNode(_component_UiIcon, {
                  name: "shield",
                  size: 18
                }),
                createTextVNode(toDisplayString(unref(t)("nav.privacy")), 1)
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(ssrRenderComponent(_component_UiButton, {
          to: "/settings/security",
          variant: "secondary"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_UiIcon, {
                name: "lock",
                size: 18
              }, null, _parent2, _scopeId));
              _push2(`${ssrInterpolate(unref(t)("sessions.title"))}`);
            } else {
              return [
                createVNode(_component_UiIcon, {
                  name: "lock",
                  size: 18
                }),
                createTextVNode(toDisplayString(unref(t)("sessions.title")), 1)
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(ssrRenderComponent(_component_UiButton, {
          to: "/settings/two-factor",
          variant: "secondary"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_UiIcon, {
                name: "lock",
                size: 18
              }, null, _parent2, _scopeId));
              _push2(`${ssrInterpolate(unref(t)("twoFactor.navLink"))}`);
            } else {
              return [
                createVNode(_component_UiIcon, {
                  name: "lock",
                  size: 18
                }),
                createTextVNode(toDisplayString(unref(t)("twoFactor.navLink")), 1)
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(ssrRenderComponent(_component_UiButton, {
          to: "/settings/billing",
          variant: "secondary"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_UiIcon, {
                name: "euro",
                size: 18
              }, null, _parent2, _scopeId));
              _push2(`${ssrInterpolate(unref(t)("billing.title"))}`);
            } else {
              return [
                createVNode(_component_UiIcon, {
                  name: "euro",
                  size: 18
                }),
                createTextVNode(toDisplayString(unref(t)("billing.title")), 1)
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(ssrRenderComponent(_component_UiButton, {
          to: "/my-requests",
          variant: "secondary"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_UiIcon, {
                name: "send",
                size: 18
              }, null, _parent2, _scopeId));
              _push2(`${ssrInterpolate(unref(t)("services.myRequests"))}`);
            } else {
              return [
                createVNode(_component_UiIcon, {
                  name: "send",
                  size: 18
                }),
                createTextVNode(toDisplayString(unref(t)("services.myRequests")), 1)
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(ssrRenderComponent(_component_UiButton, {
          to: "/provider",
          variant: "ghost"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`${ssrInterpolate(unref(t)("provider.entry"))}`);
            } else {
              return [
                createTextVNode(toDisplayString(unref(t)("provider.entry")), 1)
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(ssrRenderComponent(_component_UiButton, {
          variant: "ghost",
          onClick: logout
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_UiIcon, {
                name: "logout",
                size: 18
              }, null, _parent2, _scopeId));
              _push2(`${ssrInterpolate(unref(t)("auth.logout"))}`);
            } else {
              return [
                createVNode(_component_UiIcon, {
                  name: "logout",
                  size: 18
                }),
                createTextVNode(toDisplayString(unref(t)("auth.logout")), 1)
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div></div>`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/profile.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=profile-BXZVhwLL.mjs.map
