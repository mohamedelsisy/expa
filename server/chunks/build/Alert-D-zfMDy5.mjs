import { defineComponent, computed, mergeProps, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderClass, ssrInterpolate, ssrRenderSlot } from 'vue/server-renderer';
import { d as _sfc_main$5 } from './server.mjs';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "Alert",
  __ssrInlineRender: true,
  props: {
    tone: { default: "info" },
    title: {}
  },
  setup(__props) {
    const props = __props;
    const styles = {
      info: "bg-info-soft text-info border-info",
      success: "bg-success-soft text-success border-success",
      warning: "bg-warning-soft text-warning border-warning",
      danger: "bg-danger-soft text-danger border-danger"
    };
    const titleStyles = { info: "text-info", success: "text-success", warning: "text-warning", danger: "text-danger" };
    const icon = computed(() => ({ info: "info", success: "check", warning: "alert", danger: "alert" })[props.tone]);
    const role = computed(() => props.tone === "danger" ? "alert" : "status");
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({
        role: role.value,
        class: ["flex items-start gap-3 rounded-md border border-s-4 p-3 sm:p-4", styles[__props.tone]]
      }, _attrs))}>`);
      _push(ssrRenderComponent(_sfc_main$5, {
        name: icon.value,
        class: "mt-1"
      }, null, _parent));
      _push(`<div class="min-w-0 flex-1 text-ink">`);
      if (__props.title) {
        _push(`<p class="${ssrRenderClass([titleStyles[__props.tone], "font-semibold"])}">${ssrInterpolate(__props.title)}</p>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<div>`);
      ssrRenderSlot(_ctx.$slots, "default", {}, null, _push, _parent);
      _push(`</div></div></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/ui/Alert.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as _ };
//# sourceMappingURL=Alert-D-zfMDy5.mjs.map
