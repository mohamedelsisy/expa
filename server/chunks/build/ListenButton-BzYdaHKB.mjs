import { defineComponent, ref, mergeProps, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent } from 'vue/server-renderer';
import { u as useI18n, d as _sfc_main$5 } from './server.mjs';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "ListenButton",
  __ssrInlineRender: true,
  props: {
    text: {}
  },
  setup(__props) {
    const { t } = useI18n();
    const supported = ref(false);
    const speaking = ref(false);
    return (_ctx, _push, _parent, _attrs) => {
      if (supported.value) {
        _push(`<button${ssrRenderAttrs(mergeProps({
          type: "button",
          class: "inline-flex min-h-touch min-w-touch items-center justify-center gap-1 rounded-md text-primary-strong hover:bg-primary-soft",
          "aria-label": `${unref(t)("learn.listen")}: ${__props.text}`,
          "aria-pressed": speaking.value,
          "data-testid": "listen"
        }, _attrs))}>`);
        _push(ssrRenderComponent(_sfc_main$5, {
          name: "volume",
          size: 20
        }, null, _parent));
        _push(`</button>`);
      } else {
        _push(`<!---->`);
      }
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/learn/ListenButton.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as _ };
//# sourceMappingURL=ListenButton-BzYdaHKB.mjs.map
