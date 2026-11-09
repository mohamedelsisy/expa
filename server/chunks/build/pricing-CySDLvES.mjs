import { _ as _sfc_main$1 } from './Breadcrumbs-C7SaJcTR.mjs';
import { _ as _sfc_main$2 } from './Alert-D-zfMDy5.mjs';
import { _ as _sfc_main$3 } from './Card-BxvVO_-_.mjs';
import { _ as _sfc_main$4 } from './Skeleton-BTnKIEst.mjs';
import { u as useI18n, c as useLocalePath, a as useAuthStore, g as useApi, i as _sfc_main$2$1, j as isApiError, d as _sfc_main$5$1, _ as _sfc_main$3$1, n as navigateTo } from './server.mjs';
import { _ as _sfc_main$5 } from './EmptyState-N2xvHts8.mjs';
import { _ as _sfc_main$6 } from './Badge-PdKIsny2.mjs';
import { defineComponent, withAsyncContext, computed, ref, mergeProps, unref, withCtx, createTextVNode, toDisplayString, createVNode, openBlock, createBlock, createCommentVNode, Fragment, renderList, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderList, ssrRenderAttr, ssrRenderClass } from 'vue/server-renderer';
import { f as formatPlanPrice, c as checkoutErrorKey } from './billing-GlpWdT4D.mjs';
import { a as safeHttpsUrl } from './safe-B2eSdAXJ.mjs';
import { u as useToast } from './useToast-BX2bodPv.mjs';
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
import './money-CRo_itTF.mjs';
import 'perfect-debounce';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "pricing",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const { t, locale } = useI18n();
    const localePath = useLocalePath();
    const auth = useAuthStore();
    const toast = useToast();
    const { request } = useApi();
    useSeo(() => ({ title: t("pricing.seo.title"), description: t("pricing.seo.description") }));
    const { data, error, refresh, status } = ([__temp, __restore] = withAsyncContext(async () => useAsyncData("pricing-plans", async () => {
      var _a;
      const res = await request("billing/plans");
      return { plans: res.data, billingAvailable: ((_a = res.meta) == null ? void 0 : _a.billing_available) === true };
    }, { watch: [locale] })), __temp = await __temp, __restore(), __temp);
    const plans = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.plans) != null ? _b : [];
    });
    const billingAvailable = computed(() => {
      var _a;
      return ((_a = data.value) == null ? void 0 : _a.billingAvailable) === true;
    });
    const { data: sub } = ([__temp, __restore] = withAsyncContext(async () => useAsyncData("pricing-subscription", async () => {
      if (!auth.isAuthenticated) return null;
      try {
        return (await request("billing/subscription", { handle401: false })).data;
      } catch {
        return null;
      }
    }, { watch: [() => auth.isAuthenticated] })), __temp = await __temp, __restore(), __temp);
    const currentKey = computed(() => {
      var _a, _b, _c;
      return (_c = (_b = (_a = sub.value) == null ? void 0 : _a.plan) == null ? void 0 : _b.key) != null ? _c : auth.isAuthenticated ? "free" : null;
    });
    const KNOWN = ["ai_daily_limit", "reminders_advanced", "document_ai", "human_credits"];
    function features(p) {
      const f = p.features && typeof p.features === "object" && !Array.isArray(p.features) ? p.features : {};
      return KNOWN.filter((k) => k in f).map((k) => {
        const v = f[k];
        const on = typeof v === "boolean" ? v : Number(v) > 0;
        return { key: k, on, text: typeof v === "number" ? t(`pricing.features.${k}`, { count: v }) : t(`pricing.features.${k}`) };
      });
    }
    const price = (p) => formatPlanPrice(p.price, locale.value, { free: t("pricing.free"), interval: (i) => t(`pricing.interval.${i}`) });
    const loginTo = computed(() => `/login?redirect=${encodeURIComponent(localePath("/pricing"))}`);
    const choosing = ref(null);
    async function choose(p) {
      choosing.value = p.key;
      try {
        const res = await request("billing/checkout", { method: "POST", body: { plan: p.key } });
        const url = safeHttpsUrl(res.data.checkout_url);
        if (!url) throw new Error("bad url");
        await navigateTo(url, { external: true });
      } catch (e) {
        toast.error(t(checkoutErrorKey(isApiError(e) ? e : null)));
      } finally {
        choosing.value = null;
      }
    }
    const crumbs = computed(() => [{ label: t("nav.home"), to: "/" }, { label: t("pricing.title") }]);
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UiBreadcrumbs = _sfc_main$1;
      const _component_UiAlert = _sfc_main$2;
      const _component_UiCard = _sfc_main$3;
      const _component_UiSkeleton = _sfc_main$4;
      const _component_UiErrorState = _sfc_main$2$1;
      const _component_UiEmptyState = _sfc_main$5;
      const _component_UiBadge = _sfc_main$6;
      const _component_UiIcon = _sfc_main$5$1;
      const _component_UiButton = _sfc_main$3$1;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "container-page py-8 sm:py-12" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_UiBreadcrumbs, {
        items: unref(crumbs),
        class: "mb-6"
      }, null, _parent));
      _push(`<header class="mb-6 max-w-2xl"><h1 class="text-2xl font-bold sm:text-3xl">${ssrInterpolate(unref(t)("pricing.title"))}</h1><p class="mt-1 text-ink-soft">${ssrInterpolate(unref(t)("pricing.subtitle"))}</p></header>`);
      if (!unref(billingAvailable)) {
        _push(ssrRenderComponent(_component_UiAlert, {
          tone: "info",
          title: unref(t)("pricing.notEnabledTitle"),
          class: "mb-6",
          "data-testid": "payments-disabled"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`${ssrInterpolate(unref(t)("pricing.notEnabled"))}`);
            } else {
              return [
                createTextVNode(toDisplayString(unref(t)("pricing.notEnabled")), 1)
              ];
            }
          }),
          _: 1
        }, _parent));
      } else {
        _push(`<!---->`);
      }
      if (unref(status) === "pending" && !unref(data)) {
        _push(`<ul class="grid gap-4 md:grid-cols-3" aria-busy="true"><!--[-->`);
        ssrRenderList(3, (n) => {
          _push(`<li>`);
          _push(ssrRenderComponent(_component_UiCard, null, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(ssrRenderComponent(_component_UiSkeleton, { lines: 5 }, null, _parent2, _scopeId));
              } else {
                return [
                  createVNode(_component_UiSkeleton, { lines: 5 })
                ];
              }
            }),
            _: 2
          }, _parent));
          _push(`</li>`);
        });
        _push(`<!--]--></ul>`);
      } else if (unref(error)) {
        _push(ssrRenderComponent(_component_UiErrorState, {
          message: unref(isApiError)(unref(error)) ? unref(error).message : void 0,
          retry: "",
          onRetry: ($event) => unref(refresh)()
        }, null, _parent));
      } else if (!unref(plans).length) {
        _push(ssrRenderComponent(_component_UiEmptyState, {
          title: unref(t)("pricing.emptyTitle"),
          description: unref(t)("pricing.empty"),
          icon: "euro"
        }, null, _parent));
      } else {
        _push(`<ul class="grid gap-4 md:grid-cols-3"><!--[-->`);
        ssrRenderList(unref(plans), (p) => {
          _push(`<li>`);
          _push(ssrRenderComponent(_component_UiCard, {
            as: "article",
            class: "flex h-full flex-col gap-3",
            elevated: p.key === unref(currentKey),
            "aria-labelledby": `plan-${p.key}`
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`<div class="flex items-center justify-between gap-2"${_scopeId}><h2${ssrRenderAttr("id", `plan-${p.key}`)} class="text-xl font-bold"${_scopeId}>${ssrInterpolate(p.name)}</h2>`);
                if (p.key === unref(currentKey)) {
                  _push2(ssrRenderComponent(_component_UiBadge, { tone: "success" }, {
                    default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                      if (_push3) {
                        _push3(`${ssrInterpolate(unref(t)("pricing.current"))}`);
                      } else {
                        return [
                          createTextVNode(toDisplayString(unref(t)("pricing.current")), 1)
                        ];
                      }
                    }),
                    _: 2
                  }, _parent2, _scopeId));
                } else {
                  _push2(`<!---->`);
                }
                _push2(`</div><p class="text-2xl font-bold tabular-nums"${_scopeId}><bdi${_scopeId}>${ssrInterpolate(price(p))}</bdi></p>`);
                if (p.description) {
                  _push2(`<p class="text-ink-soft"${_scopeId}>${ssrInterpolate(p.description)}</p>`);
                } else {
                  _push2(`<!---->`);
                }
                _push2(`<ul class="space-y-1.5"${_scopeId}><!--[-->`);
                ssrRenderList(features(p), (f) => {
                  _push2(`<li class="flex items-start gap-2"${_scopeId}>`);
                  _push2(ssrRenderComponent(_component_UiIcon, {
                    name: f.on ? "check" : "x",
                    size: 18,
                    class: f.on ? "mt-1 text-success" : "mt-1 text-muted"
                  }, null, _parent2, _scopeId));
                  _push2(`<span class="${ssrRenderClass(f.on ? "" : "text-muted")}"${_scopeId}><span class="sr-only"${_scopeId}>${ssrInterpolate(f.on ? unref(t)("pricing.included") : unref(t)("pricing.notIncluded"))}: </span>${ssrInterpolate(f.text)}</span></li>`);
                });
                _push2(`<!--]--></ul><div class="mt-auto pt-2"${_scopeId}>`);
                if (p.key === unref(currentKey) || !p.price.amount_minor) {
                  _push2(ssrRenderComponent(_component_UiButton, {
                    variant: "secondary",
                    block: "",
                    disabled: ""
                  }, {
                    default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                      if (_push3) {
                        _push3(`${ssrInterpolate(p.key === unref(currentKey) ? unref(t)("pricing.current") : unref(t)("pricing.includedFree"))}`);
                      } else {
                        return [
                          createTextVNode(toDisplayString(p.key === unref(currentKey) ? unref(t)("pricing.current") : unref(t)("pricing.includedFree")), 1)
                        ];
                      }
                    }),
                    _: 2
                  }, _parent2, _scopeId));
                } else if (!unref(auth).isAuthenticated) {
                  _push2(ssrRenderComponent(_component_UiButton, {
                    to: unref(loginTo),
                    variant: "secondary",
                    block: "",
                    "data-testid": "plan-signin"
                  }, {
                    default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                      if (_push3) {
                        _push3(`${ssrInterpolate(unref(t)("pricing.signInToSubscribe"))}`);
                      } else {
                        return [
                          createTextVNode(toDisplayString(unref(t)("pricing.signInToSubscribe")), 1)
                        ];
                      }
                    }),
                    _: 2
                  }, _parent2, _scopeId));
                } else if (unref(billingAvailable)) {
                  _push2(ssrRenderComponent(_component_UiButton, {
                    block: "",
                    loading: unref(choosing) === p.key,
                    disabled: unref(choosing) !== null,
                    "data-testid": `choose-${p.key}`,
                    onClick: ($event) => choose(p)
                  }, {
                    default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                      if (_push3) {
                        _push3(`${ssrInterpolate(unref(t)("pricing.choose", { plan: p.name }))}`);
                      } else {
                        return [
                          createTextVNode(toDisplayString(unref(t)("pricing.choose", { plan: p.name })), 1)
                        ];
                      }
                    }),
                    _: 2
                  }, _parent2, _scopeId));
                } else {
                  _push2(ssrRenderComponent(_component_UiButton, {
                    variant: "secondary",
                    block: "",
                    disabled: "",
                    "data-testid": `unavailable-${p.key}`
                  }, {
                    default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                      if (_push3) {
                        _push3(`${ssrInterpolate(unref(t)("pricing.notAvailableYet"))}`);
                      } else {
                        return [
                          createTextVNode(toDisplayString(unref(t)("pricing.notAvailableYet")), 1)
                        ];
                      }
                    }),
                    _: 2
                  }, _parent2, _scopeId));
                }
                _push2(`</div>`);
              } else {
                return [
                  createVNode("div", { class: "flex items-center justify-between gap-2" }, [
                    createVNode("h2", {
                      id: `plan-${p.key}`,
                      class: "text-xl font-bold"
                    }, toDisplayString(p.name), 9, ["id"]),
                    p.key === unref(currentKey) ? (openBlock(), createBlock(_component_UiBadge, {
                      key: 0,
                      tone: "success"
                    }, {
                      default: withCtx(() => [
                        createTextVNode(toDisplayString(unref(t)("pricing.current")), 1)
                      ]),
                      _: 1
                    })) : createCommentVNode("", true)
                  ]),
                  createVNode("p", { class: "text-2xl font-bold tabular-nums" }, [
                    createVNode("bdi", null, toDisplayString(price(p)), 1)
                  ]),
                  p.description ? (openBlock(), createBlock("p", {
                    key: 0,
                    class: "text-ink-soft"
                  }, toDisplayString(p.description), 1)) : createCommentVNode("", true),
                  createVNode("ul", { class: "space-y-1.5" }, [
                    (openBlock(true), createBlock(Fragment, null, renderList(features(p), (f) => {
                      return openBlock(), createBlock("li", {
                        key: f.key,
                        class: "flex items-start gap-2"
                      }, [
                        createVNode(_component_UiIcon, {
                          name: f.on ? "check" : "x",
                          size: 18,
                          class: f.on ? "mt-1 text-success" : "mt-1 text-muted"
                        }, null, 8, ["name", "class"]),
                        createVNode("span", {
                          class: f.on ? "" : "text-muted"
                        }, [
                          createVNode("span", { class: "sr-only" }, toDisplayString(f.on ? unref(t)("pricing.included") : unref(t)("pricing.notIncluded")) + ": ", 1),
                          createTextVNode(toDisplayString(f.text), 1)
                        ], 2)
                      ]);
                    }), 128))
                  ]),
                  createVNode("div", { class: "mt-auto pt-2" }, [
                    p.key === unref(currentKey) || !p.price.amount_minor ? (openBlock(), createBlock(_component_UiButton, {
                      key: 0,
                      variant: "secondary",
                      block: "",
                      disabled: ""
                    }, {
                      default: withCtx(() => [
                        createTextVNode(toDisplayString(p.key === unref(currentKey) ? unref(t)("pricing.current") : unref(t)("pricing.includedFree")), 1)
                      ]),
                      _: 2
                    }, 1024)) : !unref(auth).isAuthenticated ? (openBlock(), createBlock(_component_UiButton, {
                      key: 1,
                      to: unref(loginTo),
                      variant: "secondary",
                      block: "",
                      "data-testid": "plan-signin"
                    }, {
                      default: withCtx(() => [
                        createTextVNode(toDisplayString(unref(t)("pricing.signInToSubscribe")), 1)
                      ]),
                      _: 1
                    }, 8, ["to"])) : unref(billingAvailable) ? (openBlock(), createBlock(_component_UiButton, {
                      key: 2,
                      block: "",
                      loading: unref(choosing) === p.key,
                      disabled: unref(choosing) !== null,
                      "data-testid": `choose-${p.key}`,
                      onClick: ($event) => choose(p)
                    }, {
                      default: withCtx(() => [
                        createTextVNode(toDisplayString(unref(t)("pricing.choose", { plan: p.name })), 1)
                      ]),
                      _: 2
                    }, 1032, ["loading", "disabled", "data-testid", "onClick"])) : (openBlock(), createBlock(_component_UiButton, {
                      key: 3,
                      variant: "secondary",
                      block: "",
                      disabled: "",
                      "data-testid": `unavailable-${p.key}`
                    }, {
                      default: withCtx(() => [
                        createTextVNode(toDisplayString(unref(t)("pricing.notAvailableYet")), 1)
                      ]),
                      _: 1
                    }, 8, ["data-testid"]))
                  ])
                ];
              }
            }),
            _: 2
          }, _parent));
          _push(`</li>`);
        });
        _push(`<!--]--></ul>`);
      }
      _push(`<p class="mt-6 text-sm text-muted">${ssrInterpolate(unref(t)("pricing.footnote"))}</p></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/pricing.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=pricing-CySDLvES.mjs.map
