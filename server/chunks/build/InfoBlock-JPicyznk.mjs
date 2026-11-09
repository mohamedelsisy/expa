import { _ as _sfc_main$1 } from './Badge-PdKIsny2.mjs';
import { u as useI18n, d as _sfc_main$5, w as contentLang } from './server.mjs';
import { _ as _sfc_main$2 } from './Prose-CISxBQ_6.mjs';
import { _ as _sfc_main$3 } from './FallbackNotice-CwHuyozE.mjs';
import { _ as _sfc_main$4 } from './GuideSource-B-ek0Kys.mjs';
import { defineComponent, mergeProps, withCtx, createTextVNode, toDisplayString, createVNode, resolveDynamicComponent, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderVNode } from 'vue/server-renderer';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "InfoBlock",
  __ssrInlineRender: true,
  props: {
    block: {},
    headingLevel: {}
  },
  setup(__props) {
    const { t } = useI18n();
    return (_ctx, _push, _parent, _attrs) => {
      var _a;
      const _component_UiBadge = _sfc_main$1;
      const _component_UiIcon = _sfc_main$5;
      const _component_ContentProse = _sfc_main$2;
      const _component_GuideFallbackNotice = _sfc_main$3;
      const _component_GuideSource = _sfc_main$4;
      _push(`<article${ssrRenderAttrs(mergeProps({
        class: "space-y-3 rounded-lg border border-line bg-surface p-5",
        "data-info-type": __props.block.info_type
      }, _attrs))}><div class="flex flex-wrap items-center gap-2">`);
      _push(ssrRenderComponent(_component_UiBadge, { tone: "primary" }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`${ssrInterpolate(__props.block.label)}`);
          } else {
            return [
              createTextVNode(toDisplayString(__props.block.label), 1)
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_UiBadge, {
        tone: __props.block.info_type === "official_info" ? "success" : "neutral",
        "data-testid": "info-label"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_UiIcon, {
              name: __props.block.info_type === "official_info" ? "shield" : "info",
              size: 14
            }, null, _parent2, _scopeId));
            _push2(`${ssrInterpolate(__props.block.info_label)}`);
          } else {
            return [
              createVNode(_component_UiIcon, {
                name: __props.block.info_type === "official_info" ? "shield" : "info",
                size: 14
              }, null, 8, ["name"]),
              createTextVNode(toDisplayString(__props.block.info_label), 1)
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div>`);
      ssrRenderVNode(_push, createVNode(resolveDynamicComponent(`h${(_a = __props.headingLevel) != null ? _a : 3}`), mergeProps({ class: "text-lg font-bold" }, unref(contentLang)(__props.block)), {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`${ssrInterpolate(__props.block.title)}`);
          } else {
            return [
              createTextVNode(toDisplayString(__props.block.title), 1)
            ];
          }
        }),
        _: 1
      }), _parent);
      if (__props.block.body) {
        _push(ssrRenderComponent(_component_ContentProse, mergeProps({
          body: __props.block.body,
          from: 4
        }, unref(contentLang)(__props.block)), null, _parent));
      } else {
        _push(`<!---->`);
      }
      if (__props.block.fallback) {
        _push(ssrRenderComponent(_component_GuideFallbackNotice, {
          locale: __props.block.locale
        }, null, _parent));
      } else {
        _push(`<!---->`);
      }
      if (__props.block.source) {
        _push(ssrRenderComponent(_component_GuideSource, {
          source: __props.block.source
        }, null, _parent));
      } else if (__props.block.info_type === "general_guidance") {
        _push(`<p class="text-sm text-muted">${ssrInterpolate(unref(t)("cityInfo.generalNote"))}</p>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</article>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/content/InfoBlock.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as _ };
//# sourceMappingURL=InfoBlock-JPicyznk.mjs.map
