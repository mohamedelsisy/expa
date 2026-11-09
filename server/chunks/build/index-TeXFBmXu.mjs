import { _ as _sfc_main$1 } from './Breadcrumbs-C7SaJcTR.mjs';
import { _ as _sfc_main$2 } from './Skeleton-BTnKIEst.mjs';
import { u as useI18n, c as useLocalePath, g as useApi, i as _sfc_main$2$1, j as isApiError, d as _sfc_main$5$1, e as __nuxt_component_0 } from './server.mjs';
import { _ as _sfc_main$3 } from './EmptyState-N2xvHts8.mjs';
import { _ as _sfc_main$4 } from './Card-BxvVO_-_.mjs';
import { _ as _sfc_main$5 } from './Badge-PdKIsny2.mjs';
import { defineComponent, withAsyncContext, computed, mergeProps, unref, withCtx, createVNode, createTextVNode, toDisplayString, openBlock, createBlock, createCommentVNode, Fragment, renderList, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderList, ssrRenderAttr } from 'vue/server-renderer';
import { u as useSeo } from './useSeo-BU4sLOnV.mjs';
import { u as useAsyncData } from './asyncData-bKJD5Wmv.mjs';
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
import 'perfect-debounce';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "index",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const { t, locale } = useI18n();
    const localePath = useLocalePath();
    const { request } = useApi();
    useSeo(() => ({ title: t("cities.title"), description: t("cities.subtitle") }));
    const { data, error, refresh, status } = ([__temp, __restore] = withAsyncContext(async () => useAsyncData("cities-all", async () => {
      const [cities, profiles2] = await Promise.all([
        request("cities"),
        request("city-profiles", { query: { per_page: 50 } }).then((r) => r.data).catch(() => [])
      ]);
      return { cities: cities.data, profiles: profiles2 };
    }, { watch: [locale] })), __temp = await __temp, __restore(), __temp);
    const groups = computed(() => {
      var _a, _b, _c;
      const m = /* @__PURE__ */ new Map();
      for (const c of (_b = (_a = data.value) == null ? void 0 : _a.cities) != null ? _b : []) {
        const g = (_c = m.get(c.region.slug)) != null ? _c : { name: c.region.name, slug: c.region.slug, cities: [] };
        g.cities.push(c);
        m.set(c.region.slug, g);
      }
      return [...m.values()].sort((a, b) => a.name.localeCompare(b.name, locale.value));
    });
    const profiles = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.profiles) != null ? _b : [];
    });
    const crumbs = computed(() => [{ label: t("nav.home"), to: "/" }, { label: t("cities.title") }]);
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UiBreadcrumbs = _sfc_main$1;
      const _component_UiSkeleton = _sfc_main$2;
      const _component_UiErrorState = _sfc_main$2$1;
      const _component_UiEmptyState = _sfc_main$3;
      const _component_UiCard = _sfc_main$4;
      const _component_UiBadge = _sfc_main$5;
      const _component_UiIcon = _sfc_main$5$1;
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "container-page py-8 sm:py-12" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_UiBreadcrumbs, {
        items: unref(crumbs),
        class: "mb-6"
      }, null, _parent));
      _push(`<header class="mb-6 max-w-2xl"><h1 class="text-2xl font-bold sm:text-3xl">${ssrInterpolate(unref(t)("cities.title"))}</h1><p class="mt-1 text-ink-soft">${ssrInterpolate(unref(t)("cities.subtitle"))}</p></header>`);
      if (unref(status) === "pending" && !unref(data)) {
        _push(`<div aria-busy="true">`);
        _push(ssrRenderComponent(_component_UiSkeleton, {
          block: "",
          lines: 6
        }, null, _parent));
        _push(`</div>`);
      } else if (unref(error)) {
        _push(ssrRenderComponent(_component_UiErrorState, {
          message: ("isApiError" in _ctx ? _ctx.isApiError : unref(isApiError))(unref(error)) ? unref(error).message : void 0,
          retry: "",
          onRetry: ($event) => unref(refresh)()
        }, null, _parent));
      } else if (!unref(groups).length && !unref(profiles).length) {
        _push(ssrRenderComponent(_component_UiEmptyState, {
          title: unref(t)("cities.emptyTitle"),
          description: unref(t)("cities.empty"),
          icon: "map"
        }, null, _parent));
      } else {
        _push(`<!--[-->`);
        if (unref(profiles).length) {
          _push(`<section aria-labelledby="cp-h" class="mb-10 space-y-4"><h2 id="cp-h" class="text-xl font-bold">${ssrInterpolate(unref(t)("cities.profiles"))}</h2><ul class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" data-testid="city-profiles"><!--[-->`);
          ssrRenderList(unref(profiles), (p) => {
            _push(`<li>`);
            _push(ssrRenderComponent(_component_UiCard, {
              as: "article",
              class: "relative flex h-full flex-col gap-2 hover:shadow-2"
            }, {
              default: withCtx((_, _push2, _parent2, _scopeId) => {
                if (_push2) {
                  _push2(ssrRenderComponent(_component_UiBadge, { class: "self-start" }, {
                    default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                      if (_push3) {
                        _push3(ssrRenderComponent(_component_UiIcon, {
                          name: "map",
                          size: 14
                        }, null, _parent3, _scopeId2));
                        _push3(`${ssrInterpolate(p.region.name)}`);
                      } else {
                        return [
                          createVNode(_component_UiIcon, {
                            name: "map",
                            size: 14
                          }),
                          createTextVNode(toDisplayString(p.region.name), 1)
                        ];
                      }
                    }),
                    _: 2
                  }, _parent2, _scopeId));
                  _push2(`<h3 class="text-lg font-bold"${_scopeId}>`);
                  _push2(ssrRenderComponent(_component_NuxtLink, {
                    to: unref(localePath)(`/cities/${p.slug}`),
                    class: "after:absolute after:inset-0 after:content-['']"
                  }, {
                    default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                      if (_push3) {
                        _push3(`${ssrInterpolate(p.name)}`);
                      } else {
                        return [
                          createTextVNode(toDisplayString(p.name), 1)
                        ];
                      }
                    }),
                    _: 2
                  }, _parent2, _scopeId));
                  _push2(`</h3>`);
                  if (p.headline) {
                    _push2(`<p class="font-medium"${_scopeId}>${ssrInterpolate(p.headline)}</p>`);
                  } else {
                    _push2(`<!---->`);
                  }
                  if (p.summary) {
                    _push2(`<p class="line-clamp-3 text-ink-soft"${_scopeId}>${ssrInterpolate(p.summary)}</p>`);
                  } else {
                    _push2(`<!---->`);
                  }
                } else {
                  return [
                    createVNode(_component_UiBadge, { class: "self-start" }, {
                      default: withCtx(() => [
                        createVNode(_component_UiIcon, {
                          name: "map",
                          size: 14
                        }),
                        createTextVNode(toDisplayString(p.region.name), 1)
                      ]),
                      _: 2
                    }, 1024),
                    createVNode("h3", { class: "text-lg font-bold" }, [
                      createVNode(_component_NuxtLink, {
                        to: unref(localePath)(`/cities/${p.slug}`),
                        class: "after:absolute after:inset-0 after:content-['']"
                      }, {
                        default: withCtx(() => [
                          createTextVNode(toDisplayString(p.name), 1)
                        ]),
                        _: 2
                      }, 1032, ["to"])
                    ]),
                    p.headline ? (openBlock(), createBlock("p", {
                      key: 0,
                      class: "font-medium"
                    }, toDisplayString(p.headline), 1)) : createCommentVNode("", true),
                    p.summary ? (openBlock(), createBlock("p", {
                      key: 1,
                      class: "line-clamp-3 text-ink-soft"
                    }, toDisplayString(p.summary), 1)) : createCommentVNode("", true)
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
        if (unref(groups).length) {
          _push(`<section aria-labelledby="cg-h" class="space-y-4"><h2 id="cg-h" class="text-xl font-bold">${ssrInterpolate(unref(t)("cities.guidesByCity"))}</h2><div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"><!--[-->`);
          ssrRenderList(unref(groups), (g) => {
            _push(ssrRenderComponent(_component_UiCard, {
              key: g.slug,
              as: "section",
              "aria-labelledby": `region-${g.slug}`
            }, {
              default: withCtx((_, _push2, _parent2, _scopeId) => {
                if (_push2) {
                  _push2(`<h3${ssrRenderAttr("id", `region-${g.slug}`)} class="mb-2 text-lg font-bold"${_scopeId}>${ssrInterpolate(g.name)}</h3><ul class="space-y-1"${_scopeId}><!--[-->`);
                  ssrRenderList(g.cities, (c) => {
                    _push2(`<li${_scopeId}>`);
                    _push2(ssrRenderComponent(_component_NuxtLink, {
                      to: { path: unref(localePath)("/guides"), query: { city: c.slug } },
                      class: "inline-flex min-h-touch items-center text-primary-strong underline underline-offset-4"
                    }, {
                      default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                        if (_push3) {
                          _push3(`${ssrInterpolate(c.name)}`);
                        } else {
                          return [
                            createTextVNode(toDisplayString(c.name), 1)
                          ];
                        }
                      }),
                      _: 2
                    }, _parent2, _scopeId));
                    _push2(`</li>`);
                  });
                  _push2(`<!--]--></ul>`);
                } else {
                  return [
                    createVNode("h3", {
                      id: `region-${g.slug}`,
                      class: "mb-2 text-lg font-bold"
                    }, toDisplayString(g.name), 9, ["id"]),
                    createVNode("ul", { class: "space-y-1" }, [
                      (openBlock(true), createBlock(Fragment, null, renderList(g.cities, (c) => {
                        return openBlock(), createBlock("li", {
                          key: c.slug
                        }, [
                          createVNode(_component_NuxtLink, {
                            to: { path: unref(localePath)("/guides"), query: { city: c.slug } },
                            class: "inline-flex min-h-touch items-center text-primary-strong underline underline-offset-4"
                          }, {
                            default: withCtx(() => [
                              createTextVNode(toDisplayString(c.name), 1)
                            ]),
                            _: 2
                          }, 1032, ["to"])
                        ]);
                      }), 128))
                    ])
                  ];
                }
              }),
              _: 2
            }, _parent));
          });
          _push(`<!--]--></div></section>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<!--]-->`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/cities/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=index-TeXFBmXu.mjs.map
