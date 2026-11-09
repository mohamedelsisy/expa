import { defineComponent, ref, mergeProps, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderAttr } from 'vue/server-renderer';
import { _ as _sfc_main$1 } from './TextInput-BI4efS3_.mjs';
import { u as useI18n, d as _sfc_main$5 } from './server.mjs';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "PasswordInput",
  __ssrInlineRender: true,
  props: {
    modelValue: {},
    autocomplete: {}
  },
  emits: ["update:modelValue"],
  setup(__props, { emit: __emit }) {
    const emit = __emit;
    const { t } = useI18n();
    const visible = ref(false);
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "relative" }, _attrs))}>`);
      _push(ssrRenderComponent(_sfc_main$1, {
        "model-value": __props.modelValue,
        type: visible.value ? "text" : "password",
        autocomplete: __props.autocomplete,
        ltr: "",
        class: "pe-12",
        "onUpdate:modelValue": ($event) => emit("update:modelValue", $event)
      }, null, _parent));
      _push(`<button type="button" class="absolute inset-y-0 end-0 flex min-w-touch items-center justify-center text-ink-soft"${ssrRenderAttr("aria-label", visible.value ? unref(t)("common.hidePassword") : unref(t)("common.showPassword"))}${ssrRenderAttr("aria-pressed", visible.value)}>`);
      _push(ssrRenderComponent(_sfc_main$5, {
        name: visible.value ? "eye-off" : "eye"
      }, null, _parent));
      _push(`</button></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/ui/PasswordInput.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as _ };
//# sourceMappingURL=PasswordInput-ClImJukS.mjs.map
