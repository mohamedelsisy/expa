import { _ as _sfc_main$1 } from './Breadcrumbs-C7SaJcTR.mjs';
import { _ as _sfc_main$2 } from './Card-BxvVO_-_.mjs';
import { _ as _sfc_main$3 } from './Alert-D-zfMDy5.mjs';
import { u as useI18n, a as useAuthStore, c as useLocalePath, g as useApi, _ as _sfc_main$3$1, d as _sfc_main$5, i as _sfc_main$2$1, j as isApiError } from './server.mjs';
import { _ as _sfc_main$4 } from './Skeleton-BTnKIEst.mjs';
import { _ as _sfc_main$6 } from './EmptyState-N2xvHts8.mjs';
import { _ as _sfc_main$7 } from './GuideCard-DdNhOq5I.mjs';
import { defineComponent, computed, withAsyncContext, mergeProps, unref, withCtx, createTextVNode, toDisplayString, createVNode, openBlock, createBlock, Fragment, renderList, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderList } from 'vue/server-renderer';
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
import './Badge-PdKIsny2.mjs';
import './SourceBadge-4_eAChkr.mjs';
import './AutoItalian-BD4PyQ-n.mjs';
import 'perfect-debounce';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "index",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const { t, locale } = useI18n();
    const auth = useAuthStore();
    const localePath = useLocalePath();
    const { request } = useApi();
    useSeo(() => ({ title: t("housing.seo.title"), description: t("housing.seo.description") }));
    const crumbs = computed(() => [{ label: t("nav.home"), to: "/" }, { label: t("housing.title") }]);
    const { data: guides, error, refresh, status } = ([__temp, __restore] = withAsyncContext(async () => useAsyncData("housing-guides", async () => (await request("guides", { query: { category: "housing", per_page: 6 } })).data, { watch: [locale] })), __temp = await __temp, __restore(), __temp);
    const points = ["paste", "flags", "cost", "limits"];
    return (_ctx, _push, _parent, _attrs) => {
      var _a;
      const _component_UiBreadcrumbs = _sfc_main$1;
      const _component_UiCard = _sfc_main$2;
      const _component_UiAlert = _sfc_main$3;
      const _component_UiButton = _sfc_main$3$1;
      const _component_UiIcon = _sfc_main$5;
      const _component_UiSkeleton = _sfc_main$4;
      const _component_UiErrorState = _sfc_main$2$1;
      const _component_UiEmptyState = _sfc_main$6;
      const _component_GuideCard = _sfc_main$7;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "container-page py-8 sm:py-12" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_UiBreadcrumbs, {
        items: unref(crumbs),
        class: "mb-6"
      }, null, _parent));
      _push(`<header class="mb-8 max-w-2xl space-y-3"><h1 class="text-2xl font-bold sm:text-3xl">${ssrInterpolate(unref(t)("housing.title"))}</h1><p class="text-ink-soft">${ssrInterpolate(unref(t)("housing.subtitle"))}</p></header>`);
      _push(ssrRenderComponent(_component_UiCard, {
        tone: "soft",
        class: "mb-8 space-y-4"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<h2 class="text-xl font-bold"${_scopeId}>${ssrInterpolate(unref(t)("housing.check.title"))}</h2><p class="max-w-prose text-ink-soft"${_scopeId}>${ssrInterpolate(unref(t)("housing.check.subtitle"))}</p><ul class="list-disc space-y-1 ps-5 text-ink-soft"${_scopeId}><!--[-->`);
            ssrRenderList(points, (p) => {
              _push2(`<li${_scopeId}>${ssrInterpolate(unref(t)(`housing.landing.${p}`))}</li>`);
            });
            _push2(`<!--]--></ul>`);
            _push2(ssrRenderComponent(_component_UiAlert, { tone: "warning" }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`${ssrInterpolate(unref(t)("housing.landing.disclaimer"))}`);
                } else {
                  return [
                    createTextVNode(toDisplayString(unref(t)("housing.landing.disclaimer")), 1)
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(`<div class="flex flex-wrap gap-3"${_scopeId}>`);
            if (unref(auth).isAuthenticated) {
              _push2(ssrRenderComponent(_component_UiButton, {
                to: "/housing/check",
                size: "lg"
              }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(ssrRenderComponent(_component_UiIcon, {
                      name: "search",
                      size: 18
                    }, null, _parent3, _scopeId2));
                    _push3(`${ssrInterpolate(unref(t)("housing.landing.start"))}`);
                  } else {
                    return [
                      createVNode(_component_UiIcon, {
                        name: "search",
                        size: 18
                      }),
                      createTextVNode(toDisplayString(unref(t)("housing.landing.start")), 1)
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
            } else {
              _push2(ssrRenderComponent(_component_UiButton, {
                to: `/login?redirect=${encodeURIComponent(unref(localePath)("/housing/check"))}`,
                size: "lg"
              }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(`${ssrInterpolate(unref(t)("housing.landing.loginToStart"))}`);
                  } else {
                    return [
                      createTextVNode(toDisplayString(unref(t)("housing.landing.loginToStart")), 1)
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
            }
            _push2(`</div>`);
          } else {
            return [
              createVNode("h2", { class: "text-xl font-bold" }, toDisplayString(unref(t)("housing.check.title")), 1),
              createVNode("p", { class: "max-w-prose text-ink-soft" }, toDisplayString(unref(t)("housing.check.subtitle")), 1),
              createVNode("ul", { class: "list-disc space-y-1 ps-5 text-ink-soft" }, [
                (openBlock(), createBlock(Fragment, null, renderList(points, (p) => {
                  return createVNode("li", { key: p }, toDisplayString(unref(t)(`housing.landing.${p}`)), 1);
                }), 64))
              ]),
              createVNode(_component_UiAlert, { tone: "warning" }, {
                default: withCtx(() => [
                  createTextVNode(toDisplayString(unref(t)("housing.landing.disclaimer")), 1)
                ]),
                _: 1
              }),
              createVNode("div", { class: "flex flex-wrap gap-3" }, [
                unref(auth).isAuthenticated ? (openBlock(), createBlock(_component_UiButton, {
                  key: 0,
                  to: "/housing/check",
                  size: "lg"
                }, {
                  default: withCtx(() => [
                    createVNode(_component_UiIcon, {
                      name: "search",
                      size: 18
                    }),
                    createTextVNode(toDisplayString(unref(t)("housing.landing.start")), 1)
                  ]),
                  _: 1
                })) : (openBlock(), createBlock(_component_UiButton, {
                  key: 1,
                  to: `/login?redirect=${encodeURIComponent(unref(localePath)("/housing/check"))}`,
                  size: "lg"
                }, {
                  default: withCtx(() => [
                    createTextVNode(toDisplayString(unref(t)("housing.landing.loginToStart")), 1)
                  ]),
                  _: 1
                }, 8, ["to"]))
              ])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<section aria-labelledby="hg-h" class="space-y-4"><h2 id="hg-h" class="text-xl font-bold">${ssrInterpolate(unref(t)("housing.landing.guides"))}</h2>`);
      if (unref(status) === "pending" && !unref(guides)) {
        _push(`<div aria-busy="true">`);
        _push(ssrRenderComponent(_component_UiSkeleton, {
          block: "",
          lines: 3
        }, null, _parent));
        _push(`</div>`);
      } else if (unref(error)) {
        _push(ssrRenderComponent(_component_UiErrorState, {
          message: ("isApiError" in _ctx ? _ctx.isApiError : unref(isApiError))(unref(error)) ? unref(error).message : void 0,
          retry: "",
          onRetry: ($event) => unref(refresh)()
        }, null, _parent));
      } else if (!((_a = unref(guides)) == null ? void 0 : _a.length)) {
        _push(ssrRenderComponent(_component_UiEmptyState, {
          title: unref(t)("housing.landing.noGuidesTitle"),
          description: unref(t)("housing.landing.noGuides"),
          icon: "home"
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
        to: "/guides?category=housing",
        variant: "ghost"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`${ssrInterpolate(unref(t)("housing.landing.allGuides"))}`);
          } else {
            return [
              createTextVNode(toDisplayString(unref(t)("housing.landing.allGuides")), 1)
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_UiButton, {
        to: "/articles?category=housing",
        variant: "ghost"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`${ssrInterpolate(unref(t)("housing.landing.articles"))}`);
          } else {
            return [
              createTextVNode(toDisplayString(unref(t)("housing.landing.articles")), 1)
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</p></section></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/housing/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=index-DFO9-Xfc.mjs.map
