import { _ as _sfc_main$1 } from './AutoItalian-BD4PyQ-n.mjs';
import { _ as _sfc_main$2 } from './Alert-D-zfMDy5.mjs';
import { defineComponent, mergeProps, unref, withCtx, createVNode, toDisplayString, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrInterpolate, ssrRenderList, ssrRenderComponent } from 'vue/server-renderer';
import { u as useI18n } from './server.mjs';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "GuideSteps",
  __ssrInlineRender: true,
  props: {
    guide: {}
  },
  setup(__props) {
    const { t } = useI18n();
    return (_ctx, _push, _parent, _attrs) => {
      var _a;
      const _component_UiAutoItalian = _sfc_main$1;
      const _component_UiAlert = _sfc_main$2;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-5" }, _attrs))}>`);
      if ((_a = __props.guide.steps) == null ? void 0 : _a.length) {
        _push(`<section aria-labelledby="ag-steps" class="space-y-2"><h3 id="ag-steps" class="text-lg font-bold">${ssrInterpolate(unref(t)("gov.steps"))}</h3><ol class="space-y-3"><!--[-->`);
        ssrRenderList(__props.guide.steps, (st, i) => {
          _push(`<li class="flex gap-3"><span class="grid size-8 shrink-0 place-items-center rounded-full bg-primary-soft font-bold text-primary-strong tabular-nums" aria-hidden="true">${ssrInterpolate(i + 1)}</span><div><p class="font-semibold">`);
          _push(ssrRenderComponent(_component_UiAutoItalian, {
            text: st.title
          }, null, _parent));
          _push(`</p>`);
          if (st.text) {
            _push(`<p class="prose-plain text-ink-soft">`);
            _push(ssrRenderComponent(_component_UiAutoItalian, {
              text: st.text
            }, null, _parent));
            _push(`</p>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div></li>`);
        });
        _push(`<!--]--></ol></section>`);
      } else {
        _push(`<!---->`);
      }
      if (__props.guide.tips) {
        _push(ssrRenderComponent(_component_UiAlert, {
          tone: "info",
          title: unref(t)("gov.tips")
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<p class="prose-plain"${_scopeId}>${ssrInterpolate(__props.guide.tips)}</p>`);
            } else {
              return [
                createVNode("p", { class: "prose-plain" }, toDisplayString(__props.guide.tips), 1)
              ];
            }
          }),
          _: 1
        }, _parent));
      } else {
        _push(`<!---->`);
      }
      if (__props.guide.cautions) {
        _push(ssrRenderComponent(_component_UiAlert, {
          tone: "warning",
          title: unref(t)("gov.cautions")
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<p class="prose-plain"${_scopeId}>${ssrInterpolate(__props.guide.cautions)}</p>`);
            } else {
              return [
                createVNode("p", { class: "prose-plain" }, toDisplayString(__props.guide.cautions), 1)
              ];
            }
          }),
          _: 1
        }, _parent));
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/gov/GuideSteps.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as _ };
//# sourceMappingURL=GuideSteps-CUJ1XeBp.mjs.map
