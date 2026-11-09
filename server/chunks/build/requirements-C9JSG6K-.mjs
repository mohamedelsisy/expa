import { _ as _sfc_main$2 } from './Breadcrumbs-C7SaJcTR.mjs';
import { _ as _sfc_main$3 } from './Alert-D-zfMDy5.mjs';
import { u as useI18n, b as useRuntimeConfig, c as useLocalePath, g as useApi, f as useRoute, _ as _sfc_main$3$1, d as _sfc_main$5$1 } from './server.mjs';
import { _ as _sfc_main$4 } from './FormField-DFtov8VK.mjs';
import { _ as _sfc_main$5 } from './Select-BjjHKxeN.mjs';
import { _ as _sfc_main$6 } from './EmptyState-N2xvHts8.mjs';
import { _ as _sfc_main$7 } from './Skeleton-BTnKIEst.mjs';
import { _ as _sfc_main$8 } from './Badge-PdKIsny2.mjs';
import { _ as _sfc_main$9 } from './GuideSource-B-ek0Kys.mjs';
import { defineComponent, computed, mergeProps, unref, withCtx, createTextVNode, toDisplayString, withAsyncContext, reactive, ref, createVNode, openBlock, createBlock, createCommentVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderAttr, ssrRenderList } from 'vue/server-renderer';
import { c as countryOptions } from './countries-e88Gbu9b.mjs';
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
import './SourceBadge-4_eAChkr.mjs';
import './FreshnessIndicator-B5-_pVo1.mjs';
import 'perfect-debounce';

const RESIDENCE_STATUSES = ["visa", "residence_permit"];
function toOptions(list, locale) {
  return list.map((c) => ({ value: c.code.toUpperCase(), label: c.name })).sort((a, b) => a.label.localeCompare(b.label, locale));
}
const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "Requirements",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const { t, locale } = useI18n();
    const { request } = useApi();
    const route = useRoute();
    const { data: countries, error: countriesError, refresh: refreshCountries } = ([__temp, __restore] = withAsyncContext(async () => useAsyncData("countries", async () => (await request("countries")).data, { watch: [locale] })), __temp = await __temp, __restore(), __temp);
    const options = computed(() => {
      var _a;
      return ((_a = countries.value) == null ? void 0 : _a.length) ? toOptions(countries.value, locale.value) : countryOptions(locale.value);
    });
    const placeholder = computed(() => t("travel.choose"));
    const statusOptions = computed(() => [{ value: "", label: t("travel.statusAny") }, ...RESIDENCE_STATUSES.map((s) => ({ value: s, label: t(`travel.statuses.${s}`) }))]);
    const pick = (q) => typeof q === "string" && /^[A-Za-z]{2}$/.test(q) ? q.toUpperCase() : "";
    const form = reactive({ nationality: pick(route.query.nationality), destination: pick(route.query.destination), status: "" });
    const errors = ref({});
    const loading = ref(false);
    const failure = ref(null);
    const result = ref(null);
    const asked = ref(null);
    const live = ref("");
    const name = (code) => {
      var _a, _b;
      return (_b = (_a = options.value.find((o) => o.value === code)) == null ? void 0 : _a.label) != null ? _b : code;
    };
    const lines = (s) => (s != null ? s : "").split(/\r?\n/).map((x) => x.trim()).filter(Boolean);
    return (_ctx, _push, _parent, _attrs) => {
      var _a, _b, _c, _d;
      const _component_UiAlert = _sfc_main$3;
      const _component_UiButton = _sfc_main$3$1;
      const _component_UiFormField = _sfc_main$4;
      const _component_UiSelect = _sfc_main$5;
      const _component_UiIcon = _sfc_main$5$1;
      const _component_UiEmptyState = _sfc_main$6;
      const _component_UiSkeleton = _sfc_main$7;
      const _component_UiBadge = _sfc_main$8;
      const _component_GuideSource = _sfc_main$9;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "grid gap-8 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)]" }, _attrs))}><form class="space-y-4 self-start rounded-lg border border-line bg-surface p-5" novalidate data-testid="travel-form">`);
      if (unref(countriesError)) {
        _push(ssrRenderComponent(_component_UiAlert, { tone: "warning" }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<p${_scopeId}>${ssrInterpolate(unref(t)("travel.countriesFallback"))}</p>`);
              _push2(ssrRenderComponent(_component_UiButton, {
                variant: "secondary",
                class: "mt-2",
                onClick: ($event) => unref(refreshCountries)()
              }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(`${ssrInterpolate(unref(t)("common.retry"))}`);
                  } else {
                    return [
                      createTextVNode(toDisplayString(unref(t)("common.retry")), 1)
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
            } else {
              return [
                createVNode("p", null, toDisplayString(unref(t)("travel.countriesFallback")), 1),
                createVNode(_component_UiButton, {
                  variant: "secondary",
                  class: "mt-2",
                  onClick: ($event) => unref(refreshCountries)()
                }, {
                  default: withCtx(() => [
                    createTextVNode(toDisplayString(unref(t)("common.retry")), 1)
                  ]),
                  _: 1
                }, 8, ["onClick"])
              ];
            }
          }),
          _: 1
        }, _parent));
      } else {
        _push(`<!---->`);
      }
      _push(ssrRenderComponent(_component_UiFormField, {
        label: unref(t)("travel.nationality"),
        hint: unref(t)("travel.nationalityHelp"),
        error: errors.value.nationality,
        required: ""
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_UiSelect, {
              modelValue: form.nationality,
              "onUpdate:modelValue": ($event) => form.nationality = $event,
              options: options.value,
              placeholder: placeholder.value
            }, null, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_UiSelect, {
                modelValue: form.nationality,
                "onUpdate:modelValue": ($event) => form.nationality = $event,
                options: options.value,
                placeholder: placeholder.value
              }, null, 8, ["modelValue", "onUpdate:modelValue", "options", "placeholder"])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_UiFormField, {
        label: unref(t)("travel.destination"),
        error: errors.value.destination,
        required: ""
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_UiSelect, {
              modelValue: form.destination,
              "onUpdate:modelValue": ($event) => form.destination = $event,
              options: options.value,
              placeholder: placeholder.value
            }, null, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_UiSelect, {
                modelValue: form.destination,
                "onUpdate:modelValue": ($event) => form.destination = $event,
                options: options.value,
                placeholder: placeholder.value
              }, null, 8, ["modelValue", "onUpdate:modelValue", "options", "placeholder"])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_UiFormField, {
        label: unref(t)("travel.status"),
        hint: unref(t)("travel.statusHelp"),
        optional: ""
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_UiSelect, {
              modelValue: form.status,
              "onUpdate:modelValue": ($event) => form.status = $event,
              options: statusOptions.value
            }, null, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_UiSelect, {
                modelValue: form.status,
                "onUpdate:modelValue": ($event) => form.status = $event,
                options: statusOptions.value
              }, null, 8, ["modelValue", "onUpdate:modelValue", "options"])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_UiButton, {
        type: "submit",
        block: "",
        loading: loading.value
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_UiIcon, {
              name: "search",
              size: 18
            }, null, _parent2, _scopeId));
            _push2(`${ssrInterpolate(unref(t)("travel.search"))}`);
          } else {
            return [
              createVNode(_component_UiIcon, {
                name: "search",
                size: 18
              }),
              createTextVNode(toDisplayString(unref(t)("travel.search")), 1)
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<p class="text-xs text-muted">${ssrInterpolate(unref(t)("travel.privacy"))}</p></form><div class="min-w-0 space-y-5"${ssrRenderAttr("aria-busy", loading.value ? "true" : void 0)}><p class="sr-only" role="status" aria-live="polite">${ssrInterpolate(live.value)}</p>`);
      if (failure.value) {
        _push(ssrRenderComponent(_component_UiAlert, {
          tone: "danger",
          title: unref(t)("travel.errorTitle"),
          "data-testid": "travel-error"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`${ssrInterpolate(failure.value)}`);
            } else {
              return [
                createTextVNode(toDisplayString(failure.value), 1)
              ];
            }
          }),
          _: 1
        }, _parent));
      } else {
        _push(`<!---->`);
      }
      if (!result.value && !failure.value && !loading.value) {
        _push(ssrRenderComponent(_component_UiEmptyState, {
          title: unref(t)("travel.idleTitle"),
          description: unref(t)("travel.idle"),
          icon: "globe"
        }, null, _parent));
      } else if (loading.value) {
        _push(ssrRenderComponent(_component_UiSkeleton, {
          block: "",
          lines: 4
        }, null, _parent));
      } else if (result.value) {
        _push(`<!--[--><h2 class="text-xl font-bold" data-testid="travel-heading">${ssrInterpolate(unref(t)("travel.resultsFor", { nationality: name((_b = (_a = asked.value) == null ? void 0 : _a.nationality) != null ? _b : result.value.nationality), destination: name((_d = (_c = asked.value) == null ? void 0 : _c.destination) != null ? _d : result.value.destination) }))}</h2>`);
        if (!result.value.items.length) {
          _push(ssrRenderComponent(_component_UiAlert, {
            tone: "info",
            title: unref(t)("travel.noInfoTitle"),
            "data-testid": "travel-empty"
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`<p${_scopeId}>${ssrInterpolate(unref(t)("travel.noInfoBody"))}</p>`);
                if (result.value.message) {
                  _push2(`<p class="mt-2 text-sm"${_scopeId}>${ssrInterpolate(result.value.message)}</p>`);
                } else {
                  _push2(`<!---->`);
                }
                _push2(`<p class="mt-3"${_scopeId}>`);
                _push2(ssrRenderComponent(_component_UiButton, {
                  to: "/ask",
                  variant: "secondary"
                }, {
                  default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                    if (_push3) {
                      _push3(ssrRenderComponent(_component_UiIcon, {
                        name: "sparkle",
                        size: 18
                      }, null, _parent3, _scopeId2));
                      _push3(`${ssrInterpolate(unref(t)("travel.askCta"))}`);
                    } else {
                      return [
                        createVNode(_component_UiIcon, {
                          name: "sparkle",
                          size: 18
                        }),
                        createTextVNode(toDisplayString(unref(t)("travel.askCta")), 1)
                      ];
                    }
                  }),
                  _: 1
                }, _parent2, _scopeId));
                _push2(`</p>`);
              } else {
                return [
                  createVNode("p", null, toDisplayString(unref(t)("travel.noInfoBody")), 1),
                  result.value.message ? (openBlock(), createBlock("p", {
                    key: 0,
                    class: "mt-2 text-sm"
                  }, toDisplayString(result.value.message), 1)) : createCommentVNode("", true),
                  createVNode("p", { class: "mt-3" }, [
                    createVNode(_component_UiButton, {
                      to: "/ask",
                      variant: "secondary"
                    }, {
                      default: withCtx(() => [
                        createVNode(_component_UiIcon, {
                          name: "sparkle",
                          size: 18
                        }),
                        createTextVNode(toDisplayString(unref(t)("travel.askCta")), 1)
                      ]),
                      _: 1
                    })
                  ])
                ];
              }
            }),
            _: 1
          }, _parent));
        } else {
          _push(`<ul class="space-y-5"><!--[-->`);
          ssrRenderList(result.value.items, (it) => {
            _push(`<li class="space-y-3 rounded-lg border border-line bg-surface p-5" data-testid="travel-item"><div class="flex flex-wrap items-center gap-2"><h3 class="text-lg font-bold" dir="auto">${ssrInterpolate(it.title)}</h3>`);
            if (it.nationality === "*") {
              _push(ssrRenderComponent(_component_UiBadge, null, {
                default: withCtx((_, _push2, _parent2, _scopeId) => {
                  if (_push2) {
                    _push2(`${ssrInterpolate(unref(t)("travel.anyNationality"))}`);
                  } else {
                    return [
                      createTextVNode(toDisplayString(unref(t)("travel.anyNationality")), 1)
                    ];
                  }
                }),
                _: 2
              }, _parent));
            } else {
              _push(`<!---->`);
            }
            if (it.residence_status !== "any") {
              _push(ssrRenderComponent(_component_UiBadge, { tone: "primary" }, {
                default: withCtx((_, _push2, _parent2, _scopeId) => {
                  if (_push2) {
                    _push2(`${ssrInterpolate(unref(t)(`travel.statuses.${it.residence_status}`, it.residence_status))}`);
                  } else {
                    return [
                      createTextVNode(toDisplayString(unref(t)(`travel.statuses.${it.residence_status}`, it.residence_status)), 1)
                    ];
                  }
                }),
                _: 2
              }, _parent));
            } else {
              _push(`<!---->`);
            }
            _push(`</div>`);
            if (it.summary) {
              _push(`<p class="text-ink-soft" dir="auto">${ssrInterpolate(it.summary)}</p>`);
            } else {
              _push(`<!---->`);
            }
            if (lines(it.requirements).length) {
              _push(`<div class="space-y-1"><h4 class="font-semibold">${ssrInterpolate(unref(t)("travel.requirements"))}</h4><ul class="list-disc space-y-1 ps-6" dir="auto"><!--[-->`);
              ssrRenderList(lines(it.requirements), (l, i) => {
                _push(`<li>${ssrInterpolate(l)}</li>`);
              });
              _push(`<!--]--></ul></div>`);
            } else {
              _push(`<!---->`);
            }
            if (it.notes) {
              _push(`<div class="space-y-1"><h4 class="font-semibold">${ssrInterpolate(unref(t)("travel.notes"))}</h4><p class="prose-plain" dir="auto">${ssrInterpolate(it.notes)}</p></div>`);
            } else {
              _push(`<!---->`);
            }
            _push(ssrRenderComponent(_component_GuideSource, {
              source: it.source
            }, null, _parent));
            _push(`</li>`);
          });
          _push(`<!--]--></ul>`);
        }
        _push(ssrRenderComponent(_component_UiAlert, {
          tone: "warning",
          "data-testid": "travel-disclaimer"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`${ssrInterpolate(result.value.disclaimer || unref(t)("travel.disclaimer"))}`);
            } else {
              return [
                createTextVNode(toDisplayString(result.value.disclaimer || unref(t)("travel.disclaimer")), 1)
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`<!--]-->`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div></div>`);
    };
  }
});
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/travel/Requirements.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "requirements",
  __ssrInlineRender: true,
  setup(__props) {
    var _a;
    const { t } = useI18n();
    const siteUrl = String((_a = useRuntimeConfig().public.siteUrl) != null ? _a : "").replace(/\/$/, "");
    const localePath = useLocalePath();
    useSeo(() => ({
      title: t("travel.seoTitle"),
      description: t("travel.seoDescription"),
      jsonLdData: { "@context": "https://schema.org", "@type": "WebPage", name: t("travel.title"), description: t("travel.seoDescription"), url: siteUrl + localePath("/travel/requirements") }
    }));
    const crumbs = computed(() => [{ label: t("nav.home"), to: "/" }, { label: t("areas.travel.title"), to: "/travel" }, { label: t("travel.title") }]);
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UiBreadcrumbs = _sfc_main$2;
      const _component_UiAlert = _sfc_main$3;
      const _component_TravelRequirements = _sfc_main$1;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "container-page py-8 sm:py-12" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_UiBreadcrumbs, {
        items: unref(crumbs),
        class: "mb-6"
      }, null, _parent));
      _push(`<header class="mb-6 max-w-2xl space-y-3"><h1 class="text-2xl font-bold sm:text-3xl">${ssrInterpolate(unref(t)("travel.title"))}</h1><p class="text-ink-soft">${ssrInterpolate(unref(t)("travel.subtitle"))}</p></header>`);
      _push(ssrRenderComponent(_component_UiAlert, {
        tone: "warning",
        class: "mb-8",
        "data-testid": "travel-notice"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`${ssrInterpolate(unref(t)("travel.notice"))}`);
          } else {
            return [
              createTextVNode(toDisplayString(unref(t)("travel.notice")), 1)
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_TravelRequirements, null, null, _parent));
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/travel/requirements.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=requirements-C9JSG6K-.mjs.map
