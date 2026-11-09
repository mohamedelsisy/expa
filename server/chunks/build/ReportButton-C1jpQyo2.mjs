import { u as useI18n, g as useApi, _ as _sfc_main$3, d as _sfc_main$5 } from './server.mjs';
import { _ as _sfc_main$1 } from './FormField-DFtov8VK.mjs';
import { _ as _sfc_main$2 } from './Select-BjjHKxeN.mjs';
import { _ as _sfc_main$4 } from './Textarea-C8QsGxT0.mjs';
import { defineComponent, ref, computed, unref, withCtx, createVNode, createTextVNode, toDisplayString, isRef, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate } from 'vue/server-renderer';
import { R as REPORT_REASONS } from './services-h_WXKmjh.mjs';
import { u as useToast } from './useToast-BX2bodPv.mjs';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "ReportButton",
  __ssrInlineRender: true,
  props: {
    endpoint: {},
    label: {}
  },
  setup(__props) {
    const { t } = useI18n();
    useApi();
    useToast();
    const open = ref(false);
    const reason = ref("");
    const note = ref("");
    const submitting = ref(false);
    const err = ref();
    const options = computed(() => REPORT_REASONS.map((r) => ({ value: r, label: t(`report.reasons.${r}`) })));
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UiButton = _sfc_main$3;
      const _component_UiIcon = _sfc_main$5;
      const _component_UiFormField = _sfc_main$1;
      const _component_UiSelect = _sfc_main$2;
      const _component_UiTextarea = _sfc_main$4;
      _push(`<div${ssrRenderAttrs(_attrs)}>`);
      _push(ssrRenderComponent(_component_UiButton, {
        variant: "ghost",
        "aria-expanded": unref(open),
        onClick: ($event) => open.value = !unref(open)
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          var _a, _b;
          if (_push2) {
            _push2(ssrRenderComponent(_component_UiIcon, {
              name: "alert",
              size: 16
            }, null, _parent2, _scopeId));
            _push2(`${ssrInterpolate((_a = __props.label) != null ? _a : unref(t)("report.button"))}`);
          } else {
            return [
              createVNode(_component_UiIcon, {
                name: "alert",
                size: 16
              }),
              createTextVNode(toDisplayString((_b = __props.label) != null ? _b : unref(t)("report.button")), 1)
            ];
          }
        }),
        _: 1
      }, _parent));
      if (unref(open)) {
        _push(`<form class="mt-2 space-y-3 rounded-md border border-line bg-sunken p-3" novalidate>`);
        _push(ssrRenderComponent(_component_UiFormField, {
          label: unref(t)("report.reason"),
          error: unref(err),
          required: ""
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_UiSelect, {
                modelValue: unref(reason),
                "onUpdate:modelValue": ($event) => isRef(reason) ? reason.value = $event : null,
                options: unref(options),
                placeholder: unref(t)("common.choose")
              }, null, _parent2, _scopeId));
            } else {
              return [
                createVNode(_component_UiSelect, {
                  modelValue: unref(reason),
                  "onUpdate:modelValue": ($event) => isRef(reason) ? reason.value = $event : null,
                  options: unref(options),
                  placeholder: unref(t)("common.choose")
                }, null, 8, ["modelValue", "onUpdate:modelValue", "options", "placeholder"])
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(ssrRenderComponent(_component_UiFormField, {
          label: unref(t)("report.note"),
          optional: ""
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_UiTextarea, {
                modelValue: unref(note),
                "onUpdate:modelValue": ($event) => isRef(note) ? note.value = $event : null,
                rows: 2,
                maxlength: 500
              }, null, _parent2, _scopeId));
            } else {
              return [
                createVNode(_component_UiTextarea, {
                  modelValue: unref(note),
                  "onUpdate:modelValue": ($event) => isRef(note) ? note.value = $event : null,
                  rows: 2,
                  maxlength: 500
                }, null, 8, ["modelValue", "onUpdate:modelValue"])
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`<div class="flex gap-2">`);
        _push(ssrRenderComponent(_component_UiButton, {
          type: "submit",
          loading: unref(submitting)
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`${ssrInterpolate(unref(t)("report.send"))}`);
            } else {
              return [
                createTextVNode(toDisplayString(unref(t)("report.send")), 1)
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(ssrRenderComponent(_component_UiButton, {
          variant: "ghost",
          onClick: ($event) => open.value = false
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`${ssrInterpolate(unref(t)("common.cancel"))}`);
            } else {
              return [
                createTextVNode(toDisplayString(unref(t)("common.cancel")), 1)
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div></form>`);
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/services/ReportButton.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as _ };
//# sourceMappingURL=ReportButton-C1jpQyo2.mjs.map
