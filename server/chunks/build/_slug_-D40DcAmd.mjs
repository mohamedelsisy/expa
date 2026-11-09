import { _ as _sfc_main$1 } from './Breadcrumbs-C7SaJcTR.mjs';
import { _ as _sfc_main$2 } from './Skeleton-BTnKIEst.mjs';
import { u as useI18n, f as useRoute, c as useLocalePath, g as useApi, b as useRuntimeConfig, j as isApiError, o as createError, i as _sfc_main$2$1, d as _sfc_main$5, w as contentLang, k as formatDate, e as __nuxt_component_0 } from './server.mjs';
import { _ as _sfc_main$3 } from './Badge-PdKIsny2.mjs';
import { _ as _sfc_main$4 } from './FallbackNotice-CwHuyozE.mjs';
import { _ as _sfc_main$6 } from './Prose-CISxBQ_6.mjs';
import { _ as _sfc_main$7 } from './Alert-D-zfMDy5.mjs';
import { _ as _sfc_main$8 } from './GuideSource-B-ek0Kys.mjs';
import { _ as _sfc_main$9 } from './Card-DWZvP-sp.mjs';
import { defineComponent, computed, withAsyncContext, mergeProps, unref, withCtx, createTextVNode, toDisplayString, createVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderAttr, ssrRenderList } from 'vue/server-renderer';
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
import './Inline-DiRQe8hf.mjs';
import './legal-vAxOkaZS.mjs';
import './SourceBadge-4_eAChkr.mjs';
import './FreshnessIndicator-B5-_pVo1.mjs';
import './Card-BxvVO_-_.mjs';
import 'perfect-debounce';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "[slug]",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const { t, locale } = useI18n();
    const route = useRoute();
    const localePath = useLocalePath();
    const { request } = useApi();
    const siteUrl = useRuntimeConfig().public.siteUrl.replace(/\/$/, "");
    const slug = computed(() => String(route.params.slug));
    const { data: a, error, refresh, status } = ([__temp, __restore] = withAsyncContext(async () => useAsyncData(() => `article-${slug.value}`, async () => (await request(`articles/${encodeURIComponent(slug.value)}`)).data, { watch: [locale] })), __temp = await __temp, __restore(), __temp);
    if (isApiError(error.value) && error.value.status === 404) throw createError({ statusCode: 404, statusMessage: "Not Found", fatal: true });
    useSeo(() => {
      var _a, _b, _c, _d, _e, _f;
      const x = a.value;
      return {
        title: x ? (_a = x.seo.title) != null ? _a : x.title : t("articles.title"),
        description: x ? (_c = (_b = x.seo.description) != null ? _b : x.excerpt) != null ? _c : t("articles.subtitle") : t("articles.subtitle"),
        type: "article",
        fallback: !!(x == null ? void 0 : x.fallback),
        jsonLdData: x ? {
          "@context": "https://schema.org",
          "@type": "Article",
          headline: x.title,
          description: (_d = x.excerpt) != null ? _d : void 0,
          inLanguage: x.locale,
          datePublished: (_e = x.published_at) != null ? _e : void 0,
          dateModified: (_f = x.updated_at) != null ? _f : void 0,
          mainEntityOfPage: `${siteUrl}${route.path}`,
          author: x.author_name ? { "@type": "Person", name: x.author_name } : { "@type": "Organization", name: "EXPA", url: siteUrl },
          publisher: { "@type": "Organization", name: "EXPA", url: siteUrl, logo: { "@type": "ImageObject", url: `${siteUrl}/og-image.png` } },
          image: `${siteUrl}/og-image.png`
        } : void 0
      };
    });
    const crumbs = computed(() => {
      var _a, _b;
      return [{ label: t("nav.home"), to: "/" }, { label: t("articles.title"), to: "/articles" }, { label: (_b = (_a = a.value) == null ? void 0 : _a.title) != null ? _b : "" }];
    });
    return (_ctx, _push, _parent, _attrs) => {
      var _a, _b;
      const _component_UiBreadcrumbs = _sfc_main$1;
      const _component_UiSkeleton = _sfc_main$2;
      const _component_UiErrorState = _sfc_main$2$1;
      const _component_UiBadge = _sfc_main$3;
      const _component_UiIcon = _sfc_main$5;
      const _component_GuideFallbackNotice = _sfc_main$4;
      const _component_ContentProse = _sfc_main$6;
      const _component_UiAlert = _sfc_main$7;
      const _component_GuideSource = _sfc_main$8;
      const _component_NuxtLink = __nuxt_component_0;
      const _component_ArticlesCard = _sfc_main$9;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "container-page max-w-3xl py-8 sm:py-12" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_UiBreadcrumbs, {
        items: unref(crumbs),
        class: "mb-6"
      }, null, _parent));
      if (!unref(a)) {
        _push(`<h1 class="sr-only">${ssrInterpolate(unref(t)("articles.title"))}</h1>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(status) === "pending" && !unref(a)) {
        _push(`<div aria-busy="true" class="space-y-6">`);
        _push(ssrRenderComponent(_component_UiSkeleton, {
          block: "",
          lines: 2
        }, null, _parent));
        _push(ssrRenderComponent(_component_UiSkeleton, { lines: 8 }, null, _parent));
        _push(`</div>`);
      } else if (unref(error) || !unref(a)) {
        _push(ssrRenderComponent(_component_UiErrorState, {
          message: ("isApiError" in _ctx ? _ctx.isApiError : unref(isApiError))(unref(error)) ? unref(error).message : void 0,
          retry: "",
          onRetry: ($event) => unref(refresh)()
        }, null, _parent));
      } else {
        _push(`<article class="space-y-6"><header class="space-y-3"><div class="flex flex-wrap items-center gap-2">`);
        _push(ssrRenderComponent(_component_UiBadge, { tone: "primary" }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`${ssrInterpolate(unref(a).category_label)}`);
            } else {
              return [
                createTextVNode(toDisplayString(unref(a).category_label), 1)
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(ssrRenderComponent(_component_UiBadge, { "data-testid": "editorial-badge" }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`${ssrInterpolate(unref(t)("articles.editorial"))}`);
            } else {
              return [
                createTextVNode(toDisplayString(unref(t)("articles.editorial")), 1)
              ];
            }
          }),
          _: 1
        }, _parent));
        if (unref(a).city) {
          _push(ssrRenderComponent(_component_UiBadge, null, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(ssrRenderComponent(_component_UiIcon, {
                  name: "map",
                  size: 14
                }, null, _parent2, _scopeId));
                _push2(`${ssrInterpolate(unref(a).city.name)}`);
              } else {
                return [
                  createVNode(_component_UiIcon, {
                    name: "map",
                    size: 14
                  }),
                  createTextVNode(toDisplayString(unref(a).city.name), 1)
                ];
              }
            }),
            _: 1
          }, _parent));
        } else {
          _push(`<!---->`);
        }
        _push(`</div><h1${ssrRenderAttrs(mergeProps({ class: "text-3xl font-bold sm:text-4xl" }, unref(contentLang)(unref(a))))}>${ssrInterpolate(unref(a).title)}</h1>`);
        if (unref(a).excerpt) {
          _push(`<p${ssrRenderAttrs(mergeProps({ class: "text-lg text-ink-soft" }, unref(contentLang)(unref(a))))}>${ssrInterpolate(unref(a).excerpt)}</p>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<p class="text-sm text-muted">`);
        if (unref(a).author_name) {
          _push(`<!--[-->${ssrInterpolate(unref(t)("articles.by", { name: unref(a).author_name }))} \xB7 <!--]-->`);
        } else {
          _push(`<!---->`);
        }
        if (unref(a).published_at) {
          _push(`<time${ssrRenderAttr("datetime", unref(a).published_at)}>${ssrInterpolate(unref(formatDate)(unref(a).published_at, unref(locale)))}</time>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(a).reading_minutes) {
          _push(`<!--[--> \xB7 ${ssrInterpolate(unref(t)("articles.readingMinutes", { count: unref(a).reading_minutes }))}<!--]-->`);
        } else {
          _push(`<!---->`);
        }
        _push(`</p>`);
        if (unref(a).fallback) {
          _push(ssrRenderComponent(_component_GuideFallbackNotice, {
            locale: unref(a).locale
          }, null, _parent));
        } else {
          _push(`<!---->`);
        }
        _push(`</header>`);
        if (unref(a).body) {
          _push(ssrRenderComponent(_component_ContentProse, mergeProps({
            body: unref(a).body
          }, unref(contentLang)(unref(a))), null, _parent));
        } else {
          _push(ssrRenderComponent(_component_UiAlert, { tone: "info" }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`${ssrInterpolate(unref(t)("articles.noBody"))}`);
              } else {
                return [
                  createTextVNode(toDisplayString(unref(t)("articles.noBody")), 1)
                ];
              }
            }),
            _: 1
          }, _parent));
        }
        if (unref(a).tags.length) {
          _push(`<ul class="flex flex-wrap gap-2"${ssrRenderAttr("aria-label", unref(t)("articles.tags"))}><!--[-->`);
          ssrRenderList(unref(a).tags, (tg) => {
            _push(`<li>`);
            _push(ssrRenderComponent(_component_UiBadge, null, {
              default: withCtx((_, _push2, _parent2, _scopeId) => {
                if (_push2) {
                  _push2(`${ssrInterpolate(tg)}`);
                } else {
                  return [
                    createTextVNode(toDisplayString(tg), 1)
                  ];
                }
              }),
              _: 2
            }, _parent));
            _push(`</li>`);
          });
          _push(`<!--]--></ul>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(a).source) {
          _push(ssrRenderComponent(_component_GuideSource, {
            source: unref(a).source
          }, null, _parent));
        } else {
          _push(`<!---->`);
        }
        _push(ssrRenderComponent(_component_UiAlert, {
          tone: "info",
          "data-testid": "article-disclaimer"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`${ssrInterpolate(unref(a).disclaimer)}`);
            } else {
              return [
                createTextVNode(toDisplayString(unref(a).disclaimer), 1)
              ];
            }
          }),
          _: 1
        }, _parent));
        if ((_a = unref(a).related_guides) == null ? void 0 : _a.length) {
          _push(`<section aria-labelledby="rg-h" class="space-y-2"><h2 id="rg-h" class="text-xl font-bold">${ssrInterpolate(unref(t)("articles.relatedGuides"))}</h2><ul class="space-y-1"><!--[-->`);
          ssrRenderList(unref(a).related_guides, (g) => {
            _push(`<li>`);
            _push(ssrRenderComponent(_component_NuxtLink, {
              to: unref(localePath)(`/guides/${g.slug}`),
              class: "inline-flex min-h-touch items-center text-primary-strong underline underline-offset-4"
            }, {
              default: withCtx((_, _push2, _parent2, _scopeId) => {
                if (_push2) {
                  _push2(`${ssrInterpolate(g.title)}`);
                } else {
                  return [
                    createTextVNode(toDisplayString(g.title), 1)
                  ];
                }
              }),
              _: 2
            }, _parent));
            _push(`</li>`);
          });
          _push(`<!--]--></ul></section>`);
        } else {
          _push(`<!---->`);
        }
        if ((_b = unref(a).related_articles) == null ? void 0 : _b.length) {
          _push(`<section aria-labelledby="ra-h" class="space-y-3"><h2 id="ra-h" class="text-xl font-bold">${ssrInterpolate(unref(t)("articles.relatedArticles"))}</h2><ul class="grid gap-4 sm:grid-cols-2"><!--[-->`);
          ssrRenderList(unref(a).related_articles, (r) => {
            _push(`<li>`);
            _push(ssrRenderComponent(_component_ArticlesCard, { article: r }, null, _parent));
            _push(`</li>`);
          });
          _push(`<!--]--></ul></section>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</article>`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/articles/[slug].vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=_slug_-D40DcAmd.mjs.map
