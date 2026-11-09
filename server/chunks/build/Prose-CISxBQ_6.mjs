import { _ as _sfc_main$1 } from './Inline-DiRQe8hf.mjs';
import { defineComponent, computed, mergeProps, unref, createVNode, resolveDynamicComponent, withCtx, openBlock, createBlock, Fragment, renderList, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderList, ssrRenderVNode, ssrRenderComponent } from 'vue/server-renderer';
import { a as parseMarkdown } from './legal-vAxOkaZS.mjs';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "Prose",
  __ssrInlineRender: true,
  props: {
    body: {},
    from: { default: 2 }
  },
  setup(__props) {
    const props = __props;
    const blocks = computed(() => parseMarkdown(props.body));
    const base = computed(() => Math.min(4, ...blocks.value.flatMap((b) => b.type === "h" ? [b.level] : [])));
    const lvl = (n) => Math.min(6, Math.max(props.from, n - base.value + props.from));
    return (_ctx, _push, _parent, _attrs) => {
      const _component_LegalInline = _sfc_main$1;
      _push(`<div${ssrRenderAttrs(mergeProps({
        class: "space-y-4 leading-relaxed",
        dir: "auto"
      }, _attrs))}><!--[-->`);
      ssrRenderList(unref(blocks), (b, i) => {
        _push(`<!--[-->`);
        if (b.type === "h") {
          ssrRenderVNode(_push, createVNode(resolveDynamicComponent(`h${lvl(b.level)}`), { class: "pt-2 text-xl font-bold" }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(ssrRenderComponent(_component_LegalInline, {
                  text: b.text
                }, null, _parent2, _scopeId));
              } else {
                return [
                  createVNode(_component_LegalInline, {
                    text: b.text
                  }, null, 8, ["text"])
                ];
              }
            }),
            _: 2
          }), _parent);
        } else if (b.type === "p") {
          _push(`<p>`);
          _push(ssrRenderComponent(_component_LegalInline, {
            text: b.text
          }, null, _parent));
          _push(`</p>`);
        } else {
          ssrRenderVNode(_push, createVNode(resolveDynamicComponent(b.type), {
            class: ["space-y-1 ps-6", b.type === "ul" ? "list-disc" : "list-decimal"]
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`<!--[-->`);
                ssrRenderList(b.items, (it, j) => {
                  _push2(`<li${_scopeId}>`);
                  _push2(ssrRenderComponent(_component_LegalInline, { text: it }, null, _parent2, _scopeId));
                  _push2(`</li>`);
                });
                _push2(`<!--]-->`);
              } else {
                return [
                  (openBlock(true), createBlock(Fragment, null, renderList(b.items, (it, j) => {
                    return openBlock(), createBlock("li", { key: j }, [
                      createVNode(_component_LegalInline, { text: it }, null, 8, ["text"])
                    ]);
                  }), 128))
                ];
              }
            }),
            _: 2
          }), _parent);
        }
        _push(`<!--]-->`);
      });
      _push(`<!--]--></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/content/Prose.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as _ };
//# sourceMappingURL=Prose-CISxBQ_6.mjs.map
