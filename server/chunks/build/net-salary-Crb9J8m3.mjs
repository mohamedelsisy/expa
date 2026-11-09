import { _ as _sfc_main$2 } from './Breadcrumbs-C7SaJcTR.mjs';
import { _ as _sfc_main$3 } from './Alert-D-zfMDy5.mjs';
import { _ as _sfc_main$4 } from './FormField-DFtov8VK.mjs';
import { _ as _sfc_main$5 } from './TextInput-BI4efS3_.mjs';
import { _ as _sfc_main$6 } from './Select-BjjHKxeN.mjs';
import { u as useI18n, b as useRuntimeConfig, c as useLocalePath, g as useApi, _ as _sfc_main$3$1, d as _sfc_main$5$1, y as formatNumber } from './server.mjs';
import { _ as _sfc_main$7 } from './EmptyState-N2xvHts8.mjs';
import { _ as _sfc_main$8 } from './Skeleton-BTnKIEst.mjs';
import { _ as _sfc_main$9 } from './GuideSource-B-ek0Kys.mjs';
import { defineComponent, computed, mergeProps, unref, withCtx, createTextVNode, toDisplayString, reactive, ref, createVNode, openBlock, createBlock, createCommentVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderAttr, ssrRenderList } from 'vue/server-renderer';
import { f as formatMoney } from './money-CRo_itTF.mjs';
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
import './Badge-PdKIsny2.mjs';
import './FreshnessIndicator-B5-_pVo1.mjs';

const MONTHS = [12, 13, 14];
const needsFreshnessWarning = (f) => f === "stale" || f === "outdated" || f === "unverified";
const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "NetSalary",
  __ssrInlineRender: true,
  setup(__props) {
    const { t, locale } = useI18n();
    useApi();
    const form = reactive({ gross: "", months: "12", taxYear: "" });
    const errors = ref({});
    const loading = ref(false);
    const failure = ref(null);
    const result = ref(null);
    const live = ref("");
    const monthOptions = MONTHS.map((m) => ({ value: String(m), label: t("net.monthsOption", { n: m }) }));
    const eur = (n, frac = 2) => formatMoney(n, "EUR", locale.value, frac);
    const pct = (n) => `${formatNumber(n, locale.value, { maximumFractionDigits: 2 })}%`;
    const ok = computed(() => result.value && result.value.available ? result.value : null);
    const rows = computed(() => {
      var _a;
      const e = (_a = ok.value) == null ? void 0 : _a.estimate;
      if (!e) return [];
      return [
        { key: "gross", v: e.gross_annual },
        { key: "contributions", v: -e.contributions },
        { key: "deduction", v: e.deduction },
        { key: "taxable", v: e.taxable_income },
        { key: "incomeTax", v: -e.income_tax }
      ];
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UiFormField = _sfc_main$4;
      const _component_UiTextInput = _sfc_main$5;
      const _component_UiSelect = _sfc_main$6;
      const _component_UiButton = _sfc_main$3$1;
      const _component_UiIcon = _sfc_main$5$1;
      const _component_UiAlert = _sfc_main$3;
      const _component_UiEmptyState = _sfc_main$7;
      const _component_UiSkeleton = _sfc_main$8;
      const _component_GuideSource = _sfc_main$9;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "grid gap-8 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)]" }, _attrs))}><form class="space-y-4 self-start rounded-lg border border-line bg-surface p-5" novalidate data-testid="net-form">`);
      _push(ssrRenderComponent(_component_UiFormField, {
        label: unref(t)("net.gross"),
        hint: unref(t)("net.grossHelp"),
        error: errors.value.gross,
        required: ""
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_UiTextInput, {
              modelValue: form.gross,
              "onUpdate:modelValue": ($event) => form.gross = $event,
              inputmode: "decimal",
              ltr: "",
              autocomplete: "off"
            }, null, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_UiTextInput, {
                modelValue: form.gross,
                "onUpdate:modelValue": ($event) => form.gross = $event,
                inputmode: "decimal",
                ltr: "",
                autocomplete: "off"
              }, null, 8, ["modelValue", "onUpdate:modelValue"])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_UiFormField, {
        label: unref(t)("net.months"),
        hint: unref(t)("net.monthsHelp")
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_UiSelect, {
              modelValue: form.months,
              "onUpdate:modelValue": ($event) => form.months = $event,
              options: unref(monthOptions)
            }, null, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_UiSelect, {
                modelValue: form.months,
                "onUpdate:modelValue": ($event) => form.months = $event,
                options: unref(monthOptions)
              }, null, 8, ["modelValue", "onUpdate:modelValue", "options"])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_UiFormField, {
        label: unref(t)("net.taxYear"),
        hint: unref(t)("net.taxYearHelp"),
        error: errors.value.taxYear,
        optional: ""
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_UiTextInput, {
              modelValue: form.taxYear,
              "onUpdate:modelValue": ($event) => form.taxYear = $event,
              inputmode: "numeric",
              maxlength: 4,
              ltr: "",
              autocomplete: "off"
            }, null, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_UiTextInput, {
                modelValue: form.taxYear,
                "onUpdate:modelValue": ($event) => form.taxYear = $event,
                inputmode: "numeric",
                maxlength: 4,
                ltr: "",
                autocomplete: "off"
              }, null, 8, ["modelValue", "onUpdate:modelValue"])
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
              name: "euro",
              size: 18
            }, null, _parent2, _scopeId));
            _push2(`${ssrInterpolate(unref(t)("net.calculate"))}`);
          } else {
            return [
              createVNode(_component_UiIcon, {
                name: "euro",
                size: 18
              }),
              createTextVNode(toDisplayString(unref(t)("net.calculate")), 1)
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<p class="text-xs text-muted">${ssrInterpolate(unref(t)("net.privacy"))}</p></form><div class="min-w-0 space-y-5"${ssrRenderAttr("aria-busy", loading.value ? "true" : void 0)}><p class="sr-only" role="status" aria-live="polite">${ssrInterpolate(live.value)}</p>`);
      if (failure.value) {
        _push(ssrRenderComponent(_component_UiAlert, {
          tone: "danger",
          title: unref(t)("net.errorTitle"),
          "data-testid": "net-error"
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
          title: unref(t)("net.idleTitle"),
          description: unref(t)("net.idle"),
          icon: "euro"
        }, null, _parent));
      } else if (loading.value) {
        _push(ssrRenderComponent(_component_UiSkeleton, {
          block: "",
          lines: 4
        }, null, _parent));
      } else if (result.value && !result.value.available) {
        _push(ssrRenderComponent(_component_UiAlert, {
          tone: "info",
          title: unref(t)("net.unavailableTitle"),
          "data-testid": "net-unavailable"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<p${_scopeId}>${ssrInterpolate(unref(t)("net.unavailableBody"))}</p>`);
              if (result.value.message) {
                _push2(`<p class="mt-2 text-sm"${_scopeId}>${ssrInterpolate(result.value.message)}</p>`);
              } else {
                _push2(`<!---->`);
              }
            } else {
              return [
                createVNode("p", null, toDisplayString(unref(t)("net.unavailableBody")), 1),
                result.value.message ? (openBlock(), createBlock("p", {
                  key: 0,
                  class: "mt-2 text-sm"
                }, toDisplayString(result.value.message), 1)) : createCommentVNode("", true)
              ];
            }
          }),
          _: 1
        }, _parent));
      } else if (ok.value) {
        _push(`<!--[--><section aria-labelledby="net-res-h" class="space-y-4" data-testid="net-result"><h2 id="net-res-h" class="text-xl font-bold">${ssrInterpolate(unref(t)("net.resultTitle", { year: ok.value.tax_year }))}</h2><dl class="grid gap-3 sm:grid-cols-2"><div class="rounded-lg bg-primary-soft p-4"><dt class="text-sm font-medium text-primary-strong">${ssrInterpolate(unref(t)("net.netMonthly", { n: ok.value.estimate.months }))}</dt><dd class="mt-1 text-2xl font-bold text-primary-strong" data-testid="net-monthly"><bdi>${ssrInterpolate(eur(ok.value.estimate.net_monthly))}</bdi></dd></div><div class="rounded-lg bg-sunken p-4"><dt class="text-sm font-medium text-ink-soft">${ssrInterpolate(unref(t)("net.netAnnual"))}</dt><dd class="mt-1 text-2xl font-bold" data-testid="net-annual"><bdi>${ssrInterpolate(eur(ok.value.estimate.net_annual))}</bdi></dd></div></dl>`);
        _push(ssrRenderComponent(_component_UiAlert, {
          tone: "warning",
          "data-testid": "net-estimate-note"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`${ssrInterpolate(unref(t)("net.estimateNote"))}`);
            } else {
              return [
                createTextVNode(toDisplayString(unref(t)("net.estimateNote")), 1)
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`<div class="overflow-x-auto rounded-lg border border-line" role="region" tabindex="0"${ssrRenderAttr("aria-label", unref(t)("net.breakdown"))}><table class="w-full text-start"><caption class="p-3 text-start font-bold">${ssrInterpolate(unref(t)("net.breakdown"))}</caption><thead class="bg-sunken text-sm"><tr><th scope="col" class="px-3 py-2 text-start">${ssrInterpolate(unref(t)("net.item"))}</th><th scope="col" class="px-3 py-2 text-end">${ssrInterpolate(unref(t)("net.amount"))}</th></tr></thead><tbody class="divide-y divide-line"><!--[-->`);
        ssrRenderList(rows.value, (r) => {
          _push(`<tr><th scope="row" class="px-3 py-2 text-start font-normal">${ssrInterpolate(unref(t)(`net.rows.${r.key}`))}</th><td class="px-3 py-2 text-end tabular-nums"><bdi>${ssrInterpolate(eur(r.v))}</bdi></td></tr>`);
        });
        _push(`<!--]--><tr class="font-bold"><th scope="row" class="px-3 py-2 text-start">${ssrInterpolate(unref(t)("net.rows.netAnnual"))}</th><td class="px-3 py-2 text-end tabular-nums"><bdi>${ssrInterpolate(eur(ok.value.estimate.net_annual))}</bdi></td></tr></tbody></table></div>`);
        if (ok.value.estimate.brackets.length) {
          _push(`<div class="overflow-x-auto rounded-lg border border-line" role="region" tabindex="0"${ssrRenderAttr("aria-label", unref(t)("net.brackets"))}><table class="w-full text-start"><caption class="p-3 text-start font-bold">${ssrInterpolate(unref(t)("net.brackets"))}</caption><thead class="bg-sunken text-sm"><tr><th scope="col" class="px-3 py-2 text-start">${ssrInterpolate(unref(t)("net.from"))}</th><th scope="col" class="px-3 py-2 text-start">${ssrInterpolate(unref(t)("net.to"))}</th><th scope="col" class="px-3 py-2 text-end">${ssrInterpolate(unref(t)("net.rate"))}</th><th scope="col" class="px-3 py-2 text-end">${ssrInterpolate(unref(t)("net.taxable"))}</th><th scope="col" class="px-3 py-2 text-end">${ssrInterpolate(unref(t)("net.tax"))}</th></tr></thead><tbody class="divide-y divide-line"><!--[-->`);
          ssrRenderList(ok.value.estimate.brackets, (b, i) => {
            _push(`<tr><td class="px-3 py-2 tabular-nums"><bdi>${ssrInterpolate(eur(b.from, 0))}</bdi></td><td class="px-3 py-2 tabular-nums">`);
            if (b.to !== null) {
              _push(`<bdi>${ssrInterpolate(eur(b.to, 0))}</bdi>`);
            } else {
              _push(`<span>${ssrInterpolate(unref(t)("net.noLimit"))}</span>`);
            }
            _push(`</td><td class="px-3 py-2 text-end tabular-nums"><bdi>${ssrInterpolate(pct(b.rate))}</bdi></td><td class="px-3 py-2 text-end tabular-nums"><bdi>${ssrInterpolate(eur(b.taxable))}</bdi></td><td class="px-3 py-2 text-end tabular-nums"><bdi>${ssrInterpolate(eur(b.tax))}</bdi></td></tr>`);
          });
          _push(`<!--]--></tbody></table></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</section>`);
        if (unref(needsFreshnessWarning)(ok.value.table.source.freshness)) {
          _push(ssrRenderComponent(_component_UiAlert, {
            tone: "warning",
            title: unref(t)("net.staleTitle"),
            "data-testid": "net-stale"
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`${ssrInterpolate(unref(t)("net.stale"))}`);
              } else {
                return [
                  createTextVNode(toDisplayString(unref(t)("net.stale")), 1)
                ];
              }
            }),
            _: 1
          }, _parent));
        } else {
          _push(`<!---->`);
        }
        _push(`<div class="space-y-2">`);
        if (ok.value.table.name) {
          _push(`<p class="text-sm text-muted">${ssrInterpolate(unref(t)("net.tableName"))}: <span dir="auto">${ssrInterpolate(ok.value.table.name)}</span></p>`);
        } else {
          _push(`<!---->`);
        }
        _push(ssrRenderComponent(_component_GuideSource, {
          source: ok.value.table.source
        }, null, _parent));
        _push(`</div>`);
        _push(ssrRenderComponent(_component_UiAlert, {
          tone: "warning",
          "data-testid": "net-disclaimer"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`${ssrInterpolate(ok.value.disclaimer)}`);
            } else {
              return [
                createTextVNode(toDisplayString(ok.value.disclaimer), 1)
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/money/NetSalary.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "net-salary",
  __ssrInlineRender: true,
  setup(__props) {
    var _a;
    const { t } = useI18n();
    const siteUrl = String((_a = useRuntimeConfig().public.siteUrl) != null ? _a : "").replace(/\/$/, "");
    const localePath = useLocalePath();
    useSeo(() => ({
      title: t("net.seoTitle"),
      description: t("net.seoDescription"),
      jsonLdData: { "@context": "https://schema.org", "@type": "WebPage", name: t("net.title"), description: t("net.seoDescription"), url: siteUrl + localePath("/money/net-salary") }
    }));
    const crumbs = computed(() => [{ label: t("nav.home"), to: "/" }, { label: t("areas.money.title"), to: "/money" }, { label: t("net.title") }]);
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UiBreadcrumbs = _sfc_main$2;
      const _component_UiAlert = _sfc_main$3;
      const _component_MoneyNetSalary = _sfc_main$1;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "container-page py-8 sm:py-12" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_UiBreadcrumbs, {
        items: unref(crumbs),
        class: "mb-6"
      }, null, _parent));
      _push(`<header class="mb-6 max-w-2xl space-y-3"><h1 class="text-2xl font-bold sm:text-3xl">${ssrInterpolate(unref(t)("net.title"))}</h1><p class="text-ink-soft">${ssrInterpolate(unref(t)("net.subtitle"))}</p></header>`);
      _push(ssrRenderComponent(_component_UiAlert, {
        tone: "warning",
        class: "mb-8",
        "data-testid": "net-notice"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`${ssrInterpolate(unref(t)("net.notAdvice"))}`);
          } else {
            return [
              createTextVNode(toDisplayString(unref(t)("net.notAdvice")), 1)
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_MoneyNetSalary, null, null, _parent));
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/money/net-salary.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=net-salary-Crb9J8m3.mjs.map
