import { _ as _sfc_main$2 } from './Skeleton-BTnKIEst.mjs';
import { u as useI18n, c as useLocalePath, g as useApi, i as _sfc_main$2$1, j as isApiError, _ as _sfc_main$3$1, d as _sfc_main$5$1, l as fieldErrors, n as navigateTo } from './server.mjs';
import { _ as _sfc_main$3 } from './Card-BxvVO_-_.mjs';
import { _ as _sfc_main$4 } from './AutoItalian-BD4PyQ-n.mjs';
import { _ as _sfc_main$5 } from './Checkbox-PDAPbGXG.mjs';
import { _ as _sfc_main$6 } from './Alert-D-zfMDy5.mjs';
import { defineComponent, withAsyncContext, reactive, ref, computed, watch, mergeProps, unref, withCtx, isRef, createTextVNode, toDisplayString, createVNode, openBlock, createBlock, createCommentVNode, withModifiers, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderAttr, ssrRenderList, ssrRenderClass } from 'vue/server-renderer';
import { _ as _sfc_main$7 } from './Badge-PdKIsny2.mjs';
import { e as emptyProfileForm, f as formFromProfile, _ as _sfc_main$8, S as STEP_FIELDS, p as patchBody } from './useProfileForm-B3Xk-pQq.mjs';
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
import './FormField-DFtov8VK.mjs';
import './Select-BjjHKxeN.mjs';
import './countries-e88Gbu9b.mjs';
import './safe-B2eSdAXJ.mjs';
import 'perfect-debounce';

const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "Stepper",
  __ssrInlineRender: true,
  props: {
    steps: {},
    label: {}
  },
  setup(__props) {
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<nav${ssrRenderAttrs(mergeProps({ "aria-label": __props.label }, _attrs))}><ol class="flex items-center gap-1.5"><!--[-->`);
      ssrRenderList(__props.steps, (s, i) => {
        _push(`<li class="flex min-w-0 flex-1 items-center"${ssrRenderAttr("aria-current", s.state === "current" ? "step" : void 0)}><span class="sr-only">${ssrInterpolate(i + 1)}/${ssrInterpolate(__props.steps.length)} ${ssrInterpolate(s.label)}</span><span class="${ssrRenderClass([s.state === "done" ? "bg-primary" : s.state === "current" ? "bg-accent" : s.state === "skipped" ? "bg-line-strong" : "bg-sunken", "h-2 flex-1 rounded-full"])}" aria-hidden="true"></span></li>`);
      });
      _push(`<!--]--></ol></nav>`);
    };
  }
});
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/ui/Stepper.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "onboarding",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const { t, locale } = useI18n();
    const localePath = useLocalePath();
    const { request } = useApi();
    const toast = useToast();
    useSeo(() => ({ title: t("onboarding.title"), description: t("onboarding.subtitle"), noindex: true }));
    const { data, error, refresh, status } = ([__temp, __restore] = withAsyncContext(async () => useAsyncData("onboarding", async () => {
      const [options, profile, consents, purposes, cities] = await Promise.all([
        request("profile/options"),
        request("profile"),
        request("profile/consents"),
        request("privacy/purposes"),
        request("cities")
      ]);
      return { options: options.data, profile: profile.data, consents: consents.data, purposes: purposes.data, cities: cities.data };
    }, { watch: [locale] })), __temp = await __temp, __restore(), __temp);
    const form = reactive(emptyProfileForm());
    const stepIndex = ref(0);
    const needConsent = ref(false);
    const errors = ref({});
    const banner = ref(null);
    const busy = ref(false);
    const initialised = ref(false);
    const steps = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.options.onboarding_steps) != null ? _b : [];
    });
    const current = computed(() => steps.value[stepIndex.value]);
    const personalizationPurpose = computed(() => {
      var _a;
      return (_a = data.value) == null ? void 0 : _a.purposes.purposes.find((p) => p.key === "profile_personalization");
    });
    const hasConsent = computed(() => {
      var _a, _b;
      return ((_b = (_a = data.value) == null ? void 0 : _a.consents.consents.profile_personalization) == null ? void 0 : _b.granted) === true;
    });
    const optIn = ref(false);
    watch(data, (d) => {
      if (!d || initialised.value) return;
      initialised.value = true;
      Object.assign(form, formFromProfile(d.profile));
      needConsent.value = !hasConsent.value;
      const firstPending = d.profile.onboarding.steps.findIndex((s) => s.status === "pending");
      stepIndex.value = Math.max(0, firstPending);
    }, { immediate: true });
    const stepper = computed(() => steps.value.map((s, i) => {
      var _a, _b;
      const st = (_b = (_a = data.value) == null ? void 0 : _a.profile.onboarding.steps.find((x) => x.key === s.key)) == null ? void 0 : _b.status;
      return { key: s.key, label: s.title, state: i === stepIndex.value ? "current" : st === "answered" ? "done" : st === "skipped" ? "skipped" : i < stepIndex.value ? "done" : "upcoming" };
    }));
    function handleError(e) {
      errors.value = fieldErrors(e);
      if (isApiError(e) && e.code === "consent_required") {
        needConsent.value = true;
        banner.value = { tone: "warning", text: e.message };
      } else if (isApiError(e) && e.code === "email_not_verified") {
        banner.value = { tone: "warning", text: e.message };
      } else if (!Object.keys(errors.value).length) {
        banner.value = { tone: "danger", text: isApiError(e) ? e.message : t("errors.generic") };
      }
    }
    async function reloadProfile() {
      const res = await request("profile");
      if (data.value) data.value = { ...data.value, profile: res.data };
    }
    async function grantConsent() {
      busy.value = true;
      banner.value = null;
      try {
        const res = await request("profile/consents", { method: "PUT", body: { consents: { profile_personalization: true } } });
        if (data.value) data.value = { ...data.value, consents: res.data };
        needConsent.value = false;
      } catch (e) {
        handleError(e);
      } finally {
        busy.value = false;
      }
    }
    async function finish() {
      try {
        await request("profile/onboarding/complete", { method: "POST" });
        toast.success(t("onboarding.done"));
        await navigateTo(localePath("/dashboard"));
      } catch (e) {
        if (isApiError(e) && e.code === "onboarding_incomplete") {
          stepIndex.value = 0;
          banner.value = { tone: "warning", text: e.message };
        } else handleError(e);
      }
    }
    async function advance() {
      if (stepIndex.value >= steps.value.length - 1) await finish();
      else stepIndex.value += 1;
    }
    async function next() {
      var _a;
      const step = current.value;
      if (!step) return;
      busy.value = true;
      errors.value = {};
      banner.value = null;
      try {
        const fields = (_a = STEP_FIELDS[step.key]) != null ? _a : [];
        const empty = fields.every((f) => Array.isArray(form[f]) ? form[f].length === 0 : !form[f]);
        if (empty && step.required) {
          errors.value = { [fields[0]]: t("onboarding.answerRequired") };
          return;
        }
        if (empty) await request("profile/onboarding/skip", { method: "POST", body: { step: step.key } });
        else await request("profile", { method: "PATCH", body: patchBody(form, fields) });
        await reloadProfile();
        await advance();
      } catch (e) {
        handleError(e);
      } finally {
        busy.value = false;
      }
    }
    async function skip() {
      const step = current.value;
      if (!step || step.required) return;
      busy.value = true;
      banner.value = null;
      try {
        await request("profile/onboarding/skip", { method: "POST", body: { step: step.key } });
        await reloadProfile();
        await advance();
      } catch (e) {
        handleError(e);
      } finally {
        busy.value = false;
      }
    }
    function back() {
      errors.value = {};
      banner.value = null;
      if (stepIndex.value > 0) stepIndex.value -= 1;
    }
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UiSkeleton = _sfc_main$2;
      const _component_UiErrorState = _sfc_main$2$1;
      const _component_UiCard = _sfc_main$3;
      const _component_UiAutoItalian = _sfc_main$4;
      const _component_UiCheckbox = _sfc_main$5;
      const _component_UiAlert = _sfc_main$6;
      const _component_UiButton = _sfc_main$3$1;
      const _component_UiStepper = _sfc_main$1;
      const _component_UiBadge = _sfc_main$7;
      const _component_ProfileStepFields = _sfc_main$8;
      const _component_UiIcon = _sfc_main$5$1;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "container-page max-w-2xl py-8 sm:py-12" }, _attrs))}>`);
      if (unref(status) === "pending" && !unref(data)) {
        _push(`<div aria-busy="true" class="space-y-4">`);
        _push(ssrRenderComponent(_component_UiSkeleton, { block: "" }, null, _parent));
        _push(ssrRenderComponent(_component_UiSkeleton, { lines: 4 }, null, _parent));
        _push(`</div>`);
      } else if (unref(error) || !unref(data)) {
        _push(ssrRenderComponent(_component_UiErrorState, {
          message: ("isApiError" in _ctx ? _ctx.isApiError : unref(isApiError))(unref(error)) ? unref(error).message : void 0,
          retry: "",
          onRetry: ($event) => unref(refresh)()
        }, null, _parent));
      } else {
        _push(`<!--[--><h1 class="text-2xl font-bold sm:text-3xl">${ssrInterpolate(unref(t)("onboarding.title"))}</h1><p class="mt-1 text-ink-soft">${ssrInterpolate(unref(t)("onboarding.subtitle"))}</p>`);
        if (unref(needConsent) && unref(personalizationPurpose)) {
          _push(ssrRenderComponent(_component_UiCard, { class: "mt-6 space-y-4" }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`<h2 class="text-xl font-bold"${_scopeId}>${ssrInterpolate(unref(t)("onboarding.consentTitle"))}</h2><p class="text-ink-soft"${_scopeId}>${ssrInterpolate(unref(t)("onboarding.consentIntro"))}</p><div class="rounded-md bg-primary-soft p-4"${_scopeId}><p class="font-semibold"${_scopeId}>`);
                _push2(ssrRenderComponent(_component_UiAutoItalian, {
                  text: unref(personalizationPurpose).title
                }, null, _parent2, _scopeId));
                _push2(`</p><p class="mt-1"${_scopeId}>${ssrInterpolate(unref(personalizationPurpose).why)}</p><p class="mt-2 text-sm text-ink-soft"${_scopeId}><span class="font-semibold"${_scopeId}>${ssrInterpolate(unref(t)("privacy.dataCollected"))}:</span> ${ssrInterpolate(unref(personalizationPurpose).data)}</p></div>`);
                _push2(ssrRenderComponent(_component_UiCheckbox, {
                  modelValue: unref(optIn),
                  "onUpdate:modelValue": ($event) => isRef(optIn) ? optIn.value = $event : null,
                  label: unref(t)("onboarding.consentCheckbox")
                }, null, _parent2, _scopeId));
                if (unref(banner)) {
                  _push2(ssrRenderComponent(_component_UiAlert, {
                    tone: unref(banner).tone
                  }, {
                    default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                      if (_push3) {
                        _push3(`${ssrInterpolate(unref(banner).text)}`);
                      } else {
                        return [
                          createTextVNode(toDisplayString(unref(banner).text), 1)
                        ];
                      }
                    }),
                    _: 1
                  }, _parent2, _scopeId));
                } else {
                  _push2(`<!---->`);
                }
                _push2(`<div class="flex flex-col gap-3 sm:flex-row"${_scopeId}>`);
                _push2(ssrRenderComponent(_component_UiButton, {
                  disabled: !unref(optIn),
                  loading: unref(busy),
                  onClick: grantConsent
                }, {
                  default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                    if (_push3) {
                      _push3(`${ssrInterpolate(unref(t)("onboarding.consentAllow"))}`);
                    } else {
                      return [
                        createTextVNode(toDisplayString(unref(t)("onboarding.consentAllow")), 1)
                      ];
                    }
                  }),
                  _: 1
                }, _parent2, _scopeId));
                _push2(ssrRenderComponent(_component_UiButton, {
                  variant: "secondary",
                  to: "/dashboard"
                }, {
                  default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                    if (_push3) {
                      _push3(`${ssrInterpolate(unref(t)("onboarding.consentDecline"))}`);
                    } else {
                      return [
                        createTextVNode(toDisplayString(unref(t)("onboarding.consentDecline")), 1)
                      ];
                    }
                  }),
                  _: 1
                }, _parent2, _scopeId));
                _push2(`</div><p class="text-sm text-muted"${_scopeId}>${ssrInterpolate(unref(t)("onboarding.consentDeclineNote"))}</p>`);
              } else {
                return [
                  createVNode("h2", { class: "text-xl font-bold" }, toDisplayString(unref(t)("onboarding.consentTitle")), 1),
                  createVNode("p", { class: "text-ink-soft" }, toDisplayString(unref(t)("onboarding.consentIntro")), 1),
                  createVNode("div", { class: "rounded-md bg-primary-soft p-4" }, [
                    createVNode("p", { class: "font-semibold" }, [
                      createVNode(_component_UiAutoItalian, {
                        text: unref(personalizationPurpose).title
                      }, null, 8, ["text"])
                    ]),
                    createVNode("p", { class: "mt-1" }, toDisplayString(unref(personalizationPurpose).why), 1),
                    createVNode("p", { class: "mt-2 text-sm text-ink-soft" }, [
                      createVNode("span", { class: "font-semibold" }, toDisplayString(unref(t)("privacy.dataCollected")) + ":", 1),
                      createTextVNode(" " + toDisplayString(unref(personalizationPurpose).data), 1)
                    ])
                  ]),
                  createVNode(_component_UiCheckbox, {
                    modelValue: unref(optIn),
                    "onUpdate:modelValue": ($event) => isRef(optIn) ? optIn.value = $event : null,
                    label: unref(t)("onboarding.consentCheckbox")
                  }, null, 8, ["modelValue", "onUpdate:modelValue", "label"]),
                  unref(banner) ? (openBlock(), createBlock(_component_UiAlert, {
                    key: 0,
                    tone: unref(banner).tone
                  }, {
                    default: withCtx(() => [
                      createTextVNode(toDisplayString(unref(banner).text), 1)
                    ]),
                    _: 1
                  }, 8, ["tone"])) : createCommentVNode("", true),
                  createVNode("div", { class: "flex flex-col gap-3 sm:flex-row" }, [
                    createVNode(_component_UiButton, {
                      disabled: !unref(optIn),
                      loading: unref(busy),
                      onClick: grantConsent
                    }, {
                      default: withCtx(() => [
                        createTextVNode(toDisplayString(unref(t)("onboarding.consentAllow")), 1)
                      ]),
                      _: 1
                    }, 8, ["disabled", "loading"]),
                    createVNode(_component_UiButton, {
                      variant: "secondary",
                      to: "/dashboard"
                    }, {
                      default: withCtx(() => [
                        createTextVNode(toDisplayString(unref(t)("onboarding.consentDecline")), 1)
                      ]),
                      _: 1
                    })
                  ]),
                  createVNode("p", { class: "text-sm text-muted" }, toDisplayString(unref(t)("onboarding.consentDeclineNote")), 1)
                ];
              }
            }),
            _: 1
          }, _parent));
        } else if (unref(current)) {
          _push(`<section class="mt-6 space-y-5"${ssrRenderAttr("aria-labelledby", "step-h")}>`);
          _push(ssrRenderComponent(_component_UiStepper, {
            steps: unref(stepper),
            label: unref(t)("onboarding.progress")
          }, null, _parent));
          _push(`<p class="text-sm text-muted" aria-live="polite">${ssrInterpolate(unref(t)("onboarding.stepOf", { current: unref(stepIndex) + 1, total: unref(steps).length }))}</p>`);
          _push(ssrRenderComponent(_component_UiCard, { class: "space-y-5" }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`<div class="space-y-2"${_scopeId}><div class="flex flex-wrap items-center gap-2"${_scopeId}><h2 id="step-h" class="text-xl font-bold"${_scopeId}>${ssrInterpolate(unref(current).title)}</h2>`);
                _push2(ssrRenderComponent(_component_UiBadge, {
                  tone: unref(current).required ? "accent" : "neutral"
                }, {
                  default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                    if (_push3) {
                      _push3(`${ssrInterpolate(unref(current).required ? unref(t)("common.required") : unref(t)("common.optional"))}`);
                    } else {
                      return [
                        createTextVNode(toDisplayString(unref(current).required ? unref(t)("common.required") : unref(t)("common.optional")), 1)
                      ];
                    }
                  }),
                  _: 1
                }, _parent2, _scopeId));
                _push2(`</div><p class="text-ink-soft"${_scopeId}>${ssrInterpolate(unref(current).why)}</p></div>`);
                if (unref(banner)) {
                  _push2(ssrRenderComponent(_component_UiAlert, {
                    tone: unref(banner).tone
                  }, {
                    default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                      if (_push3) {
                        _push3(`${ssrInterpolate(unref(banner).text)}`);
                      } else {
                        return [
                          createTextVNode(toDisplayString(unref(banner).text), 1)
                        ];
                      }
                    }),
                    _: 1
                  }, _parent2, _scopeId));
                } else {
                  _push2(`<!---->`);
                }
                _push2(`<form class="space-y-5" novalidate${_scopeId}>`);
                _push2(ssrRenderComponent(_component_ProfileStepFields, {
                  step: unref(current).key,
                  form: unref(form),
                  options: unref(data).options,
                  cities: unref(data).cities,
                  errors: unref(errors),
                  label: unref(current).title
                }, null, _parent2, _scopeId));
                _push2(`<div class="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between"${_scopeId}>`);
                _push2(ssrRenderComponent(_component_UiButton, {
                  variant: "ghost",
                  disabled: unref(stepIndex) === 0 || unref(busy),
                  onClick: back
                }, {
                  default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                    if (_push3) {
                      _push3(ssrRenderComponent(_component_UiIcon, {
                        name: "arrow-start",
                        size: 18
                      }, null, _parent3, _scopeId2));
                      _push3(`${ssrInterpolate(unref(t)("common.back"))}`);
                    } else {
                      return [
                        createVNode(_component_UiIcon, {
                          name: "arrow-start",
                          size: 18
                        }),
                        createTextVNode(toDisplayString(unref(t)("common.back")), 1)
                      ];
                    }
                  }),
                  _: 1
                }, _parent2, _scopeId));
                _push2(`<div class="flex flex-col gap-3 sm:flex-row"${_scopeId}>`);
                if (!unref(current).required) {
                  _push2(ssrRenderComponent(_component_UiButton, {
                    variant: "secondary",
                    disabled: unref(busy),
                    onClick: skip
                  }, {
                    default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                      if (_push3) {
                        _push3(`${ssrInterpolate(unref(t)("onboarding.skip"))}`);
                      } else {
                        return [
                          createTextVNode(toDisplayString(unref(t)("onboarding.skip")), 1)
                        ];
                      }
                    }),
                    _: 1
                  }, _parent2, _scopeId));
                } else {
                  _push2(`<!---->`);
                }
                _push2(ssrRenderComponent(_component_UiButton, {
                  type: "submit",
                  loading: unref(busy)
                }, {
                  default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                    if (_push3) {
                      _push3(`${ssrInterpolate(unref(stepIndex) === unref(steps).length - 1 ? unref(t)("onboarding.finish") : unref(t)("common.continue"))}`);
                      _push3(ssrRenderComponent(_component_UiIcon, {
                        name: "arrow-end",
                        size: 18
                      }, null, _parent3, _scopeId2));
                    } else {
                      return [
                        createTextVNode(toDisplayString(unref(stepIndex) === unref(steps).length - 1 ? unref(t)("onboarding.finish") : unref(t)("common.continue")), 1),
                        createVNode(_component_UiIcon, {
                          name: "arrow-end",
                          size: 18
                        })
                      ];
                    }
                  }),
                  _: 1
                }, _parent2, _scopeId));
                _push2(`</div></div></form>`);
              } else {
                return [
                  createVNode("div", { class: "space-y-2" }, [
                    createVNode("div", { class: "flex flex-wrap items-center gap-2" }, [
                      createVNode("h2", {
                        id: "step-h",
                        class: "text-xl font-bold"
                      }, toDisplayString(unref(current).title), 1),
                      createVNode(_component_UiBadge, {
                        tone: unref(current).required ? "accent" : "neutral"
                      }, {
                        default: withCtx(() => [
                          createTextVNode(toDisplayString(unref(current).required ? unref(t)("common.required") : unref(t)("common.optional")), 1)
                        ]),
                        _: 1
                      }, 8, ["tone"])
                    ]),
                    createVNode("p", { class: "text-ink-soft" }, toDisplayString(unref(current).why), 1)
                  ]),
                  unref(banner) ? (openBlock(), createBlock(_component_UiAlert, {
                    key: 0,
                    tone: unref(banner).tone
                  }, {
                    default: withCtx(() => [
                      createTextVNode(toDisplayString(unref(banner).text), 1)
                    ]),
                    _: 1
                  }, 8, ["tone"])) : createCommentVNode("", true),
                  createVNode("form", {
                    class: "space-y-5",
                    novalidate: "",
                    onSubmit: withModifiers(next, ["prevent"])
                  }, [
                    createVNode(_component_ProfileStepFields, {
                      step: unref(current).key,
                      form: unref(form),
                      options: unref(data).options,
                      cities: unref(data).cities,
                      errors: unref(errors),
                      label: unref(current).title
                    }, null, 8, ["step", "form", "options", "cities", "errors", "label"]),
                    createVNode("div", { class: "flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between" }, [
                      createVNode(_component_UiButton, {
                        variant: "ghost",
                        disabled: unref(stepIndex) === 0 || unref(busy),
                        onClick: back
                      }, {
                        default: withCtx(() => [
                          createVNode(_component_UiIcon, {
                            name: "arrow-start",
                            size: 18
                          }),
                          createTextVNode(toDisplayString(unref(t)("common.back")), 1)
                        ]),
                        _: 1
                      }, 8, ["disabled"]),
                      createVNode("div", { class: "flex flex-col gap-3 sm:flex-row" }, [
                        !unref(current).required ? (openBlock(), createBlock(_component_UiButton, {
                          key: 0,
                          variant: "secondary",
                          disabled: unref(busy),
                          onClick: skip
                        }, {
                          default: withCtx(() => [
                            createTextVNode(toDisplayString(unref(t)("onboarding.skip")), 1)
                          ]),
                          _: 1
                        }, 8, ["disabled"])) : createCommentVNode("", true),
                        createVNode(_component_UiButton, {
                          type: "submit",
                          loading: unref(busy)
                        }, {
                          default: withCtx(() => [
                            createTextVNode(toDisplayString(unref(stepIndex) === unref(steps).length - 1 ? unref(t)("onboarding.finish") : unref(t)("common.continue")), 1),
                            createVNode(_component_UiIcon, {
                              name: "arrow-end",
                              size: 18
                            })
                          ]),
                          _: 1
                        }, 8, ["loading"])
                      ])
                    ])
                  ], 32)
                ];
              }
            }),
            _: 1
          }, _parent));
          _push(`<p class="text-center">`);
          _push(ssrRenderComponent(_component_UiButton, {
            to: "/dashboard",
            variant: "ghost"
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`${ssrInterpolate(unref(t)("onboarding.skipAll"))}`);
              } else {
                return [
                  createTextVNode(toDisplayString(unref(t)("onboarding.skipAll")), 1)
                ];
              }
            }),
            _: 1
          }, _parent));
          _push(`</p></section>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<!--]-->`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/onboarding.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=onboarding-BmtCpt0a.mjs.map
