import { _ as _sfc_main$1 } from './Badge-PdKIsny2.mjs';
import { u as useI18n, d as _sfc_main$5 } from './server.mjs';
import { defineComponent, computed, mergeProps, withCtx, createVNode, createTextVNode, toDisplayString, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate } from 'vue/server-renderer';

function officialGuidePath(path) {
  return typeof path === "string" && /^\/guides\/[A-Za-z0-9][A-Za-z0-9._~-]*$/.test(path) ? path : null;
}
const statusKey = (s) => s === "pending" || s === "hidden" ? `community.status.${s}` : null;
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "Labels",
  __ssrInlineRender: true,
  props: {
    label: {},
    status: {},
    notice: {},
    mine: { type: Boolean }
  },
  setup(__props) {
    const props = __props;
    const { t } = useI18n();
    const sk = computed(() => {
      var _a;
      return statusKey((_a = props.status) != null ? _a : null);
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UiBadge = _sfc_main$1;
      const _component_UiIcon = _sfc_main$5;
      _push(`<span${ssrRenderAttrs(mergeProps({ class: "inline-flex flex-wrap items-center gap-2" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_UiBadge, {
        tone: "warning",
        "data-testid": "community-label"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_UiIcon, {
              name: "info",
              size: 14
            }, null, _parent2, _scopeId));
            _push2(`${ssrInterpolate(__props.label)}`);
          } else {
            return [
              createVNode(_component_UiIcon, {
                name: "info",
                size: 14
              }),
              createTextVNode(toDisplayString(__props.label), 1)
            ];
          }
        }),
        _: 1
      }, _parent));
      if (__props.mine) {
        _push(ssrRenderComponent(_component_UiBadge, null, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`${ssrInterpolate(unref(t)("community.mine"))}`);
            } else {
              return [
                createTextVNode(toDisplayString(unref(t)("community.mine")), 1)
              ];
            }
          }),
          _: 1
        }, _parent));
      } else {
        _push(`<!---->`);
      }
      if (unref(sk)) {
        _push(ssrRenderComponent(_component_UiBadge, { tone: "info" }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`${ssrInterpolate(unref(t)(unref(sk)))}`);
            } else {
              return [
                createTextVNode(toDisplayString(unref(t)(unref(sk))), 1)
              ];
            }
          }),
          _: 1
        }, _parent));
      } else {
        _push(`<!---->`);
      }
      _push(`</span>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/community/Labels.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as _, officialGuidePath as o };
//# sourceMappingURL=Labels-BzdhD_w4.mjs.map
