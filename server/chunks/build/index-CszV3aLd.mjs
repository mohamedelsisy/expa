import { u as useAdminSeo, _ as _sfc_main$1 } from './useAdminSeo-DuRYEU0h.mjs';
import { _ as _sfc_main$2 } from './Alert-D-zfMDy5.mjs';
import { u as useI18n, g as useApi, c as useLocalePath, f as useRoute, e as __nuxt_component_0, d as _sfc_main$5, i as _sfc_main$2$1, y as formatNumber, j as isApiError, n as navigateTo } from './server.mjs';
import { _ as _sfc_main$3 } from './Card-BxvVO_-_.mjs';
import { _ as _sfc_main$4 } from './Skeleton-BTnKIEst.mjs';
import { _ as _sfc_main$6 } from './Badge-PdKIsny2.mjs';
import { _ as _sfc_main$7 } from './FormField-DFtov8VK.mjs';
import { _ as _sfc_main$8 } from './TextInput-BI4efS3_.mjs';
import { _ as _sfc_main$9 } from './Select-BjjHKxeN.mjs';
import { _ as _sfc_main$a } from './EmptyState-N2xvHts8.mjs';
import { defineComponent, computed, withAsyncContext, mergeProps, unref, withCtx, createTextVNode, toDisplayString, createVNode, openBlock, createBlock, createCommentVNode, Fragment, renderList, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderList, ssrRenderAttr, ssrRenderStyle } from 'vue/server-renderer';
import { v as visibleNav } from './nav-BcPwSH6h.mjs';
import { u as usePermissions } from './usePermissions-C4HCMWJS.mjs';
import { u as useAsyncData } from './asyncData-bKJD5Wmv.mjs';
import './Breadcrumbs-C7SaJcTR.mjs';
import './useSeo-BU4sLOnV.mjs';
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
import './modules-CgmwLVRo.mjs';
import './permissions-CcyNKBx7.mjs';
import 'perfect-debounce';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "index",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const { t, locale } = useI18n();
    const { request } = useApi();
    const { can, canAny } = usePermissions();
    const localePath = useLocalePath();
    useAdminSeo(() => t("admin.title"));
    const canReports = can("reports.view");
    const route = useRoute();
    const q = computed(() => ({ from: typeof route.query.from === "string" ? route.query.from : "", to: typeof route.query.to === "string" ? route.query.to : "", name: typeof route.query.name === "string" ? route.query.name : "" }));
    const stats = canReports ? ([__temp, __restore] = withAsyncContext(() => useAsyncData("admin-stats", () => request("admin/stats"))), __temp = await __temp, __restore(), __temp) : null;
    const analytics = canReports ? ([__temp, __restore] = withAsyncContext(() => useAsyncData("admin-analytics", () => request("admin/analytics", { query: q.value }), { watch: [q] })), __temp = await __temp, __restore(), __temp) : null;
    const s = computed(() => {
      var _a;
      return (_a = stats == null ? void 0 : stats.data.value) == null ? void 0 : _a.data;
    });
    const num = (n) => formatNumber(n, locale.value);
    const money = (minor) => formatNumber(minor / 100, locale.value, { style: "currency", currency: "EUR" });
    const cards = computed(() => {
      const d = s.value;
      if (!d) return [];
      return [
        { key: "users", title: t("admin.dash.users"), items: [[t("admin.dash.total"), num(d.users.total)], [t("admin.dash.new30"), num(d.users.new_30d)], [t("admin.dash.active30"), num(d.users.active_30d)]] },
        { key: "ai", title: t("admin.dash.ai"), items: [[t("admin.dash.questions30"), num(d.ai.questions_30d)]] },
        { key: "content", title: t("admin.dash.content"), items: [[t("admin.dash.publishedGuides"), num(d.content.published_guides)], [t("admin.dash.pendingReview"), num(d.content.pending_review)], [t("admin.dash.staleSources"), num(d.content.stale_sources)]], warn: d.content.stale_sources > 0 || d.content.pending_review > 0 },
        { key: "jobs", title: t("admin.dash.jobs"), items: [[t("admin.dash.listed"), num(d.jobs.listed)], [t("admin.dash.imported30"), num(d.jobs.imported_30d)], [t("admin.dash.failingSources"), num(d.jobs.failing_sources)]], warn: d.jobs.failing_sources > 0 },
        { key: "billing", title: t("admin.dash.billing"), items: [[t("admin.dash.activeSubs"), num(d.billing.active_subscriptions)], [t("admin.dash.revenue30"), money(d.billing.revenue_30d_minor)], [t("admin.dash.failedPayments30"), num(d.billing.failed_payments_30d)]], warn: d.billing.failed_payments_30d > 0 },
        { key: "system", title: t("admin.dash.queue"), items: [[t("admin.dash.pendingQueue"), num(d.system.pending_queue_jobs)], [t("admin.dash.failedQueue"), num(d.system.failed_queue_jobs)]], warn: d.system.failed_queue_jobs > 0 }
      ];
    });
    const A = computed(() => {
      var _a;
      return (_a = analytics == null ? void 0 : analytics.data.value) == null ? void 0 : _a.data;
    });
    const maxTotal = computed(() => {
      var _a, _b;
      return Math.max(1, ...(_b = (_a = A.value) == null ? void 0 : _a.totals.map((x) => x.total)) != null ? _b : [1]);
    });
    const days = computed(() => {
      var _a, _b, _c;
      const by = /* @__PURE__ */ new Map();
      for (const r of (_b = (_a = A.value) == null ? void 0 : _a.daily) != null ? _b : []) by.set(r.day, ((_c = by.get(r.day)) != null ? _c : 0) + r.total);
      return [...by.entries()].map(([day, total]) => ({ day, total }));
    });
    const maxDay = computed(() => Math.max(1, ...days.value.map((d) => d.total)));
    const EVENTS = ["signup", "login", "guide_view", "job_view", "job_apply_click", "lesson_started", "lesson_completed", "ai_question", "document_added", "reminder_created", "appointment_clicked", "subscription_started"];
    const evLabel = (n) => EVENTS.includes(n) ? t(`admin.events.${n}`) : n;
    const setQ = (patch) => navigateTo({ path: route.path, query: Object.fromEntries(Object.entries({ ...q.value, ...patch }).filter(([, v]) => v)) }, { replace: true });
    const quick = computed(() => visibleNav(canAny).flatMap((g) => g.items).filter((i) => !i.exact));
    const err = (e) => isApiError(e) ? e.message : void 0;
    return (_ctx, _push, _parent, _attrs) => {
      var _a, _b, _c, _d, _e;
      const _component_AdminPageHeader = _sfc_main$1;
      const _component_UiAlert = _sfc_main$2;
      const _component_NuxtLink = __nuxt_component_0;
      const _component_UiIcon = _sfc_main$5;
      const _component_UiCard = _sfc_main$3;
      const _component_UiSkeleton = _sfc_main$4;
      const _component_UiErrorState = _sfc_main$2$1;
      const _component_UiBadge = _sfc_main$6;
      const _component_UiFormField = _sfc_main$7;
      const _component_UiTextInput = _sfc_main$8;
      const _component_UiSelect = _sfc_main$9;
      const _component_UiEmptyState = _sfc_main$a;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-8" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_AdminPageHeader, {
        title: unref(t)("admin.title"),
        description: unref(t)("admin.dash.subtitle")
      }, null, _parent));
      if (!unref(canReports)) {
        _push(`<section aria-labelledby="quick">`);
        _push(ssrRenderComponent(_component_UiAlert, {
          tone: "info",
          class: "mb-4"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`${ssrInterpolate(unref(t)("admin.dash.noReports"))}`);
            } else {
              return [
                createTextVNode(toDisplayString(unref(t)("admin.dash.noReports")), 1)
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`<h2 id="quick" class="mb-3 text-lg font-bold">${ssrInterpolate(unref(t)("admin.dash.quickLinks"))}</h2><ul class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"><!--[-->`);
        ssrRenderList(unref(quick), (i) => {
          _push(`<li>`);
          _push(ssrRenderComponent(_component_NuxtLink, {
            to: unref(localePath)(i.to),
            class: "flex min-h-touch items-center gap-3 rounded-lg border border-line bg-surface p-4 font-medium hover:shadow-2"
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(ssrRenderComponent(_component_UiIcon, {
                  name: i.icon
                }, null, _parent2, _scopeId));
                _push2(`${ssrInterpolate(unref(t)(i.label))}`);
              } else {
                return [
                  createVNode(_component_UiIcon, {
                    name: i.icon
                  }, null, 8, ["name"]),
                  createTextVNode(toDisplayString(unref(t)(i.label)), 1)
                ];
              }
            }),
            _: 2
          }, _parent));
          _push(`</li>`);
        });
        _push(`<!--]--></ul></section>`);
      } else {
        _push(`<!--[--><section aria-labelledby="stats-h"><h2 id="stats-h" class="sr-only">${ssrInterpolate(unref(t)("admin.dash.overview"))}</h2>`);
        if (((_a = unref(stats)) == null ? void 0 : _a.status.value) === "pending" && !unref(s)) {
          _push(`<ul aria-busy="true" class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"><!--[-->`);
          ssrRenderList(6, (n) => {
            _push(`<li>`);
            _push(ssrRenderComponent(_component_UiCard, null, {
              default: withCtx((_, _push2, _parent2, _scopeId) => {
                if (_push2) {
                  _push2(ssrRenderComponent(_component_UiSkeleton, { lines: 3 }, null, _parent2, _scopeId));
                } else {
                  return [
                    createVNode(_component_UiSkeleton, { lines: 3 })
                  ];
                }
              }),
              _: 2
            }, _parent));
            _push(`</li>`);
          });
          _push(`<!--]--></ul>`);
        } else if ((_b = unref(stats)) == null ? void 0 : _b.error.value) {
          _push(ssrRenderComponent(_component_UiErrorState, {
            message: err(unref(stats).error.value),
            retry: "",
            onRetry: ($event) => {
              var _a2;
              return (_a2 = unref(stats)) == null ? void 0 : _a2.refresh();
            }
          }, null, _parent));
        } else {
          _push(`<ul class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"><!--[-->`);
          ssrRenderList(unref(cards), (c) => {
            _push(`<li>`);
            _push(ssrRenderComponent(_component_UiCard, {
              as: "article",
              class: "h-full",
              "data-card": c.key
            }, {
              default: withCtx((_, _push2, _parent2, _scopeId) => {
                if (_push2) {
                  _push2(`<h3 class="mb-3 flex items-center gap-2 text-base font-bold"${_scopeId}>${ssrInterpolate(c.title)}`);
                  if (c.warn) {
                    _push2(ssrRenderComponent(_component_UiBadge, { tone: "warning" }, {
                      default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                        if (_push3) {
                          _push3(`${ssrInterpolate(unref(t)("admin.dash.attention"))}`);
                        } else {
                          return [
                            createTextVNode(toDisplayString(unref(t)("admin.dash.attention")), 1)
                          ];
                        }
                      }),
                      _: 2
                    }, _parent2, _scopeId));
                  } else {
                    _push2(`<!---->`);
                  }
                  _push2(`</h3><dl class="space-y-1.5"${_scopeId}><!--[-->`);
                  ssrRenderList(c.items, (it, i) => {
                    _push2(`<div class="flex items-baseline justify-between gap-3"${_scopeId}><dt class="text-ink-soft"${_scopeId}>${ssrInterpolate(it[0])}</dt><dd class="text-lg font-bold tabular-nums" dir="ltr"${_scopeId}>${ssrInterpolate(it[1])}</dd></div>`);
                  });
                  _push2(`<!--]--></dl>`);
                } else {
                  return [
                    createVNode("h3", { class: "mb-3 flex items-center gap-2 text-base font-bold" }, [
                      createTextVNode(toDisplayString(c.title), 1),
                      c.warn ? (openBlock(), createBlock(_component_UiBadge, {
                        key: 0,
                        tone: "warning"
                      }, {
                        default: withCtx(() => [
                          createTextVNode(toDisplayString(unref(t)("admin.dash.attention")), 1)
                        ]),
                        _: 1
                      })) : createCommentVNode("", true)
                    ]),
                    createVNode("dl", { class: "space-y-1.5" }, [
                      (openBlock(true), createBlock(Fragment, null, renderList(c.items, (it, i) => {
                        return openBlock(), createBlock("div", {
                          key: i,
                          class: "flex items-baseline justify-between gap-3"
                        }, [
                          createVNode("dt", { class: "text-ink-soft" }, toDisplayString(it[0]), 1),
                          createVNode("dd", {
                            class: "text-lg font-bold tabular-nums",
                            dir: "ltr"
                          }, toDisplayString(it[1]), 1)
                        ]);
                      }), 128))
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
        _push(`</section><section aria-labelledby="an-h" class="space-y-4"><h2 id="an-h" class="text-xl font-bold">${ssrInterpolate(unref(t)("admin.dash.analytics"))}</h2><form class="grid gap-3 rounded-lg border border-line bg-surface p-4 sm:grid-cols-3">`);
        _push(ssrRenderComponent(_component_UiFormField, {
          label: unref(t)("admin.dash.from"),
          optional: ""
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_UiTextInput, {
                "model-value": unref(q).from,
                type: "date",
                ltr: "",
                "onUpdate:modelValue": ($event) => setQ({ from: $event })
              }, null, _parent2, _scopeId));
            } else {
              return [
                createVNode(_component_UiTextInput, {
                  "model-value": unref(q).from,
                  type: "date",
                  ltr: "",
                  "onUpdate:modelValue": ($event) => setQ({ from: $event })
                }, null, 8, ["model-value", "onUpdate:modelValue"])
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(ssrRenderComponent(_component_UiFormField, {
          label: unref(t)("admin.dash.to"),
          optional: ""
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_UiTextInput, {
                "model-value": unref(q).to,
                type: "date",
                ltr: "",
                "onUpdate:modelValue": ($event) => setQ({ to: $event })
              }, null, _parent2, _scopeId));
            } else {
              return [
                createVNode(_component_UiTextInput, {
                  "model-value": unref(q).to,
                  type: "date",
                  ltr: "",
                  "onUpdate:modelValue": ($event) => setQ({ to: $event })
                }, null, 8, ["model-value", "onUpdate:modelValue"])
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(ssrRenderComponent(_component_UiFormField, {
          label: unref(t)("admin.dash.event")
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_UiSelect, {
                "model-value": unref(q).name,
                options: EVENTS.map((e) => ({ value: e, label: unref(t)(`admin.events.${e}`) })),
                placeholder: unref(t)("admin.common.all"),
                "onUpdate:modelValue": ($event) => setQ({ name: $event })
              }, null, _parent2, _scopeId));
            } else {
              return [
                createVNode(_component_UiSelect, {
                  "model-value": unref(q).name,
                  options: EVENTS.map((e) => ({ value: e, label: unref(t)(`admin.events.${e}`) })),
                  placeholder: unref(t)("admin.common.all"),
                  "onUpdate:modelValue": ($event) => setQ({ name: $event })
                }, null, 8, ["model-value", "options", "placeholder", "onUpdate:modelValue"])
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</form><p class="text-sm text-muted">${ssrInterpolate(unref(t)("admin.dash.privacyNote"))}</p>`);
        if (((_c = unref(analytics)) == null ? void 0 : _c.status.value) === "pending" && !unref(A)) {
          _push(ssrRenderComponent(_component_UiSkeleton, { lines: 4 }, null, _parent));
        } else if ((_d = unref(analytics)) == null ? void 0 : _d.error.value) {
          _push(ssrRenderComponent(_component_UiErrorState, {
            message: err(unref(analytics).error.value),
            retry: "",
            onRetry: ($event) => {
              var _a2;
              return (_a2 = unref(analytics)) == null ? void 0 : _a2.refresh();
            }
          }, null, _parent));
        } else if (!((_e = unref(A)) == null ? void 0 : _e.totals.length)) {
          _push(ssrRenderComponent(_component_UiEmptyState, {
            title: unref(t)("admin.dash.noData"),
            description: unref(t)("admin.dash.noDataHelp"),
            icon: "list"
          }, null, _parent));
        } else {
          _push(`<div class="grid gap-6 lg:grid-cols-2"><div class="relative overflow-x-auto rounded-lg border border-line bg-surface" role="region"${ssrRenderAttr("aria-label", unref(t)("admin.dash.totals"))} tabindex="0"><table class="w-full border-collapse text-start"><caption class="px-3 py-2 text-start font-bold">${ssrInterpolate(unref(t)("admin.dash.totals"))}</caption><thead class="bg-sunken text-sm text-ink-soft"><tr><th scope="col" class="px-3 py-2 text-start">${ssrInterpolate(unref(t)("admin.dash.event"))}</th><th scope="col" class="px-3 py-2 text-end">${ssrInterpolate(unref(t)("admin.dash.count"))}</th><th scope="col" class="w-1/3 px-3 py-2 text-start"><span class="sr-only">${ssrInterpolate(unref(t)("admin.dash.share"))}</span></th></tr></thead><tbody class="divide-y divide-line"><!--[-->`);
          ssrRenderList(unref(A).totals, (r) => {
            _push(`<tr><th scope="row" class="px-3 py-2 text-start font-medium">${ssrInterpolate(evLabel(r.name))}</th><td class="px-3 py-2 text-end tabular-nums" dir="ltr">${ssrInterpolate(num(r.total))}</td><td class="px-3 py-2" aria-hidden="true"><div class="h-2 rounded-full bg-sunken"><div class="h-2 rounded-full bg-primary" style="${ssrRenderStyle({ inlineSize: `${r.total / unref(maxTotal) * 100}%` })}"></div></div></td></tr>`);
          });
          _push(`<!--]--></tbody></table></div><div class="relative max-h-96 overflow-auto rounded-lg border border-line bg-surface" role="region"${ssrRenderAttr("aria-label", unref(t)("admin.dash.daily"))} tabindex="0"><table class="w-full border-collapse text-start"><caption class="px-3 py-2 text-start font-bold">${ssrInterpolate(unref(t)("admin.dash.daily"))}</caption><thead class="bg-sunken text-sm text-ink-soft"><tr><th scope="col" class="px-3 py-2 text-start">${ssrInterpolate(unref(t)("admin.dash.day"))}</th><th scope="col" class="px-3 py-2 text-end">${ssrInterpolate(unref(t)("admin.dash.count"))}</th><th scope="col" class="w-1/3 px-3 py-2"><span class="sr-only">${ssrInterpolate(unref(t)("admin.dash.share"))}</span></th></tr></thead><tbody class="divide-y divide-line"><!--[-->`);
          ssrRenderList(unref(days), (d) => {
            _push(`<tr><th scope="row" class="px-3 py-2 text-start font-medium" dir="ltr"><time${ssrRenderAttr("datetime", d.day)}>${ssrInterpolate(d.day)}</time></th><td class="px-3 py-2 text-end tabular-nums" dir="ltr">${ssrInterpolate(num(d.total))}</td><td class="px-3 py-2" aria-hidden="true"><div class="h-2 rounded-full bg-sunken"><div class="h-2 rounded-full bg-accent" style="${ssrRenderStyle({ inlineSize: `${d.total / unref(maxDay) * 100}%` })}"></div></div></td></tr>`);
          });
          _push(`<!--]--></tbody></table></div></div>`);
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/admin/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=index-CszV3aLd.mjs.map
