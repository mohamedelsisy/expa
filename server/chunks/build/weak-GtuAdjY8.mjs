import { _ as _sfc_main$1 } from './Breadcrumbs-C7SaJcTR.mjs';
import { _ as _sfc_main$2 } from './Disclaimer-ByrpdAjg.mjs';
import { _ as _sfc_main$3 } from './Skeleton-BTnKIEst.mjs';
import { u as useI18n, g as useApi, c as useLocalePath, i as _sfc_main$2$1, j as isApiError, _ as _sfc_main$3$1, e as __nuxt_component_0, d as _sfc_main$5$1, n as navigateTo } from './server.mjs';
import { _ as _sfc_main$4 } from './EmptyState-N2xvHts8.mjs';
import { _ as _sfc_main$5 } from './VerifyNeeded-mxk-8UjC.mjs';
import { _ as _sfc_main$6 } from './Alert-D-zfMDy5.mjs';
import { _ as _sfc_main$7 } from './AutoItalian-BD4PyQ-n.mjs';
import { _ as _sfc_main$8 } from './Badge-PdKIsny2.mjs';
import { defineComponent, withAsyncContext, computed, mergeProps, unref, withCtx, createTextVNode, toDisplayString, createVNode, ref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderList } from 'vue/server-renderer';
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
import './useToast-BX2bodPv.mjs';
import 'perfect-debounce';

function usePracticeStart() {
  const { request } = useApi();
  const { t } = useI18n();
  const localePath = useLocalePath();
  const starting = ref(null);
  const problem = ref(null);
  const needsVerify = ref(false);
  async function start(path, key, body = {}) {
    starting.value = key;
    problem.value = null;
    needsVerify.value = false;
    try {
      const res = await request(path, { method: "POST", body });
      await navigateTo(localePath(`/patente/run/${res.data.id}`));
    } catch (e) {
      if (isApiError(e) && e.code === "email_not_verified") needsVerify.value = true;
      else if (isApiError(e) && e.code === "not_enough_questions") problem.value = t("patente.notEnoughPractice");
      else if (isApiError(e) && e.code === "no_weak_topics") problem.value = t("patente.weakPage.noWeakStart");
      else if (isApiError(e) && e.status === 429) problem.value = t("patente.weakPage.limit");
      else problem.value = isApiError(e) ? e.message : t("errors.generic");
    } finally {
      starting.value = null;
    }
  }
  return { starting, problem, needsVerify, start };
}
const size = 15;
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "weak",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const { t, locale } = useI18n();
    const { request } = useApi();
    const localePath = useLocalePath();
    useSeo(() => ({ title: t("patente.weakPage.title"), description: t("patente.weakPage.subtitle"), noindex: true }));
    const { data, error, refresh, status } = ([__temp, __restore] = withAsyncContext(async () => useAsyncData("patente-weak", async () => (await request("patente/weak-topics")).data, { watch: [locale] })), __temp = await __temp, __restore(), __temp);
    const practice = usePracticeStart();
    const hasContent = computed(() => !!data.value && (data.value.weak.length > 0 || data.value.untouched.length > 0));
    const crumbs = computed(() => [{ label: t("patente.title"), to: "/patente" }, { label: t("patente.weakPage.title") }]);
    const row = (r) => ({ ...r, acc: r.accuracy === null ? null : `${r.accuracy}%` });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UiBreadcrumbs = _sfc_main$1;
      const _component_PatenteDisclaimer = _sfc_main$2;
      const _component_UiSkeleton = _sfc_main$3;
      const _component_UiErrorState = _sfc_main$2$1;
      const _component_UiEmptyState = _sfc_main$4;
      const _component_UiButton = _sfc_main$3$1;
      const _component_AuthVerifyNeeded = _sfc_main$5;
      const _component_UiAlert = _sfc_main$6;
      const _component_NuxtLink = __nuxt_component_0;
      const _component_UiAutoItalian = _sfc_main$7;
      const _component_UiIcon = _sfc_main$5$1;
      const _component_UiBadge = _sfc_main$8;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "container-page max-w-3xl py-8 sm:py-12" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_UiBreadcrumbs, {
        items: unref(crumbs),
        class: "mb-6"
      }, null, _parent));
      _push(`<h1 class="mb-2 text-2xl font-bold sm:text-3xl">${ssrInterpolate(unref(t)("patente.weakPage.title"))}</h1><p class="mb-6 text-ink-soft">${ssrInterpolate(unref(t)("patente.weakPage.subtitle"))}</p>`);
      _push(ssrRenderComponent(_component_PatenteDisclaimer, { class: "mb-6" }, null, _parent));
      if (unref(status) === "pending" && !unref(data)) {
        _push(`<div aria-busy="true">`);
        _push(ssrRenderComponent(_component_UiSkeleton, {
          block: "",
          lines: 5
        }, null, _parent));
        _push(`</div>`);
      } else if (unref(error) || !unref(data)) {
        _push(ssrRenderComponent(_component_UiErrorState, {
          message: ("isApiError" in _ctx ? _ctx.isApiError : unref(isApiError))(unref(error)) ? unref(error).message : void 0,
          retry: "",
          onRetry: ($event) => unref(refresh)()
        }, null, _parent));
      } else if (!unref(hasContent)) {
        _push(ssrRenderComponent(_component_UiEmptyState, {
          title: unref(t)("patente.weakPage.noContentTitle"),
          description: unref(t)("patente.weakPage.noContent"),
          icon: "car"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_UiButton, {
                to: "/patente",
                variant: "secondary"
              }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(`${ssrInterpolate(unref(t)("patente.title"))}`);
                  } else {
                    return [
                      createTextVNode(toDisplayString(unref(t)("patente.title")), 1)
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
            } else {
              return [
                createVNode(_component_UiButton, {
                  to: "/patente",
                  variant: "secondary"
                }, {
                  default: withCtx(() => [
                    createTextVNode(toDisplayString(unref(t)("patente.title")), 1)
                  ]),
                  _: 1
                })
              ];
            }
          }),
          _: 1
        }, _parent));
      } else {
        _push(`<div class="space-y-8">`);
        if (unref(practice).needsVerify.value) {
          _push(ssrRenderComponent(_component_AuthVerifyNeeded, null, null, _parent));
        } else {
          _push(`<!---->`);
        }
        if (unref(practice).problem.value) {
          _push(ssrRenderComponent(_component_UiAlert, {
            tone: "warning",
            "data-testid": "practice-problem"
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`${ssrInterpolate(unref(practice).problem.value)}`);
              } else {
                return [
                  createTextVNode(toDisplayString(unref(practice).problem.value), 1)
                ];
              }
            }),
            _: 1
          }, _parent));
        } else {
          _push(`<!---->`);
        }
        _push(`<section aria-labelledby="wk-h" class="space-y-3"><h2 id="wk-h" class="text-xl font-bold">${ssrInterpolate(unref(t)("patente.weakPage.weak"))}</h2><p class="text-sm text-muted">${ssrInterpolate(unref(t)("patente.weakPage.rule", { threshold: unref(data).threshold, min: unref(data).min_answers }))}</p>`);
        if (!unref(data).weak.length) {
          _push(`<p class="rounded-md border border-line bg-sunken p-3" data-testid="no-weak">${ssrInterpolate(unref(t)("patente.weakPage.noWeak"))}</p>`);
        } else {
          _push(`<!--[--><ul class="divide-y divide-line rounded-md border border-line bg-surface"><!--[-->`);
          ssrRenderList(unref(data).weak.map(row), (w) => {
            _push(`<li class="flex flex-wrap items-center justify-between gap-3 p-3"><div class="min-w-0">`);
            _push(ssrRenderComponent(_component_NuxtLink, {
              to: unref(localePath)(`/patente/topics/${w.topic.slug}`),
              class: "font-semibold text-primary-strong underline underline-offset-4"
            }, {
              default: withCtx((_, _push2, _parent2, _scopeId) => {
                if (_push2) {
                  _push2(ssrRenderComponent(_component_UiAutoItalian, {
                    text: w.topic.title
                  }, null, _parent2, _scopeId));
                } else {
                  return [
                    createVNode(_component_UiAutoItalian, {
                      text: w.topic.title
                    }, null, 8, ["text"])
                  ];
                }
              }),
              _: 2
            }, _parent));
            _push(`<p class="text-sm text-muted">${ssrInterpolate(unref(t)("patente.weakPage.stats", { correct: w.correct, answered: w.answered }))}`);
            if (w.acc) {
              _push(`<!--[--> \xB7 <bdi>${ssrInterpolate(w.acc)}</bdi><!--]-->`);
            } else {
              _push(`<!---->`);
            }
            _push(`</p></div>`);
            _push(ssrRenderComponent(_component_UiButton, {
              variant: "secondary",
              loading: unref(practice).starting.value === w.topic.slug,
              disabled: !w.available_questions,
              onClick: ($event) => unref(practice).start(`patente/topics/${encodeURIComponent(w.topic.slug)}/practice`, w.topic.slug, { size })
            }, {
              default: withCtx((_, _push2, _parent2, _scopeId) => {
                if (_push2) {
                  _push2(`${ssrInterpolate(unref(t)("patente.practiceThis"))}`);
                } else {
                  return [
                    createTextVNode(toDisplayString(unref(t)("patente.practiceThis")), 1)
                  ];
                }
              }),
              _: 2
            }, _parent));
            _push(`</li>`);
          });
          _push(`<!--]--></ul>`);
          _push(ssrRenderComponent(_component_UiButton, {
            size: "lg",
            loading: unref(practice).starting.value === "__weak",
            onClick: ($event) => unref(practice).start("patente/practice/weak", "__weak", { size })
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(ssrRenderComponent(_component_UiIcon, {
                  name: "list",
                  size: 18
                }, null, _parent2, _scopeId));
                _push2(`${ssrInterpolate(unref(t)("patente.weakPage.startWeak"))}`);
              } else {
                return [
                  createVNode(_component_UiIcon, {
                    name: "list",
                    size: 18
                  }),
                  createTextVNode(toDisplayString(unref(t)("patente.weakPage.startWeak")), 1)
                ];
              }
            }),
            _: 1
          }, _parent));
          _push(`<!--]-->`);
        }
        _push(`</section>`);
        if (unref(data).untouched.length) {
          _push(`<section aria-labelledby="un-h" class="space-y-3"><h2 id="un-h" class="text-xl font-bold">${ssrInterpolate(unref(t)("patente.weakPage.untouched"))}</h2><ul class="divide-y divide-line rounded-md border border-line bg-surface"><!--[-->`);
          ssrRenderList(unref(data).untouched, (w) => {
            _push(`<li class="flex flex-wrap items-center justify-between gap-3 p-3"><div class="min-w-0">`);
            _push(ssrRenderComponent(_component_NuxtLink, {
              to: unref(localePath)(`/patente/topics/${w.topic.slug}`),
              class: "font-semibold text-primary-strong underline underline-offset-4"
            }, {
              default: withCtx((_, _push2, _parent2, _scopeId) => {
                if (_push2) {
                  _push2(ssrRenderComponent(_component_UiAutoItalian, {
                    text: w.topic.title
                  }, null, _parent2, _scopeId));
                } else {
                  return [
                    createVNode(_component_UiAutoItalian, {
                      text: w.topic.title
                    }, null, 8, ["text"])
                  ];
                }
              }),
              _: 2
            }, _parent));
            _push(`<p class="text-sm text-muted">${ssrInterpolate(unref(t)("patente.questionCount", { count: w.available_questions }))}</p></div>`);
            if (unref(data).recommended === w.topic.slug) {
              _push(ssrRenderComponent(_component_UiBadge, { tone: "info" }, {
                default: withCtx((_, _push2, _parent2, _scopeId) => {
                  if (_push2) {
                    _push2(`${ssrInterpolate(unref(t)("patente.weakPage.recommended"))}`);
                  } else {
                    return [
                      createTextVNode(toDisplayString(unref(t)("patente.weakPage.recommended")), 1)
                    ];
                  }
                }),
                _: 2
              }, _parent));
            } else {
              _push(`<!---->`);
            }
            _push(ssrRenderComponent(_component_UiButton, {
              variant: "secondary",
              loading: unref(practice).starting.value === w.topic.slug,
              onClick: ($event) => unref(practice).start(`patente/topics/${encodeURIComponent(w.topic.slug)}/practice`, w.topic.slug, { size })
            }, {
              default: withCtx((_, _push2, _parent2, _scopeId) => {
                if (_push2) {
                  _push2(`${ssrInterpolate(unref(t)("patente.practiceThis"))}`);
                } else {
                  return [
                    createTextVNode(toDisplayString(unref(t)("patente.practiceThis")), 1)
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
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/patente/weak.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=weak-GtuAdjY8.mjs.map
