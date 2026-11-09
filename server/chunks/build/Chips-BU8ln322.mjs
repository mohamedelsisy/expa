import { defineComponent, mergeProps, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderList, ssrRenderAttr, ssrRenderClass, ssrInterpolate } from 'vue/server-renderer';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "Chips",
  __ssrInlineRender: true,
  props: {
    modelValue: {},
    options: {},
    label: {}
  },
  emits: ["update:modelValue"],
  setup(__props, { emit: __emit }) {
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({
        role: "group",
        "aria-label": __props.label,
        class: "flex flex-wrap gap-2"
      }, _attrs))}><!--[-->`);
      ssrRenderList(__props.options, (o) => {
        _push(`<button type="button"${ssrRenderAttr("aria-pressed", __props.modelValue === o.value)} class="${ssrRenderClass([__props.modelValue === o.value ? "border-primary bg-primary text-on-primary" : "border-line-strong bg-surface text-ink hover:bg-sunken", "inline-flex min-h-touch items-center gap-1.5 rounded-full border px-4 text-sm font-medium transition-colors"])}">${ssrInterpolate(o.label)}`);
        if (o.count !== void 0) {
          _push(`<span class="tabular-nums opacity-80">(${ssrInterpolate(o.count)})</span>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</button>`);
      });
      _push(`<!--]--></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/ui/Chips.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as _ };
//# sourceMappingURL=Chips-BU8ln322.mjs.map
