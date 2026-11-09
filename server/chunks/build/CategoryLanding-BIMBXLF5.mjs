import { _ as _sfc_main$1 } from './Breadcrumbs-C7SaJcTR.mjs';
import { _ as _sfc_main$2 } from './Alert-D-zfMDy5.mjs';
import { _ as _sfc_main$3 } from './Skeleton-BTnKIEst.mjs';
import { u as useI18n, g as useApi, b as useRuntimeConfig, c as useLocalePath, i as _sfc_main$2$1, j as isApiError, _ as _sfc_main$3$1, d as _sfc_main$5$1 } from './server.mjs';
import { _ as _sfc_main$4 } from './EmptyState-N2xvHts8.mjs';
import { _ as _sfc_main$5 } from './GuideCard-DdNhOq5I.mjs';
import { _ as _sfc_main$6 } from './Card-DWZvP-sp.mjs';
import { defineComponent, computed, withAsyncContext, mergeProps, unref, withCtx, createTextVNode, toDisplayString, createVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderSlot, ssrRenderList } from 'vue/server-renderer';
import { u as useSeo } from './useSeo-BU4sLOnV.mjs';
import { u as useAsyncData } from './asyncData-bKJD5Wmv.mjs';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "CategoryLanding",
  __ssrInlineRender: true,
  props: {
    area: {},
    category: {},
    articleCategory: {},
    path: {},
    icon: {}
  },
  async setup(__props) {
    var _a;
    let __temp, __restore;
    const props = __props;
    const { t, locale } = useI18n();
    const { request } = useApi();
    const siteUrl = String((_a = useRuntimeConfig().public.siteUrl) != null ? _a : "").replace(/\/$/, "");
    const localePath = useLocalePath();
    useSeo(() => ({
      title: t(`areas.${props.area}.seoTitle`),
      description: t(`areas.${props.area}.seoDescription`),
      jsonLdData: { "@context": "https://schema.org", "@type": "CollectionPage", name: t(`areas.${props.area}.title`), description: t(`areas.${props.area}.seoDescription`), url: siteUrl + localePath(props.path), inLanguage: locale.value }
    }));
    const crumbs = computed(() => [{ label: t("nav.home"), to: "/" }, { label: t("explore.title"), to: "/explore" }, { label: t(`areas.${props.area}.title`) }]);
    const { data: guides, error, refresh, status } = ([__temp, __restore] = withAsyncContext(async () => useAsyncData(`area-guides-${props.area}`, async () => (await request("guides", { query: { category: props.category, per_page: 12 } })).data, { watch: [locale] })), __temp = await __temp, __restore(), __temp);
    const { data: articles } = ([__temp, __restore] = withAsyncContext(async () => useAsyncData(`area-articles-${props.area}`, async () => {
      if (!props.articleCategory) return [];
      try {
        return (await request("articles", { query: { category: props.articleCategory, per_page: 6 } })).data;
      } catch {
        return [];
      }
    }, { watch: [locale] })), __temp = await __temp, __restore(), __temp);
    return (_ctx, _push, _parent, _attrs) => {
      var _a2, _b;
      const _component_UiBreadcrumbs = _sfc_main$1;
      const _component_UiAlert = _sfc_main$2;
      const _component_UiSkeleton = _sfc_main$3;
      const _component_UiErrorState = _sfc_main$2$1;
      const _component_UiEmptyState = _sfc_main$4;
      const _component_GuideCard = _sfc_main$5;
      const _component_UiButton = _sfc_main$3$1;
      const _component_UiIcon = _sfc_main$5$1;
      const _component_ArticlesCard = _sfc_main$6;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "container-page py-8 sm:py-12" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_UiBreadcrumbs, {
        items: unref(crumbs),
        class: "mb-6"
      }, null, _parent));
      _push(`<header class="mb-8 max-w-2xl space-y-3"><h1 class="text-2xl font-bold sm:text-3xl">${ssrInterpolate(unref(t)(`areas.${__props.area}.title`))}</h1><p class="text-ink-soft">${ssrInterpolate(unref(t)(`areas.${__props.area}.subtitle`))}</p></header>`);
      _push(ssrRenderComponent(_component_UiAlert, {
        tone: "warning",
        class: "mb-8",
        "data-testid": "area-disclaimer"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`${ssrInterpolate(unref(t)(`areas.${__props.area}.disclaimer`))}`);
          } else {
            return [
              createTextVNode(toDisplayString(unref(t)(`areas.${__props.area}.disclaimer`)), 1)
            ];
          }
        }),
        _: 1
      }, _parent));
      if (_ctx.$slots.tools) {
        _push(`<div class="mb-8">`);
        ssrRenderSlot(_ctx.$slots, "tools", {}, null, _push, _parent);
        _push(`</div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<section aria-labelledby="area-guides-h" class="space-y-4"><h2 id="area-guides-h" class="text-xl font-bold">${ssrInterpolate(unref(t)("areas.common.guides"))}</h2>`);
      if (unref(status) === "pending" && !unref(guides)) {
        _push(`<div aria-busy="true">`);
        _push(ssrRenderComponent(_component_UiSkeleton, {
          block: "",
          lines: 3
        }, null, _parent));
        _push(`</div>`);
      } else if (unref(error)) {
        _push(ssrRenderComponent(_component_UiErrorState, {
          message: unref(isApiError)(unref(error)) ? unref(error).message : void 0,
          retry: "",
          onRetry: ($event) => unref(refresh)()
        }, null, _parent));
      } else if (!((_a2 = unref(guides)) == null ? void 0 : _a2.length)) {
        _push(ssrRenderComponent(_component_UiEmptyState, {
          title: unref(t)("areas.common.noGuidesTitle"),
          description: unref(t)("areas.common.noGuides"),
          icon: __props.icon
        }, null, _parent));
      } else {
        _push(`<ul class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"><!--[-->`);
        ssrRenderList(unref(guides), (g) => {
          _push(`<li>`);
          _push(ssrRenderComponent(_component_GuideCard, { guide: g }, null, _parent));
          _push(`</li>`);
        });
        _push(`<!--]--></ul>`);
      }
      _push(`<p class="flex flex-wrap gap-2">`);
      _push(ssrRenderComponent(_component_UiButton, {
        to: `/guides?category=${__props.category}`,
        variant: "ghost"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`${ssrInterpolate(unref(t)("areas.common.allGuides"))}`);
          } else {
            return [
              createTextVNode(toDisplayString(unref(t)("areas.common.allGuides")), 1)
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_UiButton, {
        to: "/ask",
        variant: "ghost"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_UiIcon, {
              name: "sparkle",
              size: 18
            }, null, _parent2, _scopeId));
            _push2(`${ssrInterpolate(unref(t)("areas.common.ask"))}`);
          } else {
            return [
              createVNode(_component_UiIcon, {
                name: "sparkle",
                size: 18
              }),
              createTextVNode(toDisplayString(unref(t)("areas.common.ask")), 1)
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</p></section>`);
      if (__props.articleCategory) {
        _push(`<section aria-labelledby="area-articles-h" class="mt-10 space-y-4"><h2 id="area-articles-h" class="text-xl font-bold">${ssrInterpolate(unref(t)("areas.common.articles"))}</h2>`);
        if (!((_b = unref(articles)) == null ? void 0 : _b.length)) {
          _push(`<p class="text-ink-soft">${ssrInterpolate(unref(t)("areas.common.noArticles"))}</p>`);
        } else {
          _push(`<ul class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"><!--[-->`);
          ssrRenderList(unref(articles), (a) => {
            _push(`<li>`);
            _push(ssrRenderComponent(_component_ArticlesCard, { article: a }, null, _parent));
            _push(`</li>`);
          });
          _push(`<!--]--></ul>`);
        }
        _push(`<p>`);
        _push(ssrRenderComponent(_component_UiButton, {
          to: `/articles?category=${__props.articleCategory}`,
          variant: "ghost"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`${ssrInterpolate(unref(t)("areas.common.allArticles"))}`);
            } else {
              return [
                createTextVNode(toDisplayString(unref(t)("areas.common.allArticles")), 1)
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</p></section>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<p class="mt-10 max-w-2xl text-sm text-muted">${ssrInterpolate(unref(t)("areas.common.sourcesNote"))}</p></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/guide/CategoryLanding.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as _ };
//# sourceMappingURL=CategoryLanding-BIMBXLF5.mjs.map
