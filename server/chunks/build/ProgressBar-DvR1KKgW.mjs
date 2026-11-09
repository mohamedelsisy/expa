import { defineComponent, computed, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrInterpolate, ssrRenderAttr, ssrRenderStyle } from 'vue/server-renderer';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "ProgressBar",
  __ssrInlineRender: true,
  props: {
    value: {},
    label: {},
    showValue: { type: Boolean }
  },
  setup(__props) {
    const props = __props;
    const pct = computed(() => {
      var _a;
      return Math.max(0, Math.min(100, (_a = props.value) != null ? _a : 0));
    });
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(_attrs)}>`);
      if (__props.showValue) {
        _push(`<div class="mb-1 flex justify-between text-sm"><span class="text-ink-soft">${ssrInterpolate(__props.label)}</span><span class="font-semibold tabular-nums text-ink">${ssrInterpolate(__props.value === null ? "\u2013" : `${pct.value}%`)}</span></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<div role="progressbar"${ssrRenderAttr("aria-label", __props.label)} aria-valuemin="0" aria-valuemax="100"${ssrRenderAttr("aria-valuenow", __props.value === null ? void 0 : pct.value)} class="h-2.5 overflow-hidden rounded-full bg-sunken"><div class="h-full rounded-full bg-primary transition-[width] duration-500" style="${ssrRenderStyle({ width: `${pct.value}%` })}"></div></div></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/ui/ProgressBar.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as _ };
//# sourceMappingURL=ProgressBar-DvR1KKgW.mjs.map
