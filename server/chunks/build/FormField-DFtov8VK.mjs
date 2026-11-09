import { defineComponent, useId, computed, provide, createVNode, resolveDynamicComponent, mergeProps, withCtx, unref, toDisplayString, openBlock, createBlock, createCommentVNode, renderSlot, useSSRContext } from 'vue';
import { ssrRenderVNode, ssrInterpolate, ssrRenderAttr, ssrRenderSlot } from 'vue/server-renderer';
import { u as useI18n } from './server.mjs';

const FORM_FIELD_KEY = /* @__PURE__ */ Symbol("form-field");
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "FormField",
  __ssrInlineRender: true,
  props: {
    label: {},
    hint: {},
    error: {},
    required: { type: Boolean },
    optional: { type: Boolean },
    group: { type: Boolean }
  },
  setup(__props) {
    const props = __props;
    const { t } = useI18n();
    const id = `ff-${useId()}`;
    const hintId = `${id}-hint`;
    const errorId = `${id}-error`;
    const describedBy = computed(() => {
      const ids = [props.hint ? hintId : "", props.error ? errorId : ""].filter(Boolean);
      return ids.length ? ids.join(" ") : void 0;
    });
    provide(FORM_FIELD_KEY, {
      id,
      describedBy,
      invalid: computed(() => !!props.error),
      required: computed(() => !!props.required)
    });
    return (_ctx, _push, _parent, _attrs) => {
      ssrRenderVNode(_push, createVNode(resolveDynamicComponent(__props.group ? "fieldset" : "div"), mergeProps({
        class: "min-w-0 space-y-1.5",
        "aria-describedby": __props.group ? describedBy.value : void 0
      }, _attrs), {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            ssrRenderVNode(_push2, createVNode(resolveDynamicComponent(__props.group ? "legend" : "label"), {
              for: __props.group ? void 0 : id,
              class: "flex flex-wrap items-baseline gap-x-2 text-sm font-medium text-ink"
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`<span${_scopeId2}>${ssrInterpolate(__props.label)}</span>`);
                  if (__props.required) {
                    _push3(`<span class="text-xs font-normal text-accent-strong"${_scopeId2}>${ssrInterpolate(unref(t)("common.required"))}</span>`);
                  } else if (__props.optional) {
                    _push3(`<span class="text-xs font-normal text-muted"${_scopeId2}>${ssrInterpolate(unref(t)("common.optional"))}</span>`);
                  } else {
                    _push3(`<!---->`);
                  }
                } else {
                  return [
                    createVNode("span", null, toDisplayString(__props.label), 1),
                    __props.required ? (openBlock(), createBlock("span", {
                      key: 0,
                      class: "text-xs font-normal text-accent-strong"
                    }, toDisplayString(unref(t)("common.required")), 1)) : __props.optional ? (openBlock(), createBlock("span", {
                      key: 1,
                      class: "text-xs font-normal text-muted"
                    }, toDisplayString(unref(t)("common.optional")), 1)) : createCommentVNode("", true)
                  ];
                }
              }),
              _: 1
            }), _parent2, _scopeId);
            if (__props.hint) {
              _push2(`<p${ssrRenderAttr("id", hintId)} class="text-sm text-muted"${_scopeId}>${ssrInterpolate(__props.hint)}</p>`);
            } else {
              _push2(`<!---->`);
            }
            ssrRenderSlot(_ctx.$slots, "default", {}, null, _push2, _parent2, _scopeId);
            if (__props.error) {
              _push2(`<p${ssrRenderAttr("id", errorId)} class="flex items-start gap-1.5 text-sm font-medium text-danger" role="alert"${_scopeId}><span aria-hidden="true"${_scopeId}>!</span><span${_scopeId}>${ssrInterpolate(__props.error)}</span></p>`);
            } else {
              _push2(`<!---->`);
            }
          } else {
            return [
              (openBlock(), createBlock(resolveDynamicComponent(__props.group ? "legend" : "label"), {
                for: __props.group ? void 0 : id,
                class: "flex flex-wrap items-baseline gap-x-2 text-sm font-medium text-ink"
              }, {
                default: withCtx(() => [
                  createVNode("span", null, toDisplayString(__props.label), 1),
                  __props.required ? (openBlock(), createBlock("span", {
                    key: 0,
                    class: "text-xs font-normal text-accent-strong"
                  }, toDisplayString(unref(t)("common.required")), 1)) : __props.optional ? (openBlock(), createBlock("span", {
                    key: 1,
                    class: "text-xs font-normal text-muted"
                  }, toDisplayString(unref(t)("common.optional")), 1)) : createCommentVNode("", true)
                ]),
                _: 1
              }, 8, ["for"])),
              __props.hint ? (openBlock(), createBlock("p", {
                key: 0,
                id: hintId,
                class: "text-sm text-muted"
              }, toDisplayString(__props.hint), 1)) : createCommentVNode("", true),
              renderSlot(_ctx.$slots, "default"),
              __props.error ? (openBlock(), createBlock("p", {
                key: 1,
                id: errorId,
                class: "flex items-start gap-1.5 text-sm font-medium text-danger",
                role: "alert"
              }, [
                createVNode("span", { "aria-hidden": "true" }, "!"),
                createVNode("span", null, toDisplayString(__props.error), 1)
              ])) : createCommentVNode("", true)
            ];
          }
        }),
        _: 3
      }), _parent);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/ui/FormField.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { FORM_FIELD_KEY as F, _sfc_main as _ };
//# sourceMappingURL=FormField-DFtov8VK.mjs.map
