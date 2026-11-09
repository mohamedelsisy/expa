import { defineComponent, mergeProps, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrIncludeBooleanAttr, ssrRenderComponent, ssrInterpolate } from 'vue/server-renderer';
import { u as useI18n, d as _sfc_main$5 } from './server.mjs';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "Pagination",
  __ssrInlineRender: true,
  props: {
    page: {},
    lastPage: {}
  },
  emits: ["change"],
  setup(__props, { emit: __emit }) {
    const { t } = useI18n();
    return (_ctx, _push, _parent, _attrs) => {
      if (__props.lastPage > 1) {
        _push(`<nav${ssrRenderAttrs(mergeProps({
          "aria-label": unref(t)("common.pagination"),
          class: "flex items-center justify-center gap-3"
        }, _attrs))}><button type="button" class="inline-flex min-h-touch items-center gap-1 rounded-md border border-line-strong bg-surface px-4 font-medium disabled:opacity-50"${ssrIncludeBooleanAttr(__props.page <= 1) ? " disabled" : ""}>`);
        _push(ssrRenderComponent(_sfc_main$5, {
          name: "chevron-start",
          size: 18
        }, null, _parent));
        _push(`${ssrInterpolate(unref(t)("common.previous"))}</button><span class="text-sm tabular-nums text-ink-soft" aria-live="polite">${ssrInterpolate(unref(t)("common.pageOf", { page: __props.page, total: __props.lastPage }))}</span><button type="button" class="inline-flex min-h-touch items-center gap-1 rounded-md border border-line-strong bg-surface px-4 font-medium disabled:opacity-50"${ssrIncludeBooleanAttr(__props.page >= __props.lastPage) ? " disabled" : ""}>${ssrInterpolate(unref(t)("common.next"))}`);
        _push(ssrRenderComponent(_sfc_main$5, {
          name: "chevron-end",
          size: 18
        }, null, _parent));
        _push(`</button></nav>`);
      } else {
        _push(`<!---->`);
      }
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/ui/Pagination.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as _ };
//# sourceMappingURL=Pagination-DA28GIFv.mjs.map
