import { _ as _sfc_main$1 } from './Alert-D-zfMDy5.mjs';
import { _ as _sfc_main$2 } from './FormField-DFtov8VK.mjs';
import { _ as _sfc_main$3 } from './Select-BjjHKxeN.mjs';
import { u as useI18n, f as useRoute, c as useLocalePath, g as useApi, _ as _sfc_main$3$1, d as _sfc_main$5, i as _sfc_main$2$1, e as __nuxt_component_0, n as navigateTo, j as isApiError } from './server.mjs';
import { _ as _sfc_main$4 } from './AutoItalian-BD4PyQ-n.mjs';
import { _ as _sfc_main$6 } from './FallbackNotice-CwHuyozE.mjs';
import { _ as _sfc_main$7 } from './GuideSteps-CUJ1XeBp.mjs';
import { _ as _sfc_main$8 } from './GuideSource-B-ek0Kys.mjs';
import { _ as _sfc_main$9 } from './OfficeCard-D7gQkLPp.mjs';
import { _ as _sfc_main$a } from './Card-BxvVO_-_.mjs';
import { _ as _sfc_main$b } from './Badge-PdKIsny2.mjs';
import { _ as _sfc_main$c } from './SourceBadge-4_eAChkr.mjs';
import { defineComponent, computed, ref, withAsyncContext, mergeProps, unref, withCtx, createTextVNode, toDisplayString, isRef, createVNode, openBlock, createBlock, createCommentVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrInterpolate, ssrRenderComponent, ssrRenderList } from 'vue/server-renderer';
import { u as useSeo } from './useSeo-BU4sLOnV.mjs';
import { u as useAsyncData } from './asyncData-bKJD5Wmv.mjs';
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
import './safe-B2eSdAXJ.mjs';
import './FreshnessIndicator-B5-_pVo1.mjs';
import './BookingBlock-DOKLO1aP.mjs';
import './useAnalytics-Dh-8IvGy.mjs';
import 'perfect-debounce';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "index",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const { t, locale } = useI18n();
    const route = useRoute();
    const localePath = useLocalePath();
    const { request } = useApi();
    useSeo(() => ({ title: t("appt.title"), description: t("appt.subtitle") }));
    const TYPES = ["questura", "prefettura", "comune", "anagrafe", "asl", "inps", "agenzia_entrate", "poste", "motorizzazione", "university", "other"];
    const typeOptions = computed(() => TYPES.map((v) => ({ value: v, label: t(`appt.officeTypes.${v}`) })));
    const type = ref(typeof route.query.type === "string" ? route.query.type : "");
    const city = ref(typeof route.query.city === "string" ? route.query.city : "");
    const { data: lookups, error: lookupError } = ([__temp, __restore] = withAsyncContext(async () => useAsyncData("appt-lookups", async () => {
      const [cities, guides] = await Promise.all([request("cities"), request("appointments/guides", { query: { per_page: 50 } })]);
      return { cities: cities.data, guides: guides.data };
    }, { watch: [locale] })), __temp = await __temp, __restore(), __temp);
    const cityOptions = computed(() => {
      var _a, _b;
      return ((_b = (_a = lookups.value) == null ? void 0 : _a.cities) != null ? _b : []).map((c) => ({ value: c.slug, label: c.name }));
    });
    const hub = ref(null);
    const loading = ref(false);
    const hubError = ref(null);
    const touched = ref(false);
    async function find() {
      touched.value = true;
      if (!type.value || !city.value) return;
      loading.value = true;
      hubError.value = null;
      try {
        hub.value = (await request("appointments/hub", { query: { type: type.value, city: city.value } })).data;
        navigateTo({ path: route.path, query: { type: type.value, city: city.value } }, { replace: true });
      } catch (e) {
        hub.value = null;
        hubError.value = isApiError(e) ? e.message : t("errors.generic");
      } finally {
        loading.value = false;
      }
    }
    return (_ctx, _push, _parent, _attrs) => {
      var _a;
      const _component_UiAlert = _sfc_main$1;
      const _component_UiFormField = _sfc_main$2;
      const _component_UiSelect = _sfc_main$3;
      const _component_UiButton = _sfc_main$3$1;
      const _component_UiIcon = _sfc_main$5;
      const _component_UiErrorState = _sfc_main$2$1;
      const _component_UiAutoItalian = _sfc_main$4;
      const _component_GuideFallbackNotice = _sfc_main$6;
      const _component_GovGuideSteps = _sfc_main$7;
      const _component_GuideSource = _sfc_main$8;
      const _component_GovOfficeCard = _sfc_main$9;
      const _component_UiCard = _sfc_main$a;
      const _component_UiBadge = _sfc_main$b;
      const _component_UiSourceBadge = _sfc_main$c;
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "container-page py-8 sm:py-12" }, _attrs))}><header class="mb-6 max-w-2xl"><h1 class="text-2xl font-bold sm:text-3xl">${ssrInterpolate(unref(t)("appt.title"))}</h1><p class="mt-1 text-ink-soft">${ssrInterpolate(unref(t)("appt.subtitle"))}</p></header>`);
      _push(ssrRenderComponent(_component_UiAlert, {
        tone: "info",
        class: "mb-6"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`${ssrInterpolate(unref(t)("appt.notice"))}`);
          } else {
            return [
              createTextVNode(toDisplayString(unref(t)("appt.notice")), 1)
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<form class="mb-8 grid gap-4 rounded-lg border border-line bg-surface p-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end" novalidate>`);
      _push(ssrRenderComponent(_component_UiFormField, {
        label: unref(t)("appt.officeType"),
        error: unref(touched) && !unref(type) ? unref(t)("appt.chooseType") : void 0,
        required: ""
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_UiSelect, {
              modelValue: unref(type),
              "onUpdate:modelValue": ($event) => isRef(type) ? type.value = $event : null,
              options: unref(typeOptions),
              placeholder: unref(t)("common.choose")
            }, null, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_UiSelect, {
                modelValue: unref(type),
                "onUpdate:modelValue": ($event) => isRef(type) ? type.value = $event : null,
                options: unref(typeOptions),
                placeholder: unref(t)("common.choose")
              }, null, 8, ["modelValue", "onUpdate:modelValue", "options", "placeholder"])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_UiFormField, {
        label: unref(t)("guides.city"),
        error: unref(touched) && !unref(city) ? unref(t)("appt.chooseCity") : void 0,
        required: ""
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_UiSelect, {
              modelValue: unref(city),
              "onUpdate:modelValue": ($event) => isRef(city) ? city.value = $event : null,
              options: unref(cityOptions),
              placeholder: unref(t)("common.choose")
            }, null, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_UiSelect, {
                modelValue: unref(city),
                "onUpdate:modelValue": ($event) => isRef(city) ? city.value = $event : null,
                options: unref(cityOptions),
                placeholder: unref(t)("common.choose")
              }, null, 8, ["modelValue", "onUpdate:modelValue", "options", "placeholder"])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_UiButton, {
        type: "submit",
        loading: unref(loading)
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_UiIcon, {
              name: "search",
              size: 18
            }, null, _parent2, _scopeId));
            _push2(`${ssrInterpolate(unref(t)("appt.find"))}`);
          } else {
            return [
              createVNode(_component_UiIcon, {
                name: "search",
                size: 18
              }),
              createTextVNode(toDisplayString(unref(t)("appt.find")), 1)
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</form>`);
      if (unref(lookupError)) {
        _push(ssrRenderComponent(_component_UiAlert, {
          tone: "warning",
          class: "mb-6"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`${ssrInterpolate(unref(t)("guides.filtersUnavailable"))}`);
            } else {
              return [
                createTextVNode(toDisplayString(unref(t)("guides.filtersUnavailable")), 1)
              ];
            }
          }),
          _: 1
        }, _parent));
      } else {
        _push(`<!---->`);
      }
      _push(`<div aria-live="polite">`);
      if (unref(hubError)) {
        _push(ssrRenderComponent(_component_UiErrorState, {
          message: unref(hubError),
          retry: "",
          onRetry: find
        }, null, _parent));
      } else if (unref(hub)) {
        _push(`<div class="space-y-8" data-testid="appointment-hub"><h2 class="text-xl font-bold">${ssrInterpolate(unref(t)("appt.resultsFor", { type: unref(hub).office_type_label, city: unref(hub).city.name }))}</h2>`);
        _push(ssrRenderComponent(_component_UiAlert, {
          tone: "info",
          "data-testid": "hub-notice"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`${ssrInterpolate(unref(hub).notice)}`);
            } else {
              return [
                createTextVNode(toDisplayString(unref(hub).notice), 1)
              ];
            }
          }),
          _: 1
        }, _parent));
        if (unref(hub).guide) {
          _push(`<section aria-labelledby="hub-guide" class="space-y-4"><h3 id="hub-guide" class="text-lg font-bold">`);
          _push(ssrRenderComponent(_component_UiAutoItalian, {
            text: unref(hub).guide.title
          }, null, _parent));
          _push(`</h3>`);
          if (unref(hub).guide.summary) {
            _push(`<p class="text-ink-soft">${ssrInterpolate(unref(hub).guide.summary)}</p>`);
          } else {
            _push(`<!---->`);
          }
          if (unref(hub).guide.fallback) {
            _push(ssrRenderComponent(_component_GuideFallbackNotice, {
              locale: unref(hub).guide.locale
            }, null, _parent));
          } else {
            _push(`<!---->`);
          }
          _push(ssrRenderComponent(_component_GovGuideSteps, {
            guide: unref(hub).guide
          }, null, _parent));
          _push(ssrRenderComponent(_component_GuideSource, {
            source: unref(hub).guide.source
          }, null, _parent));
          _push(`</section>`);
        } else {
          _push(ssrRenderComponent(_component_UiAlert, { tone: "warning" }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`${ssrInterpolate(unref(t)("appt.noGuide"))}`);
              } else {
                return [
                  createTextVNode(toDisplayString(unref(t)("appt.noGuide")), 1)
                ];
              }
            }),
            _: 1
          }, _parent));
        }
        _push(`<section aria-labelledby="hub-offices" class="space-y-4"><h3 id="hub-offices" class="text-lg font-bold">${ssrInterpolate(unref(t)("gov.offices"))}</h3>`);
        if (!unref(hub).offices.length) {
          _push(`<p class="text-muted">${ssrInterpolate(unref(t)("appt.noOffices"))}</p>`);
        } else {
          _push(`<ul class="grid gap-4 md:grid-cols-2"><!--[-->`);
          ssrRenderList(unref(hub).offices, (o) => {
            _push(`<li>`);
            _push(ssrRenderComponent(_component_GovOfficeCard, {
              office: o,
              link: ""
            }, null, _parent));
            _push(`</li>`);
          });
          _push(`<!--]--></ul>`);
        }
        _push(`</section></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
      if ((_a = unref(lookups)) == null ? void 0 : _a.guides.length) {
        _push(`<section aria-labelledby="all-guides" class="mt-12 space-y-4"><h2 id="all-guides" class="text-xl font-bold">${ssrInterpolate(unref(t)("appt.allGuides"))}</h2><ul class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"><!--[-->`);
        ssrRenderList(unref(lookups).guides, (g) => {
          _push(`<li>`);
          _push(ssrRenderComponent(_component_UiCard, {
            as: "article",
            class: "relative flex h-full flex-col gap-2 hover:shadow-2"
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`<div class="flex flex-wrap gap-2"${_scopeId}>`);
                _push2(ssrRenderComponent(_component_UiBadge, { tone: "primary" }, {
                  default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                    if (_push3) {
                      _push3(`${ssrInterpolate(g.office_type_label)}`);
                    } else {
                      return [
                        createTextVNode(toDisplayString(g.office_type_label), 1)
                      ];
                    }
                  }),
                  _: 2
                }, _parent2, _scopeId));
                _push2(ssrRenderComponent(_component_UiSourceBadge, {
                  type: g.source.type
                }, null, _parent2, _scopeId));
                _push2(`</div><h3 class="font-bold"${_scopeId}>`);
                _push2(ssrRenderComponent(_component_NuxtLink, {
                  to: unref(localePath)(`/appointments/${g.slug}`),
                  class: "after:absolute after:inset-0 after:content-['']"
                }, {
                  default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                    if (_push3) {
                      _push3(ssrRenderComponent(_component_UiAutoItalian, {
                        text: g.title
                      }, null, _parent3, _scopeId2));
                    } else {
                      return [
                        createVNode(_component_UiAutoItalian, {
                          text: g.title
                        }, null, 8, ["text"])
                      ];
                    }
                  }),
                  _: 2
                }, _parent2, _scopeId));
                _push2(`</h3>`);
                if (g.summary) {
                  _push2(`<p class="line-clamp-3 text-ink-soft"${_scopeId}>${ssrInterpolate(g.summary)}</p>`);
                } else {
                  _push2(`<!---->`);
                }
              } else {
                return [
                  createVNode("div", { class: "flex flex-wrap gap-2" }, [
                    createVNode(_component_UiBadge, { tone: "primary" }, {
                      default: withCtx(() => [
                        createTextVNode(toDisplayString(g.office_type_label), 1)
                      ]),
                      _: 2
                    }, 1024),
                    createVNode(_component_UiSourceBadge, {
                      type: g.source.type
                    }, null, 8, ["type"])
                  ]),
                  createVNode("h3", { class: "font-bold" }, [
                    createVNode(_component_NuxtLink, {
                      to: unref(localePath)(`/appointments/${g.slug}`),
                      class: "after:absolute after:inset-0 after:content-['']"
                    }, {
                      default: withCtx(() => [
                        createVNode(_component_UiAutoItalian, {
                          text: g.title
                        }, null, 8, ["text"])
                      ]),
                      _: 2
                    }, 1032, ["to"])
                  ]),
                  g.summary ? (openBlock(), createBlock("p", {
                    key: 0,
                    class: "line-clamp-3 text-ink-soft"
                  }, toDisplayString(g.summary), 1)) : createCommentVNode("", true)
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
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/appointments/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=index-BI-vWTTE.mjs.map
