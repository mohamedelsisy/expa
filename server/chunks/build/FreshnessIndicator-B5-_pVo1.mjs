import { defineComponent, computed, mergeProps, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderAttr, ssrRenderClass } from 'vue/server-renderer';
import { u as useI18n, k as formatDate, d as _sfc_main$5 } from './server.mjs';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "FreshnessIndicator",
  __ssrInlineRender: true,
  props: {
    lastVerifiedAt: {},
    freshness: {}
  },
  setup(__props) {
    const props = __props;
    const { t, locale } = useI18n();
    const date = computed(() => formatDate(props.lastVerifiedAt, locale.value));
    const warn = computed(() => props.freshness !== "fresh");
    const tone = computed(() => props.freshness === "outdated" || props.freshness === "unverified" ? "text-danger bg-danger-soft" : props.freshness === "stale" ? "text-warning bg-warning-soft" : "text-success bg-success-soft");
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({
        class: "space-y-1.5 text-sm",
        "data-freshness": __props.freshness
      }, _attrs))}><p class="flex flex-wrap items-center gap-x-2 gap-y-1 text-ink-soft">`);
      _push(ssrRenderComponent(_sfc_main$5, {
        name: "calendar",
        size: 16
      }, null, _parent));
      if (__props.lastVerifiedAt) {
        _push(`<span>${ssrInterpolate(unref(t)("freshness.lastVerified"))}: <time${ssrRenderAttr("datetime", __props.lastVerifiedAt)}>${ssrInterpolate(date.value)}</time></span>`);
      } else {
        _push(`<span>${ssrInterpolate(unref(t)("freshness.neverVerified"))}</span>`);
      }
      _push(`<span class="${ssrRenderClass([tone.value, "rounded-full px-2 py-0.5 text-xs font-semibold"])}">${ssrInterpolate(unref(t)(`freshness.state.${__props.freshness}`))}</span></p>`);
      if (warn.value) {
        _push(`<p role="status" class="${ssrRenderClass([tone.value, "flex items-start gap-2 rounded-md px-3 py-2"])}" data-testid="freshness-warning">`);
        _push(ssrRenderComponent(_sfc_main$5, {
          name: "alert",
          size: 18,
          class: "mt-0.5"
        }, null, _parent));
        _push(`<span>${ssrInterpolate(unref(t)(`freshness.warning.${__props.freshness}`))}</span></p>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/ui/FreshnessIndicator.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as _ };
//# sourceMappingURL=FreshnessIndicator-B5-_pVo1.mjs.map
