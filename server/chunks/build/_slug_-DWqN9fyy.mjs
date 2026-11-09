import { _ as _sfc_main$1 } from './Breadcrumbs-C7SaJcTR.mjs';
import { _ as _sfc_main$2 } from './Skeleton-BTnKIEst.mjs';
import { u as useI18n, f as useRoute, c as useLocalePath, g as useApi, j as isApiError, o as createError, i as _sfc_main$2$1, d as _sfc_main$5, _ as _sfc_main$3$1 } from './server.mjs';
import { _ as _sfc_main$3 } from './Badge-PdKIsny2.mjs';
import { _ as _sfc_main$4 } from './FallbackNotice-CwHuyozE.mjs';
import { _ as _sfc_main$6 } from './Alert-D-zfMDy5.mjs';
import { _ as _sfc_main$7 } from './InfoBlock-JPicyznk.mjs';
import { _ as _sfc_main$8 } from './EmptyState-N2xvHts8.mjs';
import { _ as _sfc_main$9 } from './GuideCard-DdNhOq5I.mjs';
import { _ as _sfc_main$a } from './Card-DWZvP-sp.mjs';
import { defineComponent, computed, withAsyncContext, mergeProps, unref, withCtx, createVNode, createTextVNode, toDisplayString, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderList } from 'vue/server-renderer';
import { u as useAsyncData } from './asyncData-bKJD5Wmv.mjs';
import { u as useSeo } from './useSeo-BU4sLOnV.mjs';
import './safe-B2eSdAXJ.mjs';
import '../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'node:url';
import '../routes/renderer.mjs';
import 'vue-bundle-renderer/runtime';
import 'unhead/server';
import 'devalue';
import 'unhead/plugins';
import 'unhead/utils';
import 'pinia';
import 'vue-router';
import './Prose-CISxBQ_6.mjs';
import './Inline-DiRQe8hf.mjs';
import './legal-vAxOkaZS.mjs';
import './GuideSource-B-ek0Kys.mjs';
import './SourceBadge-4_eAChkr.mjs';
import './FreshnessIndicator-B5-_pVo1.mjs';
import './Card-BxvVO_-_.mjs';
import './AutoItalian-BD4PyQ-n.mjs';
import 'perfect-debounce';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "[slug]",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const { t, locale } = useI18n();
    const route = useRoute();
    useLocalePath();
    const { request } = useApi();
    const slug = computed(() => String(route.params.slug));
    const { data: c, error, refresh, status } = ([__temp, __restore] = withAsyncContext(async () => useAsyncData(() => `city-${slug.value}`, async () => (await request(`cities/${encodeURIComponent(slug.value)}`)).data, { watch: [locale] })), __temp = await __temp, __restore(), __temp);
    if (isApiError(error.value) && error.value.status === 404) throw createError({ statusCode: 404, statusMessage: "Not Found", fatal: true });
    useSeo(() => {
      var _a, _b, _c, _d, _e, _f;
      return {
        title: c.value ? t("cities.pageTitle", { city: c.value.name }) : t("cities.title"),
        description: (_d = (_c = (_a = c.value) == null ? void 0 : _a.seo_description) != null ? _c : (_b = c.value) == null ? void 0 : _b.summary) != null ? _d : t("cities.subtitle"),
        fallback: !!((_e = c.value) == null ? void 0 : _e.fallback),
        jsonLdData: c.value ? { "@context": "https://schema.org", "@type": "City", name: c.value.name, description: (_f = c.value.summary) != null ? _f : void 0, containedInPlace: { "@type": "AdministrativeArea", name: c.value.region.name } } : void 0
      };
    });
    const crumbs = computed(() => {
      var _a, _b;
      return [{ label: t("nav.home"), to: "/" }, { label: t("cities.title"), to: "/cities" }, { label: (_b = (_a = c.value) == null ? void 0 : _a.name) != null ? _b : "" }];
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UiBreadcrumbs = _sfc_main$1;
      const _component_UiSkeleton = _sfc_main$2;
      const _component_UiErrorState = _sfc_main$2$1;
      const _component_UiBadge = _sfc_main$3;
      const _component_UiIcon = _sfc_main$5;
      const _component_GuideFallbackNotice = _sfc_main$4;
      const _component_UiAlert = _sfc_main$6;
      const _component_ContentInfoBlock = _sfc_main$7;
      const _component_UiEmptyState = _sfc_main$8;
      const _component_GuideCard = _sfc_main$9;
      const _component_ArticlesCard = _sfc_main$a;
      const _component_UiButton = _sfc_main$3$1;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "container-page max-w-5xl py-8 sm:py-12" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_UiBreadcrumbs, {
        items: unref(crumbs),
        class: "mb-6"
      }, null, _parent));
      if (!unref(c)) {
        _push(`<h1 class="sr-only">${ssrInterpolate(unref(t)("cities.title"))}</h1>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(status) === "pending" && !unref(c)) {
        _push(`<div aria-busy="true" class="space-y-6">`);
        _push(ssrRenderComponent(_component_UiSkeleton, {
          block: "",
          lines: 2
        }, null, _parent));
        _push(ssrRenderComponent(_component_UiSkeleton, { lines: 6 }, null, _parent));
        _push(`</div>`);
      } else if (unref(error) || !unref(c)) {
        _push(ssrRenderComponent(_component_UiErrorState, {
          message: ("isApiError" in _ctx ? _ctx.isApiError : unref(isApiError))(unref(error)) ? unref(error).message : void 0,
          retry: "",
          onRetry: ($event) => unref(refresh)()
        }, null, _parent));
      } else {
        _push(`<div class="space-y-10"><header class="space-y-3">`);
        _push(ssrRenderComponent(_component_UiBadge, null, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_UiIcon, {
                name: "map",
                size: 14
              }, null, _parent2, _scopeId));
              _push2(`${ssrInterpolate(unref(c).region.name)}`);
            } else {
              return [
                createVNode(_component_UiIcon, {
                  name: "map",
                  size: 14
                }),
                createTextVNode(toDisplayString(unref(c).region.name), 1)
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`<h1 class="text-3xl font-bold sm:text-4xl">${ssrInterpolate(unref(c).name)}</h1>`);
        if (unref(c).headline) {
          _push(`<p class="text-xl font-medium text-ink-soft">${ssrInterpolate(unref(c).headline)}</p>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(c).summary) {
          _push(`<p class="max-w-prose text-ink-soft">${ssrInterpolate(unref(c).summary)}</p>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(c).fallback) {
          _push(ssrRenderComponent(_component_GuideFallbackNotice, {
            locale: unref(c).locale
          }, null, _parent));
        } else {
          _push(`<!---->`);
        }
        _push(`</header>`);
        _push(ssrRenderComponent(_component_UiAlert, {
          tone: "info",
          "data-testid": "city-disclaimer"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`${ssrInterpolate(unref(c).disclaimer)}`);
            } else {
              return [
                createTextVNode(toDisplayString(unref(c).disclaimer), 1)
              ];
            }
          }),
          _: 1
        }, _parent));
        if (unref(c).blocks.length) {
          _push(`<section aria-labelledby="cb-h" class="space-y-4"><h2 id="cb-h" class="text-2xl font-bold">${ssrInterpolate(unref(t)("cities.localInfo"))}</h2><div class="grid gap-4 md:grid-cols-2"><!--[-->`);
          ssrRenderList(unref(c).blocks, (b) => {
            _push(ssrRenderComponent(_component_ContentInfoBlock, {
              key: b.key,
              block: b
            }, null, _parent));
          });
          _push(`<!--]--></div></section>`);
        } else {
          _push(ssrRenderComponent(_component_UiEmptyState, {
            title: unref(t)("cities.noBlocksTitle"),
            description: unref(t)("cities.noBlocks"),
            icon: "map"
          }, null, _parent));
        }
        if (unref(c).guides.length) {
          _push(`<section aria-labelledby="cgd-h" class="space-y-4"><h2 id="cgd-h" class="text-2xl font-bold">${ssrInterpolate(unref(t)("cities.guidesHere"))}</h2><ul class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"><!--[-->`);
          ssrRenderList(unref(c).guides, (g) => {
            _push(`<li>`);
            _push(ssrRenderComponent(_component_GuideCard, { guide: g }, null, _parent));
            _push(`</li>`);
          });
          _push(`<!--]--></ul></section>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(c).articles.length) {
          _push(`<section aria-labelledby="car-h" class="space-y-4"><h2 id="car-h" class="text-2xl font-bold">${ssrInterpolate(unref(t)("cities.articlesHere"))}</h2><ul class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"><!--[-->`);
          ssrRenderList(unref(c).articles, (a) => {
            _push(`<li>`);
            _push(ssrRenderComponent(_component_ArticlesCard, { article: a }, null, _parent));
            _push(`</li>`);
          });
          _push(`<!--]--></ul></section>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(c).offices_count > 0) {
          _push(`<p>`);
          _push(ssrRenderComponent(_component_UiButton, {
            to: `/government?city=${encodeURIComponent(unref(c).slug)}`,
            variant: "secondary"
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(ssrRenderComponent(_component_UiIcon, {
                  name: "building",
                  size: 18
                }, null, _parent2, _scopeId));
                _push2(`${ssrInterpolate(unref(t)("cities.offices", { count: unref(c).offices_count }))}`);
              } else {
                return [
                  createVNode(_component_UiIcon, {
                    name: "building",
                    size: 18
                  }),
                  createTextVNode(toDisplayString(unref(t)("cities.offices", { count: unref(c).offices_count })), 1)
                ];
              }
            }),
            _: 1
          }, _parent));
          _push(`</p>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div>`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/cities/[slug].vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=_slug_-DWqN9fyy.mjs.map
