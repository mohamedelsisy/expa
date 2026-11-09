import { _ as _sfc_main$1 } from './Breadcrumbs-C7SaJcTR.mjs';
import { _ as _sfc_main$2 } from './Alert-D-zfMDy5.mjs';
import { _ as _sfc_main$3 } from './Gate-CrfDaJ02.mjs';
import { u as useI18n, g as useApi, c as useLocalePath, i as _sfc_main$2$1, j as isApiError, n as navigateTo } from './server.mjs';
import { _ as _sfc_main$4 } from './Card-BxvVO_-_.mjs';
import { _ as _sfc_main$5 } from './Form-BvHcw3NH.mjs';
import { defineComponent, withAsyncContext, computed, mergeProps, unref, withCtx, createTextVNode, toDisplayString, createVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate } from 'vue/server-renderer';
import { u as useSeo } from './useSeo-BU4sLOnV.mjs';
import { u as useAsyncData } from './asyncData-bKJD5Wmv.mjs';
import { u as useConsent } from './useConsent-mKBmxtRH.mjs';
import './safe-B2eSdAXJ.mjs';
import './Links-BHP4RLan.mjs';
import './legal-vAxOkaZS.mjs';
import './useToast-BX2bodPv.mjs';
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
import './TextInput-BI4efS3_.mjs';
import './Textarea-C8QsGxT0.mjs';
import './Checkbox-PDAPbGXG.mjs';
import 'perfect-debounce';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "new",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const { t, locale } = useI18n();
    const { request } = useApi();
    const localePath = useLocalePath();
    useSeo(() => ({ title: t("documents.new"), description: t("documents.subtitle"), noindex: true }));
    const { data: types, error, refresh } = ([__temp, __restore] = withAsyncContext(async () => useAsyncData("document-types", async () => (await request("document-types")).data, { watch: [locale] })), __temp = await __temp, __restore(), __temp);
    const crumbs = computed(() => [{ label: t("documents.title"), to: "/documents" }, { label: t("documents.new") }]);
    const { granted } = useConsent("document_storage");
    const done = (d) => navigateTo(localePath(`/documents/${d.id}`));
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UiBreadcrumbs = _sfc_main$1;
      const _component_UiAlert = _sfc_main$2;
      const _component_ConsentGate = _sfc_main$3;
      const _component_UiErrorState = _sfc_main$2$1;
      const _component_UiCard = _sfc_main$4;
      const _component_DocumentsForm = _sfc_main$5;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "container-page max-w-2xl py-8 sm:py-12" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_UiBreadcrumbs, {
        items: unref(crumbs),
        class: "mb-6"
      }, null, _parent));
      _push(`<h1 class="mb-2 text-2xl font-bold sm:text-3xl">${ssrInterpolate(unref(t)("documents.new"))}</h1>`);
      _push(ssrRenderComponent(_component_UiAlert, {
        tone: "info",
        class: "mb-6"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`${ssrInterpolate(unref(t)("documents.privacy"))}`);
          } else {
            return [
              createTextVNode(toDisplayString(unref(t)("documents.privacy")), 1)
            ];
          }
        }),
        _: 1
      }, _parent));
      if (unref(granted) === false) {
        _push(ssrRenderComponent(_component_ConsentGate, {
          purpose: "document_storage",
          class: "mb-6",
          onGranted: ($event) => granted.value = true
        }, null, _parent));
      } else {
        _push(`<!---->`);
      }
      if (unref(error) || !unref(types)) {
        _push(ssrRenderComponent(_component_UiErrorState, {
          message: ("isApiError" in _ctx ? _ctx.isApiError : unref(isApiError))(unref(error)) ? unref(error).message : void 0,
          retry: "",
          onRetry: ($event) => unref(refresh)()
        }, null, _parent));
      } else {
        _push(ssrRenderComponent(_component_UiCard, null, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_DocumentsForm, {
                types: unref(types),
                onSaved: done
              }, null, _parent2, _scopeId));
            } else {
              return [
                createVNode(_component_DocumentsForm, {
                  types: unref(types),
                  onSaved: done
                }, null, 8, ["types"])
              ];
            }
          }),
          _: 1
        }, _parent));
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/documents/new.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=new-C7dqfZ1S.mjs.map
