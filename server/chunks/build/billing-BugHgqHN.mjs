import { _ as _sfc_main$1 } from './Breadcrumbs-C7SaJcTR.mjs';
import { _ as _sfc_main$2 } from './Skeleton-BTnKIEst.mjs';
import { u as useI18n, g as useApi, f as useRoute, i as _sfc_main$2$1, j as isApiError, _ as _sfc_main$3$1, k as formatDate } from './server.mjs';
import { _ as _sfc_main$3 } from './Alert-D-zfMDy5.mjs';
import { _ as _sfc_main$4 } from './Card-BxvVO_-_.mjs';
import { _ as _sfc_main$5 } from './Badge-PdKIsny2.mjs';
import { _ as _sfc_main$6 } from './ConfirmInline-sG5Cp32P.mjs';
import { defineComponent, computed, withAsyncContext, ref, mergeProps, unref, withCtx, createTextVNode, toDisplayString, createVNode, openBlock, createBlock, createCommentVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderList } from 'vue/server-renderer';
import { f as formatMoney } from './money-CRo_itTF.mjs';
import { u as useToast } from './useToast-BX2bodPv.mjs';
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
  __name: "billing",
  __ssrInlineRender: true,
  async setup(__props) {
    var _a, _b;
    let __temp, __restore;
    const { t, locale } = useI18n();
    const { request } = useApi();
    const toast = useToast();
    useSeo(() => ({ title: t("billing.title"), description: t("billing.subtitle"), noindex: true }));
    const crumbs = computed(() => [{ label: t("nav.home"), to: "/" }, { label: t("profile.title"), to: "/profile" }, { label: t("billing.title") }]);
    const { data, error, refresh, status } = ([__temp, __restore] = withAsyncContext(async () => useAsyncData("billing-subscription", async () => (await request("billing/subscription")).data)), __temp = await __temp, __restore(), __temp);
    const { data: invoices, refresh: refreshInvoices } = ([__temp, __restore] = withAsyncContext(async () => useAsyncData("billing-invoices", async () => {
      try {
        return (await request("billing/invoices")).data;
      } catch {
        return [];
      }
    })), __temp = await __temp, __restore(), __temp);
    const sub = computed(() => data.value);
    const route = useRoute();
    const returned = ref(route.query.checkout === "cancelled" ? "cancelled" : route.query.checkout === "success" ? "processing" : null);
    (_b = (_a = data.value) == null ? void 0 : _a.plan.key) != null ? _b : "free";
    const paid = computed(() => !!sub.value && sub.value.status !== "free" && sub.value.plan.key !== "free");
    const canCancel = computed(() => paid.value && sub.value.billing_available && !sub.value.cancel_at_period_end && ["active", "trialing", "past_due"].includes(sub.value.status));
    const confirming = ref(false);
    const busy = ref(false);
    const failure = ref("");
    async function cancel() {
      busy.value = true;
      failure.value = "";
      try {
        await request("billing/cancel", { method: "POST" });
        toast.success(t("billing.canceled"));
        confirming.value = false;
        await Promise.all([refresh(), refreshInvoices()]);
      } catch (e) {
        failure.value = isApiError(e) && e.status === 503 ? t("billing.unavailable") : isApiError(e) ? e.message : t("errors.generic");
      } finally {
        busy.value = false;
      }
    }
    const money = (minor, cur) => formatMoney(minor / 100, cur, locale.value, 2);
    return (_ctx, _push, _parent, _attrs) => {
      var _a2;
      const _component_UiBreadcrumbs = _sfc_main$1;
      const _component_UiSkeleton = _sfc_main$2;
      const _component_UiErrorState = _sfc_main$2$1;
      const _component_UiAlert = _sfc_main$3;
      const _component_UiButton = _sfc_main$3$1;
      const _component_UiCard = _sfc_main$4;
      const _component_UiBadge = _sfc_main$5;
      const _component_UiConfirmInline = _sfc_main$6;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "container-page max-w-3xl py-8 sm:py-12" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_UiBreadcrumbs, {
        items: unref(crumbs),
        class: "mb-6"
      }, null, _parent));
      _push(`<h1 class="text-2xl font-bold sm:text-3xl">${ssrInterpolate(unref(t)("billing.title"))}</h1><p class="mt-1 mb-6 text-ink-soft">${ssrInterpolate(unref(t)("billing.subtitle"))}</p>`);
      if (unref(status) === "pending" && !unref(data)) {
        _push(`<div aria-busy="true">`);
        _push(ssrRenderComponent(_component_UiSkeleton, {
          block: "",
          lines: 3
        }, null, _parent));
        _push(`</div>`);
      } else if (unref(error) || !unref(sub)) {
        _push(ssrRenderComponent(_component_UiErrorState, {
          message: unref(isApiError)(unref(error)) ? unref(error).message : void 0,
          retry: "",
          onRetry: ($event) => unref(refresh)()
        }, null, _parent));
      } else {
        _push(`<!--[--><div aria-live="polite" data-testid="checkout-return">`);
        if (unref(returned) === "processing") {
          _push(ssrRenderComponent(_component_UiAlert, {
            tone: "info",
            class: "mb-6",
            title: unref(t)("billing.return.processingTitle")
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`${ssrInterpolate(unref(t)("billing.return.processing"))}`);
              } else {
                return [
                  createTextVNode(toDisplayString(unref(t)("billing.return.processing")), 1)
                ];
              }
            }),
            _: 1
          }, _parent));
        } else if (unref(returned) === "confirmed") {
          _push(ssrRenderComponent(_component_UiAlert, {
            tone: "success",
            class: "mb-6",
            title: unref(t)("billing.return.confirmedTitle")
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`${ssrInterpolate(unref(t)("billing.return.confirmed"))}`);
              } else {
                return [
                  createTextVNode(toDisplayString(unref(t)("billing.return.confirmed")), 1)
                ];
              }
            }),
            _: 1
          }, _parent));
        } else if (unref(returned) === "pending") {
          _push(ssrRenderComponent(_component_UiAlert, {
            tone: "warning",
            class: "mb-6",
            title: unref(t)("billing.return.pendingTitle")
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`${ssrInterpolate(unref(t)("billing.return.pending"))} `);
                _push2(ssrRenderComponent(_component_UiButton, {
                  variant: "secondary",
                  class: "mt-2",
                  onClick: ($event) => unref(refresh)()
                }, {
                  default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                    if (_push3) {
                      _push3(`${ssrInterpolate(unref(t)("billing.return.refresh"))}`);
                    } else {
                      return [
                        createTextVNode(toDisplayString(unref(t)("billing.return.refresh")), 1)
                      ];
                    }
                  }),
                  _: 1
                }, _parent2, _scopeId));
              } else {
                return [
                  createTextVNode(toDisplayString(unref(t)("billing.return.pending")) + " ", 1),
                  createVNode(_component_UiButton, {
                    variant: "secondary",
                    class: "mt-2",
                    onClick: ($event) => unref(refresh)()
                  }, {
                    default: withCtx(() => [
                      createTextVNode(toDisplayString(unref(t)("billing.return.refresh")), 1)
                    ]),
                    _: 1
                  }, 8, ["onClick"])
                ];
              }
            }),
            _: 1
          }, _parent));
        } else if (unref(returned) === "cancelled") {
          _push(ssrRenderComponent(_component_UiAlert, {
            tone: "info",
            class: "mb-6",
            title: unref(t)("billing.return.cancelledTitle")
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`${ssrInterpolate(unref(t)("billing.return.cancelled"))} `);
                _push2(ssrRenderComponent(_component_UiButton, {
                  to: "/pricing",
                  variant: "secondary",
                  class: "mt-2"
                }, {
                  default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                    if (_push3) {
                      _push3(`${ssrInterpolate(unref(t)("billing.seePlans"))}`);
                    } else {
                      return [
                        createTextVNode(toDisplayString(unref(t)("billing.seePlans")), 1)
                      ];
                    }
                  }),
                  _: 1
                }, _parent2, _scopeId));
              } else {
                return [
                  createTextVNode(toDisplayString(unref(t)("billing.return.cancelled")) + " ", 1),
                  createVNode(_component_UiButton, {
                    to: "/pricing",
                    variant: "secondary",
                    class: "mt-2"
                  }, {
                    default: withCtx(() => [
                      createTextVNode(toDisplayString(unref(t)("billing.seePlans")), 1)
                    ]),
                    _: 1
                  })
                ];
              }
            }),
            _: 1
          }, _parent));
        } else {
          _push(`<!---->`);
        }
        _push(`</div>`);
        if (!unref(sub).billing_available) {
          _push(ssrRenderComponent(_component_UiAlert, {
            tone: "info",
            class: "mb-6",
            title: unref(t)("pricing.notEnabledTitle"),
            "data-testid": "billing-unavailable"
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`${ssrInterpolate(unref(t)("billing.notAvailable"))}`);
              } else {
                return [
                  createTextVNode(toDisplayString(unref(t)("billing.notAvailable")), 1)
                ];
              }
            }),
            _: 1
          }, _parent));
        } else {
          _push(`<!---->`);
        }
        _push(ssrRenderComponent(_component_UiCard, {
          class: "space-y-3",
          "aria-labelledby": "plan-h"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            var _a3, _b2;
            if (_push2) {
              _push2(`<h2 id="plan-h" class="text-xl font-bold"${_scopeId}>${ssrInterpolate(unref(t)("billing.currentPlan"))}</h2><p class="flex flex-wrap items-center gap-2 text-lg"${_scopeId}><span class="font-semibold"${_scopeId}>${ssrInterpolate((_a3 = unref(sub).plan.name) != null ? _a3 : unref(sub).plan.key)}</span>`);
              _push2(ssrRenderComponent(_component_UiBadge, { tone: "neutral" }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(`${ssrInterpolate(unref(t)(`billing.status.${unref(sub).status}`))}`);
                  } else {
                    return [
                      createTextVNode(toDisplayString(unref(t)(`billing.status.${unref(sub).status}`)), 1)
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
              _push2(`</p>`);
              if (unref(sub).current_period_end && unref(paid)) {
                _push2(`<p class="text-ink-soft"${_scopeId}>${ssrInterpolate(unref(sub).cancel_at_period_end ? unref(t)("billing.endsOn", { date: unref(formatDate)(unref(sub).current_period_end, unref(locale)) }) : unref(t)("billing.renewsOn", { date: unref(formatDate)(unref(sub).current_period_end, unref(locale)) }))}</p>`);
              } else {
                _push2(`<!---->`);
              }
              if (!unref(paid)) {
                _push2(`<p class="text-ink-soft"${_scopeId}>${ssrInterpolate(unref(t)("billing.freePlan"))}</p>`);
              } else {
                _push2(`<!---->`);
              }
              _push2(`<div aria-live="polite"${_scopeId}>`);
              if (unref(failure)) {
                _push2(ssrRenderComponent(_component_UiAlert, { tone: "danger" }, {
                  default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                    if (_push3) {
                      _push3(`${ssrInterpolate(unref(failure))}`);
                    } else {
                      return [
                        createTextVNode(toDisplayString(unref(failure)), 1)
                      ];
                    }
                  }),
                  _: 1
                }, _parent2, _scopeId));
              } else {
                _push2(`<!---->`);
              }
              _push2(`</div><div class="flex flex-wrap gap-3"${_scopeId}>`);
              if (!unref(paid) || !unref(sub).billing_available) {
                _push2(ssrRenderComponent(_component_UiButton, {
                  to: "/pricing",
                  variant: "secondary"
                }, {
                  default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                    if (_push3) {
                      _push3(`${ssrInterpolate(unref(t)("billing.seePlans"))}`);
                    } else {
                      return [
                        createTextVNode(toDisplayString(unref(t)("billing.seePlans")), 1)
                      ];
                    }
                  }),
                  _: 1
                }, _parent2, _scopeId));
              } else {
                _push2(`<!---->`);
              }
              if (unref(canCancel) && !unref(confirming)) {
                _push2(ssrRenderComponent(_component_UiButton, {
                  variant: "danger",
                  onClick: ($event) => confirming.value = true
                }, {
                  default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                    if (_push3) {
                      _push3(`${ssrInterpolate(unref(t)("billing.cancel"))}`);
                    } else {
                      return [
                        createTextVNode(toDisplayString(unref(t)("billing.cancel")), 1)
                      ];
                    }
                  }),
                  _: 1
                }, _parent2, _scopeId));
              } else {
                _push2(`<!---->`);
              }
              _push2(`</div>`);
              if (unref(confirming)) {
                _push2(ssrRenderComponent(_component_UiConfirmInline, {
                  message: unref(t)("billing.cancelConfirm"),
                  "confirm-label": unref(t)("billing.cancel"),
                  loading: unref(busy),
                  onCancel: ($event) => confirming.value = false,
                  onConfirm: cancel
                }, null, _parent2, _scopeId));
              } else {
                _push2(`<!---->`);
              }
              if (unref(paid) && unref(sub).cancel_at_period_end) {
                _push2(`<p class="text-sm text-muted"${_scopeId}>${ssrInterpolate(unref(t)("billing.cancelNote"))}</p>`);
              } else {
                _push2(`<!---->`);
              }
            } else {
              return [
                createVNode("h2", {
                  id: "plan-h",
                  class: "text-xl font-bold"
                }, toDisplayString(unref(t)("billing.currentPlan")), 1),
                createVNode("p", { class: "flex flex-wrap items-center gap-2 text-lg" }, [
                  createVNode("span", { class: "font-semibold" }, toDisplayString((_b2 = unref(sub).plan.name) != null ? _b2 : unref(sub).plan.key), 1),
                  createVNode(_component_UiBadge, { tone: "neutral" }, {
                    default: withCtx(() => [
                      createTextVNode(toDisplayString(unref(t)(`billing.status.${unref(sub).status}`)), 1)
                    ]),
                    _: 1
                  })
                ]),
                unref(sub).current_period_end && unref(paid) ? (openBlock(), createBlock("p", {
                  key: 0,
                  class: "text-ink-soft"
                }, toDisplayString(unref(sub).cancel_at_period_end ? unref(t)("billing.endsOn", { date: unref(formatDate)(unref(sub).current_period_end, unref(locale)) }) : unref(t)("billing.renewsOn", { date: unref(formatDate)(unref(sub).current_period_end, unref(locale)) })), 1)) : createCommentVNode("", true),
                !unref(paid) ? (openBlock(), createBlock("p", {
                  key: 1,
                  class: "text-ink-soft"
                }, toDisplayString(unref(t)("billing.freePlan")), 1)) : createCommentVNode("", true),
                createVNode("div", { "aria-live": "polite" }, [
                  unref(failure) ? (openBlock(), createBlock(_component_UiAlert, {
                    key: 0,
                    tone: "danger"
                  }, {
                    default: withCtx(() => [
                      createTextVNode(toDisplayString(unref(failure)), 1)
                    ]),
                    _: 1
                  })) : createCommentVNode("", true)
                ]),
                createVNode("div", { class: "flex flex-wrap gap-3" }, [
                  !unref(paid) || !unref(sub).billing_available ? (openBlock(), createBlock(_component_UiButton, {
                    key: 0,
                    to: "/pricing",
                    variant: "secondary"
                  }, {
                    default: withCtx(() => [
                      createTextVNode(toDisplayString(unref(t)("billing.seePlans")), 1)
                    ]),
                    _: 1
                  })) : createCommentVNode("", true),
                  unref(canCancel) && !unref(confirming) ? (openBlock(), createBlock(_component_UiButton, {
                    key: 1,
                    variant: "danger",
                    onClick: ($event) => confirming.value = true
                  }, {
                    default: withCtx(() => [
                      createTextVNode(toDisplayString(unref(t)("billing.cancel")), 1)
                    ]),
                    _: 1
                  }, 8, ["onClick"])) : createCommentVNode("", true)
                ]),
                unref(confirming) ? (openBlock(), createBlock(_component_UiConfirmInline, {
                  key: 2,
                  message: unref(t)("billing.cancelConfirm"),
                  "confirm-label": unref(t)("billing.cancel"),
                  loading: unref(busy),
                  onCancel: ($event) => confirming.value = false,
                  onConfirm: cancel
                }, null, 8, ["message", "confirm-label", "loading", "onCancel"])) : createCommentVNode("", true),
                unref(paid) && unref(sub).cancel_at_period_end ? (openBlock(), createBlock("p", {
                  key: 3,
                  class: "text-sm text-muted"
                }, toDisplayString(unref(t)("billing.cancelNote")), 1)) : createCommentVNode("", true)
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`<section aria-labelledby="inv-h" class="mt-8 space-y-3"><h2 id="inv-h" class="text-xl font-bold">${ssrInterpolate(unref(t)("billing.invoices"))}</h2>`);
        if (!((_a2 = unref(invoices)) == null ? void 0 : _a2.length)) {
          _push(`<p class="text-ink-soft">${ssrInterpolate(unref(t)("billing.noInvoices"))}</p>`);
        } else {
          _push(`<ul class="space-y-2"><!--[-->`);
          ssrRenderList(unref(invoices), (i) => {
            _push(`<li class="flex flex-wrap items-center justify-between gap-2 rounded-md border border-line bg-surface p-3"><p><span class="font-semibold" dir="ltr">${ssrInterpolate(i.number)}</span><span class="text-sm text-muted"> \xB7 ${ssrInterpolate(unref(formatDate)(i.issued_at, unref(locale)))}`);
            if (i.description) {
              _push(`<!--[--> \xB7 <span dir="auto">${ssrInterpolate(i.description)}</span><!--]-->`);
            } else {
              _push(`<!---->`);
            }
            _push(`</span></p><p class="font-semibold tabular-nums"><bdi>${ssrInterpolate(money(i.total_minor, i.currency))}</bdi>`);
            if (i.tax) {
              _push(`<span class="ms-2 text-sm font-normal text-muted">${ssrInterpolate(unref(t)("billing.vatIncluded", { amount: money(i.tax.amount_minor, i.currency) }))}</span>`);
            } else {
              _push(`<!---->`);
            }
            _push(`</p></li>`);
          });
          _push(`<!--]--></ul>`);
        }
        _push(`</section><!--]-->`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/settings/billing.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=billing-BugHgqHN.mjs.map
