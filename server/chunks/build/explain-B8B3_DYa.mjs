import { _ as _sfc_main$2 } from './Breadcrumbs-C7SaJcTR.mjs';
import { _ as _sfc_main$3 } from './Alert-D-zfMDy5.mjs';
import { _ as _sfc_main$4 } from './VerifyNeeded-mxk-8UjC.mjs';
import { _ as _sfc_main$5 } from './Gate-CrfDaJ02.mjs';
import { u as useI18n, g as useApi, _ as _sfc_main$3$1, d as _sfc_main$5$1, c as useLocalePath, z as formatDay, e as __nuxt_component_0 } from './server.mjs';
import { _ as _sfc_main$9 } from './Badge-PdKIsny2.mjs';
import { _ as _sfc_main$a } from './SourceBadge-4_eAChkr.mjs';
import { defineComponent, computed, ref, mergeProps, unref, withCtx, createTextVNode, toDisplayString, createVNode, isRef, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderAttr, ssrRenderList } from 'vue/server-renderer';
import { D as DEFAULT_MAX_FILE_KB, a as DEFAULT_MAX_TEXT, M as MIN_TEXT, E as EXPLAIN_ACCEPT, k as keyDateViews, b as actionViews, v as validateExplainFile, c as confidencePercent } from './explain-B6AMfDd9.mjs';
import { a as safeHttpsUrl } from './safe-B2eSdAXJ.mjs';
import { _ as _sfc_main$6 } from './FormField-DFtov8VK.mjs';
import { _ as _sfc_main$7 } from './Textarea-C8QsGxT0.mjs';
import { _ as _sfc_main$8 } from './FileInput-CgCeuTL_.mjs';
import { f as formatBytes } from './documents-DL9ve8rH.mjs';
import { u as useSeo } from './useSeo-BU4sLOnV.mjs';
import { u as useConsent } from './useConsent-mKBmxtRH.mjs';
import './useToast-BX2bodPv.mjs';
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
import './routes-BNQ9Jhms.mjs';

const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "Result",
  __ssrInlineRender: true,
  props: {
    result: {}
  },
  setup(__props) {
    const props = __props;
    const { t, te, locale } = useI18n();
    const localePath = useLocalePath();
    const dates = computed(() => keyDateViews(props.result.key_dates));
    const actions = computed(() => actionViews(props.result.suggested_actions));
    const conf = computed(() => {
      const c = props.result.classification.confidence;
      const p = confidencePercent(c);
      if (p !== null) return `${p}%`;
      return typeof c === "string" && te(`explain.confidenceText.${c}`) ? t(`explain.confidenceText.${c}`) : null;
    });
    const sources = computed(() => props.result.sources.map((s) => ({ ...s, safe: safeHttpsUrl(s.url) })));
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UiAlert = _sfc_main$3;
      const _component_UiBadge = _sfc_main$9;
      const _component_NuxtLink = __nuxt_component_0;
      const _component_UiSourceBadge = _sfc_main$a;
      const _component_UiIcon = _sfc_main$5$1;
      _push(`<div${ssrRenderAttrs(mergeProps({
        class: "space-y-8",
        "data-testid": "explain-result"
      }, _attrs))}>`);
      if (__props.result.degraded) {
        _push(ssrRenderComponent(_component_UiAlert, {
          tone: "info",
          "data-testid": "explain-degraded"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`${ssrInterpolate(unref(t)("explain.degraded"))}`);
            } else {
              return [
                createTextVNode(toDisplayString(unref(t)("explain.degraded")), 1)
              ];
            }
          }),
          _: 1
        }, _parent));
      } else {
        _push(`<!---->`);
      }
      _push(`<section aria-labelledby="ex-class" class="space-y-2"><h2 id="ex-class" class="text-xl font-bold">${ssrInterpolate(unref(t)("explain.classification"))}</h2><p class="flex flex-wrap items-center gap-2"><span class="text-lg font-semibold" data-testid="explain-type">${ssrInterpolate(__props.result.classification.type_label)}</span>`);
      if (unref(conf)) {
        _push(ssrRenderComponent(_component_UiBadge, { "data-testid": "explain-confidence" }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`${ssrInterpolate(unref(t)("explain.confidence", { value: unref(conf) }))}`);
            } else {
              return [
                createTextVNode(toDisplayString(unref(t)("explain.confidence", { value: unref(conf) })), 1)
              ];
            }
          }),
          _: 1
        }, _parent));
      } else {
        _push(`<!---->`);
      }
      _push(ssrRenderComponent(_component_UiBadge, { tone: "info" }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`${ssrInterpolate(__props.result.label_text)}`);
          } else {
            return [
              createTextVNode(toDisplayString(__props.result.label_text), 1)
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</p><p class="text-sm text-muted">${ssrInterpolate(unref(t)("explain.classificationNote"))}</p></section><section aria-labelledby="ex-sum" class="space-y-2"><h2 id="ex-sum" class="text-xl font-bold">${ssrInterpolate(unref(t)("explain.summary"))}</h2>`);
      if (__props.result.summary) {
        _push(`<p class="prose-plain" dir="auto" data-testid="explain-summary">${ssrInterpolate(__props.result.summary)}</p>`);
      } else {
        _push(`<p class="text-ink-soft">${ssrInterpolate(unref(t)("explain.degraded"))}</p>`);
      }
      _push(`</section><section aria-labelledby="ex-dates" class="space-y-2"><h2 id="ex-dates" class="text-xl font-bold">${ssrInterpolate(unref(t)("explain.dates"))}</h2>`);
      if (!unref(dates).length) {
        _push(`<p class="text-ink-soft">${ssrInterpolate(unref(t)("explain.datesNone"))}</p>`);
      } else {
        _push(`<ul class="divide-y divide-line rounded-md border border-line bg-surface" data-testid="explain-dates"><!--[-->`);
        ssrRenderList(unref(dates), (d, i) => {
          _push(`<li class="space-y-1 p-3"><p class="font-medium" dir="auto">${ssrInterpolate(d.label)}</p>`);
          if (d.date) {
            _push(`<p class="flex flex-wrap items-center gap-2"><time${ssrRenderAttr("datetime", d.date)}><bdi>${ssrInterpolate(unref(formatDay)(d.date, unref(locale)))}</bdi></time>`);
            if (d.past) {
              _push(ssrRenderComponent(_component_UiBadge, { tone: "warning" }, {
                default: withCtx((_, _push2, _parent2, _scopeId) => {
                  if (_push2) {
                    _push2(`${ssrInterpolate(unref(t)("explain.datePast"))}`);
                  } else {
                    return [
                      createTextVNode(toDisplayString(unref(t)("explain.datePast")), 1)
                    ];
                  }
                }),
                _: 2
              }, _parent));
            } else {
              _push(`<!---->`);
            }
            if (d.yearMissing) {
              _push(ssrRenderComponent(_component_UiBadge, null, {
                default: withCtx((_, _push2, _parent2, _scopeId) => {
                  if (_push2) {
                    _push2(`${ssrInterpolate(unref(t)("explain.yearMissing"))}`);
                  } else {
                    return [
                      createTextVNode(toDisplayString(unref(t)("explain.yearMissing")), 1)
                    ];
                  }
                }),
                _: 2
              }, _parent));
            } else {
              _push(`<!---->`);
            }
            _push(`</p>`);
          } else {
            _push(`<p class="text-warning" data-testid="date-unclear">${ssrInterpolate(unref(t)("explain.dateUnclear"))}</p>`);
          }
          if (d.text) {
            _push(`<p class="text-sm text-ink-soft" dir="auto">${ssrInterpolate(unref(t)("explain.dateText", { text: d.text }))}</p>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</li>`);
        });
        _push(`<!--]--></ul>`);
      }
      _push(`</section><section aria-labelledby="ex-act" class="space-y-2"><h2 id="ex-act" class="text-xl font-bold">${ssrInterpolate(unref(t)("explain.actions"))}</h2>`);
      if (!unref(actions).length) {
        _push(`<p class="text-ink-soft">${ssrInterpolate(unref(t)("explain.actionsNone"))}</p>`);
      } else {
        _push(`<!--[--><p class="text-sm text-ink-soft">${ssrInterpolate(unref(t)("explain.actionsNote"))}</p><ul class="space-y-2" data-testid="explain-actions"><!--[-->`);
        ssrRenderList(unref(actions), (a, i) => {
          _push(`<li class="flex flex-wrap items-center gap-2 rounded-md border border-line bg-surface p-3">`);
          _push(ssrRenderComponent(_component_UiBadge, null, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`${ssrInterpolate(unref(t)(`explain.actionTypes.${a.type}`))}`);
              } else {
                return [
                  createTextVNode(toDisplayString(unref(t)(`explain.actionTypes.${a.type}`)), 1)
                ];
              }
            }),
            _: 2
          }, _parent));
          if (a.path) {
            _push(ssrRenderComponent(_component_NuxtLink, {
              to: unref(localePath)(a.path),
              class: "inline-flex min-h-touch items-center font-medium text-primary-strong underline underline-offset-4"
            }, {
              default: withCtx((_, _push2, _parent2, _scopeId) => {
                if (_push2) {
                  _push2(`${ssrInterpolate(a.label)}`);
                } else {
                  return [
                    createTextVNode(toDisplayString(a.label), 1)
                  ];
                }
              }),
              _: 2
            }, _parent));
          } else {
            _push(`<span class="font-medium">${ssrInterpolate(a.label)}</span>`);
          }
          if (a.date) {
            _push(`<span class="text-sm text-muted">${ssrInterpolate(unref(t)("explain.actionDate", { date: unref(formatDay)(a.date, unref(locale)) }))}</span>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</li>`);
        });
        _push(`<!--]--></ul><!--]-->`);
      }
      _push(`</section>`);
      if (unref(sources).length) {
        _push(`<section aria-labelledby="ex-src" class="space-y-2"><h2 id="ex-src" class="text-xl font-bold">${ssrInterpolate(unref(t)("explain.sources"))}</h2><ul class="space-y-2"><!--[-->`);
        ssrRenderList(unref(sources), (s, i) => {
          _push(`<li class="flex flex-wrap items-center gap-2 rounded-md border border-line bg-surface p-3">`);
          _push(ssrRenderComponent(_component_UiSourceBadge, {
            type: s.type
          }, null, _parent));
          if (s.safe) {
            _push(`<a${ssrRenderAttr("href", s.safe)} target="_blank" rel="noopener noreferrer" class="inline-flex min-h-touch items-center gap-1 font-medium text-primary-strong underline underline-offset-4">${ssrInterpolate(s.title)}`);
            _push(ssrRenderComponent(_component_UiIcon, {
              name: "external",
              size: 14
            }, null, _parent));
            _push(`<span class="sr-only">${ssrInterpolate(unref(t)("a11y.opensNewTab"))}</span></a>`);
          } else {
            _push(`<span class="font-medium">${ssrInterpolate(s.title)}</span>`);
          }
          if (s.name) {
            _push(`<span class="text-sm text-muted">${ssrInterpolate(s.name)}</span>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</li>`);
        });
        _push(`<!--]--></ul></section>`);
      } else {
        _push(`<!---->`);
      }
      _push(ssrRenderComponent(_component_UiAlert, {
        tone: "warning",
        title: unref(t)("explain.disclaimerTitle"),
        "data-testid": "explain-disclaimer"
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
      _push(`<p class="text-sm text-muted" data-testid="explain-stored">${ssrInterpolate(unref(t)("explain.stored"))}</p></div>`);
    };
  }
});
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/explain/Result.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "explain",
  __ssrInlineRender: true,
  setup(__props) {
    const { t, locale } = useI18n();
    useApi();
    useSeo(() => ({ title: t("explain.seo.title"), description: t("explain.seo.description"), noindex: true }));
    const crumbs = computed(() => [{ label: t("documents.title"), to: "/documents" }, { label: t("explain.title") }]);
    const usage = ref(null);
    const mode = ref("text");
    const maxKb = computed(() => {
      var _a, _b;
      return (_b = (_a = usage.value) == null ? void 0 : _a.max_file_kb) != null ? _b : DEFAULT_MAX_FILE_KB;
    });
    const maxText = computed(() => {
      var _a, _b;
      return (_b = (_a = usage.value) == null ? void 0 : _a.max_text_chars) != null ? _b : DEFAULT_MAX_TEXT;
    });
    const ocrAvailable = computed(() => {
      var _a;
      return ((_a = usage.value) == null ? void 0 : _a.ocr_available) !== false;
    });
    const { granted } = useConsent("document_analysis");
    const text = ref("");
    const picked = ref(null);
    const fileInput = ref(null);
    const fileError = ref();
    const textError = ref();
    const notice = ref(null);
    const submitting = ref(false);
    const needConsent = ref(false);
    const needVerify = ref(false);
    const result = ref(null);
    ref(null);
    const sizeLabel = computed(() => formatBytes(maxKb.value * 1024, locale.value));
    function setMode(m) {
      mode.value = m;
      fileError.value = void 0;
      textError.value = void 0;
      notice.value = null;
    }
    function onPick(e) {
      var _a, _b;
      const f = (_b = (_a = e.target.files) == null ? void 0 : _a[0]) != null ? _b : null;
      picked.value = null;
      fileError.value = void 0;
      notice.value = null;
      if (!f) return;
      const p = validateExplainFile(f, maxKb.value);
      if (p) {
        fileError.value = t(`explain.fileProblems.${p}`, { size: sizeLabel.value });
        return;
      }
      picked.value = f;
    }
    function again() {
      result.value = null;
      text.value = "";
      picked.value = null;
    }
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UiBreadcrumbs = _sfc_main$2;
      const _component_UiAlert = _sfc_main$3;
      const _component_AuthVerifyNeeded = _sfc_main$4;
      const _component_ConsentGate = _sfc_main$5;
      const _component_UiButton = _sfc_main$3$1;
      const _component_UiIcon = _sfc_main$5$1;
      const _component_ExplainResult = _sfc_main$1;
      const _component_UiFormField = _sfc_main$6;
      const _component_UiTextarea = _sfc_main$7;
      const _component_UiFileInput = _sfc_main$8;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "container-page max-w-3xl py-8 sm:py-12" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_UiBreadcrumbs, {
        items: unref(crumbs),
        class: "mb-6"
      }, null, _parent));
      _push(`<header class="mb-6 space-y-2"><h1 class="text-2xl font-bold sm:text-3xl">${ssrInterpolate(unref(t)("explain.title"))}</h1><p class="text-ink-soft">${ssrInterpolate(unref(t)("explain.subtitle"))}</p></header>`);
      _push(ssrRenderComponent(_component_UiAlert, {
        tone: "info",
        class: "mb-6",
        "data-testid": "explain-privacy"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`${ssrInterpolate(unref(t)("explain.privacy"))}`);
          } else {
            return [
              createTextVNode(toDisplayString(unref(t)("explain.privacy")), 1)
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
          purpose: "document_analysis",
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
        _push(`<div tabindex="-1" class="space-y-6 outline-none"${ssrRenderAttr("aria-label", unref(t)("explain.resultTitle"))}><div class="flex flex-wrap items-center justify-between gap-3"><h2 class="text-2xl font-bold">${ssrInterpolate(unref(t)("explain.resultTitle"))}</h2>`);
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
              _push2(`${ssrInterpolate(unref(t)("explain.another"))}`);
            } else {
              return [
                createVNode(_component_UiIcon, {
                  name: "refresh",
                  size: 18
                }),
                createTextVNode(toDisplayString(unref(t)("explain.another")), 1)
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div>`);
        _push(ssrRenderComponent(_component_ExplainResult, { result: unref(result) }, null, _parent));
        _push(`</div>`);
      } else {
        _push(`<form class="space-y-5" novalidate>`);
        if (unref(usage) && unref(usage).remaining !== null) {
          _push(`<p class="text-sm text-muted" data-testid="explain-usage">${ssrInterpolate(unref(t)("explain.remaining", { count: unref(usage).remaining }))}</p>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<div role="group"${ssrRenderAttr("aria-label", unref(t)("explain.mode.label"))} class="inline-flex flex-wrap gap-2">`);
        _push(ssrRenderComponent(_component_UiButton, {
          variant: unref(mode) === "text" ? "primary" : "secondary",
          "aria-pressed": unref(mode) === "text",
          "data-testid": "mode-text",
          onClick: ($event) => setMode("text")
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`${ssrInterpolate(unref(t)("explain.mode.text"))}`);
            } else {
              return [
                createTextVNode(toDisplayString(unref(t)("explain.mode.text")), 1)
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(ssrRenderComponent(_component_UiButton, {
          variant: unref(mode) === "file" ? "primary" : "secondary",
          "aria-pressed": unref(mode) === "file",
          "data-testid": "mode-file",
          onClick: ($event) => setMode("file")
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`${ssrInterpolate(unref(t)("explain.mode.file"))}`);
            } else {
              return [
                createTextVNode(toDisplayString(unref(t)("explain.mode.file")), 1)
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div>`);
        if (unref(mode) === "file" && !unref(ocrAvailable)) {
          _push(ssrRenderComponent(_component_UiAlert, {
            tone: "warning",
            "data-testid": "ocr-off"
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`${ssrInterpolate(unref(t)("explain.ocrUnavailable"))}`);
              } else {
                return [
                  createTextVNode(toDisplayString(unref(t)("explain.ocrUnavailable")), 1)
                ];
              }
            }),
            _: 1
          }, _parent));
        } else {
          _push(`<!---->`);
        }
        if (unref(notice)) {
          _push(ssrRenderComponent(_component_UiAlert, {
            tone: unref(notice).tone,
            "data-testid": "explain-notice"
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
        if (unref(mode) === "text") {
          _push(ssrRenderComponent(_component_UiFormField, {
            label: unref(t)("explain.text"),
            hint: unref(t)("explain.textHint", { min: unref(MIN_TEXT), max: unref(maxText) }),
            error: unref(textError),
            required: ""
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(ssrRenderComponent(_component_UiTextarea, {
                  modelValue: unref(text),
                  "onUpdate:modelValue": ($event) => isRef(text) ? text.value = $event : null,
                  rows: 10,
                  maxlength: unref(maxText) + 2e3
                }, null, _parent2, _scopeId));
              } else {
                return [
                  createVNode(_component_UiTextarea, {
                    modelValue: unref(text),
                    "onUpdate:modelValue": ($event) => isRef(text) ? text.value = $event : null,
                    rows: 10,
                    maxlength: unref(maxText) + 2e3
                  }, null, 8, ["modelValue", "onUpdate:modelValue", "maxlength"])
                ];
              }
            }),
            _: 1
          }, _parent));
        } else {
          _push(ssrRenderComponent(_component_UiFormField, {
            label: unref(t)("explain.file"),
            hint: unref(t)("explain.fileHint", { size: unref(sizeLabel) }),
            error: unref(fileError),
            required: ""
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(ssrRenderComponent(_component_UiFileInput, {
                  ref_key: "fileInput",
                  ref: fileInput,
                  accept: unref(EXPLAIN_ACCEPT),
                  onChange: onPick
                }, null, _parent2, _scopeId));
              } else {
                return [
                  createVNode(_component_UiFileInput, {
                    ref_key: "fileInput",
                    ref: fileInput,
                    accept: unref(EXPLAIN_ACCEPT),
                    onChange: onPick
                  }, null, 8, ["accept"])
                ];
              }
            }),
            _: 1
          }, _parent));
        }
        _push(ssrRenderComponent(_component_UiButton, {
          type: "submit",
          size: "lg",
          loading: unref(submitting),
          disabled: unref(mode) === "file" && !unref(ocrAvailable)
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_UiIcon, {
                name: "file",
                size: 18
              }, null, _parent2, _scopeId));
              _push2(`${ssrInterpolate(unref(t)("explain.submit"))}`);
            } else {
              return [
                createVNode(_component_UiIcon, {
                  name: "file",
                  size: 18
                }),
                createTextVNode(toDisplayString(unref(t)("explain.submit")), 1)
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</form>`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/documents/explain.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=explain-B8B3_DYa.mjs.map
