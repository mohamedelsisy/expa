import { defineComponent, computed, mergeProps, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderAttr, ssrInterpolate } from 'vue/server-renderer';
import { u as useI18n } from './server.mjs';

const R = 52;
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "ScoreRing",
  __ssrInlineRender: true,
  props: {
    value: {},
    label: {},
    size: { default: 160 }
  },
  setup(__props) {
    const props = __props;
    const { t } = useI18n();
    const C = 2 * Math.PI * R;
    const pct = computed(() => props.value === null ? 0 : Math.max(0, Math.min(100, props.value)));
    const offset = computed(() => C * (1 - pct.value / 100));
    const text = computed(() => props.value === null ? t("score.notEnoughData") : t("score.aria", { label: props.label, value: pct.value }));
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({
        class: "relative inline-grid place-items-center",
        style: { width: `${__props.size}px`, height: `${__props.size}px` },
        role: "img",
        "aria-label": text.value
      }, _attrs))}><div class="rtl:-scale-x-100" aria-hidden="true"><svg viewBox="0 0 120 120" class="-rotate-90"${ssrRenderAttr("width", __props.size)}${ssrRenderAttr("height", __props.size)} focusable="false"><circle cx="60" cy="60"${ssrRenderAttr("r", R)} fill="none" stroke="rgb(var(--c-sunken))" stroke-width="10"></circle><circle cx="60" cy="60"${ssrRenderAttr("r", R)} fill="none" stroke="rgb(var(--c-primary))" stroke-width="10" stroke-linecap="round"${ssrRenderAttr("stroke-dasharray", C)}${ssrRenderAttr("stroke-dashoffset", offset.value)} class="transition-[stroke-dashoffset] duration-700"></circle></svg></div><div class="absolute inset-0 grid place-items-center text-center" aria-hidden="true"><div><div class="text-3xl font-bold tabular-nums text-ink">${ssrInterpolate(__props.value === null ? "\u2013" : pct.value)}`);
      if (__props.value !== null) {
        _push(`<span class="text-lg font-medium text-muted">%</span>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div><div class="px-4 text-xs text-muted">${ssrInterpolate(__props.label)}</div></div></div></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/ui/ScoreRing.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as _ };
//# sourceMappingURL=ScoreRing-D5NDFTYF.mjs.map
