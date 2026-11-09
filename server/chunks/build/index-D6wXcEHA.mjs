import { _ as _sfc_main$1 } from './Breadcrumbs-C7SaJcTR.mjs';
import { _ as _sfc_main$2 } from './Alert-D-zfMDy5.mjs';
import { _ as _sfc_main$3 } from './Card-BxvVO_-_.mjs';
import { u as useI18n, f as useRoute, c as useLocalePath, a as useAuthStore, g as useApi, _ as _sfc_main$3$1, d as _sfc_main$5, i as _sfc_main$2$1, j as isApiError, e as __nuxt_component_0, n as navigateTo } from './server.mjs';
import { _ as _sfc_main$4 } from './FormField-DFtov8VK.mjs';
import { _ as _sfc_main$6 } from './Select-BjjHKxeN.mjs';
import { _ as _sfc_main$7 } from './Skeleton-BTnKIEst.mjs';
import { _ as _sfc_main$8 } from './EmptyState-N2xvHts8.mjs';
import { _ as _sfc_main$9 } from './Badge-PdKIsny2.mjs';
import { _ as _sfc_main$a } from './ReviewedNotice-RpV3jHT3.mjs';
import { _ as _sfc_main$b } from './AutoItalian-BD4PyQ-n.mjs';
import { _ as _sfc_main$c } from './Pagination-DA28GIFv.mjs';
import { defineComponent, computed, withAsyncContext, mergeProps, unref, withCtx, createTextVNode, toDisplayString, createVNode, openBlock, createBlock, Fragment, createCommentVNode, useSSRContext } from 'vue';
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
import 'perfect-debounce';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "index",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const { t, locale } = useI18n();
    const route = useRoute();
    const localePath = useLocalePath();
    const auth = useAuthStore();
    const { request } = useApi();
    useSeo(() => ({ title: t("practice.seo.title"), description: t("practice.seo.description") }));
    const get = (k) => typeof route.query[k] === "string" ? route.query[k] : "";
    const scenario = computed(() => get("scenario"));
    const type = computed(() => get("type"));
    const level = computed(() => get("level"));
    const page = computed(() => Math.max(1, Number(route.query.page) || 1));
    const LEVELS = ["a0", "a1", "a2", "b1", "b2", "c1"];
    const TYPES = ["multiple_choice", "fill_blank", "match", "listening"];
    const levelOptions = computed(() => LEVELS.map((l) => ({ value: l, label: t(`learn.levels.${l}`) })));
    const typeOptions = computed(() => TYPES.map((v) => ({ value: v, label: t(`practice.types.${v}`) })));
    const { data: scenarios, error: scError, refresh: scRefresh } = ([__temp, __restore] = withAsyncContext(async () => useAsyncData("practice-scenarios", async () => (await request("italian/scenarios")).data, { watch: [locale] })), __temp = await __temp, __restore(), __temp);
    const scenarioOptions = computed(() => {
      var _a;
      return ((_a = scenarios.value) != null ? _a : []).filter((s) => s.exercises > 0).map((s) => ({ value: s.value, label: s.label }));
    });
    const { data: mine } = ([__temp, __restore] = withAsyncContext(async () => useAsyncData("practice-progress", async () => {
      if (!auth.isAuthenticated) return null;
      try {
        return (await request("italian/practice/progress", { handle401: false })).data;
      } catch {
        return null;
      }
    }, { watch: [locale] })), __temp = await __temp, __restore(), __temp);
    const { data, error, refresh, status } = ([__temp, __restore] = withAsyncContext(() => useAsyncData("practice-exercises", () => request("italian/exercises", { query: { scenario: scenario.value, type: type.value, level: level.value, page: page.value, per_page: 12 } }), { watch: [scenario, type, level, page, locale] })), __temp = await __temp, __restore(), __temp);
    const exercises = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.data) != null ? _b : [];
    });
    const em = computed(() => {
      var _a;
      return (_a = data.value) == null ? void 0 : _a.meta;
    });
    const hasFilters = computed(() => !!(scenario.value || type.value || level.value));
    function setQuery(patch) {
      const merged = { scenario: scenario.value, type: type.value, level: level.value, ...patch };
      const next = {};
      for (const [k, v] of Object.entries(merged)) if (v !== "" && v !== void 0) next[k] = String(v);
      if (!("page" in patch)) delete next.page;
      return navigateTo({ path: route.path, query: next });
    }
    const crumbs = computed(() => [{ label: t("learn.title"), to: "/learn-italian" }, { label: t("practice.title") }]);
    return (_ctx, _push, _parent, _attrs) => {
      var _a, _b, _c, _d;
      const _component_UiBreadcrumbs = _sfc_main$1;
      const _component_UiAlert = _sfc_main$2;
      const _component_UiCard = _sfc_main$3;
      const _component_UiButton = _sfc_main$3$1;
      const _component_UiIcon = _sfc_main$5;
      const _component_UiErrorState = _sfc_main$2$1;
      const _component_NuxtLink = __nuxt_component_0;
      const _component_UiFormField = _sfc_main$4;
      const _component_UiSelect = _sfc_main$6;
      const _component_UiSkeleton = _sfc_main$7;
      const _component_UiEmptyState = _sfc_main$8;
      const _component_UiBadge = _sfc_main$9;
      const _component_LearnReviewedNotice = _sfc_main$a;
      const _component_UiAutoItalian = _sfc_main$b;
      const _component_UiPagination = _sfc_main$c;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "container-page py-8 sm:py-12" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_UiBreadcrumbs, {
        items: unref(crumbs),
        class: "mb-6"
      }, null, _parent));
      _push(`<header class="mb-6 max-w-2xl"><h1 class="text-2xl font-bold sm:text-3xl">${ssrInterpolate(unref(t)("practice.title"))}</h1><p class="mt-1 text-ink-soft">${ssrInterpolate(unref(t)("practice.subtitle"))}</p></header>`);
      _push(ssrRenderComponent(_component_UiAlert, {
        tone: "info",
        class: "mb-6"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`${ssrInterpolate(unref(t)("practice.reviewExplain"))}`);
          } else {
            return [
              createTextVNode(toDisplayString(unref(t)("practice.reviewExplain")), 1)
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<section aria-labelledby="pr-h" class="mb-10 grid gap-4 sm:grid-cols-2">`);
      _push(ssrRenderComponent(_component_UiCard, { class: "space-y-3" }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<h2 id="pr-h" class="text-xl font-bold"${_scopeId}>${ssrInterpolate(unref(t)("practice.reviewTitle"))}</h2>`);
            if (unref(auth).isAuthenticated) {
              _push2(`<!--[-->`);
              if (unref(mine)) {
                _push2(`<p class="text-ink-soft" data-testid="practice-stats"${_scopeId}>${ssrInterpolate(unref(t)("practice.dueNow", { count: unref(mine).vocabulary.due_now }))} \xB7 ${ssrInterpolate(unref(t)("practice.learning", { count: unref(mine).vocabulary.cards_learning }))} \xB7 ${ssrInterpolate(unref(t)("practice.mastered", { count: unref(mine).vocabulary.mastered }))}</p>`);
              } else {
                _push2(`<!---->`);
              }
              _push2(ssrRenderComponent(_component_UiButton, {
                to: "/learn-italian/practice/review",
                size: "lg"
              }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(ssrRenderComponent(_component_UiIcon, {
                      name: "refresh",
                      size: 18
                    }, null, _parent3, _scopeId2));
                    _push3(`${ssrInterpolate(unref(t)("practice.startReview"))}`);
                  } else {
                    return [
                      createVNode(_component_UiIcon, {
                        name: "refresh",
                        size: 18
                      }),
                      createTextVNode(toDisplayString(unref(t)("practice.startReview")), 1)
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
              _push2(`<!--]-->`);
            } else {
              _push2(`<!--[--><p class="text-ink-soft"${_scopeId}>${ssrInterpolate(unref(t)("practice.loginForReview"))}</p>`);
              _push2(ssrRenderComponent(_component_UiButton, {
                to: "/login",
                variant: "secondary"
              }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(`${ssrInterpolate(unref(t)("auth.login"))}`);
                  } else {
                    return [
                      createTextVNode(toDisplayString(unref(t)("auth.login")), 1)
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
              _push2(`<!--]-->`);
            }
          } else {
            return [
              createVNode("h2", {
                id: "pr-h",
                class: "text-xl font-bold"
              }, toDisplayString(unref(t)("practice.reviewTitle")), 1),
              unref(auth).isAuthenticated ? (openBlock(), createBlock(Fragment, { key: 0 }, [
                unref(mine) ? (openBlock(), createBlock("p", {
                  key: 0,
                  class: "text-ink-soft",
                  "data-testid": "practice-stats"
                }, toDisplayString(unref(t)("practice.dueNow", { count: unref(mine).vocabulary.due_now })) + " \xB7 " + toDisplayString(unref(t)("practice.learning", { count: unref(mine).vocabulary.cards_learning })) + " \xB7 " + toDisplayString(unref(t)("practice.mastered", { count: unref(mine).vocabulary.mastered })), 1)) : createCommentVNode("", true),
                createVNode(_component_UiButton, {
                  to: "/learn-italian/practice/review",
                  size: "lg"
                }, {
                  default: withCtx(() => [
                    createVNode(_component_UiIcon, {
                      name: "refresh",
                      size: 18
                    }),
                    createTextVNode(toDisplayString(unref(t)("practice.startReview")), 1)
                  ]),
                  _: 1
                })
              ], 64)) : (openBlock(), createBlock(Fragment, { key: 1 }, [
                createVNode("p", { class: "text-ink-soft" }, toDisplayString(unref(t)("practice.loginForReview")), 1),
                createVNode(_component_UiButton, {
                  to: "/login",
                  variant: "secondary"
                }, {
                  default: withCtx(() => [
                    createTextVNode(toDisplayString(unref(t)("auth.login")), 1)
                  ]),
                  _: 1
                })
              ], 64))
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_UiCard, { class: "space-y-3" }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<h2 class="text-xl font-bold"${_scopeId}>${ssrInterpolate(unref(t)("practice.vocabularyTitle"))}</h2><p class="text-ink-soft"${_scopeId}>${ssrInterpolate(unref(t)("practice.vocabularyBody"))}</p>`);
            _push2(ssrRenderComponent(_component_UiButton, {
              to: "/learn-italian/vocabulary",
              variant: "secondary"
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(ssrRenderComponent(_component_UiIcon, {
                    name: "book",
                    size: 18
                  }, null, _parent3, _scopeId2));
                  _push3(`${ssrInterpolate(unref(t)("practice.browseVocabulary"))}`);
                } else {
                  return [
                    createVNode(_component_UiIcon, {
                      name: "book",
                      size: 18
                    }),
                    createTextVNode(toDisplayString(unref(t)("practice.browseVocabulary")), 1)
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
          } else {
            return [
              createVNode("h2", { class: "text-xl font-bold" }, toDisplayString(unref(t)("practice.vocabularyTitle")), 1),
              createVNode("p", { class: "text-ink-soft" }, toDisplayString(unref(t)("practice.vocabularyBody")), 1),
              createVNode(_component_UiButton, {
                to: "/learn-italian/vocabulary",
                variant: "secondary"
              }, {
                default: withCtx(() => [
                  createVNode(_component_UiIcon, {
                    name: "book",
                    size: 18
                  }),
                  createTextVNode(toDisplayString(unref(t)("practice.browseVocabulary")), 1)
                ]),
                _: 1
              })
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</section><section aria-labelledby="sc-h" class="mb-10 space-y-3"><h2 id="sc-h" class="text-xl font-bold">${ssrInterpolate(unref(t)("practice.scenariosTitle"))}</h2>`);
      if (unref(scError)) {
        _push(ssrRenderComponent(_component_UiErrorState, {
          message: ("isApiError" in _ctx ? _ctx.isApiError : unref(isApiError))(unref(scError)) ? unref(scError).message : void 0,
          retry: "",
          onRetry: ($event) => unref(scRefresh)()
        }, null, _parent));
      } else {
        _push(`<ul class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"><!--[-->`);
        ssrRenderList(unref(scenarios), (s) => {
          _push(`<li>`);
          _push(ssrRenderComponent(_component_UiCard, {
            as: "article",
            class: "space-y-1 !p-4"
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`<h3 class="font-bold"${_scopeId}>${ssrInterpolate(s.label)}</h3><p class="text-sm text-muted"${_scopeId}>${ssrInterpolate(unref(t)("practice.scenarioCounts", { lessons: s.lessons, vocabulary: s.vocabulary, exercises: s.exercises }))}</p><p class="flex flex-wrap gap-2 pt-1"${_scopeId}>`);
                if (s.exercises) {
                  _push2(ssrRenderComponent(_component_NuxtLink, {
                    to: { path: unref(localePath)("/learn-italian/practice"), query: { scenario: s.value } },
                    class: "inline-flex min-h-touch items-center text-primary-strong underline underline-offset-4"
                  }, {
                    default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                      if (_push3) {
                        _push3(`${ssrInterpolate(unref(t)("practice.exercisesLink"))}`);
                      } else {
                        return [
                          createTextVNode(toDisplayString(unref(t)("practice.exercisesLink")), 1)
                        ];
                      }
                    }),
                    _: 2
                  }, _parent2, _scopeId));
                } else {
                  _push2(`<!---->`);
                }
                if (s.vocabulary) {
                  _push2(ssrRenderComponent(_component_NuxtLink, {
                    to: { path: unref(localePath)("/learn-italian/vocabulary"), query: { category: s.value } },
                    class: "inline-flex min-h-touch items-center text-primary-strong underline underline-offset-4"
                  }, {
                    default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                      if (_push3) {
                        _push3(`${ssrInterpolate(unref(t)("practice.vocabularyLink"))}`);
                      } else {
                        return [
                          createTextVNode(toDisplayString(unref(t)("practice.vocabularyLink")), 1)
                        ];
                      }
                    }),
                    _: 2
                  }, _parent2, _scopeId));
                } else {
                  _push2(`<!---->`);
                }
                if (s.lessons) {
                  _push2(ssrRenderComponent(_component_NuxtLink, {
                    to: { path: unref(localePath)("/learn-italian"), query: { scenario: s.value } },
                    class: "inline-flex min-h-touch items-center text-primary-strong underline underline-offset-4"
                  }, {
                    default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                      if (_push3) {
                        _push3(`${ssrInterpolate(unref(t)("practice.lessonsLink"))}`);
                      } else {
                        return [
                          createTextVNode(toDisplayString(unref(t)("practice.lessonsLink")), 1)
                        ];
                      }
                    }),
                    _: 2
                  }, _parent2, _scopeId));
                } else {
                  _push2(`<!---->`);
                }
                _push2(`</p>`);
              } else {
                return [
                  createVNode("h3", { class: "font-bold" }, toDisplayString(s.label), 1),
                  createVNode("p", { class: "text-sm text-muted" }, toDisplayString(unref(t)("practice.scenarioCounts", { lessons: s.lessons, vocabulary: s.vocabulary, exercises: s.exercises })), 1),
                  createVNode("p", { class: "flex flex-wrap gap-2 pt-1" }, [
                    s.exercises ? (openBlock(), createBlock(_component_NuxtLink, {
                      key: 0,
                      to: { path: unref(localePath)("/learn-italian/practice"), query: { scenario: s.value } },
                      class: "inline-flex min-h-touch items-center text-primary-strong underline underline-offset-4"
                    }, {
                      default: withCtx(() => [
                        createTextVNode(toDisplayString(unref(t)("practice.exercisesLink")), 1)
                      ]),
                      _: 1
                    }, 8, ["to"])) : createCommentVNode("", true),
                    s.vocabulary ? (openBlock(), createBlock(_component_NuxtLink, {
                      key: 1,
                      to: { path: unref(localePath)("/learn-italian/vocabulary"), query: { category: s.value } },
                      class: "inline-flex min-h-touch items-center text-primary-strong underline underline-offset-4"
                    }, {
                      default: withCtx(() => [
                        createTextVNode(toDisplayString(unref(t)("practice.vocabularyLink")), 1)
                      ]),
                      _: 1
                    }, 8, ["to"])) : createCommentVNode("", true),
                    s.lessons ? (openBlock(), createBlock(_component_NuxtLink, {
                      key: 2,
                      to: { path: unref(localePath)("/learn-italian"), query: { scenario: s.value } },
                      class: "inline-flex min-h-touch items-center text-primary-strong underline underline-offset-4"
                    }, {
                      default: withCtx(() => [
                        createTextVNode(toDisplayString(unref(t)("practice.lessonsLink")), 1)
                      ]),
                      _: 1
                    }, 8, ["to"])) : createCommentVNode("", true)
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
      _push(`</section><section aria-labelledby="ex-h" class="space-y-4"><h2 id="ex-h" class="text-xl font-bold">${ssrInterpolate(unref(t)("practice.exercisesTitle"))}</h2><div class="grid gap-4 rounded-lg border border-line bg-surface p-4 sm:grid-cols-3">`);
      _push(ssrRenderComponent(_component_UiFormField, {
        label: unref(t)("learn.level")
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_UiSelect, {
              "model-value": unref(level),
              options: unref(levelOptions),
              placeholder: unref(t)("learn.allLevels"),
              "onUpdate:modelValue": ($event) => setQuery({ level: $event })
            }, null, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_UiSelect, {
                "model-value": unref(level),
                options: unref(levelOptions),
                placeholder: unref(t)("learn.allLevels"),
                "onUpdate:modelValue": ($event) => setQuery({ level: $event })
              }, null, 8, ["model-value", "options", "placeholder", "onUpdate:modelValue"])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_UiFormField, {
        label: unref(t)("practice.type")
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_UiSelect, {
              "model-value": unref(type),
              options: unref(typeOptions),
              placeholder: unref(t)("learn.allTypes"),
              "onUpdate:modelValue": ($event) => setQuery({ type: $event })
            }, null, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_UiSelect, {
                "model-value": unref(type),
                options: unref(typeOptions),
                placeholder: unref(t)("learn.allTypes"),
                "onUpdate:modelValue": ($event) => setQuery({ type: $event })
              }, null, 8, ["model-value", "options", "placeholder", "onUpdate:modelValue"])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_UiFormField, {
        label: unref(t)("learn.scenario")
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_UiSelect, {
              "model-value": unref(scenario),
              options: unref(scenarioOptions),
              placeholder: unref(t)("learn.allScenarios"),
              "onUpdate:modelValue": ($event) => setQuery({ scenario: $event })
            }, null, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_UiSelect, {
                "model-value": unref(scenario),
                options: unref(scenarioOptions),
                placeholder: unref(t)("learn.allScenarios"),
                "onUpdate:modelValue": ($event) => setQuery({ scenario: $event })
              }, null, 8, ["model-value", "options", "placeholder", "onUpdate:modelValue"])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div>`);
      if (unref(status) === "pending" && !unref(data)) {
        _push(`<ul class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true"><!--[-->`);
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
      } else if (unref(error)) {
        _push(ssrRenderComponent(_component_UiErrorState, {
          message: ("isApiError" in _ctx ? _ctx.isApiError : unref(isApiError))(unref(error)) ? unref(error).message : void 0,
          retry: "",
          onRetry: ($event) => unref(refresh)()
        }, null, _parent));
      } else if (!unref(exercises).length) {
        _push(ssrRenderComponent(_component_UiEmptyState, {
          title: unref(t)("practice.emptyTitle"),
          description: unref(hasFilters) ? unref(t)("guides.noResults") : unref(t)("practice.empty"),
          icon: "book"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              if (unref(hasFilters)) {
                _push2(ssrRenderComponent(_component_UiButton, {
                  variant: "secondary",
                  onClick: ($event) => ("navigateTo" in _ctx ? _ctx.navigateTo : unref(navigateTo))({ path: unref(route).path })
                }, {
                  default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                    if (_push3) {
                      _push3(`${ssrInterpolate(unref(t)("guides.clear"))}`);
                    } else {
                      return [
                        createTextVNode(toDisplayString(unref(t)("guides.clear")), 1)
                      ];
                    }
                  }),
                  _: 1
                }, _parent2, _scopeId));
              } else {
                _push2(`<!---->`);
              }
            } else {
              return [
                unref(hasFilters) ? (openBlock(), createBlock(_component_UiButton, {
                  key: 0,
                  variant: "secondary",
                  onClick: ($event) => ("navigateTo" in _ctx ? _ctx.navigateTo : unref(navigateTo))({ path: unref(route).path })
                }, {
                  default: withCtx(() => [
                    createTextVNode(toDisplayString(unref(t)("guides.clear")), 1)
                  ]),
                  _: 1
                }, 8, ["onClick"])) : createCommentVNode("", true)
              ];
            }
          }),
          _: 1
        }, _parent));
      } else {
        _push(`<!--[--><ul class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"><!--[-->`);
        ssrRenderList(unref(exercises), (e) => {
          _push(`<li>`);
          _push(ssrRenderComponent(_component_UiCard, {
            as: "article",
            class: "relative flex h-full flex-col gap-3 hover:shadow-2"
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`<div class="flex flex-wrap items-center gap-2"${_scopeId}>`);
                _push2(ssrRenderComponent(_component_UiBadge, { tone: "primary" }, {
                  default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                    if (_push3) {
                      _push3(`${ssrInterpolate(e.level_label)}`);
                    } else {
                      return [
                        createTextVNode(toDisplayString(e.level_label), 1)
                      ];
                    }
                  }),
                  _: 2
                }, _parent2, _scopeId));
                _push2(ssrRenderComponent(_component_UiBadge, null, {
                  default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                    if (_push3) {
                      _push3(`${ssrInterpolate(e.type_label)}`);
                    } else {
                      return [
                        createTextVNode(toDisplayString(e.type_label), 1)
                      ];
                    }
                  }),
                  _: 2
                }, _parent2, _scopeId));
                _push2(ssrRenderComponent(_component_LearnReviewedNotice, {
                  item: e,
                  compact: ""
                }, null, _parent2, _scopeId));
                _push2(`</div><h3 class="text-lg font-bold"${_scopeId}>`);
                _push2(ssrRenderComponent(_component_NuxtLink, {
                  to: unref(localePath)(`/learn-italian/exercises/${e.slug}`),
                  class: "after:absolute after:inset-0 after:content-['']"
                }, {
                  default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                    var _a2, _b2;
                    if (_push3) {
                      _push3(ssrRenderComponent(_component_UiAutoItalian, {
                        text: (_a2 = e.prompt) != null ? _a2 : e.type_label
                      }, null, _parent3, _scopeId2));
                    } else {
                      return [
                        createVNode(_component_UiAutoItalian, {
                          text: (_b2 = e.prompt) != null ? _b2 : e.type_label
                        }, null, 8, ["text"])
                      ];
                    }
                  }),
                  _: 2
                }, _parent2, _scopeId));
                _push2(`</h3>`);
                if (e.scenario_label) {
                  _push2(`<p class="mt-auto text-sm text-muted"${_scopeId}>${ssrInterpolate(e.scenario_label)}</p>`);
                } else {
                  _push2(`<!---->`);
                }
              } else {
                return [
                  createVNode("div", { class: "flex flex-wrap items-center gap-2" }, [
                    createVNode(_component_UiBadge, { tone: "primary" }, {
                      default: withCtx(() => [
                        createTextVNode(toDisplayString(e.level_label), 1)
                      ]),
                      _: 2
                    }, 1024),
                    createVNode(_component_UiBadge, null, {
                      default: withCtx(() => [
                        createTextVNode(toDisplayString(e.type_label), 1)
                      ]),
                      _: 2
                    }, 1024),
                    createVNode(_component_LearnReviewedNotice, {
                      item: e,
                      compact: ""
                    }, null, 8, ["item"])
                  ]),
                  createVNode("h3", { class: "text-lg font-bold" }, [
                    createVNode(_component_NuxtLink, {
                      to: unref(localePath)(`/learn-italian/exercises/${e.slug}`),
                      class: "after:absolute after:inset-0 after:content-['']"
                    }, {
                      default: withCtx(() => {
                        var _a2;
                        return [
                          createVNode(_component_UiAutoItalian, {
                            text: (_a2 = e.prompt) != null ? _a2 : e.type_label
                          }, null, 8, ["text"])
                        ];
                      }),
                      _: 2
                    }, 1032, ["to"])
                  ]),
                  e.scenario_label ? (openBlock(), createBlock("p", {
                    key: 0,
                    class: "mt-auto text-sm text-muted"
                  }, toDisplayString(e.scenario_label), 1)) : createCommentVNode("", true)
                ];
              }
            }),
            _: 2
          }, _parent));
          _push(`</li>`);
        });
        _push(`<!--]--></ul>`);
        _push(ssrRenderComponent(_component_UiPagination, {
          page: (_b = (_a = unref(em)) == null ? void 0 : _a.page) != null ? _b : 1,
          "last-page": (_d = (_c = unref(em)) == null ? void 0 : _c.last_page) != null ? _d : 1,
          onChange: ($event) => setQuery({ page: $event })
        }, null, _parent));
        _push(`<!--]-->`);
      }
      _push(`</section></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/learn-italian/practice/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=index-D6wXcEHA.mjs.map
