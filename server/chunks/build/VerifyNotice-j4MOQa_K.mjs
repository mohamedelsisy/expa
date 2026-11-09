import { _ as _sfc_main$1 } from './Alert-D-zfMDy5.mjs';
import { defineComponent, mergeProps, unref, withCtx, createTextVNode, toDisplayString, useSSRContext } from 'vue';
import { ssrRenderComponent, ssrInterpolate } from 'vue/server-renderer';
import { u as useI18n } from './server.mjs';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "VerifyNotice",
  __ssrInlineRender: true,
  props: {
    text: {}
  },
  setup(__props) {
    const { t } = useI18n();
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UiAlert = _sfc_main$1;
      _push(ssrRenderComponent(_component_UiAlert, mergeProps({
        tone: "info",
        title: unref(t)("study.verifyTitle"),
        "data-testid": "study-verify"
      }, _attrs), {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`${ssrInterpolate(__props.text || unref(t)("study.verifyDefault"))}`);
          } else {
            return [
              createTextVNode(toDisplayString(__props.text || unref(t)("study.verifyDefault")), 1)
            ];
          }
        }),
        _: 1
      }, _parent));
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/study/VerifyNotice.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as _ };
//# sourceMappingURL=VerifyNotice-j4MOQa_K.mjs.map
