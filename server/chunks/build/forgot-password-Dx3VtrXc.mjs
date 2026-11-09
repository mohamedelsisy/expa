import { _ as _sfc_main$1 } from './Alert-D-zfMDy5.mjs';
import { _ as _sfc_main$2 } from './FormField-DFtov8VK.mjs';
import { _ as _sfc_main$3 } from './TextInput-BI4efS3_.mjs';
import { u as useI18n, c as useLocalePath, g as useApi, _ as _sfc_main$3$1, e as __nuxt_component_0 } from './server.mjs';
import { defineComponent, ref, unref, withCtx, createTextVNode, toDisplayString, isRef, createVNode, useSSRContext } from 'vue';
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
  __name: "forgot-password",
  __ssrInlineRender: true,
  setup(__props) {
    const { t } = useI18n();
    const localePath = useLocalePath();
    useApi();
    useSeo(() => ({ title: t("auth.forgotTitle"), description: t("auth.forgotSubtitle"), noindex: true }));
    const email = ref("");
    const errors = ref({});
    const formError = ref("");
    const done = ref("");
    const busy = ref(false);
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UiAlert = _sfc_main$1;
      const _component_UiFormField = _sfc_main$2;
      const _component_UiTextInput = _sfc_main$3;
      const _component_UiButton = _sfc_main$3$1;
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(_attrs)}><h1 class="text-2xl font-bold">${ssrInterpolate(unref(t)("auth.forgotTitle"))}</h1><p class="mt-1 text-ink-soft">${ssrInterpolate(unref(t)("auth.forgotSubtitle"))}</p>`);
      if (unref(done)) {
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
      } else {
        _push(`<form class="mt-6 space-y-5" novalidate>`);
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
                inputmode: "email",
                ltr: ""
              }, null, _parent2, _scopeId));
            } else {
              return [
                createVNode(_component_UiTextInput, {
                  modelValue: unref(email),
                  "onUpdate:modelValue": ($event) => isRef(email) ? email.value = $event : null,
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
        _push(ssrRenderComponent(_component_UiButton, {
          type: "submit",
          block: "",
          loading: unref(busy)
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`${ssrInterpolate(unref(t)("auth.sendResetLink"))}`);
            } else {
              return [
                createTextVNode(toDisplayString(unref(t)("auth.sendResetLink")), 1)
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</form>`);
      }
      _push(`<p class="mt-6 text-center">`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: unref(localePath)("/login"),
        class: "inline-flex min-h-touch items-center text-primary-strong underline underline-offset-4"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`${ssrInterpolate(unref(t)("auth.backToLogin"))}`);
          } else {
            return [
              createTextVNode(toDisplayString(unref(t)("auth.backToLogin")), 1)
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/forgot-password.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=forgot-password-Dx3VtrXc.mjs.map
