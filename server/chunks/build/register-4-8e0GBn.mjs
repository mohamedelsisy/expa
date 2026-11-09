import { _ as _sfc_main$1 } from './Alert-D-zfMDy5.mjs';
import { _ as _sfc_main$2 } from './FormField-DFtov8VK.mjs';
import { _ as _sfc_main$3 } from './TextInput-BI4efS3_.mjs';
import { _ as _sfc_main$4 } from './PasswordInput-ClImJukS.mjs';
import { _ as _sfc_main$5 } from './Links-BHP4RLan.mjs';
import { _ as _sfc_main$6 } from './Skeleton-BTnKIEst.mjs';
import { u as useI18n, c as useLocalePath, a as useAuthStore, g as useApi, i as _sfc_main$2$1, j as isApiError, _ as _sfc_main$3$1, e as __nuxt_component_0 } from './server.mjs';
import { _ as _sfc_main$7 } from './ConsentPurposeItem-CPAtz3HV.mjs';
import { defineComponent, withAsyncContext, computed, reactive, ref, unref, withCtx, createTextVNode, toDisplayString, createVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrInterpolate, ssrRenderComponent, ssrRenderAttr, ssrRenderList } from 'vue/server-renderer';
import { u as useToast } from './useToast-BX2bodPv.mjs';
import { u as useSeo } from './useSeo-BU4sLOnV.mjs';
import { u as useAsyncData } from './asyncData-bKJD5Wmv.mjs';
import './legal-vAxOkaZS.mjs';
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
import './AutoItalian-BD4PyQ-n.mjs';
import './Badge-PdKIsny2.mjs';
import './safe-B2eSdAXJ.mjs';
import 'perfect-debounce';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "register",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const { t, locale } = useI18n();
    const localePath = useLocalePath();
    useAuthStore();
    useToast();
    const { request } = useApi();
    useSeo(() => ({ title: t("auth.registerTitle"), description: t("auth.registerSubtitle"), noindex: true }));
    const { data: purposesRes, error: purposesError, refresh, status } = ([__temp, __restore] = withAsyncContext(() => useAsyncData("register-purposes", () => request("privacy/purposes", { handle401: false }), { watch: [locale] })), __temp = await __temp, __restore(), __temp);
    const purposes = computed(() => {
      var _a, _b;
      return (_b = (_a = purposesRes.value) == null ? void 0 : _a.data.purposes) != null ? _b : [];
    });
    const required = computed(() => purposes.value.filter((p) => p.required));
    const optional = computed(() => purposes.value.filter((p) => !p.required));
    const form = reactive({ name: "", email: "", password: "", password_confirmation: "", accept_terms: false, accept_privacy: false });
    const optIn = reactive({});
    const errors = ref({});
    const formError = ref("");
    const busy = ref(false);
    function acceptKey(key) {
      return key === "terms" ? "accept_terms" : key === "privacy" ? "accept_privacy" : null;
    }
    return (_ctx, _push, _parent, _attrs) => {
      var _a;
      const _component_UiAlert = _sfc_main$1;
      const _component_UiFormField = _sfc_main$2;
      const _component_UiTextInput = _sfc_main$3;
      const _component_UiPasswordInput = _sfc_main$4;
      const _component_LegalLinks = _sfc_main$5;
      const _component_UiSkeleton = _sfc_main$6;
      const _component_UiErrorState = _sfc_main$2$1;
      const _component_ProfileConsentPurposeItem = _sfc_main$7;
      const _component_UiButton = _sfc_main$3$1;
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(_attrs)}><h1 class="text-2xl font-bold">${ssrInterpolate(unref(t)("auth.registerTitle"))}</h1><p class="mt-1 text-ink-soft">${ssrInterpolate(unref(t)("auth.registerSubtitle"))}</p><form class="mt-6 space-y-5" novalidate>`);
      if (unref(formError)) {
        _push(ssrRenderComponent(_component_UiAlert, { tone: "danger" }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`${ssrInterpolate(unref(formError))}`);
            } else {
              return [
                createTextVNode(toDisplayString(unref(formError)), 1)
              ];
            }
          }),
          _: 1
        }, _parent));
      } else {
        _push(`<!---->`);
      }
      _push(ssrRenderComponent(_component_UiFormField, {
        label: unref(t)("auth.name"),
        error: unref(errors).name,
        required: ""
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_UiTextInput, {
              modelValue: unref(form).name,
              "onUpdate:modelValue": ($event) => unref(form).name = $event,
              autocomplete: "name",
              maxlength: 100
            }, null, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_UiTextInput, {
                modelValue: unref(form).name,
                "onUpdate:modelValue": ($event) => unref(form).name = $event,
                autocomplete: "name",
                maxlength: 100
              }, null, 8, ["modelValue", "onUpdate:modelValue"])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_UiFormField, {
        label: unref(t)("auth.email"),
        error: unref(errors).email,
        required: ""
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_UiTextInput, {
              modelValue: unref(form).email,
              "onUpdate:modelValue": ($event) => unref(form).email = $event,
              type: "email",
              autocomplete: "email",
              inputmode: "email",
              ltr: ""
            }, null, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_UiTextInput, {
                modelValue: unref(form).email,
                "onUpdate:modelValue": ($event) => unref(form).email = $event,
                type: "email",
                autocomplete: "email",
                inputmode: "email",
                ltr: ""
              }, null, 8, ["modelValue", "onUpdate:modelValue"])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_UiFormField, {
        label: unref(t)("auth.password"),
        hint: unref(t)("auth.passwordHint"),
        error: unref(errors).password,
        required: ""
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_UiPasswordInput, {
              modelValue: unref(form).password,
              "onUpdate:modelValue": ($event) => unref(form).password = $event,
              autocomplete: "new-password"
            }, null, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_UiPasswordInput, {
                modelValue: unref(form).password,
                "onUpdate:modelValue": ($event) => unref(form).password = $event,
                autocomplete: "new-password"
              }, null, 8, ["modelValue", "onUpdate:modelValue"])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_UiFormField, {
        label: unref(t)("auth.passwordConfirm"),
        error: unref(errors).password_confirmation,
        required: ""
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_UiPasswordInput, {
              modelValue: unref(form).password_confirmation,
              "onUpdate:modelValue": ($event) => unref(form).password_confirmation = $event,
              autocomplete: "new-password"
            }, null, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_UiPasswordInput, {
                modelValue: unref(form).password_confirmation,
                "onUpdate:modelValue": ($event) => unref(form).password_confirmation = $event,
                autocomplete: "new-password"
              }, null, 8, ["modelValue", "onUpdate:modelValue"])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<section class="space-y-3"${ssrRenderAttr("aria-label", unref(t)("register.privacyTitle"))}><h2 class="text-lg font-bold">${ssrInterpolate(unref(t)("register.privacyTitle"))}</h2><p class="text-sm text-ink-soft">${ssrInterpolate(unref(t)("register.privacyIntro"))}</p>`);
      _push(ssrRenderComponent(_component_LegalLinks, {
        version: (_a = unref(purposesRes)) == null ? void 0 : _a.data.policy_version
      }, null, _parent));
      if (unref(status) === "pending" && !unref(purposesRes)) {
        _push(`<div aria-busy="true">`);
        _push(ssrRenderComponent(_component_UiSkeleton, {
          block: "",
          lines: 2
        }, null, _parent));
        _push(`</div>`);
      } else if (unref(purposesError)) {
        _push(ssrRenderComponent(_component_UiErrorState, {
          message: ("isApiError" in _ctx ? _ctx.isApiError : unref(isApiError))(unref(purposesError)) ? unref(purposesError).message : void 0,
          retry: "",
          onRetry: ($event) => unref(refresh)()
        }, null, _parent));
      } else {
        _push(`<!--[--><!--[-->`);
        ssrRenderList(unref(required), (p) => {
          _push(ssrRenderComponent(_component_ProfileConsentPurposeItem, {
            key: p.key,
            purpose: p,
            "model-value": acceptKey(p.key) ? unref(form)[acceptKey(p.key)] : true,
            "error-text": acceptKey(p.key) ? unref(errors)[acceptKey(p.key)] : void 0,
            "onUpdate:modelValue": ($event) => acceptKey(p.key) && (unref(form)[acceptKey(p.key)] = $event)
          }, null, _parent));
        });
        _push(`<!--]-->`);
        if (unref(optional).length) {
          _push(`<h3 class="pt-2 text-base font-bold">${ssrInterpolate(unref(t)("register.optionalTitle"))}</h3>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(optional).length) {
          _push(`<p class="text-sm text-ink-soft">${ssrInterpolate(unref(t)("register.optionalIntro"))}</p>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<!--[-->`);
        ssrRenderList(unref(optional), (p) => {
          _push(ssrRenderComponent(_component_ProfileConsentPurposeItem, {
            key: p.key,
            purpose: p,
            "model-value": !!unref(optIn)[p.key],
            "onUpdate:modelValue": ($event) => unref(optIn)[p.key] = $event
          }, null, _parent));
        });
        _push(`<!--]--><!--]-->`);
      }
      _push(`</section>`);
      _push(ssrRenderComponent(_component_UiButton, {
        type: "submit",
        block: "",
        loading: unref(busy),
        disabled: !!unref(purposesError)
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`${ssrInterpolate(unref(t)("auth.register"))}`);
          } else {
            return [
              createTextVNode(toDisplayString(unref(t)("auth.register")), 1)
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</form><p class="mt-6 text-center text-sm text-ink-soft">${ssrInterpolate(unref(t)("auth.haveAccount"))} `);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: unref(localePath)("/login"),
        class: "inline-flex min-h-touch items-center font-medium text-primary-strong underline underline-offset-4"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`${ssrInterpolate(unref(t)("auth.login"))}`);
          } else {
            return [
              createTextVNode(toDisplayString(unref(t)("auth.login")), 1)
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</p></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/register.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=register-4-8e0GBn.mjs.map
