import { defineComponent, computed, mergeProps, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrInterpolate, ssrRenderComponent, ssrRenderAttr } from 'vue/server-renderer';
import { a as safeHttpsUrl } from './safe-B2eSdAXJ.mjs';
import { _ as _sfc_main$1 } from './SourceBadge-4_eAChkr.mjs';
import { _ as _sfc_main$2 } from './FreshnessIndicator-B5-_pVo1.mjs';
import { u as useI18n, d as _sfc_main$5 } from './server.mjs';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "GuideSource",
  __ssrInlineRender: true,
  props: {
    source: {}
  },
  setup(__props) {
    const props = __props;
    const { t } = useI18n();
    const url = computed(() => safeHttpsUrl(props.source.url));
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<section${ssrRenderAttrs(mergeProps({
        class: "space-y-3 rounded-lg border border-line bg-surface p-5",
        "aria-label": unref(t)("source.title")
      }, _attrs))}><h2 class="text-base font-bold">${ssrInterpolate(unref(t)("source.title"))}</h2><div class="flex flex-wrap items-center gap-2">`);
      _push(ssrRenderComponent(_sfc_main$1, {
        type: __props.source.type
      }, null, _parent));
      if (__props.source.name) {
        _push(`<span class="font-medium" data-testid="source-name">${ssrInterpolate(__props.source.name)}</span>`);
      } else {
        _push(`<span class="text-muted">${ssrInterpolate(unref(t)("source.unknown"))}</span>`);
      }
      _push(`</div>`);
      if (url.value) {
        _push(`<a${ssrRenderAttr("href", url.value)} target="_blank" rel="noopener noreferrer" class="inline-flex min-h-touch items-center gap-2 font-medium text-primary-strong underline underline-offset-4" data-testid="source-link">${ssrInterpolate(unref(t)("source.open"))}`);
        _push(ssrRenderComponent(_sfc_main$5, {
          name: "external",
          size: 16
        }, null, _parent));
        _push(`<span class="sr-only">${ssrInterpolate(unref(t)("a11y.opensNewTab"))}</span></a>`);
      } else {
        _push(`<!---->`);
      }
      _push(ssrRenderComponent(_sfc_main$2, {
        "last-verified-at": __props.source.last_verified_at,
        freshness: __props.source.freshness
      }, null, _parent));
      _push(`</section>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/guide/GuideSource.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as _ };
//# sourceMappingURL=GuideSource-B-ek0Kys.mjs.map
