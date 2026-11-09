import { defineComponent, useId, computed, mergeProps, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderAttr, ssrIncludeBooleanAttr, ssrRenderSlot, ssrInterpolate } from 'vue/server-renderer';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "Checkbox",
  __ssrInlineRender: true,
  props: {
    modelValue: { type: Boolean },
    label: {},
    description: {},
    disabled: { type: Boolean },
    invalid: { type: Boolean },
    describedby: {}
  },
  emits: ["update:modelValue"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const id = `cb-${useId()}`;
    const descId = computed(() => props.description ? `${id}-d` : void 0);
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "flex min-h-touch items-start gap-3 rounded-md py-2" }, _attrs))}><input${ssrRenderAttr("id", id)} type="checkbox"${ssrIncludeBooleanAttr(__props.modelValue) ? " checked" : ""}${ssrIncludeBooleanAttr(__props.disabled) ? " disabled" : ""}${ssrRenderAttr("aria-invalid", __props.invalid ? "true" : void 0)}${ssrRenderAttr("aria-describedby", [descId.value, __props.describedby].filter(Boolean).join(" ") || void 0)} class="mt-1 size-5 shrink-0 cursor-pointer accent-primary disabled:cursor-not-allowed"><div class="min-w-0"><label${ssrRenderAttr("for", id)} class="cursor-pointer font-medium text-ink">`);
      ssrRenderSlot(_ctx.$slots, "default", {}, () => {
        _push(`${ssrInterpolate(__props.label)}`);
      }, _push, _parent);
      _push(`</label>`);
      if (__props.description) {
        _push(`<p${ssrRenderAttr("id", descId.value)} class="text-sm text-muted">${ssrInterpolate(__props.description)}</p>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/ui/Checkbox.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as _ };
//# sourceMappingURL=Checkbox-PDAPbGXG.mjs.map
