import { defineComponent, computed, mergeProps, withCtx, unref, createVNode, createTextVNode, toDisplayString, useSSRContext } from 'vue';
import { ssrRenderComponent, ssrInterpolate } from 'vue/server-renderer';
import { _ as _sfc_main$1 } from './Badge-PdKIsny2.mjs';
import { u as useI18n, d as _sfc_main$5 } from './server.mjs';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "SourceBadge",
  __ssrInlineRender: true,
  props: {
    type: {}
  },
  setup(__props) {
    const props = __props;
    const { t } = useI18n();
    const tone = computed(() => {
      var _a;
      return { official: "success", institutional: "info", verified_partner: "primary", third_party: "warning" }[(_a = props.type) != null ? _a : "third_party"];
    });
    const icon = computed(() => props.type === "official" ? "shield" : props.type === "third_party" ? "info" : "check");
    return (_ctx, _push, _parent, _attrs) => {
      if (__props.type) {
        _push(ssrRenderComponent(_sfc_main$1, mergeProps({
          tone: tone.value,
          "data-source-type": __props.type
        }, _attrs), {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_sfc_main$5, {
                name: icon.value,
                size: 14
              }, null, _parent2, _scopeId));
              _push2(`${ssrInterpolate(unref(t)(`source.types.${__props.type}`))}`);
            } else {
              return [
                createVNode(_sfc_main$5, {
                  name: icon.value,
                  size: 14
                }, null, 8, ["name"]),
                createTextVNode(toDisplayString(unref(t)(`source.types.${__props.type}`)), 1)
              ];
            }
          }),
          _: 1
        }, _parent));
      } else {
        _push(`<!---->`);
      }
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/ui/SourceBadge.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as _ };
//# sourceMappingURL=SourceBadge-4_eAChkr.mjs.map
