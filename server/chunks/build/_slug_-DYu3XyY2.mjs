import { _ as _sfc_main$1 } from './Breadcrumbs-C7SaJcTR.mjs';
import { _ as _sfc_main$2 } from './Skeleton-BTnKIEst.mjs';
import { u as useI18n, f as useRoute, g as useApi, j as isApiError, o as createError, i as _sfc_main$2$1, d as _sfc_main$5, _ as _sfc_main$3$1, n as navigateTo } from './server.mjs';
import { _ as _sfc_main$3 } from './Badge-PdKIsny2.mjs';
import { a as _sfc_main$1$1, _ as _sfc_main$4 } from './AutoItalian-BD4PyQ-n.mjs';
import { _ as _sfc_main$6 } from './FallbackNotice-CwHuyozE.mjs';
import { _ as _sfc_main$7 } from './Card-BxvVO_-_.mjs';
import { _ as _sfc_main$8 } from './FormField-DFtov8VK.mjs';
import { _ as _sfc_main$9 } from './Select-BjjHKxeN.mjs';
import { _ as _sfc_main$a } from './OfficeCard-D7gQkLPp.mjs';
import { _ as _sfc_main$b } from './GuideSource-B-ek0Kys.mjs';
import { defineComponent, computed, withAsyncContext, mergeProps, unref, withCtx, createTextVNode, toDisplayString, createVNode, useSSRContext } from 'vue';
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
import './Alert-D-zfMDy5.mjs';
import './SourceBadge-4_eAChkr.mjs';
import './BookingBlock-DOKLO1aP.mjs';
import './useAnalytics-Dh-8IvGy.mjs';
import './FreshnessIndicator-B5-_pVo1.mjs';
import 'perfect-debounce';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "[slug]",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const { t, locale } = useI18n();
    const route = useRoute();
    const { request } = useApi();
    const slug = computed(() => String(route.params.slug));
    const cityQ = computed(() => typeof route.query.city === "string" ? route.query.city : "");
    const { data: cities } = ([__temp, __restore] = withAsyncContext(async () => useAsyncData("gov-cities", async () => (await request("cities")).data, { watch: [locale] })), __temp = await __temp, __restore(), __temp);
    const { data: s, error, refresh, status } = ([__temp, __restore] = withAsyncContext(async () => useAsyncData(() => `gov-service-${slug.value}-${cityQ.value}`, async () => (await request(`government/services/${encodeURIComponent(slug.value)}`, { query: { city: cityQ.value } })).data, { watch: [locale, cityQ] })), __temp = await __temp, __restore(), __temp);
    if (isApiError(error.value) && error.value.status === 404) throw createError({ statusCode: 404, statusMessage: "Not Found", fatal: true });
    useSeo(() => {
      var _a, _b;
      return { title: s.value ? `${s.value.name} | EXPA` : t("gov.title"), description: (_b = (_a = s.value) == null ? void 0 : _a.summary) != null ? _b : t("gov.subtitle"), type: "article" };
    });
    const crumbs = computed(() => {
      var _a, _b;
      return [{ label: t("nav.home"), to: "/" }, { label: t("gov.title"), to: "/government" }, { label: (_b = (_a = s.value) == null ? void 0 : _a.name) != null ? _b : "" }];
    });
    const cityOptions = computed(() => {
      var _a;
      return ((_a = cities.value) != null ? _a : []).map((c) => ({ value: c.slug, label: c.name }));
    });
    const setCity = (v) => navigateTo({ path: route.path, query: v ? { city: v } : {} });
    return (_ctx, _push, _parent, _attrs) => {
      var _a;
      const _component_UiBreadcrumbs = _sfc_main$1;
      const _component_UiSkeleton = _sfc_main$2;
      const _component_UiErrorState = _sfc_main$2$1;
      const _component_UiBadge = _sfc_main$3;
      const _component_UiItalianTerm = _sfc_main$1$1;
      const _component_UiIcon = _sfc_main$5;
      const _component_UiAutoItalian = _sfc_main$4;
      const _component_GuideFallbackNotice = _sfc_main$6;
      const _component_UiCard = _sfc_main$7;
      const _component_UiButton = _sfc_main$3$1;
      const _component_UiFormField = _sfc_main$8;
      const _component_UiSelect = _sfc_main$9;
      const _component_GovOfficeCard = _sfc_main$a;
      const _component_GuideSource = _sfc_main$b;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "container-page max-w-4xl py-8 sm:py-12" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_UiBreadcrumbs, {
        items: unref(crumbs),
        class: "mb-6"
      }, null, _parent));
      if (unref(status) === "pending" && !unref(s)) {
        _push(`<div aria-busy="true">`);
        _push(ssrRenderComponent(_component_UiSkeleton, {
          block: "",
          lines: 6
        }, null, _parent));
        _push(`</div>`);
      } else if (unref(error) || !unref(s)) {
        _push(ssrRenderComponent(_component_UiErrorState, {
          "heading-level": 1,
          message: ("isApiError" in _ctx ? _ctx.isApiError : unref(isApiError))(unref(error)) ? unref(error).message : void 0,
          retry: "",
          onRetry: ($event) => unref(refresh)()
        }, null, _parent));
      } else {
        _push(`<article class="space-y-8"><header class="space-y-3"><div class="flex flex-wrap items-center gap-2">`);
        _push(ssrRenderComponent(_component_UiBadge, { tone: "primary" }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`${ssrInterpolate(unref(s).domain_label)}`);
            } else {
              return [
                createTextVNode(toDisplayString(unref(s).domain_label), 1)
              ];
            }
          }),
          _: 1
        }, _parent));
        if (unref(s).italian_term) {
          _push(ssrRenderComponent(_component_UiItalianTerm, null, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`${ssrInterpolate(unref(s).italian_term)}`);
              } else {
                return [
                  createTextVNode(toDisplayString(unref(s).italian_term), 1)
                ];
              }
            }),
            _: 1
          }, _parent));
        } else {
          _push(`<!---->`);
        }
        _push(ssrRenderComponent(_component_UiBadge, null, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            var _a2, _b, _c, _d, _e, _f, _g, _h;
            if (_push2) {
              _push2(ssrRenderComponent(_component_UiIcon, {
                name: "map",
                size: 14
              }, null, _parent2, _scopeId));
              _push2(`${ssrInterpolate((_d = (_c = (_a2 = unref(s).city) == null ? void 0 : _a2.name) != null ? _c : (_b = unref(s).region) == null ? void 0 : _b.name) != null ? _d : unref(t)("guides.national"))}`);
            } else {
              return [
                createVNode(_component_UiIcon, {
                  name: "map",
                  size: 14
                }),
                createTextVNode(toDisplayString((_h = (_g = (_e = unref(s).city) == null ? void 0 : _e.name) != null ? _g : (_f = unref(s).region) == null ? void 0 : _f.name) != null ? _h : unref(t)("guides.national")), 1)
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div><h1 class="text-3xl font-bold sm:text-4xl">`);
        _push(ssrRenderComponent(_component_UiAutoItalian, {
          text: unref(s).name
        }, null, _parent));
        _push(`</h1>`);
        if (unref(s).summary) {
          _push(`<p class="text-lg text-ink-soft">${ssrInterpolate(unref(s).summary)}</p>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</header>`);
        if (unref(s).fallback) {
          _push(ssrRenderComponent(_component_GuideFallbackNotice, {
            locale: unref(s).locale
          }, null, _parent));
        } else {
          _push(`<!---->`);
        }
        if (unref(s).how_to_apply) {
          _push(`<section aria-labelledby="how-h" class="space-y-2"><h2 id="how-h" class="text-xl font-bold">${ssrInterpolate(unref(t)("gov.howToApply"))}</h2><p class="prose-plain text-lg">`);
          _push(ssrRenderComponent(_component_UiAutoItalian, {
            text: unref(s).how_to_apply
          }, null, _parent));
          _push(`</p></section>`);
        } else {
          _push(`<!---->`);
        }
        if ((_a = unref(s).required_documents) == null ? void 0 : _a.length) {
          _push(`<section aria-labelledby="req-h" class="space-y-2"><h2 id="req-h" class="text-xl font-bold">${ssrInterpolate(unref(t)("gov.requiredDocuments"))}</h2><ul class="list-disc space-y-1 ps-6"><!--[-->`);
          ssrRenderList(unref(s).required_documents, (d, i) => {
            _push(`<li>`);
            _push(ssrRenderComponent(_component_UiAutoItalian, { text: d }, null, _parent));
            _push(`</li>`);
          });
          _push(`<!--]--></ul></section>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(s).notes) {
          _push(`<section class="space-y-2"><h2 class="text-xl font-bold">${ssrInterpolate(unref(t)("gov.notes"))}</h2><p class="prose-plain">${ssrInterpolate(unref(s).notes)}</p></section>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(s).guide) {
          _push(ssrRenderComponent(_component_UiCard, {
            tone: "soft",
            class: "flex flex-wrap items-center justify-between gap-3"
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`<p class="font-medium"${_scopeId}>${ssrInterpolate(unref(t)("gov.linkedGuide"))}: `);
                _push2(ssrRenderComponent(_component_UiAutoItalian, {
                  text: unref(s).guide.title
                }, null, _parent2, _scopeId));
                _push2(`</p>`);
                _push2(ssrRenderComponent(_component_UiButton, {
                  to: `/guides/${unref(s).guide.slug}`,
                  variant: "secondary"
                }, {
                  default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                    if (_push3) {
                      _push3(`${ssrInterpolate(unref(t)("dashboard.readGuide"))}`);
                      _push3(ssrRenderComponent(_component_UiIcon, {
                        name: "arrow-end",
                        size: 16
                      }, null, _parent3, _scopeId2));
                    } else {
                      return [
                        createTextVNode(toDisplayString(unref(t)("dashboard.readGuide")), 1),
                        createVNode(_component_UiIcon, {
                          name: "arrow-end",
                          size: 16
                        })
                      ];
                    }
                  }),
                  _: 1
                }, _parent2, _scopeId));
              } else {
                return [
                  createVNode("p", { class: "font-medium" }, [
                    createTextVNode(toDisplayString(unref(t)("gov.linkedGuide")) + ": ", 1),
                    createVNode(_component_UiAutoItalian, {
                      text: unref(s).guide.title
                    }, null, 8, ["text"])
                  ]),
                  createVNode(_component_UiButton, {
                    to: `/guides/${unref(s).guide.slug}`,
                    variant: "secondary"
                  }, {
                    default: withCtx(() => [
                      createTextVNode(toDisplayString(unref(t)("dashboard.readGuide")), 1),
                      createVNode(_component_UiIcon, {
                        name: "arrow-end",
                        size: 16
                      })
                    ]),
                    _: 1
                  }, 8, ["to"])
                ];
              }
            }),
            _: 1
          }, _parent));
        } else {
          _push(`<!---->`);
        }
        _push(`<section aria-labelledby="off-h" class="space-y-4"><h2 id="off-h" class="text-xl font-bold">${ssrInterpolate(unref(t)("gov.offices"))}</h2>`);
        _push(ssrRenderComponent(_component_UiFormField, {
          label: unref(t)("gov.filterOfficesByCity"),
          class: "max-w-sm"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_UiSelect, {
                "model-value": unref(cityQ),
                options: unref(cityOptions),
                placeholder: unref(t)("guides.allCities"),
                "onUpdate:modelValue": setCity
              }, null, _parent2, _scopeId));
            } else {
              return [
                createVNode(_component_UiSelect, {
                  "model-value": unref(cityQ),
                  options: unref(cityOptions),
                  placeholder: unref(t)("guides.allCities"),
                  "onUpdate:modelValue": setCity
                }, null, 8, ["model-value", "options", "placeholder"])
              ];
            }
          }),
          _: 1
        }, _parent));
        if (!unref(s).offices.length) {
          _push(`<p class="text-muted">${ssrInterpolate(unref(t)("gov.noOffices"))}</p>`);
        } else {
          _push(`<ul class="grid gap-4 md:grid-cols-2"><!--[-->`);
          ssrRenderList(unref(s).offices, (o) => {
            _push(`<li>`);
            _push(ssrRenderComponent(_component_GovOfficeCard, {
              office: o,
              link: ""
            }, null, _parent));
            _push(`</li>`);
          });
          _push(`<!--]--></ul>`);
        }
        _push(`</section>`);
        _push(ssrRenderComponent(_component_GuideSource, {
          source: unref(s).source
        }, null, _parent));
        _push(`</article>`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/government/services/[slug].vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=_slug_-DYu3XyY2.mjs.map
