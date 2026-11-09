import { _ as _sfc_main$2 } from './Alert-D-zfMDy5.mjs';
import { u as useI18n, f as useRoute, c as useLocalePath, a as useAuthStore, g as useApi, _ as _sfc_main$3$1, e as __nuxt_component_0, n as navigateTo } from './server.mjs';
import { f as formatCountdown, _ as _sfc_main$6 } from './twoFactor-TZ4hBhIH.mjs';
import { defineComponent, reactive, ref, unref, mergeProps, withCtx, createTextVNode, toDisplayString, createVNode, computed, watch, isRef, useSSRContext } from 'vue';
import { ssrRenderComponent, ssrRenderAttrs, ssrInterpolate, ssrRenderClass } from 'vue/server-renderer';
import { _ as _sfc_main$3 } from './FormField-DFtov8VK.mjs';
import { _ as _sfc_main$4 } from './TextInput-BI4efS3_.mjs';
import { _ as _sfc_main$5 } from './PasswordInput-ClImJukS.mjs';
import { s as safeRedirect } from './safe-B2eSdAXJ.mjs';
import { u as useSeo } from './useSeo-BU4sLOnV.mjs';
import { u as useToast } from './useToast-BX2bodPv.mjs';
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
import 'uqr';

const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "TwoFactorStep",
  __ssrInlineRender: true,
  props: {
    expiresIn: {}
  },
  emits: ["done", "restart"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit = __emit;
    const { t } = useI18n();
    useApi();
    const mode = ref("code");
    const value = ref("");
    const error = ref("");
    const formError = ref("");
    const busy = ref(false);
    const fields = ref(null);
    const deadline = Date.now() + props.expiresIn * 1e3;
    const now = ref(Date.now());
    const remaining = computed(() => Math.max(0, Math.ceil((deadline - now.value) / 1e3)));
    const expired = computed(() => remaining.value <= 0);
    const lockedUntil = ref(0);
    const locked = computed(() => lockedUntil.value > now.value);
    const soon = computed(() => remaining.value > 0 && remaining.value <= 60);
    watch(locked, (l) => {
      if (!l && formError.value && lockedUntil.value) {
        formError.value = "";
        lockedUntil.value = 0;
      }
    });
    watch(expired, (e) => {
      if (e) {
        formError.value = "";
        error.value = "";
      }
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UiAlert = _sfc_main$2;
      const _component_UiButton = _sfc_main$3$1;
      const _component_AuthCodeOrRecovery = _sfc_main$6;
      _push(`<div${ssrRenderAttrs(mergeProps({ "data-testid": "two-factor-step" }, _attrs))}><h1 id="tf-login-h" class="text-2xl font-bold">${ssrInterpolate(unref(t)("twoFactor.login.title"))}</h1><p class="mt-1 text-ink-soft">${ssrInterpolate(unref(mode) === "code" ? unref(t)("twoFactor.login.subtitle") : unref(t)("twoFactor.login.recoverySubtitle"))}</p><p class="${ssrRenderClass([{ "font-semibold text-warning": unref(soon) }, "mt-3 text-sm text-ink-soft"])}" data-testid="two-factor-countdown">`);
      if (!unref(expired)) {
        _push(`<!--[-->${ssrInterpolate(unref(t)("twoFactor.login.expiresIn", { time: unref(formatCountdown)(unref(remaining)) }))}<!--]-->`);
      } else {
        _push(`<!---->`);
      }
      _push(`</p><p class="sr-only" role="status">${ssrInterpolate(unref(soon) ? unref(t)("twoFactor.login.expiresSoon") : "")}</p>`);
      if (unref(expired)) {
        _push(`<div class="mt-4 space-y-3">`);
        _push(ssrRenderComponent(_component_UiAlert, { tone: "danger" }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`${ssrInterpolate(unref(t)("twoFactor.login.expired"))}`);
            } else {
              return [
                createTextVNode(toDisplayString(unref(t)("twoFactor.login.expired")), 1)
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(ssrRenderComponent(_component_UiButton, {
          block: "",
          "data-testid": "two-factor-restart",
          onClick: ($event) => emit("restart", "expired")
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`${ssrInterpolate(unref(t)("twoFactor.login.startAgain"))}`);
            } else {
              return [
                createTextVNode(toDisplayString(unref(t)("twoFactor.login.startAgain")), 1)
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div>`);
      } else {
        _push(`<form class="mt-4 space-y-5" novalidate aria-labelledby="tf-login-h">`);
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
        _push(ssrRenderComponent(_component_AuthCodeOrRecovery, {
          ref_key: "fields",
          ref: fields,
          modelValue: unref(value),
          "onUpdate:modelValue": ($event) => isRef(value) ? value.value = $event : null,
          mode: unref(mode),
          "onUpdate:mode": ($event) => isRef(mode) ? mode.value = $event : null,
          error: unref(error),
          autofocus: ""
        }, null, _parent));
        _push(ssrRenderComponent(_component_UiButton, {
          type: "submit",
          block: "",
          loading: unref(busy),
          disabled: unref(locked)
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`${ssrInterpolate(unref(busy) ? unref(t)("twoFactor.login.verifying") : unref(t)("twoFactor.login.verify"))}`);
            } else {
              return [
                createTextVNode(toDisplayString(unref(busy) ? unref(t)("twoFactor.login.verifying") : unref(t)("twoFactor.login.verify")), 1)
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`<button type="button" class="inline-flex min-h-touch w-full items-center justify-center text-sm font-medium text-primary-strong underline underline-offset-4">${ssrInterpolate(unref(t)("auth.backToLogin"))}</button></form>`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/auth/TwoFactorStep.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "login",
  __ssrInlineRender: true,
  setup(__props) {
    const { t } = useI18n();
    const route = useRoute();
    const localePath = useLocalePath();
    const auth = useAuthStore();
    useApi();
    useSeo(() => ({ title: t("auth.loginTitle"), description: t("auth.loginSubtitle"), noindex: true }));
    const form = reactive({ email: "", password: "" });
    const errors = ref({});
    const formError = ref("");
    const busy = ref(false);
    const challenge = ref(null);
    function restart(reason) {
      challenge.value = null;
      form.password = "";
      formError.value = reason === "lost" ? t("twoFactor.login.challengeLost") : reason === "expired" ? t("twoFactor.login.expired") : "";
    }
    async function finish(user, remaining) {
      auth.setUser(user);
      if (remaining !== null && remaining <= 2) useToast().info(t("twoFactor.login.lowRecovery", { count: remaining }));
      await navigateTo(safeRedirect(route.query.redirect, localePath("/dashboard")));
    }
    return (_ctx, _push, _parent, _attrs) => {
      const _component_AuthTwoFactorStep = _sfc_main$1;
      const _component_UiAlert = _sfc_main$2;
      const _component_UiFormField = _sfc_main$3;
      const _component_UiTextInput = _sfc_main$4;
      const _component_UiPasswordInput = _sfc_main$5;
      const _component_UiButton = _sfc_main$3$1;
      const _component_NuxtLink = __nuxt_component_0;
      if (unref(challenge)) {
        _push(ssrRenderComponent(_component_AuthTwoFactorStep, mergeProps({
          "expires-in": unref(challenge).expiresIn,
          onDone: finish,
          onRestart: restart
        }, _attrs), null, _parent));
      } else {
        _push(`<div${ssrRenderAttrs(_attrs)}><h1 class="text-2xl font-bold">${ssrInterpolate(unref(t)("auth.loginTitle"))}</h1><p class="mt-1 text-ink-soft">${ssrInterpolate(unref(t)("auth.loginSubtitle"))}</p><form class="mt-6 space-y-5" novalidate>`);
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
          error: unref(errors).password,
          required: ""
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_UiPasswordInput, {
                modelValue: unref(form).password,
                "onUpdate:modelValue": ($event) => unref(form).password = $event,
                autocomplete: "current-password"
              }, null, _parent2, _scopeId));
            } else {
              return [
                createVNode(_component_UiPasswordInput, {
                  modelValue: unref(form).password,
                  "onUpdate:modelValue": ($event) => unref(form).password = $event,
                  autocomplete: "current-password"
                }, null, 8, ["modelValue", "onUpdate:modelValue"])
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(ssrRenderComponent(_component_UiButton, {
          type: "submit",
          block: "",
          loading: unref(busy)
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
        _push(`</form><div class="mt-6 flex flex-col gap-1 text-center text-sm">`);
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: unref(localePath)("/forgot-password"),
          class: "inline-flex min-h-touch items-center justify-center text-primary-strong underline underline-offset-4"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`${ssrInterpolate(unref(t)("auth.forgotLink"))}`);
            } else {
              return [
                createTextVNode(toDisplayString(unref(t)("auth.forgotLink")), 1)
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`<p class="text-ink-soft">${ssrInterpolate(unref(t)("auth.noAccount"))} `);
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: unref(localePath)("/register"),
          class: "inline-flex min-h-touch items-center font-medium text-primary-strong underline underline-offset-4"
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
        _push(`</p></div></div>`);
      }
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/login.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=login-BbWNjlh-.mjs.map
