import { _ as _sfc_main$3 } from './Breadcrumbs-C7SaJcTR.mjs';
import { _ as _sfc_main$4 } from './Skeleton-BTnKIEst.mjs';
import { u as useI18n, f as useRoute, g as useApi, b as useRuntimeConfig, j as isApiError, o as createError, i as _sfc_main$2$1, d as _sfc_main$5$1, w as contentLang, n as navigateTo } from './server.mjs';
import { _ as _sfc_main$5 } from './Badge-PdKIsny2.mjs';
import { a as _sfc_main$1$1, _ as _sfc_main$6 } from './AutoItalian-BD4PyQ-n.mjs';
import { _ as _sfc_main$7 } from './FallbackNotice-CwHuyozE.mjs';
import { defineComponent, computed, withAsyncContext, mergeProps, unref, withCtx, createTextVNode, toDisplayString, createVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderList, ssrRenderAttr } from 'vue/server-renderer';
import { _ as _sfc_main$a } from './FormField-DFtov8VK.mjs';
import { _ as _sfc_main$b } from './Select-BjjHKxeN.mjs';
import { _ as _sfc_main$c } from './InfoBlock-JPicyznk.mjs';
import { u as useAsyncData } from './asyncData-bKJD5Wmv.mjs';
import { _ as _sfc_main$8 } from './GuideSource-B-ek0Kys.mjs';
import { _ as _sfc_main$9 } from './Alert-D-zfMDy5.mjs';
import { a as safeHttpsUrl } from './safe-B2eSdAXJ.mjs';
import { u as useSeo } from './useSeo-BU4sLOnV.mjs';
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
import 'perfect-debounce';
import './SourceBadge-4_eAChkr.mjs';
import './FreshnessIndicator-B5-_pVo1.mjs';

const _sfc_main$2 = /* @__PURE__ */ defineComponent({
  __name: "Timeline",
  __ssrInlineRender: true,
  props: {
    items: {}
  },
  setup(__props) {
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<ol${ssrRenderAttrs(mergeProps({ class: "space-y-0" }, _attrs))}><!--[-->`);
      ssrRenderList(__props.items, (item, i) => {
        _push(`<li class="relative flex gap-4 pb-6 last:pb-0"><div class="flex flex-col items-center"><span class="grid size-9 shrink-0 place-items-center rounded-full bg-primary font-bold text-on-primary" aria-hidden="true">${ssrInterpolate(i + 1)}</span>`);
        if (i < __props.items.length - 1) {
          _push(`<span class="mt-1 w-0.5 flex-1 bg-line" aria-hidden="true"></span>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div><div class="min-w-0 pt-1"><h3 class="text-base font-semibold"><span class="sr-only">${ssrInterpolate(i + 1)}. </span>${ssrInterpolate(item.title)}</h3>`);
        if (item.text) {
          _push(`<p class="prose-plain mt-1 text-ink-soft">${ssrInterpolate(item.text)}</p>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div></li>`);
      });
      _push(`<!--]--></ol>`);
    };
  }
});
const _sfc_setup$2 = _sfc_main$2.setup;
_sfc_main$2.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/ui/Timeline.vue");
  return _sfc_setup$2 ? _sfc_setup$2(props, ctx) : void 0;
};
const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "LocalInfo",
  __ssrInlineRender: true,
  props: {
    slug: {}
  },
  async setup(__props) {
    let __temp, __restore;
    const props = __props;
    const { t, locale } = useI18n();
    const route = useRoute();
    const { request } = useApi();
    const city = computed(() => typeof route.query.city === "string" ? route.query.city : "");
    const { data: cities } = ([__temp, __restore] = withAsyncContext(async () => useAsyncData(() => `local-cities-${locale.value}`, async () => (await request("cities")).data.map((c) => ({ value: c.slug, label: c.name })).sort((a, b) => a.label.localeCompare(b.label, locale.value)), { watch: [locale] })), __temp = await __temp, __restore(), __temp);
    const { data, error, status, refresh } = ([__temp, __restore] = withAsyncContext(async () => useAsyncData(() => `local-info-${props.slug}-${city.value}`, async () => {
      if (!city.value) return null;
      try {
        return (await request(`guides/${encodeURIComponent(props.slug)}/local-info`, { query: { city: city.value } })).data;
      } catch (e) {
        if (isApiError(e) && (e.status === 404 || e.status === 422)) return { guide: props.slug, city: city.value, block: null };
        throw e;
      }
    }, { watch: [city, locale] })), __temp = await __temp, __restore(), __temp);
    const pick = (v) => navigateTo({ path: route.path, query: { ...route.query, city: v || void 0 } }, { replace: true });
    return (_ctx, _push, _parent, _attrs) => {
      var _a;
      const _component_UiFormField = _sfc_main$a;
      const _component_UiSelect = _sfc_main$b;
      const _component_UiSkeleton = _sfc_main$4;
      const _component_UiErrorState = _sfc_main$2$1;
      const _component_ContentInfoBlock = _sfc_main$c;
      _push(`<section${ssrRenderAttrs(mergeProps({
        class: "space-y-3",
        "aria-labelledby": "li-h",
        "data-testid": "local-info"
      }, _attrs))}><h2 id="li-h" class="text-xl font-bold">${ssrInterpolate(unref(t)("cityInfo.title"))}</h2><p class="text-sm text-ink-soft">${ssrInterpolate(unref(t)("cityInfo.intro"))}</p>`);
      _push(ssrRenderComponent(_component_UiFormField, {
        label: unref(t)("cityInfo.pick")
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          var _a2, _b;
          if (_push2) {
            _push2(ssrRenderComponent(_component_UiSelect, {
              "model-value": unref(city),
              options: (_a2 = unref(cities)) != null ? _a2 : [],
              placeholder: unref(t)("cityInfo.none"),
              "onUpdate:modelValue": pick
            }, null, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_UiSelect, {
                "model-value": unref(city),
                options: (_b = unref(cities)) != null ? _b : [],
                placeholder: unref(t)("cityInfo.none"),
                "onUpdate:modelValue": pick
              }, null, 8, ["model-value", "options", "placeholder"])
            ];
          }
        }),
        _: 1
      }, _parent));
      if (unref(city) && unref(status) === "pending" && !unref(data)) {
        _push(`<div aria-busy="true">`);
        _push(ssrRenderComponent(_component_UiSkeleton, { lines: 3 }, null, _parent));
        _push(`</div>`);
      } else if (unref(error)) {
        _push(ssrRenderComponent(_component_UiErrorState, {
          message: ("isApiError" in _ctx ? _ctx.isApiError : unref(isApiError))(unref(error)) ? unref(error).message : void 0,
          retry: "",
          onRetry: ($event) => unref(refresh)()
        }, null, _parent));
      } else if ((_a = unref(data)) == null ? void 0 : _a.block) {
        _push(ssrRenderComponent(_component_ContentInfoBlock, {
          block: unref(data).block
        }, null, _parent));
      } else if (unref(city)) {
        _push(`<p class="rounded-md border border-line bg-sunken p-3 text-ink-soft" data-testid="local-info-empty">${ssrInterpolate(unref(t)("cityInfo.empty"))}</p>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</section>`);
    };
  }
});
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/guide/LocalInfo.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "[slug]",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const { t, locale } = useI18n();
    const route = useRoute();
    const { request } = useApi();
    const siteUrl = useRuntimeConfig().public.siteUrl.replace(/\/$/, "");
    const slug = computed(() => String(route.params.slug));
    const { data, error, refresh, status } = ([__temp, __restore] = withAsyncContext(async () => useAsyncData(
      () => `guide-${slug.value}`,
      async () => (await request(`guides/${encodeURIComponent(slug.value)}`)).data,
      { watch: [locale] }
    )), __temp = await __temp, __restore(), __temp);
    if (isApiError(error.value) && error.value.status === 404) {
      throw createError({ statusCode: 404, statusMessage: "Not Found", fatal: true });
    }
    const guide = computed(() => data.value);
    useSeo(() => {
      var _a, _b, _c, _d;
      const g = guide.value;
      const src = g ? safeHttpsUrl(g.source.url) : null;
      return {
        title: g ? g.title : t("guides.title"),
        description: (_a = g == null ? void 0 : g.summary) != null ? _a : t("guides.seo.description"),
        type: "article",
        fallback: !!(g == null ? void 0 : g.fallback),
        jsonLdData: g ? {
          "@context": "https://schema.org",
          "@type": "Article",
          headline: g.title,
          description: (_b = g.summary) != null ? _b : void 0,
          inLanguage: g.locale,
          datePublished: (_c = g.published_at) != null ? _c : void 0,
          dateModified: (_d = g.updated_at) != null ? _d : void 0,
          mainEntityOfPage: `${siteUrl}${route.path}`,
          author: { "@type": "Organization", name: "EXPA", url: siteUrl },
          publisher: { "@type": "Organization", name: "EXPA", url: siteUrl, logo: { "@type": "ImageObject", url: `${siteUrl}/og-image.png` } },
          image: `${siteUrl}/og-image.png`,
          ...src ? { isBasedOn: src } : {}
        } : void 0
      };
    });
    const sections = computed(() => {
      const g = guide.value;
      if (!g) return [];
      return [
        { key: "what_is", icon: "info", text: g.what_is },
        { key: "who_needs", icon: "user", text: g.who_needs },
        { key: "where_to_apply", icon: "map", text: g.where_to_apply },
        { key: "how_to_book", icon: "calendar", text: g.how_to_book },
        { key: "costs", icon: "euro", text: g.costs },
        { key: "processing_time", icon: "clock", text: g.processing_time }
      ].filter((s) => !!s.text);
    });
    const crumbs = computed(() => {
      var _a, _b;
      return [
        { label: t("nav.home"), to: "/" },
        { label: t("guides.title"), to: "/guides" },
        { label: (_b = (_a = guide.value) == null ? void 0 : _a.title) != null ? _b : "" }
      ];
    });
    return (_ctx, _push, _parent, _attrs) => {
      var _a, _b;
      const _component_UiBreadcrumbs = _sfc_main$3;
      const _component_UiSkeleton = _sfc_main$4;
      const _component_UiErrorState = _sfc_main$2$1;
      const _component_UiBadge = _sfc_main$5;
      const _component_UiItalianTerm = _sfc_main$1$1;
      const _component_UiIcon = _sfc_main$5$1;
      const _component_UiAutoItalian = _sfc_main$6;
      const _component_GuideFallbackNotice = _sfc_main$7;
      const _component_UiTimeline = _sfc_main$2;
      const _component_GuideLocalInfo = _sfc_main$1;
      const _component_GuideSource = _sfc_main$8;
      const _component_UiAlert = _sfc_main$9;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "container-page max-w-4xl py-8 sm:py-12" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_UiBreadcrumbs, {
        items: unref(crumbs),
        class: "mb-6"
      }, null, _parent));
      if (!unref(guide)) {
        _push(`<h1 class="sr-only">${ssrInterpolate(unref(t)("guides.title"))}</h1>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(status) === "pending" && !unref(guide)) {
        _push(`<div aria-busy="true" class="space-y-6">`);
        _push(ssrRenderComponent(_component_UiSkeleton, {
          block: "",
          lines: 2
        }, null, _parent));
        _push(ssrRenderComponent(_component_UiSkeleton, { lines: 6 }, null, _parent));
        _push(`</div>`);
      } else if (unref(error) || !unref(guide)) {
        _push(ssrRenderComponent(_component_UiErrorState, {
          message: ("isApiError" in _ctx ? _ctx.isApiError : unref(isApiError))(unref(error)) ? unref(error).message : void 0,
          retry: "",
          onRetry: ($event) => unref(refresh)()
        }, null, _parent));
      } else {
        _push(`<article class="space-y-8"><header class="space-y-3"><div class="flex flex-wrap items-center gap-2">`);
        _push(ssrRenderComponent(_component_UiBadge, { tone: "primary" }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`${ssrInterpolate(unref(guide).category_label)}`);
            } else {
              return [
                createTextVNode(toDisplayString(unref(guide).category_label), 1)
              ];
            }
          }),
          _: 1
        }, _parent));
        if (unref(guide).italian_term) {
          _push(ssrRenderComponent(_component_UiItalianTerm, null, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`${ssrInterpolate(unref(guide).italian_term)}`);
              } else {
                return [
                  createTextVNode(toDisplayString(unref(guide).italian_term), 1)
                ];
              }
            }),
            _: 1
          }, _parent));
        } else {
          _push(`<!---->`);
        }
        if (unref(guide).city || unref(guide).region) {
          _push(ssrRenderComponent(_component_UiBadge, null, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              var _a2, _b2, _c, _d, _e, _f;
              if (_push2) {
                _push2(ssrRenderComponent(_component_UiIcon, {
                  name: "map",
                  size: 14
                }, null, _parent2, _scopeId));
                _push2(`${ssrInterpolate((_c = (_a2 = unref(guide).city) == null ? void 0 : _a2.name) != null ? _c : (_b2 = unref(guide).region) == null ? void 0 : _b2.name)}`);
              } else {
                return [
                  createVNode(_component_UiIcon, {
                    name: "map",
                    size: 14
                  }),
                  createTextVNode(toDisplayString((_f = (_d = unref(guide).city) == null ? void 0 : _d.name) != null ? _f : (_e = unref(guide).region) == null ? void 0 : _e.name), 1)
                ];
              }
            }),
            _: 1
          }, _parent));
        } else {
          _push(ssrRenderComponent(_component_UiBadge, null, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`${ssrInterpolate(unref(t)("guides.national"))}`);
              } else {
                return [
                  createTextVNode(toDisplayString(unref(t)("guides.national")), 1)
                ];
              }
            }),
            _: 1
          }, _parent));
        }
        _push(`</div><h1${ssrRenderAttrs(mergeProps({ class: "text-3xl font-bold sm:text-4xl" }, unref(contentLang)(unref(guide))))}>`);
        _push(ssrRenderComponent(_component_UiAutoItalian, {
          text: unref(guide).title
        }, null, _parent));
        _push(`</h1>`);
        if (unref(guide).summary) {
          _push(`<p${ssrRenderAttrs(mergeProps({ class: "max-w-prose text-lg text-ink-soft" }, unref(contentLang)(unref(guide))))}>${ssrInterpolate(unref(guide).summary)}</p>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(guide).fallback) {
          _push(ssrRenderComponent(_component_GuideFallbackNotice, {
            locale: unref(guide).locale
          }, null, _parent));
        } else {
          _push(`<!---->`);
        }
        _push(`</header><div class="grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]"><div class="space-y-8"><!--[-->`);
        ssrRenderList(unref(sections), (s) => {
          _push(`<section${ssrRenderAttr("aria-labelledby", `s-${s.key}`)}><h2${ssrRenderAttr("id", `s-${s.key}`)} class="mb-2 flex items-center gap-2 text-xl font-bold">`);
          _push(ssrRenderComponent(_component_UiIcon, {
            name: s.icon,
            size: 22,
            class: "text-primary"
          }, null, _parent));
          _push(`${ssrInterpolate(unref(t)(`guides.sections.${s.key}`))}</h2><p${ssrRenderAttrs(mergeProps({ class: "prose-plain text-ink-soft sm:text-ink" }, { ref_for: true }, unref(contentLang)(unref(guide))))}>${ssrInterpolate(s.text)}</p></section>`);
        });
        _push(`<!--]-->`);
        if ((_a = unref(guide).required_documents) == null ? void 0 : _a.length) {
          _push(`<section aria-labelledby="s-docs"><h2 id="s-docs" class="mb-3 flex items-center gap-2 text-xl font-bold">`);
          _push(ssrRenderComponent(_component_UiIcon, {
            name: "file",
            size: 22,
            class: "text-primary"
          }, null, _parent));
          _push(`${ssrInterpolate(unref(t)("guides.sections.required_documents"))}</h2><ul${ssrRenderAttrs(mergeProps({ class: "space-y-2" }, unref(contentLang)(unref(guide))))}><!--[-->`);
          ssrRenderList(unref(guide).required_documents, (d, i) => {
            _push(`<li class="flex items-start gap-3 rounded-md border border-line bg-surface p-3">`);
            _push(ssrRenderComponent(_component_UiIcon, {
              name: "check",
              size: 20,
              class: "mt-1 text-primary"
            }, null, _parent));
            _push(`<span>${ssrInterpolate(d)}</span></li>`);
          });
          _push(`<!--]--></ul></section>`);
        } else {
          _push(`<!---->`);
        }
        if ((_b = unref(guide).steps) == null ? void 0 : _b.length) {
          _push(`<section aria-labelledby="s-steps"><h2 id="s-steps" class="mb-4 flex items-center gap-2 text-xl font-bold">`);
          _push(ssrRenderComponent(_component_UiIcon, {
            name: "list",
            size: 22,
            class: "text-primary"
          }, null, _parent));
          _push(`${ssrInterpolate(unref(t)("guides.sections.steps"))}</h2><div${ssrRenderAttrs(unref(contentLang)(unref(guide)))}>`);
          _push(ssrRenderComponent(_component_UiTimeline, {
            items: unref(guide).steps
          }, null, _parent));
          _push(`</div></section>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(guide).body) {
          _push(`<section aria-labelledby="s-body"><h2 id="s-body" class="mb-2 text-xl font-bold">${ssrInterpolate(unref(t)("guides.sections.body"))}</h2><p${ssrRenderAttrs(mergeProps({ class: "prose-plain" }, unref(contentLang)(unref(guide))))}>${ssrInterpolate(unref(guide).body)}</p></section>`);
        } else {
          _push(`<!---->`);
        }
        _push(ssrRenderComponent(_component_GuideLocalInfo, {
          slug: unref(guide).slug
        }, null, _parent));
        _push(`</div><aside class="space-y-4 lg:sticky lg:top-24 lg:self-start">`);
        _push(ssrRenderComponent(_component_GuideSource, {
          source: unref(guide).source
        }, null, _parent));
        _push(ssrRenderComponent(_component_UiAlert, { tone: "info" }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`${ssrInterpolate(unref(t)("guides.disclaimer"))}`);
            } else {
              return [
                createTextVNode(toDisplayString(unref(t)("guides.disclaimer")), 1)
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</aside></div></article>`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/guides/[slug].vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=_slug_-CxhHpa3n.mjs.map
