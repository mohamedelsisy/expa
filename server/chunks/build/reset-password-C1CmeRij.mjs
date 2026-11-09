import { _ as _sfc_main$1 } from './Alert-D-zfMDy5.mjs';
import { u as useI18n, f as useRoute, c as useLocalePath, g as useApi, _ as _sfc_main$3, e as __nuxt_component_0 } from './server.mjs';
import { _ as _sfc_main$2 } from './FormField-DFtov8VK.mjs';
import { _ as _sfc_main$4 } from './TextInput-BI4efS3_.mjs';
import { _ as _sfc_main$5 } from './PasswordInput-ClImJukS.mjs';
import { defineComponent, computed, ref, reactive, unref, withCtx, createTextVNode, toDisplayString, isRef, createVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrInterpolate, ssrRenderComponent } from 'vue/server-renderer';
import { u as useSeo } from './useSeo-BU4sLOnV.mjs';
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

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "reset-password",
  __ssrInlineRender: true,
  setup(__props) {
    var _a;
    const { t } = useI18n();
    const route = useRoute();
    const localePath = useLocalePath();
    useApi();
    useSeo(() => ({ title: t("auth.resetTitle"), description: t("auth.resetSubtitle"), noindex: true }));
    const token = computed(() => {
      var _a2;
      return String((_a2 = route.query.token) != null ? _a2 : "");
    });
    const email = ref(String((_a = route.query.email) != null ? _a : ""));
    const form = reactive({ password: "", password_confirmation: "" });
    const errors = ref({});
    const formError = ref("");
    const done = ref("");
    const busy = ref(false);
    const linkMissing = computed(() => !token.value);
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UiAlert = _sfc_main$1;
      const _component_UiButton = _sfc_main$3;
      const _component_UiFormField = _sfc_main$2;
      const _component_UiTextInput = _sfc_main$4;
      const _component_UiPasswordInput = _sfc_main$5;
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(_attrs)}><h1 class="text-2xl font-bold">${ssrInterpolate(unref(t)("auth.resetTitle"))}</h1>`);
      if (unref(linkMissing)) {
        _push(ssrRenderComponent(_component_UiAlert, {
          tone: "danger",
          class: "mt-6"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`${ssrInterpolate(unref(t)("auth.resetLinkMissing"))}`);
            } else {
              return [
                createTextVNode(toDisplayString(unref(t)("auth.resetLinkMissing")), 1)
              ];
            }
          }),
          _: 1
        }, _parent));
      } else if (unref(done)) {
        _push(`<!--[-->`);
        _push(ssrRenderComponent(_component_UiAlert, {
          tone: "success",
          class: "mt-6"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`${ssrInterpolate(unref(done))}`);
            } else {
              return [
                createTextVNode(toDisplayString(unref(done)), 1)
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(ssrRenderComponent(_component_UiButton, {
          to: "/login",
          block: "",
          class: "mt-6"
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
        _push(`<!--]-->`);
      } else {
        _push(`<form class="mt-6 space-y-5" novalidate><p class="text-ink-soft">${ssrInterpolate(unref(t)("auth.resetSubtitle"))}</p>`);
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
                modelValue: unref(email),
                "onUpdate:modelValue": ($event) => isRef(email) ? email.value = $event : null,
                type: "email",
                autocomplete: "email",
                ltr: ""
              }, null, _parent2, _scopeId));
            } else {
              return [
                createVNode(_component_UiTextInput, {
                  modelValue: unref(email),
                  "onUpdate:modelValue": ($event) => isRef(email) ? email.value = $event : null,
                  type: "email",
                  autocomplete: "email",
                  ltr: ""
                }, null, 8, ["modelValue", "onUpdate:modelValue"])
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(ssrRenderComponent(_component_UiFormField, {
          label: unref(t)("auth.newPassword"),
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
        _push(ssrRenderComponent(_component_UiButton, {
          type: "submit",
          block: "",
          loading: unref(busy)
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`${ssrInterpolate(unref(t)("auth.resetSubmit"))}`);
            } else {
              return [
                createTextVNode(toDisplayString(unref(t)("auth.resetSubmit")), 1)
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</form>`);
      }
      _push(`<p class="mt-6 text-center">`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: unref(localePath)("/forgot-password"),
        class: "inline-flex min-h-touch items-center text-primary-strong underline underline-offset-4"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`${ssrInterpolate(unref(t)("auth.requestNewLink"))}`);
          } else {
            return [
              createTextVNode(toDisplayString(unref(t)("auth.requestNewLink")), 1)
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/reset-password.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=reset-password-C1CmeRij.mjs.map
