import { u as useAdminSeo, _ as _sfc_main$1 } from './useAdminSeo-DuRYEU0h.mjs';
import { _ as _sfc_main$2 } from './Alert-D-zfMDy5.mjs';
import { _ as _sfc_main$3 } from './Skeleton-BTnKIEst.mjs';
import { u as useI18n, g as useApi, i as _sfc_main$2$1, j as isApiError, _ as _sfc_main$3$1, l as fieldErrors } from './server.mjs';
import { _ as _sfc_main$4 } from './EmptyState-N2xvHts8.mjs';
import { _ as _sfc_main$5 } from './DataTable--nNCrVdv.mjs';
import { _ as _sfc_main$6 } from './Badge-PdKIsny2.mjs';
import { _ as _sfc_main$7 } from './Dialog-D35kg5aY.mjs';
import { _ as _sfc_main$8 } from './Checkbox-PDAPbGXG.mjs';
import { _ as _sfc_main$9 } from './FormField-DFtov8VK.mjs';
import { _ as _sfc_main$a } from './TextInput-BI4efS3_.mjs';
import { _ as _sfc_main$b } from './Select-BjjHKxeN.mjs';
import { defineComponent, withAsyncContext, computed, ref, reactive, unref, withCtx, createTextVNode, toDisplayString, createVNode, openBlock, createBlock, createCommentVNode, withModifiers, Fragment, renderList, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderList } from 'vue/server-renderer';
import { a as formatMinor, m as minorToEuros, f as formatPlanPrice, e as eurosToMinor } from './billing-GlpWdT4D.mjs';
import { u as useToast } from './useToast-BX2bodPv.mjs';
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
import './money-CRo_itTF.mjs';
import './permissions-CcyNKBx7.mjs';
import 'perfect-debounce';

const PLAN_LOCALES = ["ar", "en", "it"];
const PLAN_INTERVALS = ["month", "year"];
const s = (v) => v === null || v === void 0 ? "" : String(v);
const isFreePlan = (p) => p.key === "free";
function planToForm(p) {
  const tr = (l) => {
    var _a, _b;
    return (_b = (_a = p.translations) == null ? void 0 : _a[l]) != null ? _b : {};
  };
  return {
    active: p.active,
    price: minorToEuros(p.price.amount_minor),
    interval: p.price.interval === "year" ? "year" : "month",
    ai_daily_limit: s(p.features.ai_daily_limit),
    human_credits: s(p.features.human_credits),
    reminders_advanced: p.features.reminders_advanced === true,
    document_ai: p.features.document_ai === true,
    names: { ar: s(tr("ar").name), en: s(tr("en").name), it: s(tr("it").name) },
    descriptions: { ar: s(tr("ar").description), en: s(tr("en").description), it: s(tr("it").description) }
  };
}
function validatePlanForm(p, f, maxPriceMinor) {
  const e = {};
  if (!isFreePlan(p)) {
    const minor = eurosToMinor(f.price);
    if (minor === null) e.price_minor = { key: "admin.plans.errors.price" };
    else if (maxPriceMinor !== null && minor > maxPriceMinor) e.price_minor = { key: "admin.plans.errors.priceMax", params: { max: minorToEuros(maxPriceMinor) } };
    else if (f.active && minor === 0) e.active = { key: "admin.plans.errors.activeNeedsPrice" };
  }
  for (const k of ["ai_daily_limit", "human_credits"]) {
    if (f[k].trim() !== "" && !/^\d{1,6}$/.test(f[k].trim())) e[`features.${k}`] = { key: "admin.plans.errors.integer" };
  }
  for (const l of PLAN_LOCALES) {
    const name = f.names[l].trim();
    if (name.length > 80) e[`translations.${l}.name`] = { key: "admin.plans.errors.nameLength" };
    else if (!name && f.descriptions[l].trim()) e[`translations.${l}.name`] = { key: "admin.plans.errors.nameRequired" };
  }
  return e;
}
function buildPlanPatch(p, f) {
  const before = planToForm(p);
  const out = {};
  if (!isFreePlan(p)) {
    if (f.active !== before.active) out.active = f.active;
    const minor = eurosToMinor(f.price);
    if (minor !== null && minor !== p.price.amount_minor) {
      out.price_minor = minor;
      out.currency = "EUR";
    }
    if (f.interval !== before.interval) out.interval = f.interval;
  }
  const features = {};
  for (const k of ["ai_daily_limit", "human_credits"]) {
    if (f[k].trim() !== before[k].trim() && f[k].trim() !== "") features[k] = Number(f[k]);
  }
  for (const k of ["reminders_advanced", "document_ai"]) if (f[k] !== before[k]) features[k] = f[k];
  if (Object.keys(features).length) out.features = features;
  const translations = {};
  for (const l of PLAN_LOCALES) {
    const name = f.names[l].trim();
    const description = f.descriptions[l].trim();
    if (name && (name !== before.names[l].trim() || description !== before.descriptions[l].trim())) translations[l] = { name, ...description ? { description } : {} };
  }
  if (Object.keys(translations).length) out.translations = translations;
  return Object.keys(out).length ? out : null;
}
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "index",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const { t, locale } = useI18n();
    const { request } = useApi();
    const toast = useToast();
    const { can } = usePermissions();
    useAdminSeo(() => t("admin.plans.title"));
    const { data, error, refresh, status: st } = ([__temp, __restore] = withAsyncContext(() => useAsyncData("admin-billing-plans", () => request("admin/billing/plans"))), __temp = await __temp, __restore(), __temp);
    const rows = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.data) != null ? _b : [];
    });
    const meta = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.meta) != null ? _b : {};
    });
    const maxPrice = computed(() => typeof meta.value.max_price_minor === "number" ? meta.value.max_price_minor : null);
    const canManage = computed(() => can("plans.manage"));
    const nameOf = (p) => {
      var _a, _b, _c, _d, _e, _f;
      return ((_b = (_a = p.translations) == null ? void 0 : _a[locale.value]) == null ? void 0 : _b.name) || ((_d = (_c = p.translations) == null ? void 0 : _c.en) == null ? void 0 : _d.name) || ((_f = (_e = p.translations) == null ? void 0 : _e.ar) == null ? void 0 : _f.name) || p.key;
    };
    const priceOf = (p) => formatPlanPrice(p.price, locale.value, { free: t("pricing.free"), interval: (i) => t(`pricing.interval.${i}`) });
    const columns = computed(() => [
      { key: "name", label: t("admin.plans.name") },
      { key: "price", label: t("admin.plans.price") },
      { key: "status", label: t("admin.fields.status") },
      { key: "active_subscriptions", label: t("admin.plans.subscribers") },
      ...canManage.value ? [{ key: "actions", label: t("admin.common.actions") }] : []
    ]);
    const editing = ref(null);
    const form = reactive(planToForm({ active: false, price: { amount_minor: 0, currency: "EUR", interval: "month" }, features: {}, translations: {} }));
    const errors = ref({});
    const failure = ref("");
    const busy = ref(false);
    const notice = ref([]);
    function open(p) {
      editing.value = p;
      errors.value = {};
      failure.value = "";
      Object.assign(form, planToForm(p));
    }
    const free = computed(() => !!editing.value && isFreePlan(editing.value));
    async function save() {
      var _a, _b;
      const p = editing.value;
      if (!p) return;
      failure.value = "";
      const local = validatePlanForm(p, form, maxPrice.value);
      errors.value = Object.fromEntries(Object.entries(local).map(([k, v]) => {
        var _a2;
        return [k, t(v.key, (_a2 = v.params) != null ? _a2 : {})];
      }));
      if (Object.keys(errors.value).length) return;
      const patch = buildPlanPatch(p, form);
      if (!patch) {
        failure.value = t("admin.plans.noChanges");
        return;
      }
      busy.value = true;
      try {
        const res = await request(`admin/billing/plans/${p.key}`, { method: "PATCH", body: patch });
        const warnings = ((_b = (_a = res.meta) == null ? void 0 : _a.warnings) != null ? _b : []).filter((w) => w === "stripe_price_id_overrides_price");
        notice.value = warnings;
        toast.success(t("admin.plans.saved"));
        editing.value = null;
        await refresh();
      } catch (e) {
        errors.value = fieldErrors(e);
        failure.value = isApiError(e) && e.status === 403 ? t("admin.common.forbidden") : isApiError(e) && e.status === 429 ? t("admin.plans.tooMany") : !Object.keys(errors.value).length ? isApiError(e) ? e.message : t("errors.generic") : t("admin.plans.fixErrors");
      } finally {
        busy.value = false;
      }
    }
    const maxLabel = computed(() => maxPrice.value === null ? "" : formatMinor(maxPrice.value, "EUR", locale.value));
    return (_ctx, _push, _parent, _attrs) => {
      const _component_AdminPageHeader = _sfc_main$1;
      const _component_UiAlert = _sfc_main$2;
      const _component_UiSkeleton = _sfc_main$3;
      const _component_UiErrorState = _sfc_main$2$1;
      const _component_UiEmptyState = _sfc_main$4;
      const _component_AdminDataTable = _sfc_main$5;
      const _component_UiBadge = _sfc_main$6;
      const _component_UiButton = _sfc_main$3$1;
      const _component_AdminDialog = _sfc_main$7;
      const _component_UiCheckbox = _sfc_main$8;
      const _component_UiFormField = _sfc_main$9;
      const _component_UiTextInput = _sfc_main$a;
      const _component_UiSelect = _sfc_main$b;
      _push(`<div${ssrRenderAttrs(_attrs)}>`);
      _push(ssrRenderComponent(_component_AdminPageHeader, {
        title: unref(t)("admin.plans.title"),
        description: unref(t)("admin.plans.subtitle"),
        crumbs: [{ label: unref(t)("admin.title"), to: "/admin" }, { label: unref(t)("admin.plans.title") }]
      }, null, _parent));
      if (unref(data) && unref(meta).billing_available === false) {
        _push(ssrRenderComponent(_component_UiAlert, {
          tone: "info",
          class: "mb-4",
          title: unref(t)("pricing.notEnabledTitle"),
          "data-testid": "plans-billing-off"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`${ssrInterpolate(unref(t)("admin.plans.billingOff"))}`);
            } else {
              return [
                createTextVNode(toDisplayString(unref(t)("admin.plans.billingOff")), 1)
              ];
            }
          }),
          _: 1
        }, _parent));
      } else {
        _push(`<!---->`);
      }
      _push(ssrRenderComponent(_component_UiAlert, {
        tone: "warning",
        class: "mb-4",
        "data-testid": "plans-newonly"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`${ssrInterpolate(unref(t)("admin.plans.newCheckoutsOnly"))}`);
          } else {
            return [
              createTextVNode(toDisplayString(unref(t)("admin.plans.newCheckoutsOnly")), 1)
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<div aria-live="polite">`);
      if (unref(notice).includes("stripe_price_id_overrides_price")) {
        _push(ssrRenderComponent(_component_UiAlert, {
          tone: "warning",
          class: "mb-4",
          "data-testid": "plans-stripe-warning",
          title: unref(t)("admin.plans.stripeOverrideTitle")
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`${ssrInterpolate(unref(t)("admin.plans.stripeOverride"))}`);
            } else {
              return [
                createTextVNode(toDisplayString(unref(t)("admin.plans.stripeOverride")), 1)
              ];
            }
          }),
          _: 1
        }, _parent));
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
      if (unref(st) === "pending" && !unref(data)) {
        _push(ssrRenderComponent(_component_UiSkeleton, { lines: 4 }, null, _parent));
      } else if (unref(error)) {
        _push(ssrRenderComponent(_component_UiErrorState, {
          message: unref(isApiError)(unref(error)) && unref(error).status === 403 ? unref(t)("admin.common.forbidden") : unref(isApiError)(unref(error)) ? unref(error).message : void 0,
          retry: "",
          onRetry: ($event) => unref(refresh)()
        }, null, _parent));
      } else if (!unref(rows).length) {
        _push(ssrRenderComponent(_component_UiEmptyState, {
          title: unref(t)("admin.common.noResults"),
          description: unref(t)("admin.common.noResultsHelp"),
          icon: "euro"
        }, null, _parent));
      } else {
        _push(ssrRenderComponent(_component_AdminDataTable, {
          columns: unref(columns),
          rows: unref(rows),
          "row-key": "key",
          caption: unref(t)("admin.plans.title")
        }, {
          "cell-name": withCtx(({ row }, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<span dir="auto" class="font-medium"${_scopeId}>${ssrInterpolate(nameOf(row))}</span> <span class="text-sm text-muted" dir="ltr"${_scopeId}>(${ssrInterpolate(row.key)})</span>`);
            } else {
              return [
                createVNode("span", {
                  dir: "auto",
                  class: "font-medium"
                }, toDisplayString(nameOf(row)), 1),
                createTextVNode(),
                createVNode("span", {
                  class: "text-sm text-muted",
                  dir: "ltr"
                }, "(" + toDisplayString(row.key) + ")", 1)
              ];
            }
          }),
          "cell-price": withCtx(({ row }, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<bdi class="tabular-nums"${_scopeId}>${ssrInterpolate(priceOf(row))}</bdi>`);
            } else {
              return [
                createVNode("bdi", { class: "tabular-nums" }, toDisplayString(priceOf(row)), 1)
              ];
            }
          }),
          "cell-status": withCtx(({ row }, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_UiBadge, {
                tone: row.active ? "success" : "neutral"
              }, {
                default: withCtx((_, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(`${ssrInterpolate(row.active ? unref(t)("admin.plans.active") : unref(t)("admin.plans.inactive"))}`);
                  } else {
                    return [
                      createTextVNode(toDisplayString(row.active ? unref(t)("admin.plans.active") : unref(t)("admin.plans.inactive")), 1)
                    ];
                  }
                }),
                _: 2
              }, _parent2, _scopeId));
              if (row.stripe_price_id_configured) {
                _push2(ssrRenderComponent(_component_UiBadge, {
                  tone: "warning",
                  class: "ms-1"
                }, {
                  default: withCtx((_, _push3, _parent3, _scopeId2) => {
                    if (_push3) {
                      _push3(`${ssrInterpolate(unref(t)("admin.plans.stripePriceBadge"))}`);
                    } else {
                      return [
                        createTextVNode(toDisplayString(unref(t)("admin.plans.stripePriceBadge")), 1)
                      ];
                    }
                  }),
                  _: 2
                }, _parent2, _scopeId));
              } else {
                _push2(`<!---->`);
              }
            } else {
              return [
                createVNode(_component_UiBadge, {
                  tone: row.active ? "success" : "neutral"
                }, {
                  default: withCtx(() => [
                    createTextVNode(toDisplayString(row.active ? unref(t)("admin.plans.active") : unref(t)("admin.plans.inactive")), 1)
                  ]),
                  _: 2
                }, 1032, ["tone"]),
                row.stripe_price_id_configured ? (openBlock(), createBlock(_component_UiBadge, {
                  key: 0,
                  tone: "warning",
                  class: "ms-1"
                }, {
                  default: withCtx(() => [
                    createTextVNode(toDisplayString(unref(t)("admin.plans.stripePriceBadge")), 1)
                  ]),
                  _: 1
                })) : createCommentVNode("", true)
              ];
            }
          }),
          "cell-active_subscriptions": withCtx(({ row }, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<span class="tabular-nums"${_scopeId}>${ssrInterpolate(row.active_subscriptions)}</span>`);
            } else {
              return [
                createVNode("span", { class: "tabular-nums" }, toDisplayString(row.active_subscriptions), 1)
              ];
            }
          }),
          "cell-actions": withCtx(({ row }, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_UiButton, {
                variant: "secondary",
                "data-testid": `edit-${row.key}`,
                onClick: ($event) => open(row)
              }, {
                default: withCtx((_, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(`${ssrInterpolate(unref(t)("admin.common.edit"))}<span class="sr-only"${_scopeId2}>${ssrInterpolate(nameOf(row))}</span>`);
                  } else {
                    return [
                      createTextVNode(toDisplayString(unref(t)("admin.common.edit")), 1),
                      createVNode("span", { class: "sr-only" }, toDisplayString(nameOf(row)), 1)
                    ];
                  }
                }),
                _: 2
              }, _parent2, _scopeId));
            } else {
              return [
                createVNode(_component_UiButton, {
                  variant: "secondary",
                  "data-testid": `edit-${row.key}`,
                  onClick: ($event) => open(row)
                }, {
                  default: withCtx(() => [
                    createTextVNode(toDisplayString(unref(t)("admin.common.edit")), 1),
                    createVNode("span", { class: "sr-only" }, toDisplayString(nameOf(row)), 1)
                  ]),
                  _: 2
                }, 1032, ["data-testid", "onClick"])
              ];
            }
          }),
          _: 1
        }, _parent));
      }
      _push(ssrRenderComponent(_component_AdminDialog, {
        open: !!unref(editing),
        title: unref(t)("admin.plans.edit", { plan: unref(editing) ? nameOf(unref(editing)) : "" }),
        onClose: ($event) => editing.value = null
      }, {
        footer: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_UiButton, {
              variant: "secondary",
              onClick: ($event) => editing.value = null
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`${ssrInterpolate(unref(t)("common.cancel"))}`);
                } else {
                  return [
                    createTextVNode(toDisplayString(unref(t)("common.cancel")), 1)
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(ssrRenderComponent(_component_UiButton, {
              type: "submit",
              loading: unref(busy),
              "data-testid": "plan-save",
              onClick: save
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`${ssrInterpolate(unref(t)("common.save"))}`);
                } else {
                  return [
                    createTextVNode(toDisplayString(unref(t)("common.save")), 1)
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_UiButton, {
                variant: "secondary",
                onClick: ($event) => editing.value = null
              }, {
                default: withCtx(() => [
                  createTextVNode(toDisplayString(unref(t)("common.cancel")), 1)
                ]),
                _: 1
              }, 8, ["onClick"]),
              createVNode(_component_UiButton, {
                type: "submit",
                loading: unref(busy),
                "data-testid": "plan-save",
                onClick: save
              }, {
                default: withCtx(() => [
                  createTextVNode(toDisplayString(unref(t)("common.save")), 1)
                ]),
                _: 1
              }, 8, ["loading"])
            ];
          }
        }),
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            if (unref(editing)) {
              _push2(`<form id="plan-form" class="space-y-5" novalidate${_scopeId}><div aria-live="polite"${_scopeId}>`);
              if (unref(failure)) {
                _push2(ssrRenderComponent(_component_UiAlert, {
                  tone: "danger",
                  "data-testid": "plan-failure"
                }, {
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
              _push2(`</div>`);
              if (unref(editing).stripe_price_id_configured) {
                _push2(ssrRenderComponent(_component_UiAlert, {
                  tone: "warning",
                  title: unref(t)("admin.plans.stripeOverrideTitle")
                }, {
                  default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                    if (_push3) {
                      _push3(`${ssrInterpolate(unref(t)("admin.plans.stripeOverride"))}`);
                    } else {
                      return [
                        createTextVNode(toDisplayString(unref(t)("admin.plans.stripeOverride")), 1)
                      ];
                    }
                  }),
                  _: 1
                }, _parent2, _scopeId));
              } else {
                _push2(`<!---->`);
              }
              if (unref(free)) {
                _push2(ssrRenderComponent(_component_UiAlert, { tone: "info" }, {
                  default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                    if (_push3) {
                      _push3(`${ssrInterpolate(unref(t)("admin.plans.freeLocked"))}`);
                    } else {
                      return [
                        createTextVNode(toDisplayString(unref(t)("admin.plans.freeLocked")), 1)
                      ];
                    }
                  }),
                  _: 1
                }, _parent2, _scopeId));
              } else {
                _push2(`<!---->`);
              }
              _push2(`<fieldset class="space-y-3"${_scopeId}><legend class="text-lg font-bold"${_scopeId}>${ssrInterpolate(unref(t)("admin.plans.pricing"))}</legend>`);
              _push2(ssrRenderComponent(_component_UiCheckbox, {
                modelValue: unref(form).active,
                "onUpdate:modelValue": ($event) => unref(form).active = $event,
                label: unref(t)("admin.plans.activeLabel"),
                description: unref(t)("admin.plans.activeHelp"),
                disabled: unref(free),
                invalid: !!unref(errors).active,
                describedby: unref(errors).active ? "plan-active-err" : void 0
              }, null, _parent2, _scopeId));
              if (unref(errors).active) {
                _push2(`<p id="plan-active-err" class="text-sm font-medium text-danger" role="alert"${_scopeId}>${ssrInterpolate(unref(errors).active)}</p>`);
              } else {
                _push2(`<!---->`);
              }
              _push2(`<div class="grid gap-4 sm:grid-cols-2"${_scopeId}>`);
              _push2(ssrRenderComponent(_component_UiFormField, {
                label: unref(t)("admin.plans.priceEuro"),
                hint: unref(maxLabel) ? unref(t)("admin.plans.priceHint", { max: unref(maxLabel) }) : unref(t)("admin.plans.priceHintNoMax"),
                error: unref(errors).price_minor || unref(errors).currency,
                required: ""
              }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(ssrRenderComponent(_component_UiTextInput, {
                      modelValue: unref(form).price,
                      "onUpdate:modelValue": ($event) => unref(form).price = $event,
                      inputmode: "decimal",
                      ltr: "",
                      disabled: unref(free)
                    }, null, _parent3, _scopeId2));
                  } else {
                    return [
                      createVNode(_component_UiTextInput, {
                        modelValue: unref(form).price,
                        "onUpdate:modelValue": ($event) => unref(form).price = $event,
                        inputmode: "decimal",
                        ltr: "",
                        disabled: unref(free)
                      }, null, 8, ["modelValue", "onUpdate:modelValue", "disabled"])
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
              _push2(ssrRenderComponent(_component_UiFormField, {
                label: unref(t)("admin.plans.interval"),
                error: unref(errors).interval,
                required: ""
              }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(ssrRenderComponent(_component_UiSelect, {
                      modelValue: unref(form).interval,
                      "onUpdate:modelValue": ($event) => unref(form).interval = $event,
                      options: unref(PLAN_INTERVALS).map((i) => ({ value: i, label: unref(t)(`pricing.interval.${i}`) })),
                      disabled: unref(free)
                    }, null, _parent3, _scopeId2));
                  } else {
                    return [
                      createVNode(_component_UiSelect, {
                        modelValue: unref(form).interval,
                        "onUpdate:modelValue": ($event) => unref(form).interval = $event,
                        options: unref(PLAN_INTERVALS).map((i) => ({ value: i, label: unref(t)(`pricing.interval.${i}`) })),
                        disabled: unref(free)
                      }, null, 8, ["modelValue", "onUpdate:modelValue", "options", "disabled"])
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
              _push2(`</div></fieldset><fieldset class="space-y-3"${_scopeId}><legend class="text-lg font-bold"${_scopeId}>${ssrInterpolate(unref(t)("admin.plans.features"))}</legend><div class="grid gap-4 sm:grid-cols-2"${_scopeId}>`);
              _push2(ssrRenderComponent(_component_UiFormField, {
                label: unref(t)("admin.plans.aiDailyLimit"),
                error: unref(errors)["features.ai_daily_limit"]
              }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(ssrRenderComponent(_component_UiTextInput, {
                      modelValue: unref(form).ai_daily_limit,
                      "onUpdate:modelValue": ($event) => unref(form).ai_daily_limit = $event,
                      inputmode: "numeric",
                      ltr: ""
                    }, null, _parent3, _scopeId2));
                  } else {
                    return [
                      createVNode(_component_UiTextInput, {
                        modelValue: unref(form).ai_daily_limit,
                        "onUpdate:modelValue": ($event) => unref(form).ai_daily_limit = $event,
                        inputmode: "numeric",
                        ltr: ""
                      }, null, 8, ["modelValue", "onUpdate:modelValue"])
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
              _push2(ssrRenderComponent(_component_UiFormField, {
                label: unref(t)("admin.plans.humanCredits"),
                error: unref(errors)["features.human_credits"]
              }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(ssrRenderComponent(_component_UiTextInput, {
                      modelValue: unref(form).human_credits,
                      "onUpdate:modelValue": ($event) => unref(form).human_credits = $event,
                      inputmode: "numeric",
                      ltr: ""
                    }, null, _parent3, _scopeId2));
                  } else {
                    return [
                      createVNode(_component_UiTextInput, {
                        modelValue: unref(form).human_credits,
                        "onUpdate:modelValue": ($event) => unref(form).human_credits = $event,
                        inputmode: "numeric",
                        ltr: ""
                      }, null, 8, ["modelValue", "onUpdate:modelValue"])
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
              _push2(`</div>`);
              _push2(ssrRenderComponent(_component_UiCheckbox, {
                modelValue: unref(form).reminders_advanced,
                "onUpdate:modelValue": ($event) => unref(form).reminders_advanced = $event,
                label: unref(t)("pricing.features.reminders_advanced")
              }, null, _parent2, _scopeId));
              _push2(ssrRenderComponent(_component_UiCheckbox, {
                modelValue: unref(form).document_ai,
                "onUpdate:modelValue": ($event) => unref(form).document_ai = $event,
                label: unref(t)("pricing.features.document_ai")
              }, null, _parent2, _scopeId));
              _push2(`</fieldset><fieldset class="space-y-4"${_scopeId}><legend class="text-lg font-bold"${_scopeId}>${ssrInterpolate(unref(t)("admin.plans.texts"))}</legend><!--[-->`);
              ssrRenderList(unref(PLAN_LOCALES), (l) => {
                _push2(`<div class="space-y-3 rounded-md border border-line p-3"${_scopeId}><p class="font-semibold"${_scopeId}>${ssrInterpolate(unref(t)(`languages.${l}`))}</p>`);
                _push2(ssrRenderComponent(_component_UiFormField, {
                  label: unref(t)("admin.plans.name"),
                  error: unref(errors)[`translations.${l}.name`],
                  optional: ""
                }, {
                  default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                    if (_push3) {
                      _push3(ssrRenderComponent(_component_UiTextInput, {
                        modelValue: unref(form).names[l],
                        "onUpdate:modelValue": ($event) => unref(form).names[l] = $event,
                        maxlength: 80,
                        dir: l === "ar" ? "rtl" : "ltr"
                      }, null, _parent3, _scopeId2));
                    } else {
                      return [
                        createVNode(_component_UiTextInput, {
                          modelValue: unref(form).names[l],
                          "onUpdate:modelValue": ($event) => unref(form).names[l] = $event,
                          maxlength: 80,
                          dir: l === "ar" ? "rtl" : "ltr"
                        }, null, 8, ["modelValue", "onUpdate:modelValue", "dir"])
                      ];
                    }
                  }),
                  _: 2
                }, _parent2, _scopeId));
                _push2(ssrRenderComponent(_component_UiFormField, {
                  label: unref(t)("admin.plans.description"),
                  error: unref(errors)[`translations.${l}.description`],
                  optional: ""
                }, {
                  default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                    if (_push3) {
                      _push3(ssrRenderComponent(_component_UiTextInput, {
                        modelValue: unref(form).descriptions[l],
                        "onUpdate:modelValue": ($event) => unref(form).descriptions[l] = $event,
                        maxlength: 300,
                        dir: l === "ar" ? "rtl" : "ltr"
                      }, null, _parent3, _scopeId2));
                    } else {
                      return [
                        createVNode(_component_UiTextInput, {
                          modelValue: unref(form).descriptions[l],
                          "onUpdate:modelValue": ($event) => unref(form).descriptions[l] = $event,
                          maxlength: 300,
                          dir: l === "ar" ? "rtl" : "ltr"
                        }, null, 8, ["modelValue", "onUpdate:modelValue", "dir"])
                      ];
                    }
                  }),
                  _: 2
                }, _parent2, _scopeId));
                _push2(`</div>`);
              });
              _push2(`<!--]--></fieldset></form>`);
            } else {
              _push2(`<!---->`);
            }
          } else {
            return [
              unref(editing) ? (openBlock(), createBlock("form", {
                key: 0,
                id: "plan-form",
                class: "space-y-5",
                novalidate: "",
                onSubmit: withModifiers(save, ["prevent"])
              }, [
                createVNode("div", { "aria-live": "polite" }, [
                  unref(failure) ? (openBlock(), createBlock(_component_UiAlert, {
                    key: 0,
                    tone: "danger",
                    "data-testid": "plan-failure"
                  }, {
                    default: withCtx(() => [
                      createTextVNode(toDisplayString(unref(failure)), 1)
                    ]),
                    _: 1
                  })) : createCommentVNode("", true)
                ]),
                unref(editing).stripe_price_id_configured ? (openBlock(), createBlock(_component_UiAlert, {
                  key: 0,
                  tone: "warning",
                  title: unref(t)("admin.plans.stripeOverrideTitle")
                }, {
                  default: withCtx(() => [
                    createTextVNode(toDisplayString(unref(t)("admin.plans.stripeOverride")), 1)
                  ]),
                  _: 1
                }, 8, ["title"])) : createCommentVNode("", true),
                unref(free) ? (openBlock(), createBlock(_component_UiAlert, {
                  key: 1,
                  tone: "info"
                }, {
                  default: withCtx(() => [
                    createTextVNode(toDisplayString(unref(t)("admin.plans.freeLocked")), 1)
                  ]),
                  _: 1
                })) : createCommentVNode("", true),
                createVNode("fieldset", { class: "space-y-3" }, [
                  createVNode("legend", { class: "text-lg font-bold" }, toDisplayString(unref(t)("admin.plans.pricing")), 1),
                  createVNode(_component_UiCheckbox, {
                    modelValue: unref(form).active,
                    "onUpdate:modelValue": ($event) => unref(form).active = $event,
                    label: unref(t)("admin.plans.activeLabel"),
                    description: unref(t)("admin.plans.activeHelp"),
                    disabled: unref(free),
                    invalid: !!unref(errors).active,
                    describedby: unref(errors).active ? "plan-active-err" : void 0
                  }, null, 8, ["modelValue", "onUpdate:modelValue", "label", "description", "disabled", "invalid", "describedby"]),
                  unref(errors).active ? (openBlock(), createBlock("p", {
                    key: 0,
                    id: "plan-active-err",
                    class: "text-sm font-medium text-danger",
                    role: "alert"
                  }, toDisplayString(unref(errors).active), 1)) : createCommentVNode("", true),
                  createVNode("div", { class: "grid gap-4 sm:grid-cols-2" }, [
                    createVNode(_component_UiFormField, {
                      label: unref(t)("admin.plans.priceEuro"),
                      hint: unref(maxLabel) ? unref(t)("admin.plans.priceHint", { max: unref(maxLabel) }) : unref(t)("admin.plans.priceHintNoMax"),
                      error: unref(errors).price_minor || unref(errors).currency,
                      required: ""
                    }, {
                      default: withCtx(() => [
                        createVNode(_component_UiTextInput, {
                          modelValue: unref(form).price,
                          "onUpdate:modelValue": ($event) => unref(form).price = $event,
                          inputmode: "decimal",
                          ltr: "",
                          disabled: unref(free)
                        }, null, 8, ["modelValue", "onUpdate:modelValue", "disabled"])
                      ]),
                      _: 1
                    }, 8, ["label", "hint", "error"]),
                    createVNode(_component_UiFormField, {
                      label: unref(t)("admin.plans.interval"),
                      error: unref(errors).interval,
                      required: ""
                    }, {
                      default: withCtx(() => [
                        createVNode(_component_UiSelect, {
                          modelValue: unref(form).interval,
                          "onUpdate:modelValue": ($event) => unref(form).interval = $event,
                          options: unref(PLAN_INTERVALS).map((i) => ({ value: i, label: unref(t)(`pricing.interval.${i}`) })),
                          disabled: unref(free)
                        }, null, 8, ["modelValue", "onUpdate:modelValue", "options", "disabled"])
                      ]),
                      _: 1
                    }, 8, ["label", "error"])
                  ])
                ]),
                createVNode("fieldset", { class: "space-y-3" }, [
                  createVNode("legend", { class: "text-lg font-bold" }, toDisplayString(unref(t)("admin.plans.features")), 1),
                  createVNode("div", { class: "grid gap-4 sm:grid-cols-2" }, [
                    createVNode(_component_UiFormField, {
                      label: unref(t)("admin.plans.aiDailyLimit"),
                      error: unref(errors)["features.ai_daily_limit"]
                    }, {
                      default: withCtx(() => [
                        createVNode(_component_UiTextInput, {
                          modelValue: unref(form).ai_daily_limit,
                          "onUpdate:modelValue": ($event) => unref(form).ai_daily_limit = $event,
                          inputmode: "numeric",
                          ltr: ""
                        }, null, 8, ["modelValue", "onUpdate:modelValue"])
                      ]),
                      _: 1
                    }, 8, ["label", "error"]),
                    createVNode(_component_UiFormField, {
                      label: unref(t)("admin.plans.humanCredits"),
                      error: unref(errors)["features.human_credits"]
                    }, {
                      default: withCtx(() => [
                        createVNode(_component_UiTextInput, {
                          modelValue: unref(form).human_credits,
                          "onUpdate:modelValue": ($event) => unref(form).human_credits = $event,
                          inputmode: "numeric",
                          ltr: ""
                        }, null, 8, ["modelValue", "onUpdate:modelValue"])
                      ]),
                      _: 1
                    }, 8, ["label", "error"])
                  ]),
                  createVNode(_component_UiCheckbox, {
                    modelValue: unref(form).reminders_advanced,
                    "onUpdate:modelValue": ($event) => unref(form).reminders_advanced = $event,
                    label: unref(t)("pricing.features.reminders_advanced")
                  }, null, 8, ["modelValue", "onUpdate:modelValue", "label"]),
                  createVNode(_component_UiCheckbox, {
                    modelValue: unref(form).document_ai,
                    "onUpdate:modelValue": ($event) => unref(form).document_ai = $event,
                    label: unref(t)("pricing.features.document_ai")
                  }, null, 8, ["modelValue", "onUpdate:modelValue", "label"])
                ]),
                createVNode("fieldset", { class: "space-y-4" }, [
                  createVNode("legend", { class: "text-lg font-bold" }, toDisplayString(unref(t)("admin.plans.texts")), 1),
                  (openBlock(true), createBlock(Fragment, null, renderList(unref(PLAN_LOCALES), (l) => {
                    return openBlock(), createBlock("div", {
                      key: l,
                      class: "space-y-3 rounded-md border border-line p-3"
                    }, [
                      createVNode("p", { class: "font-semibold" }, toDisplayString(unref(t)(`languages.${l}`)), 1),
                      createVNode(_component_UiFormField, {
                        label: unref(t)("admin.plans.name"),
                        error: unref(errors)[`translations.${l}.name`],
                        optional: ""
                      }, {
                        default: withCtx(() => [
                          createVNode(_component_UiTextInput, {
                            modelValue: unref(form).names[l],
                            "onUpdate:modelValue": ($event) => unref(form).names[l] = $event,
                            maxlength: 80,
                            dir: l === "ar" ? "rtl" : "ltr"
                          }, null, 8, ["modelValue", "onUpdate:modelValue", "dir"])
                        ]),
                        _: 2
                      }, 1032, ["label", "error"]),
                      createVNode(_component_UiFormField, {
                        label: unref(t)("admin.plans.description"),
                        error: unref(errors)[`translations.${l}.description`],
                        optional: ""
                      }, {
                        default: withCtx(() => [
                          createVNode(_component_UiTextInput, {
                            modelValue: unref(form).descriptions[l],
                            "onUpdate:modelValue": ($event) => unref(form).descriptions[l] = $event,
                            maxlength: 300,
                            dir: l === "ar" ? "rtl" : "ltr"
                          }, null, 8, ["modelValue", "onUpdate:modelValue", "dir"])
                        ]),
                        _: 2
                      }, 1032, ["label", "error"])
                    ]);
                  }), 128))
                ])
              ], 32)) : createCommentVNode("", true)
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/admin/plans/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=index-B-VJMSDM.mjs.map
