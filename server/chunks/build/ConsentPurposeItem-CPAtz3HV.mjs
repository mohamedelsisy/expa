import { _ as _sfc_main$1 } from './Checkbox-PDAPbGXG.mjs';
import { _ as _sfc_main$2 } from './AutoItalian-BD4PyQ-n.mjs';
import { _ as _sfc_main$3 } from './Badge-PdKIsny2.mjs';
import { defineComponent, mergeProps, withCtx, createVNode, unref, createTextVNode, toDisplayString, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate } from 'vue/server-renderer';
import { u as useI18n } from './server.mjs';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "ConsentPurposeItem",
  __ssrInlineRender: true,
  props: {
    purpose: {},
    modelValue: { type: Boolean },
    disabled: { type: Boolean },
    errorText: {}
  },
  emits: ["update:modelValue"],
  setup(__props, { emit: __emit }) {
    const emit = __emit;
    const { t } = useI18n();
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UiCheckbox = _sfc_main$1;
      const _component_UiAutoItalian = _sfc_main$2;
      const _component_UiBadge = _sfc_main$3;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "rounded-md border border-line bg-surface p-4" }, _attrs))}><div class="flex flex-wrap items-start justify-between gap-x-3 gap-y-1">`);
      _push(ssrRenderComponent(_component_UiCheckbox, {
        "model-value": !!__props.modelValue,
        disabled: __props.disabled,
        invalid: !!__props.errorText,
        class: "min-w-0 flex-1 basis-48",
        "onUpdate:modelValue": ($event) => emit("update:modelValue", $event)
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_UiAutoItalian, {
              text: __props.purpose.title
            }, null, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_UiAutoItalian, {
                text: __props.purpose.title
              }, null, 8, ["text"])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_UiBadge, {
        tone: __props.purpose.required ? "accent" : "neutral"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`${ssrInterpolate(__props.purpose.required ? unref(t)("privacy.required") : unref(t)("privacy.optional"))}`);
          } else {
            return [
              createTextVNode(toDisplayString(__props.purpose.required ? unref(t)("privacy.required") : unref(t)("privacy.optional")), 1)
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div><p class="ms-8 text-ink-soft">${ssrInterpolate(__props.purpose.why)}</p><details class="ms-8 mt-2 text-sm"><summary class="inline-flex min-h-touch cursor-pointer items-center font-medium text-primary-strong">${ssrInterpolate(unref(t)("privacy.dataCollected"))}</summary><p class="mt-1 text-ink-soft">${ssrInterpolate(__props.purpose.data)}</p></details>`);
      if (__props.errorText) {
        _push(`<p class="ms-8 mt-1 text-sm font-medium text-danger" role="alert">${ssrInterpolate(__props.errorText)}</p>`);
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/profile/ConsentPurposeItem.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as _ };
//# sourceMappingURL=ConsentPurposeItem-CPAtz3HV.mjs.map
