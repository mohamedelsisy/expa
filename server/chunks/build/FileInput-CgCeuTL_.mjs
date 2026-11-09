import { defineComponent, inject, useId, computed, ref, mergeProps, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs } from 'vue/server-renderer';
import { F as FORM_FIELD_KEY } from './FormField-DFtov8VK.mjs';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "FileInput",
  __ssrInlineRender: true,
  props: {
    accept: {},
    disabled: { type: Boolean }
  },
  emits: ["change"],
  setup(__props, { expose: __expose, emit: __emit }) {
    const ctx = inject(FORM_FIELD_KEY, null);
    const ownId = `fi-${useId()}`;
    const id = computed(() => {
      var _a;
      return (_a = ctx == null ? void 0 : ctx.id) != null ? _a : ownId;
    });
    const el = ref(null);
    __expose({ reset: () => {
      if (el.value) el.value.value = "";
    } });
    return (_ctx, _push, _parent, _attrs) => {
      var _a, _b, _c;
      _push(`<input${ssrRenderAttrs(mergeProps({
        id: id.value,
        ref_key: "el",
        ref: el,
        type: "file",
        accept: __props.accept,
        disabled: __props.disabled,
        "aria-invalid": ((_a = unref(ctx)) == null ? void 0 : _a.invalid.value) ? "true" : void 0,
        "aria-describedby": (_b = unref(ctx)) == null ? void 0 : _b.describedBy.value,
        class: ["block min-h-touch w-full rounded-md border bg-surface p-2 text-ink file:me-3 file:rounded-md file:border-0 file:bg-primary-soft file:px-3 file:py-2 file:font-medium file:text-primary-strong", ((_c = unref(ctx)) == null ? void 0 : _c.invalid.value) ? "border-danger" : "border-line-strong"]
      }, _attrs))}>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/ui/FileInput.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as _ };
//# sourceMappingURL=FileInput-CgCeuTL_.mjs.map
