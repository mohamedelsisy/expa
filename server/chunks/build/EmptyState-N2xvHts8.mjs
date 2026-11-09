import { defineComponent, mergeProps, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderSlot } from 'vue/server-renderer';
import { d as _sfc_main$5 } from './server.mjs';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "EmptyState",
  __ssrInlineRender: true,
  props: {
    title: {},
    description: {},
    icon: { default: "compass" }
  },
  setup(__props) {
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "mx-auto flex max-w-md flex-col items-center gap-3 px-4 py-10 text-center" }, _attrs))}><span class="grid size-14 place-items-center rounded-full bg-primary-soft text-primary-strong">`);
      _push(ssrRenderComponent(_sfc_main$5, {
        name: __props.icon,
        size: 28
      }, null, _parent));
      _push(`</span><h2 class="text-lg font-bold">${ssrInterpolate(__props.title)}</h2>`);
      if (__props.description) {
        _push(`<p class="text-ink-soft">${ssrInterpolate(__props.description)}</p>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<div class="mt-2">`);
      ssrRenderSlot(_ctx.$slots, "default", {}, null, _push, _parent);
      _push(`</div></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/ui/EmptyState.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as _ };
//# sourceMappingURL=EmptyState-N2xvHts8.mjs.map
