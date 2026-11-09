import { _ as _sfc_main$1 } from './Badge-PdKIsny2.mjs';
import { u as useI18n, d as _sfc_main$5 } from './server.mjs';
import { _ as _sfc_main$2 } from './Alert-D-zfMDy5.mjs';
import { defineComponent, mergeProps, withCtx, unref, createVNode, createTextVNode, toDisplayString, useSSRContext } from 'vue';
import { ssrRenderComponent, ssrInterpolate } from 'vue/server-renderer';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "ReviewedNotice",
  __ssrInlineRender: true,
  props: {
    item: {},
    compact: { type: Boolean }
  },
  setup(__props) {
    const { t } = useI18n();
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UiBadge = _sfc_main$1;
      const _component_UiIcon = _sfc_main$5;
      const _component_UiAlert = _sfc_main$2;
      if (__props.item.reviewed) {
        _push(ssrRenderComponent(_component_UiBadge, mergeProps({
          tone: "success",
          "data-testid": "reviewed"
        }, _attrs), {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_UiIcon, {
                name: "check",
                size: 14
              }, null, _parent2, _scopeId));
              _push2(`${ssrInterpolate(unref(t)("practice.reviewed"))}`);
            } else {
              return [
                createVNode(_component_UiIcon, {
                  name: "check",
                  size: 14
                }),
                createTextVNode(toDisplayString(unref(t)("practice.reviewed")), 1)
              ];
            }
          }),
          _: 1
        }, _parent));
      } else {
        _push(`<!--[-->`);
        if (__props.compact) {
          _push(ssrRenderComponent(_component_UiBadge, {
            tone: "warning",
            "data-testid": "not-reviewed"
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(ssrRenderComponent(_component_UiIcon, {
                  name: "info",
                  size: 14
                }, null, _parent2, _scopeId));
                _push2(`${ssrInterpolate(unref(t)("practice.notReviewed"))}`);
              } else {
                return [
                  createVNode(_component_UiIcon, {
                    name: "info",
                    size: 14
                  }),
                  createTextVNode(toDisplayString(unref(t)("practice.notReviewed")), 1)
                ];
              }
            }),
            _: 1
          }, _parent));
        } else {
          _push(ssrRenderComponent(_component_UiAlert, {
            tone: "warning",
            "data-testid": "not-reviewed"
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              var _a, _b;
              if (_push2) {
                _push2(`${ssrInterpolate((_a = __props.item.review_notice) != null ? _a : unref(t)("practice.reviewPending"))}`);
              } else {
                return [
                  createTextVNode(toDisplayString((_b = __props.item.review_notice) != null ? _b : unref(t)("practice.reviewPending")), 1)
                ];
              }
            }),
            _: 1
          }, _parent));
        }
        _push(`<!--]-->`);
      }
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/learn/ReviewedNotice.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as _ };
//# sourceMappingURL=ReviewedNotice-RpV3jHT3.mjs.map
