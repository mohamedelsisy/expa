import { E as _sfc_main$7, F as _sfc_main$6, G as _sfc_main$4 } from './server.mjs';
import { _ as _sfc_main$1 } from './Card-BxvVO_-_.mjs';
import { u as usePersistLocale, _ as _sfc_main$2 } from './useNav-C30IWQ9P.mjs';
import { defineComponent, mergeProps, unref, withCtx, renderSlot, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderSlot } from 'vue/server-renderer';
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
import './useToast-BX2bodPv.mjs';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "auth",
  __ssrInlineRender: true,
  setup(__props) {
    const persist = usePersistLocale();
    return (_ctx, _push, _parent, _attrs) => {
      const _component_LayoutSkipLink = _sfc_main$7;
      const _component_LayoutBrandLogo = _sfc_main$6;
      const _component_UiLanguageSwitcher = _sfc_main$4;
      const _component_UiCard = _sfc_main$1;
      const _component_UiToastRegion = _sfc_main$2;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "flex min-h-screen flex-col" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_LayoutSkipLink, null, null, _parent));
      _push(`<header class="container-page flex min-h-[64px] flex-wrap items-center justify-between gap-y-1">`);
      _push(ssrRenderComponent(_component_LayoutBrandLogo, null, null, _parent));
      _push(ssrRenderComponent(_component_UiLanguageSwitcher, { onSwitch: unref(persist) }, null, _parent));
      _push(`</header><main id="main" tabindex="-1" class="flex flex-1 items-start justify-center px-4 pb-12 pt-4 outline-none sm:items-center"><div class="w-full max-w-lg">`);
      _push(ssrRenderComponent(_component_UiCard, {
        elevated: "",
        class: "!p-6 sm:!p-8"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            ssrRenderSlot(_ctx.$slots, "default", {}, null, _push2, _parent2, _scopeId);
          } else {
            return [
              renderSlot(_ctx.$slots, "default")
            ];
          }
        }),
        _: 3
      }, _parent));
      _push(`</div></main>`);
      _push(ssrRenderComponent(_component_UiToastRegion, null, null, _parent));
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("layouts/auth.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=auth-KEZ6Awpr.mjs.map
