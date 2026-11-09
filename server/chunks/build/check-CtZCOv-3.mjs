import { _ as _sfc_main$2 } from './Breadcrumbs-C7SaJcTR.mjs';
import { _ as _sfc_main$3 } from './Alert-D-zfMDy5.mjs';
import { _ as _sfc_main$4 } from './VerifyNeeded-mxk-8UjC.mjs';
import { _ as _sfc_main$5 } from './Gate-CrfDaJ02.mjs';
import { u as useI18n, g as useApi, _ as _sfc_main$3$1, d as _sfc_main$5$1, k as formatDate, j as isApiError } from './server.mjs';
import { _ as _sfc_main$c } from './Badge-PdKIsny2.mjs';
import { _ as _sfc_main$d } from './GuideSource-B-ek0Kys.mjs';
import { defineComponent, computed, ref, reactive, mergeProps, unref, withCtx, createTextVNode, toDisplayString, createVNode, openBlock, createBlock, createCommentVNode, nextTick, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderAttr, ssrRenderList } from 'vue/server-renderer';
import { f as formatMoney } from './money-CRo_itTF.mjs';
import { _ as _sfc_main$6 } from './FormField-DFtov8VK.mjs';
import { _ as _sfc_main$7 } from './Textarea-C8QsGxT0.mjs';
import { _ as _sfc_main$8 } from './TextInput-BI4efS3_.mjs';
import { _ as _sfc_main$9 } from './Checkbox-PDAPbGXG.mjs';
import { _ as _sfc_main$a } from './ConfirmInline-sG5Cp32P.mjs';
import { _ as _sfc_main$b } from './Skeleton-BTnKIEst.mjs';
import { u as useToast } from './useToast-BX2bodPv.mjs';
import { u as useSeo } from './useSeo-BU4sLOnV.mjs';
import { u as useConsent } from './useConsent-mKBmxtRH.mjs';
import './safe-B2eSdAXJ.mjs';
import './Links-BHP4RLan.mjs';
import './legal-vAxOkaZS.mjs';
import './asyncData-bKJD5Wmv.mjs';
import 'perfect-debounce';
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

const EXTRA_FIELDS = ["rent_monthly", "utilities_monthly", "condo_fees_monthly", "internet_monthly"];
const DEFAULT_MIN_CHARS = 20;
const DEFAULT_MAX_CHARS = 12e3;
const SEVERITY_TONE = { info: "info", caution: "warning", warning: "danger" };
const SEVERITY_ORDER = { warning: 0, caution: 1, info: 2 };
const sortFlags = (flags) => [...flags].sort((a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity]);
const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "ResultView",
  __ssrInlineRender: true,
  props: {
    result: {}
  },
  setup(__props) {
    const props = __props;
    const { t, te, locale } = useI18n();
    const money = (n) => formatMoney(n, props.result.cost.currency, locale.value, 2);
    const flags = computed(() => sortFlags(props.result.red_flags));
    const facts = computed(() => {
      const f = props.result.facts;
      const rows = [];
      for (const [k, v] of Object.entries(f)) {
        if (v === null || v === void 0 || v === false || Array.isArray(v) && !v.length) continue;
        const label = te(`housing.facts.${k}`) ? t(`housing.facts.${k}`) : k;
        let value;
        if (typeof v === "number") value = k.endsWith("_months") ? t("housing.months", { count: v }) : money(v);
        else if (typeof v === "boolean") value = t("housing.mentioned");
        else if (Array.isArray(v)) value = v.join(", ");
        else value = te(`housing.factValues.${String(v)}`) ? t(`housing.factValues.${String(v)}`) : String(v);
        rows.push({ key: k, label, value });
      }
      return rows;
    });
    const componentLabel = (k) => te(`housing.cost.${k}`) ? t(`housing.cost.${k}`) : k;
    const confidenceTone = computed(() => ({ low: "warning", medium: "info", high: "success" })[props.result.confidence]);
    return (_ctx, _push, _parent, _attrs) => {
      var _a;
      const _component_UiAlert = _sfc_main$3;
      const _component_UiBadge = _sfc_main$c;
      const _component_GuideSource = _sfc_main$d;
      _push(`<div${ssrRenderAttrs(mergeProps({
        class: "space-y-8",
        "data-testid": "housing-result"
      }, _attrs))}>`);
      _push(ssrRenderComponent(_component_UiAlert, {
        tone: unref(confidenceTone) === "warning" ? "warning" : "info",
        title: unref(t)("housing.confidence.title"),
        "data-testid": "housing-confidence"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<p${_scopeId}>`);
            _push2(ssrRenderComponent(_component_UiBadge, { tone: unref(confidenceTone) }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`${ssrInterpolate(unref(t)(`housing.confidence.${__props.result.confidence}`))}`);
                } else {
                  return [
                    createTextVNode(toDisplayString(unref(t)(`housing.confidence.${__props.result.confidence}`)), 1)
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(`</p><p class="mt-1 text-sm"${_scopeId}>${ssrInterpolate(unref(t)("housing.confidence.explain"))}</p>`);
          } else {
            return [
              createVNode("p", null, [
                createVNode(_component_UiBadge, { tone: unref(confidenceTone) }, {
                  default: withCtx(() => [
                    createTextVNode(toDisplayString(unref(t)(`housing.confidence.${__props.result.confidence}`)), 1)
                  ]),
                  _: 1
                }, 8, ["tone"])
              ]),
              createVNode("p", { class: "mt-1 text-sm" }, toDisplayString(unref(t)("housing.confidence.explain")), 1)
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<section aria-labelledby="hr-facts" class="space-y-3"><h2 id="hr-facts" class="text-xl font-bold">${ssrInterpolate(unref(t)("housing.terms.title"))}</h2>`);
      if (!unref(facts).length) {
        _push(`<p class="text-ink-soft">${ssrInterpolate(unref(t)("housing.terms.none"))}</p>`);
      } else {
        _push(`<dl class="grid gap-3 sm:grid-cols-2"><!--[-->`);
        ssrRenderList(unref(facts), (f) => {
          _push(`<div class="rounded-md border border-line bg-surface p-3"><dt class="text-sm text-muted">${ssrInterpolate(f.label)}</dt><dd class="font-semibold"><bdi>${ssrInterpolate(f.value)}</bdi></dd></div>`);
        });
        _push(`<!--]--></dl>`);
      }
      if (__props.result.facts.contract_keywords && __props.result.facts.contract_keywords.length) {
        _push(`<p class="text-sm text-ink-soft">${ssrInterpolate(unref(t)("housing.terms.keywordsNote"))}</p>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</section><section aria-labelledby="hr-flags" class="space-y-3"><h2 id="hr-flags" class="text-xl font-bold">${ssrInterpolate(unref(t)("housing.flags.title"))}</h2><p class="text-sm text-ink-soft">${ssrInterpolate(unref(t)("housing.flags.note"))}</p>`);
      if (!unref(flags).length) {
        _push(`<p class="rounded-md border border-line bg-sunken p-3" data-testid="no-flags">${ssrInterpolate(unref(t)("housing.flags.none"))}</p>`);
      } else {
        _push(`<ul class="space-y-3"><!--[-->`);
        ssrRenderList(unref(flags), (f) => {
          _push(`<li>`);
          _push(ssrRenderComponent(_component_UiAlert, {
            tone: unref(SEVERITY_TONE)[f.severity] === "danger" ? "warning" : unref(SEVERITY_TONE)[f.severity],
            title: f.title
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                if (f.explanation) {
                  _push2(`<p${_scopeId}>${ssrInterpolate(f.explanation)}</p>`);
                } else {
                  _push2(`<!---->`);
                }
                _push2(`<p class="mt-1 flex flex-wrap items-center gap-2 text-sm"${_scopeId}>`);
                _push2(ssrRenderComponent(_component_UiBadge, null, {
                  default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                    if (_push3) {
                      _push3(`${ssrInterpolate(unref(t)(`housing.severity.${f.severity}`))}`);
                    } else {
                      return [
                        createTextVNode(toDisplayString(unref(t)(`housing.severity.${f.severity}`)), 1)
                      ];
                    }
                  }),
                  _: 2
                }, _parent2, _scopeId));
                _push2(ssrRenderComponent(_component_UiBadge, {
                  tone: f.basis === "sourced" ? "info" : "neutral"
                }, {
                  default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                    if (_push3) {
                      _push3(`${ssrInterpolate(unref(t)(`housing.basis.${f.basis}`))}`);
                    } else {
                      return [
                        createTextVNode(toDisplayString(unref(t)(`housing.basis.${f.basis}`)), 1)
                      ];
                    }
                  }),
                  _: 2
                }, _parent2, _scopeId));
                _push2(`</p>`);
                if (f.source) {
                  _push2(ssrRenderComponent(_component_GuideSource, {
                    source: f.source,
                    class: "mt-2"
                  }, null, _parent2, _scopeId));
                } else {
                  _push2(`<!---->`);
                }
              } else {
                return [
                  f.explanation ? (openBlock(), createBlock("p", { key: 0 }, toDisplayString(f.explanation), 1)) : createCommentVNode("", true),
                  createVNode("p", { class: "mt-1 flex flex-wrap items-center gap-2 text-sm" }, [
                    createVNode(_component_UiBadge, null, {
                      default: withCtx(() => [
                        createTextVNode(toDisplayString(unref(t)(`housing.severity.${f.severity}`)), 1)
                      ]),
                      _: 2
                    }, 1024),
                    createVNode(_component_UiBadge, {
                      tone: f.basis === "sourced" ? "info" : "neutral"
                    }, {
                      default: withCtx(() => [
                        createTextVNode(toDisplayString(unref(t)(`housing.basis.${f.basis}`)), 1)
                      ]),
                      _: 2
                    }, 1032, ["tone"])
                  ]),
                  f.source ? (openBlock(), createBlock(_component_GuideSource, {
                    key: 1,
                    source: f.source,
                    class: "mt-2"
                  }, null, 8, ["source"])) : createCommentVNode("", true)
                ];
              }
            }),
            _: 2
          }, _parent));
          _push(`</li>`);
        });
        _push(`<!--]--></ul>`);
      }
      _push(`</section><section aria-labelledby="hr-q" class="space-y-3"><h2 id="hr-q" class="text-xl font-bold">${ssrInterpolate(unref(t)("housing.questions.title"))}</h2>`);
      if (!__props.result.questions.length) {
        _push(`<p class="text-ink-soft">${ssrInterpolate(unref(t)("housing.questions.none"))}</p>`);
      } else {
        _push(`<ul class="space-y-2"><!--[-->`);
        ssrRenderList(__props.result.questions, (q) => {
          var _a2;
          _push(`<li class="rounded-md border border-line bg-surface p-3"><p class="font-medium">${ssrInterpolate((_a2 = q.question) != null ? _a2 : q.title)}</p>`);
          if (q.explanation) {
            _push(`<p class="mt-1 text-sm text-ink-soft">${ssrInterpolate(q.explanation)}</p>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</li>`);
        });
        _push(`<!--]--></ul>`);
      }
      _push(`</section><section aria-labelledby="hr-cost" class="space-y-3"><h2 id="hr-cost" class="text-xl font-bold">${ssrInterpolate(unref(t)("housing.cost.title"))}</h2>`);
      if (__props.result.cost.monthly_total === null) {
        _push(ssrRenderComponent(_component_UiAlert, {
          tone: "warning",
          "data-testid": "no-total"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`${ssrInterpolate(unref(t)("housing.cost.noTotal"))}`);
            } else {
              return [
                createTextVNode(toDisplayString(unref(t)("housing.cost.noTotal")), 1)
              ];
            }
          }),
          _: 1
        }, _parent));
      } else {
        _push(`<!--[--><p class="text-3xl font-bold tabular-nums" data-testid="monthly-total"><bdi>${ssrInterpolate(money(__props.result.cost.monthly_total))}</bdi> <span class="text-base font-normal text-muted">${ssrInterpolate(unref(t)("housing.cost.perMonth"))}</span></p><ul class="divide-y divide-line rounded-md border border-line bg-surface"><!--[-->`);
        ssrRenderList(__props.result.cost.components, (c) => {
          _push(`<li class="flex flex-wrap items-center justify-between gap-2 p-3"><span>${ssrInterpolate(componentLabel(c.key))} `);
          _push(ssrRenderComponent(_component_UiBadge, null, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`${ssrInterpolate(unref(t)(`housing.cost.source.${c.source}`))}`);
              } else {
                return [
                  createTextVNode(toDisplayString(unref(t)(`housing.cost.source.${c.source}`)), 1)
                ];
              }
            }),
            _: 2
          }, _parent));
          _push(`</span><span class="font-semibold tabular-nums"><bdi>${ssrInterpolate(money(c.amount))}</bdi></span></li>`);
        });
        _push(`<!--]--></ul><!--]-->`);
      }
      if (__props.result.cost.one_time.length) {
        _push(`<div class="space-y-2"><h3 class="font-semibold">${ssrInterpolate(unref(t)("housing.cost.oneTime"))}</h3><p class="text-sm text-ink-soft">${ssrInterpolate(unref(t)("housing.cost.oneTimeNote"))}</p><ul class="divide-y divide-line rounded-md border border-line bg-surface"><!--[-->`);
        ssrRenderList(__props.result.cost.one_time, (c) => {
          _push(`<li class="flex flex-wrap items-center justify-between gap-2 p-3"><span>${ssrInterpolate(componentLabel(c.key))}`);
          if (c.derived) {
            _push(`<!--[--> (${ssrInterpolate(unref(t)("housing.cost.derived"))})<!--]-->`);
          } else {
            _push(`<!---->`);
          }
          _push(`</span><span class="font-semibold tabular-nums"><bdi>${ssrInterpolate(money(c.amount))}</bdi></span></li>`);
        });
        _push(`<!--]--></ul></div>`);
      } else {
        _push(`<!---->`);
      }
      if (__props.result.cost.assumptions.length) {
        _push(`<div><h3 class="mb-1 font-semibold">${ssrInterpolate(unref(t)("housing.cost.assumptions"))}</h3><ul class="list-disc space-y-1 ps-5 text-ink-soft" data-testid="assumptions"><!--[-->`);
        ssrRenderList(__props.result.cost.assumptions, (a) => {
          _push(`<li>${ssrInterpolate(a.text)}</li>`);
        });
        _push(`<!--]--></ul></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</section><section aria-labelledby="hr-missing" class="space-y-3"><h2 id="hr-missing" class="text-xl font-bold">${ssrInterpolate(unref(t)("housing.missing.title"))}</h2>`);
      if (!__props.result.could_not_detect.length) {
        _push(`<p class="text-ink-soft">${ssrInterpolate(unref(t)("housing.missing.none"))}</p>`);
      } else {
        _push(`<!--[--><p class="text-sm text-ink-soft">${ssrInterpolate(unref(t)("housing.missing.note"))}</p><ul class="flex flex-wrap gap-2" data-testid="could-not-detect"><!--[-->`);
        ssrRenderList(__props.result.could_not_detect, (m) => {
          _push(`<li>`);
          _push(ssrRenderComponent(_component_UiBadge, { tone: "warning" }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`${ssrInterpolate(m.label)}`);
              } else {
                return [
                  createTextVNode(toDisplayString(m.label), 1)
                ];
              }
            }),
            _: 2
          }, _parent));
          _push(`</li>`);
        });
        _push(`<!--]--></ul><!--]-->`);
      }
      _push(`</section>`);
      if ((_a = __props.result.notes) == null ? void 0 : _a.length) {
        _push(`<section aria-labelledby="hr-notes" class="space-y-2"><h2 id="hr-notes" class="text-xl font-bold">${ssrInterpolate(unref(t)("housing.notes"))}</h2><ul class="list-disc space-y-1 ps-5 text-ink-soft"><!--[-->`);
        ssrRenderList(__props.result.notes, (n) => {
          _push(`<li>${ssrInterpolate(n.text)}</li>`);
        });
        _push(`<!--]--></ul></section>`);
      } else {
        _push(`<!---->`);
      }
      if (__props.result.explanation) {
        _push(`<section aria-labelledby="hr-ai" class="space-y-2"><h2 id="hr-ai" class="text-xl font-bold">${ssrInterpolate(unref(t)("housing.explanation.title"))}</h2>`);
        _push(ssrRenderComponent(_component_UiBadge, { tone: "info" }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`${ssrInterpolate(unref(t)("housing.explanation.label"))}`);
            } else {
              return [
                createTextVNode(toDisplayString(unref(t)("housing.explanation.label")), 1)
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`<p class="prose-plain" dir="auto">${ssrInterpolate(__props.result.explanation.text)}</p></section>`);
      } else if (__props.result.explanation_status === "unavailable") {
        _push(ssrRenderComponent(_component_UiAlert, { tone: "info" }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`${ssrInterpolate(unref(t)("housing.explanation.unavailable"))}`);
            } else {
              return [
                createTextVNode(toDisplayString(unref(t)("housing.explanation.unavailable")), 1)
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
        title: unref(t)("housing.disclaimerTitle"),
        "data-testid": "housing-disclaimer"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`${ssrInterpolate(__props.result.disclaimer)}`);
          } else {
            return [
              createTextVNode(toDisplayString(__props.result.disclaimer), 1)
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<p class="text-sm text-muted" data-testid="housing-saved-note">${ssrInterpolate(__props.result.persisted ? unref(t)("housing.savedYes") : unref(t)("housing.savedNo"))}</p></div>`);
    };
  }
});
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/housing/ResultView.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "check",
  __ssrInlineRender: true,
  setup(__props) {
    const { t, locale } = useI18n();
    const { request } = useApi();
    const toast = useToast();
    useSeo(() => ({ title: t("housing.check.title"), description: t("housing.check.subtitle"), noindex: true }));
    const crumbs = computed(() => [{ label: t("housing.title"), to: "/housing" }, { label: t("housing.check.title") }]);
    const usage = ref(null);
    const limits = computed(() => {
      var _a, _b;
      return { min: DEFAULT_MIN_CHARS, max: (_b = (_a = usage.value) == null ? void 0 : _a.max_chars) != null ? _b : DEFAULT_MAX_CHARS };
    });
    const { granted } = useConsent("housing_analysis");
    const form = reactive({ text: "", extra: Object.fromEntries(EXTRA_FIELDS.map((k) => [k, ""])), explain: false, save: false, label: "" });
    const errors = ref({});
    const submitting = ref(false);
    const needConsent = ref(false);
    const needVerify = ref(false);
    const notice = ref(null);
    const result = ref(null);
    const resultEl = ref(null);
    function again() {
      result.value = null;
    }
    const saved = ref(null);
    const savedError = ref(false);
    async function loadSaved() {
      try {
        saved.value = (await request("housing/checks", { handle401: false })).data;
        savedError.value = false;
      } catch {
        saved.value = null;
        savedError.value = true;
      }
    }
    const confirmId = ref(null);
    const busyId = ref(null);
    async function openSaved(id) {
      var _a;
      busyId.value = id;
      try {
        const res = await request(`housing/checks/${id}`);
        result.value = { ...res.data.result, persisted: true, saved_id: id };
        await nextTick();
        (_a = resultEl.value) == null ? void 0 : _a.focus();
      } catch (e) {
        toast.error(isApiError(e) ? e.message : t("errors.generic"));
      } finally {
        busyId.value = null;
      }
    }
    async function removeSaved(id) {
      busyId.value = id;
      try {
        await request(`housing/checks/${id}`, { method: "DELETE" });
        toast.success(t("housing.saved.deleted"));
        confirmId.value = null;
        await loadSaved();
      } catch (e) {
        toast.error(isApiError(e) ? e.message : t("errors.generic"));
      } finally {
        busyId.value = null;
      }
    }
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UiBreadcrumbs = _sfc_main$2;
      const _component_UiAlert = _sfc_main$3;
      const _component_AuthVerifyNeeded = _sfc_main$4;
      const _component_ConsentGate = _sfc_main$5;
      const _component_UiButton = _sfc_main$3$1;
      const _component_UiIcon = _sfc_main$5$1;
      const _component_HousingResultView = _sfc_main$1;
      const _component_UiFormField = _sfc_main$6;
      const _component_UiTextarea = _sfc_main$7;
      const _component_UiTextInput = _sfc_main$8;
      const _component_UiCheckbox = _sfc_main$9;
      const _component_UiConfirmInline = _sfc_main$a;
      const _component_UiSkeleton = _sfc_main$b;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "container-page max-w-3xl py-8 sm:py-12" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_UiBreadcrumbs, {
        items: unref(crumbs),
        class: "mb-6"
      }, null, _parent));
      _push(`<header class="mb-6 space-y-2"><h1 class="text-2xl font-bold sm:text-3xl">${ssrInterpolate(unref(t)("housing.check.title"))}</h1><p class="text-ink-soft">${ssrInterpolate(unref(t)("housing.check.subtitle"))}</p></header>`);
      _push(ssrRenderComponent(_component_UiAlert, {
        tone: "info",
        class: "mb-6",
        "data-testid": "housing-privacy"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`${ssrInterpolate(unref(t)("housing.check.privacy"))}`);
          } else {
            return [
              createTextVNode(toDisplayString(unref(t)("housing.check.privacy")), 1)
            ];
          }
        }),
        _: 1
      }, _parent));
      if (unref(needVerify)) {
        _push(ssrRenderComponent(_component_AuthVerifyNeeded, { class: "mb-6" }, null, _parent));
      } else {
        _push(`<!---->`);
      }
      if (unref(granted) === false || unref(needConsent)) {
        _push(ssrRenderComponent(_component_ConsentGate, {
          purpose: "housing_analysis",
          class: "mb-6",
          onGranted: ($event) => {
            granted.value = true;
            needConsent.value = false;
          }
        }, null, _parent));
      } else {
        _push(`<!---->`);
      }
      if (unref(result)) {
        _push(`<div tabindex="-1" class="space-y-6 outline-none"${ssrRenderAttr("aria-label", unref(t)("housing.check.resultTitle"))}><div class="flex flex-wrap items-center justify-between gap-3"><h2 class="text-2xl font-bold">${ssrInterpolate(unref(t)("housing.check.resultTitle"))}</h2>`);
        _push(ssrRenderComponent(_component_UiButton, {
          variant: "secondary",
          onClick: again
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_UiIcon, {
                name: "refresh",
                size: 18
              }, null, _parent2, _scopeId));
              _push2(`${ssrInterpolate(unref(t)("housing.check.another"))}`);
            } else {
              return [
                createVNode(_component_UiIcon, {
                  name: "refresh",
                  size: 18
                }),
                createTextVNode(toDisplayString(unref(t)("housing.check.another")), 1)
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div>`);
        _push(ssrRenderComponent(_component_HousingResultView, { result: unref(result) }, null, _parent));
        _push(`</div>`);
      } else {
        _push(`<!--[-->`);
        if (unref(usage) && unref(usage).remaining !== null) {
          _push(`<p class="mb-4 text-sm text-muted" data-testid="housing-usage">${ssrInterpolate(unref(t)("housing.check.remaining", { count: unref(usage).remaining }))}</p>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<form class="space-y-5" novalidate>`);
        _push(ssrRenderComponent(_component_UiFormField, {
          label: unref(t)("housing.check.text"),
          hint: unref(t)("housing.check.textHint", { min: unref(limits).min, max: unref(limits).max }),
          error: unref(errors).text,
          required: ""
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_UiTextarea, {
                modelValue: unref(form).text,
                "onUpdate:modelValue": ($event) => unref(form).text = $event,
                rows: 10,
                maxlength: unref(limits).max + 2e3
              }, null, _parent2, _scopeId));
            } else {
              return [
                createVNode(_component_UiTextarea, {
                  modelValue: unref(form).text,
                  "onUpdate:modelValue": ($event) => unref(form).text = $event,
                  rows: 10,
                  maxlength: unref(limits).max + 2e3
                }, null, 8, ["modelValue", "onUpdate:modelValue", "maxlength"])
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`<p class="text-sm text-muted" aria-live="polite"><bdi>${ssrInterpolate(unref(form).text.trim().length)}</bdi> / <bdi>${ssrInterpolate(unref(limits).max)}</bdi></p><fieldset class="space-y-3 rounded-lg border border-line p-4"><legend class="px-2 font-semibold">${ssrInterpolate(unref(t)("housing.check.extraTitle"))}</legend><p class="text-sm text-ink-soft">${ssrInterpolate(unref(t)("housing.check.extraHint"))}</p><div class="grid gap-4 sm:grid-cols-2"><!--[-->`);
        ssrRenderList(unref(EXTRA_FIELDS), (k) => {
          var _a;
          _push(ssrRenderComponent(_component_UiFormField, {
            key: k,
            label: unref(t)(`housing.check.extra.${k}`),
            error: (_a = unref(errors)[k]) != null ? _a : unref(errors)[`extra.${k}`],
            optional: ""
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(ssrRenderComponent(_component_UiTextInput, {
                  modelValue: unref(form).extra[k],
                  "onUpdate:modelValue": ($event) => unref(form).extra[k] = $event,
                  inputmode: "decimal",
                  ltr: "",
                  maxlength: 12
                }, null, _parent2, _scopeId));
              } else {
                return [
                  createVNode(_component_UiTextInput, {
                    modelValue: unref(form).extra[k],
                    "onUpdate:modelValue": ($event) => unref(form).extra[k] = $event,
                    inputmode: "decimal",
                    ltr: "",
                    maxlength: 12
                  }, null, 8, ["modelValue", "onUpdate:modelValue"])
                ];
              }
            }),
            _: 2
          }, _parent));
        });
        _push(`<!--]--></div></fieldset>`);
        _push(ssrRenderComponent(_component_UiCheckbox, {
          modelValue: unref(form).explain,
          "onUpdate:modelValue": ($event) => unref(form).explain = $event,
          label: unref(t)("housing.check.explain"),
          description: unref(t)("housing.check.explainHint")
        }, null, _parent));
        _push(`<div class="space-y-2 rounded-lg border border-line p-4">`);
        _push(ssrRenderComponent(_component_UiCheckbox, {
          modelValue: unref(form).save,
          "onUpdate:modelValue": ($event) => unref(form).save = $event,
          label: unref(t)("housing.check.save"),
          description: unref(t)("housing.check.saveHint")
        }, null, _parent));
        if (unref(form).save) {
          _push(ssrRenderComponent(_component_UiFormField, {
            label: unref(t)("housing.check.label"),
            optional: ""
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(ssrRenderComponent(_component_UiTextInput, {
                  modelValue: unref(form).label,
                  "onUpdate:modelValue": ($event) => unref(form).label = $event,
                  maxlength: 100
                }, null, _parent2, _scopeId));
              } else {
                return [
                  createVNode(_component_UiTextInput, {
                    modelValue: unref(form).label,
                    "onUpdate:modelValue": ($event) => unref(form).label = $event,
                    maxlength: 100
                  }, null, 8, ["modelValue", "onUpdate:modelValue"])
                ];
              }
            }),
            _: 1
          }, _parent));
        } else {
          _push(`<!---->`);
        }
        _push(`</div>`);
        if (unref(notice)) {
          _push(ssrRenderComponent(_component_UiAlert, {
            tone: unref(notice).tone,
            "data-testid": "housing-notice"
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`${ssrInterpolate(unref(notice).text)}`);
              } else {
                return [
                  createTextVNode(toDisplayString(unref(notice).text), 1)
                ];
              }
            }),
            _: 1
          }, _parent));
        } else {
          _push(`<!---->`);
        }
        _push(ssrRenderComponent(_component_UiButton, {
          type: "submit",
          size: "lg",
          loading: unref(submitting)
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_UiIcon, {
                name: "search",
                size: 18
              }, null, _parent2, _scopeId));
              _push2(`${ssrInterpolate(unref(t)("housing.check.submit"))}`);
            } else {
              return [
                createVNode(_component_UiIcon, {
                  name: "search",
                  size: 18
                }),
                createTextVNode(toDisplayString(unref(t)("housing.check.submit")), 1)
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</form><section class="mt-10 space-y-3" aria-labelledby="sv-h"><h2 id="sv-h" class="text-xl font-bold">${ssrInterpolate(unref(t)("housing.saved.title"))}</h2><p class="text-sm text-ink-soft">${ssrInterpolate(unref(t)("housing.saved.note"))}</p>`);
        if (unref(savedError)) {
          _push(ssrRenderComponent(_component_UiAlert, { tone: "warning" }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`${ssrInterpolate(unref(t)("housing.saved.unavailable"))}`);
              } else {
                return [
                  createTextVNode(toDisplayString(unref(t)("housing.saved.unavailable")), 1)
                ];
              }
            }),
            _: 1
          }, _parent));
        } else if (unref(saved) && !unref(saved).length) {
          _push(`<p class="text-muted">${ssrInterpolate(unref(t)("housing.saved.empty"))}</p>`);
        } else if (unref(saved)) {
          _push(`<ul class="divide-y divide-line rounded-md border border-line bg-surface"><!--[-->`);
          ssrRenderList(unref(saved), (s) => {
            var _a;
            _push(`<li class="space-y-2 p-3"><div class="flex flex-wrap items-center justify-between gap-2"><p class="min-w-0 font-medium" dir="auto">${ssrInterpolate((_a = s.label) != null ? _a : unref(t)("housing.saved.unnamed"))} <span class="text-sm font-normal text-muted"><bdi>${ssrInterpolate(unref(formatDate)(s.created_at, unref(locale)))}</bdi></span></p><div class="flex gap-2">`);
            _push(ssrRenderComponent(_component_UiButton, {
              variant: "secondary",
              loading: unref(busyId) === s.id,
              onClick: ($event) => openSaved(s.id)
            }, {
              default: withCtx((_, _push2, _parent2, _scopeId) => {
                if (_push2) {
                  _push2(`${ssrInterpolate(unref(t)("housing.saved.open"))}`);
                } else {
                  return [
                    createTextVNode(toDisplayString(unref(t)("housing.saved.open")), 1)
                  ];
                }
              }),
              _: 2
            }, _parent));
            _push(ssrRenderComponent(_component_UiButton, {
              variant: "ghost",
              onClick: ($event) => confirmId.value = s.id
            }, {
              default: withCtx((_, _push2, _parent2, _scopeId) => {
                if (_push2) {
                  _push2(`${ssrInterpolate(unref(t)("common.delete"))}`);
                } else {
                  return [
                    createTextVNode(toDisplayString(unref(t)("common.delete")), 1)
                  ];
                }
              }),
              _: 2
            }, _parent));
            _push(`</div></div>`);
            if (unref(confirmId) === s.id) {
              _push(ssrRenderComponent(_component_UiConfirmInline, {
                message: unref(t)("housing.saved.deleteConfirm"),
                "confirm-label": unref(t)("common.delete"),
                loading: unref(busyId) === s.id,
                onConfirm: ($event) => removeSaved(s.id),
                onCancel: ($event) => confirmId.value = null
              }, null, _parent));
            } else {
              _push(`<!---->`);
            }
            _push(`</li>`);
          });
          _push(`<!--]--></ul>`);
        } else {
          _push(`<div aria-busy="true">`);
          _push(ssrRenderComponent(_component_UiSkeleton, { lines: 2 }, null, _parent));
          _push(`</div>`);
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/housing/check.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=check-CtZCOv-3.mjs.map
