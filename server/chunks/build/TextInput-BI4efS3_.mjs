import { defineComponent, inject, useId, computed, mergeProps, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs } from 'vue/server-renderer';
import { F as FORM_FIELD_KEY } from './FormField-DFtov8VK.mjs';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "TextInput",
  __ssrInlineRender: true,
  props: {
    modelValue: {},
    type: { default: "text" },
    autocomplete: {},
    inputmode: {},
    placeholder: {},
    disabled: { type: Boolean },
    maxlength: {},
    ltr: { type: Boolean },
    dir: {}
  },
  emits: ["update:modelValue"],
  setup(__props, { expose: __expose, emit: __emit }) {
    const ctx = inject(FORM_FIELD_KEY, null);
    const ownId = `ti-${useId()}`;
    const id = computed(() => {
      var _a;
      return (_a = ctx == null ? void 0 : ctx.id) != null ? _a : ownId;
    });
    __expose({ id });
    return (_ctx, _push, _parent, _attrs) => {
      var _a, _b, _c, _d, _e;
      _push(`<input${ssrRenderAttrs(mergeProps({
        id: id.value,
        value: __props.modelValue,
        type: __props.type,
        autocomplete: __props.autocomplete,
        inputmode: __props.inputmode,
        placeholder: __props.placeholder,
        disabled: __props.disabled,
        maxlength: __props.maxlength,
        required: (_a = unref(ctx)) == null ? void 0 : _a.required.value,
        "aria-invalid": ((_b = unref(ctx)) == null ? void 0 : _b.invalid.value) ? "true" : void 0,
        "aria-describedby": (_c = unref(ctx)) == null ? void 0 : _c.describedBy.value,
        dir: (_d = __props.dir) != null ? _d : __props.ltr ? "ltr" : void 0,
        class: ["block min-h-touch w-full rounded-md border bg-surface px-3 py-2 text-ink placeholder:text-muted disabled:cursor-not-allowed disabled:bg-sunken", [((_e = unref(ctx)) == null ? void 0 : _e.invalid.value) ? "border-danger" : "border-line-strong", __props.ltr ? "text-start" : ""]]
      }, _attrs))}>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/ui/TextInput.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as _ };
//# sourceMappingURL=TextInput-BI4efS3_.mjs.map
