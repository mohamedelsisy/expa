import { defineComponent, computed, mergeProps, unref, withCtx, createVNode, createTextVNode, toDisplayString, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate } from 'vue/server-renderer';
import { S as STATUS_TONE, a as STATUS_ICON } from './documents-DL9ve8rH.mjs';
import { _ as _sfc_main$1 } from './Badge-PdKIsny2.mjs';
import { u as useI18n, d as _sfc_main$5 } from './server.mjs';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "StatusBadge",
  __ssrInlineRender: true,
  props: {
    status: {},
    days: {}
  },
  setup(__props) {
    const props = __props;
    const { t } = useI18n();
    const text = computed(() => {
      if (props.days === null) return "";
      if (props.status === "expired") return t("documents.expiredAgo", { count: Math.abs(props.days) });
      return t("documents.daysLeft", { count: props.days });
    });
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<span${ssrRenderAttrs(mergeProps({
        class: "inline-flex flex-wrap items-center gap-2",
        "data-status": __props.status
      }, _attrs))}>`);
      _push(ssrRenderComponent(_sfc_main$1, {
        tone: unref(STATUS_TONE)[__props.status]
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_sfc_main$5, {
              name: unref(STATUS_ICON)[__props.status],
              size: 14
            }, null, _parent2, _scopeId));
            _push2(`${ssrInterpolate(unref(t)(`documents.status.${__props.status}`))}`);
          } else {
            return [
              createVNode(_sfc_main$5, {
                name: unref(STATUS_ICON)[__props.status],
                size: 14
              }, null, 8, ["name"]),
              createTextVNode(toDisplayString(unref(t)(`documents.status.${__props.status}`)), 1)
            ];
          }
        }),
        _: 1
      }, _parent));
      if (text.value) {
        _push(`<span class="text-sm text-ink-soft tabular-nums">${ssrInterpolate(text.value)}</span>`);
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/documents/StatusBadge.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as _ };
//# sourceMappingURL=StatusBadge-DdQOB3xC.mjs.map
