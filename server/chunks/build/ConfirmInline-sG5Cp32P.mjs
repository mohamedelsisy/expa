import { defineComponent, ref, mergeProps, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrInterpolate, ssrIncludeBooleanAttr, ssrRenderAttr } from 'vue/server-renderer';
import { u as useI18n } from './server.mjs';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "ConfirmInline",
  __ssrInlineRender: true,
  props: {
    message: {},
    confirmLabel: {},
    loading: { type: Boolean }
  },
  emits: ["confirm", "cancel"],
  setup(__props, { emit: __emit }) {
    const { t } = useI18n();
    ref(null);
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({
        role: "alertdialog",
        "aria-modal": "false",
        "aria-label": __props.message,
        class: "space-y-3 rounded-md border border-danger bg-danger-soft p-4"
      }, _attrs))}><p class="font-medium text-ink">${ssrInterpolate(__props.message)}</p><div class="flex flex-wrap gap-2"><button type="button" class="inline-flex min-h-touch items-center justify-center rounded-md border border-line-strong bg-surface px-5 py-2 font-medium">${ssrInterpolate(unref(t)("common.cancel"))}</button><button type="button" class="inline-flex min-h-touch items-center justify-center rounded-md bg-danger px-5 py-2 font-medium text-surface disabled:opacity-60"${ssrIncludeBooleanAttr(__props.loading) ? " disabled" : ""}${ssrRenderAttr("aria-busy", __props.loading ? "true" : void 0)}>${ssrInterpolate(__props.confirmLabel)}</button></div></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/ui/ConfirmInline.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as _ };
//# sourceMappingURL=ConfirmInline-sG5Cp32P.mjs.map
