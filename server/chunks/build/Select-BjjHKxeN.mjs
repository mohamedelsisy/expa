import { defineComponent, inject, useId, computed, mergeProps, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrInterpolate, ssrRenderList, ssrRenderAttr } from 'vue/server-renderer';
import { F as FORM_FIELD_KEY } from './FormField-DFtov8VK.mjs';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "Select",
  __ssrInlineRender: true,
  props: {
    modelValue: {},
    options: {},
    placeholder: {},
    disabled: { type: Boolean }
  },
  emits: ["update:modelValue"],
  setup(__props, { emit: __emit }) {
    const ctx = inject(FORM_FIELD_KEY, null);
    const ownId = `sel-${useId()}`;
    const id = computed(() => {
      var _a;
      return (_a = ctx == null ? void 0 : ctx.id) != null ? _a : ownId;
    });
    return (_ctx, _push, _parent, _attrs) => {
      var _a, _b, _c, _d;
      _push(`<select${ssrRenderAttrs(mergeProps({
        id: id.value,
        value: __props.modelValue,
        disabled: __props.disabled,
        required: (_a = unref(ctx)) == null ? void 0 : _a.required.value,
        "aria-invalid": ((_b = unref(ctx)) == null ? void 0 : _b.invalid.value) ? "true" : void 0,
        "aria-describedby": (_c = unref(ctx)) == null ? void 0 : _c.describedBy.value,
        class: ["block min-h-touch w-full rounded-md border bg-surface px-3 py-2 text-ink disabled:bg-sunken", ((_d = unref(ctx)) == null ? void 0 : _d.invalid.value) ? "border-danger" : "border-line-strong"]
      }, _attrs))}>`);
      if (__props.placeholder !== void 0) {
        _push(`<option value="">${ssrInterpolate(__props.placeholder)}</option>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<!--[-->`);
      ssrRenderList(__props.options, (o) => {
        _push(`<option${ssrRenderAttr("value", o.value)}>${ssrInterpolate(o.label)}</option>`);
      });
      _push(`<!--]--></select>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/ui/Select.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as _ };
//# sourceMappingURL=Select-BjjHKxeN.mjs.map
