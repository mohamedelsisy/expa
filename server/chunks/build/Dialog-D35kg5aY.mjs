import { defineComponent, useId, ref, watch, nextTick, mergeProps, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderAttr, ssrRenderClass, ssrInterpolate, ssrRenderComponent, ssrRenderSlot } from 'vue/server-renderer';
import { u as useI18n, d as _sfc_main$5 } from './server.mjs';

const FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]):not([type="hidden"]),select:not([disabled]),textarea:not([disabled]),summary,[tabindex]:not([tabindex="-1"])';
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "Dialog",
  __ssrInlineRender: true,
  props: {
    open: { type: Boolean },
    title: {},
    variant: { default: "center" }
  },
  emits: ["close"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const { t } = useI18n();
    const titleId = `dlg-${useId()}`;
    const panel = ref(null);
    let opener = null;
    watch(() => props.open, async (v) => {
      var _a, _b, _c, _d, _e;
      if (v) {
        opener = (void 0).activeElement;
        (void 0).documentElement.style.overflow = "hidden";
        await nextTick();
        const first = (_d = (_c = (_a = panel.value) == null ? void 0 : _a.querySelector("[data-autofocus]")) != null ? _c : (_b = panel.value) == null ? void 0 : _b.querySelector(FOCUSABLE)) != null ? _d : panel.value;
        first == null ? void 0 : first.focus();
      } else {
        (void 0).documentElement.style.overflow = "";
        (_e = opener == null ? void 0 : opener.focus) == null ? void 0 : _e.call(opener);
      }
    });
    return (_ctx, _push, _parent, _attrs) => {
      if (__props.open) {
        _push(`<div${ssrRenderAttrs(mergeProps({
          class: ["fixed inset-0 z-50 flex", __props.variant === "drawer" ? "justify-end" : "items-center justify-center p-4"]
        }, _attrs))}><div class="absolute inset-0 bg-ink/50" aria-hidden="true"></div><div role="dialog" aria-modal="true"${ssrRenderAttr("aria-labelledby", titleId)} tabindex="-1" class="${ssrRenderClass([__props.variant === "drawer" ? "h-full max-w-xl" : "max-w-lg rounded-lg", "relative flex max-h-full w-full flex-col overflow-hidden bg-surface shadow-3 outline-none"])}"><header class="flex items-center justify-between gap-3 border-b border-line px-5 py-3"><h2${ssrRenderAttr("id", titleId)} class="text-lg font-bold">${ssrInterpolate(__props.title)}</h2><button type="button" class="inline-flex min-h-touch min-w-touch items-center justify-center rounded-md text-ink-soft hover:bg-sunken"${ssrRenderAttr("aria-label", unref(t)("admin.common.close"))}>`);
        _push(ssrRenderComponent(_sfc_main$5, { name: "x" }, null, _parent));
        _push(`</button></header><div class="min-h-0 flex-1 overflow-y-auto px-5 py-4">`);
        ssrRenderSlot(_ctx.$slots, "default", {}, null, _push, _parent);
        _push(`</div>`);
        if (_ctx.$slots.footer) {
          _push(`<footer class="flex flex-wrap justify-end gap-2 border-t border-line px-5 py-3">`);
          ssrRenderSlot(_ctx.$slots, "footer", {}, null, _push, _parent);
          _push(`</footer>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div></div>`);
      } else {
        _push(`<!---->`);
      }
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/admin/Dialog.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as _ };
//# sourceMappingURL=Dialog-D35kg5aY.mjs.map
