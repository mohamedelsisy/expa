import { defineComponent, mergeProps, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent } from 'vue/server-renderer';
import { d as _sfc_main$5 } from './server.mjs';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "IconButton",
  __ssrInlineRender: true,
  props: {
    icon: {},
    label: {},
    pressed: { type: Boolean },
    disabled: { type: Boolean }
  },
  setup(__props) {
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<button${ssrRenderAttrs(mergeProps({
        type: "button",
        "aria-label": __props.label,
        title: __props.label,
        "aria-pressed": __props.pressed,
        disabled: __props.disabled,
        class: "inline-flex min-h-touch min-w-touch items-center justify-center rounded-md text-ink-soft transition-colors hover:bg-sunken disabled:opacity-50"
      }, _attrs))}>`);
      _push(ssrRenderComponent(_sfc_main$5, { name: __props.icon }, null, _parent));
      _push(`</button>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/ui/IconButton.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as _ };
//# sourceMappingURL=IconButton-f7KcV3ty.mjs.map
