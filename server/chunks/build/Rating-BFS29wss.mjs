import { _ as _sfc_main$2 } from './Badge-PdKIsny2.mjs';
import { u as useI18n, d as _sfc_main$5, z as formatDay } from './server.mjs';
import { defineComponent, computed, mergeProps, unref, withCtx, createVNode, createTextVNode, toDisplayString, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate } from 'vue/server-renderer';
import { r as ratingLabel } from './services-h_WXKmjh.mjs';

const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "Verification",
  __ssrInlineRender: true,
  props: {
    verification: {},
    detail: { type: Boolean }
  },
  setup(__props) {
    const props = __props;
    const { t, locale } = useI18n();
    const tone = computed(() => {
      var _a;
      return (_a = { verified: "success", pending: "info", expired: "warning", unverified: "neutral" }[props.verification.status]) != null ? _a : "neutral";
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UiBadge = _sfc_main$2;
      const _component_UiIcon = _sfc_main$5;
      _push(`<span${ssrRenderAttrs(mergeProps({
        class: "inline-flex flex-wrap items-center gap-1.5",
        "data-verification": __props.verification.status
      }, _attrs))}>`);
      _push(ssrRenderComponent(_component_UiBadge, { tone: unref(tone) }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_UiIcon, {
              name: __props.verification.status === "verified" ? "check" : "info",
              size: 14
            }, null, _parent2, _scopeId));
            _push2(`${ssrInterpolate(__props.verification.label)}`);
          } else {
            return [
              createVNode(_component_UiIcon, {
                name: __props.verification.status === "verified" ? "check" : "info",
                size: 14
              }, null, 8, ["name"]),
              createTextVNode(toDisplayString(__props.verification.label), 1)
            ];
          }
        }),
        _: 1
      }, _parent));
      if (__props.detail && __props.verification.status === "verified" && __props.verification.valid_until) {
        _push(`<span class="text-sm text-muted">${ssrInterpolate(unref(t)("services.validUntil", { date: unref(formatDay)(__props.verification.valid_until, unref(locale)) }))}</span>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</span>`);
    };
  }
});
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/services/Verification.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "Rating",
  __ssrInlineRender: true,
  props: {
    average: {},
    count: {}
  },
  setup(__props) {
    const props = __props;
    const { t } = useI18n();
    const r = computed(() => ratingLabel(props.average, props.count));
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UiIcon = _sfc_main$5;
      if (unref(r).average) {
        _push(`<p${ssrRenderAttrs(mergeProps({
          class: "inline-flex items-center gap-1 text-sm",
          "data-testid": "rating"
        }, _attrs))}>`);
        _push(ssrRenderComponent(_component_UiIcon, {
          name: "sparkle",
          size: 14,
          class: "text-accent-strong"
        }, null, _parent));
        _push(`<span class="font-semibold tabular-nums"><bdi>${ssrInterpolate(unref(r).average)}</bdi></span><span class="text-muted">${ssrInterpolate(unref(t)("services.reviewsCount", { count: unref(r).count }))}</span></p>`);
      } else {
        _push(`<p${ssrRenderAttrs(mergeProps({
          class: "text-sm text-muted",
          "data-testid": "rating"
        }, _attrs))}>${ssrInterpolate(unref(t)("services.noReviews"))}</p>`);
      }
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/services/Rating.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main$1 as _, _sfc_main as a };
//# sourceMappingURL=Rating-BFS29wss.mjs.map
