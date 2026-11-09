import { _ as _sfc_main$1 } from './Breadcrumbs-C7SaJcTR.mjs';
import { defineComponent, mergeProps, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderSlot } from 'vue/server-renderer';
import { u as useI18n } from './server.mjs';
import { u as useSeo } from './useSeo-BU4sLOnV.mjs';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "PageHeader",
  __ssrInlineRender: true,
  props: {
    title: {},
    description: {},
    crumbs: {}
  },
  setup(__props) {
    return (_ctx, _push, _parent, _attrs) => {
      var _a;
      const _component_UiBreadcrumbs = _sfc_main$1;
      _push(`<header${ssrRenderAttrs(mergeProps({ class: "mb-6 space-y-2" }, _attrs))}>`);
      if ((_a = __props.crumbs) == null ? void 0 : _a.length) {
        _push(ssrRenderComponent(_component_UiBreadcrumbs, { items: __props.crumbs }, null, _parent));
      } else {
        _push(`<!---->`);
      }
      _push(`<div class="flex flex-wrap items-end justify-between gap-3"><div class="min-w-0 max-w-3xl"><h1 class="text-2xl font-bold sm:text-3xl">${ssrInterpolate(__props.title)}</h1>`);
      if (__props.description) {
        _push(`<p class="mt-1 text-ink-soft">${ssrInterpolate(__props.description)}</p>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
      if (_ctx.$slots.default) {
        _push(`<div class="flex flex-wrap items-center gap-2">`);
        ssrRenderSlot(_ctx.$slots, "default", {}, null, _push, _parent);
        _push(`</div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div></header>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/admin/PageHeader.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
function useAdminSeo(title) {
  const { t } = useI18n();
  useSeo(() => ({ title: title(), description: t("admin.title"), noindex: true }));
}

export { _sfc_main as _, useAdminSeo as u };
//# sourceMappingURL=useAdminSeo-DuRYEU0h.mjs.map
