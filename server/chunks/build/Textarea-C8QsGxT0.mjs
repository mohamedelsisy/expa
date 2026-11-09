import { defineComponent, inject, useId, computed, mergeProps, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrInterpolate } from 'vue/server-renderer';
import { F as FORM_FIELD_KEY } from './FormField-DFtov8VK.mjs';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "Textarea",
  __ssrInlineRender: true,
  props: {
    modelValue: {},
    rows: { default: 4 },
    placeholder: {},
    disabled: { type: Boolean },
    maxlength: {},
    ltr: { type: Boolean },
    dir: {}
  },
  emits: ["update:modelValue"],
  setup(__props, { emit: __emit }) {
    const ctx = inject(FORM_FIELD_KEY, null);
    const ownId = `ta-${useId()}`;
    const id = computed(() => {
      var _a;
      return (_a = ctx == null ? void 0 : ctx.id) != null ? _a : ownId;
    });
    return (_ctx, _push, _parent, _attrs) => {
      var _a, _b, _c, _d, _e;
      let _temp0;
      _push(`<textarea${ssrRenderAttrs(_temp0 = mergeProps({
        id: id.value,
        value: __props.modelValue,
        rows: __props.rows,
        placeholder: __props.placeholder,
        disabled: __props.disabled,
        maxlength: __props.maxlength,
        required: (_a = unref(ctx)) == null ? void 0 : _a.required.value,
        "aria-invalid": ((_b = unref(ctx)) == null ? void 0 : _b.invalid.value) ? "true" : void 0,
        "aria-describedby": (_c = unref(ctx)) == null ? void 0 : _c.describedBy.value,
        dir: (_d = __props.dir) != null ? _d : __props.ltr ? "ltr" : "auto",
        class: ["block w-full rounded-md border bg-surface px-3 py-2 text-ink placeholder:text-muted disabled:cursor-not-allowed disabled:bg-sunken", [((_e = unref(ctx)) == null ? void 0 : _e.invalid.value) ? "border-danger" : "border-line-strong"]]
      }, _attrs), "textarea")}>${ssrInterpolate("value" in _temp0 ? _temp0.value : "")}</textarea>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/ui/Textarea.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as _ };
//# sourceMappingURL=Textarea-C8QsGxT0.mjs.map
