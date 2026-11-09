import { u as useI18n, f as useRoute, c as useLocalePath, a as useAuthStore, g as useApi, _ as _sfc_main$3, d as _sfc_main$5, i as _sfc_main$2, j as isApiError, e as __nuxt_component_0, n as navigateTo } from './server.mjs';
import { _ as _sfc_main$1 } from './Card-BxvVO_-_.mjs';
import { _ as _sfc_main$4 } from './Badge-PdKIsny2.mjs';
import { _ as _sfc_main$6 } from './ProgressBar-DvR1KKgW.mjs';
import { _ as _sfc_main$7 } from './AutoItalian-BD4PyQ-n.mjs';
import { _ as _sfc_main$8 } from './Alert-D-zfMDy5.mjs';
import { _ as _sfc_main$9 } from './FormField-DFtov8VK.mjs';
import { _ as _sfc_main$a } from './Select-BjjHKxeN.mjs';
import { _ as _sfc_main$b } from './Skeleton-BTnKIEst.mjs';
import { _ as _sfc_main$c } from './EmptyState-N2xvHts8.mjs';
import { _ as _sfc_main$d } from './Pagination-DA28GIFv.mjs';
import { defineComponent, computed, withAsyncContext, mergeProps, unref, withCtx, createVNode, createTextVNode, toDisplayString, openBlock, createBlock, Fragment, renderList, createCommentVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrInterpolate, ssrRenderComponent, ssrRenderList, ssrRenderClass } from 'vue/server-renderer';
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
import './safe-B2eSdAXJ.mjs';
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
    useSeo(() => ({ title: t("learn.title"), description: t("learn.subtitle") }));
    const level = computed(() => typeof route.query.level === "string" ? route.query.level : "");
    const type = computed(() => typeof route.query.type === "string" ? route.query.type : "");
    const scenario = computed(() => typeof route.query.scenario === "string" ? route.query.scenario : "");
    const page = computed(() => Math.max(1, Number(route.query.page) || 1));
    const LEVELS = ["a0", "a1", "a2", "b1", "b2", "c1"];
    const { data: meta } = ([__temp, __restore] = withAsyncContext(async () => useAsyncData("italian-meta", async () => (await request("italian/meta")).data, { watch: [locale] })), __temp = await __temp, __restore(), __temp);
    const { data: mine, error: mineError, refresh: refreshMine } = ([__temp, __restore] = withAsyncContext(async () => useAsyncData("italian-mine", async () => {
      if (!auth.isAuthenticated) return null;
      const [daily, progress] = await Promise.all([request("italian/daily"), request("italian/progress")]);
      return { daily: daily.data, progress: progress.data };
    }, { watch: [locale] })), __temp = await __temp, __restore(), __temp);
    const { data, error, refresh, status } = ([__temp, __restore] = withAsyncContext(() => useAsyncData("italian-lessons", () => request("italian/lessons", {
      query: { level: level.value, type: type.value, scenario: scenario.value, page: page.value, per_page: 12 }
    }), { watch: [level, type, scenario, page, locale] })), __temp = await __temp, __restore(), __temp);
    const lessons = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.data) != null ? _b : [];
    });
    const lm = computed(() => {
      var _a;
      return (_a = data.value) == null ? void 0 : _a.meta;
    });
    function setQuery(patch) {
      const merged = { level: level.value, type: type.value, scenario: scenario.value, ...patch };
      const next = {};
      for (const [k, v] of Object.entries(merged)) if (v !== "" && v !== void 0) next[k] = String(v);
      if (!("page" in patch)) delete next.page;
      return navigateTo({ path: route.path, query: next });
    }
    const levelOptions = computed(() => LEVELS.map((l) => ({ value: l, label: t(`learn.levels.${l}`) })));
    const typeOptions = computed(() => {
      var _a, _b;
      return ((_b = (_a = meta.value) == null ? void 0 : _a.types) != null ? _b : []).map((o) => ({ value: o.value, label: o.label }));
    });
    const scenarioOptions = computed(() => {
      var _a, _b;
      return ((_b = (_a = meta.value) == null ? void 0 : _a.scenarios) != null ? _b : []).map((o) => ({ value: o.value, label: o.label }));
    });
    const hasFilters = computed(() => !!(level.value || type.value || scenario.value));
    const typeIcon = (tp) => {
      var _a;
      return (_a = { vocabulary: "book", grammar: "list", conversation: "sparkle", pronunciation: "volume", mission: "check-circle" }[tp]) != null ? _a : "book";
    };
    return (_ctx, _push, _parent, _attrs) => {
      var _a, _b, _c, _d, _e;
      const _component_UiButton = _sfc_main$3;
      const _component_UiIcon = _sfc_main$5;
      const _component_UiErrorState = _sfc_main$2;
      const _component_UiCard = _sfc_main$1;
      const _component_UiBadge = _sfc_main$4;
      const _component_UiProgressBar = _sfc_main$6;
      const _component_UiAutoItalian = _sfc_main$7;
      const _component_NuxtLink = __nuxt_component_0;
      const _component_UiAlert = _sfc_main$8;
      const _component_UiFormField = _sfc_main$9;
      const _component_UiSelect = _sfc_main$a;
      const _component_UiSkeleton = _sfc_main$b;
      const _component_UiEmptyState = _sfc_main$c;
      const _component_UiPagination = _sfc_main$d;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "container-page py-8 sm:py-12" }, _attrs))}><header class="mb-8 max-w-2xl"><h1 class="text-2xl font-bold sm:text-3xl">${ssrInterpolate(unref(t)("learn.title"))}</h1><p class="mt-1 text-ink-soft">${ssrInterpolate(unref(t)("learn.subtitle"))}</p><p class="mt-4 flex flex-wrap gap-2">`);
      _push(ssrRenderComponent(_component_UiButton, {
        to: "/learn-italian/practice",
        variant: "secondary"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_UiIcon, {
              name: "refresh",
              size: 18
            }, null, _parent2, _scopeId));
            _push2(`${ssrInterpolate(unref(t)("practice.title"))}`);
          } else {
            return [
              createVNode(_component_UiIcon, {
                name: "refresh",
                size: 18
              }),
              createTextVNode(toDisplayString(unref(t)("practice.title")), 1)
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_UiButton, {
        to: "/learn-italian/vocabulary",
        variant: "ghost"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`${ssrInterpolate(unref(t)("vocab.title"))}`);
          } else {
            return [
              createTextVNode(toDisplayString(unref(t)("vocab.title")), 1)
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</p></header>`);
      if (unref(auth).isAuthenticated) {
        _push(`<section aria-labelledby="daily-h" class="mb-10 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">`);
        if (unref(mineError) || !unref(mine)) {
          _push(ssrRenderComponent(_component_UiErrorState, {
            message: ("isApiError" in _ctx ? _ctx.isApiError : unref(isApiError))(unref(mineError)) ? unref(mineError).message : void 0,
            retry: "",
            onRetry: ($event) => unref(refreshMine)(),
            class: "lg:col-span-2"
          }, null, _parent));
        } else {
          _push(`<!--[-->`);
          _push(ssrRenderComponent(_component_UiCard, { class: "min-w-0 space-y-4" }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`<div class="flex flex-wrap items-center justify-between gap-3"${_scopeId}><h2 id="daily-h" class="text-xl font-bold"${_scopeId}>${ssrInterpolate(unref(t)("learn.dailyTitle"))}</h2><p class="flex flex-wrap items-center gap-2 text-sm"${_scopeId}>`);
                _push2(ssrRenderComponent(_component_UiBadge, { tone: "accent" }, {
                  default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                    if (_push3) {
                      _push3(ssrRenderComponent(_component_UiIcon, {
                        name: "flame",
                        size: 14
                      }, null, _parent3, _scopeId2));
                      _push3(`${ssrInterpolate(unref(t)("learn.streak", { count: unref(mine).daily.streak }))}`);
                    } else {
                      return [
                        createVNode(_component_UiIcon, {
                          name: "flame",
                          size: 14
                        }),
                        createTextVNode(toDisplayString(unref(t)("learn.streak", { count: unref(mine).daily.streak })), 1)
                      ];
                    }
                  }),
                  _: 1
                }, _parent2, _scopeId));
                _push2(ssrRenderComponent(_component_UiBadge, null, {
                  default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                    if (_push3) {
                      _push3(ssrRenderComponent(_component_UiIcon, {
                        name: "clock",
                        size: 14
                      }, null, _parent3, _scopeId2));
                      _push3(`${ssrInterpolate(unref(t)("learn.minutes", { count: unref(mine).daily.minutes }))}`);
                    } else {
                      return [
                        createVNode(_component_UiIcon, {
                          name: "clock",
                          size: 14
                        }),
                        createTextVNode(toDisplayString(unref(t)("learn.minutes", { count: unref(mine).daily.minutes })), 1)
                      ];
                    }
                  }),
                  _: 1
                }, _parent2, _scopeId));
                _push2(ssrRenderComponent(_component_UiBadge, { tone: "primary" }, {
                  default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                    if (_push3) {
                      _push3(`${ssrInterpolate(unref(mine).daily.level_label)}`);
                    } else {
                      return [
                        createTextVNode(toDisplayString(unref(mine).daily.level_label), 1)
                      ];
                    }
                  }),
                  _: 1
                }, _parent2, _scopeId));
                _push2(`</p></div>`);
                _push2(ssrRenderComponent(_component_UiProgressBar, {
                  value: unref(mine).daily.total ? Math.round(unref(mine).daily.done_today / unref(mine).daily.total * 100) : 0,
                  label: unref(t)("learn.doneToday", { done: unref(mine).daily.done_today, total: unref(mine).daily.total }),
                  "show-value": ""
                }, null, _parent2, _scopeId));
                _push2(`<ol class="divide-y divide-line"${_scopeId}><!--[-->`);
                ssrRenderList(unref(mine).daily.slots, (s) => {
                  _push2(`<li class="flex flex-wrap items-center justify-between gap-3 py-3"${_scopeId}><div class="flex min-w-0 items-center gap-3"${_scopeId}><span class="${ssrRenderClass([s.done_today ? "bg-success-soft text-success" : "bg-primary-soft text-primary-strong", "grid size-10 shrink-0 place-items-center rounded-full"])}"${_scopeId}>`);
                  _push2(ssrRenderComponent(_component_UiIcon, {
                    name: s.done_today ? "check" : typeIcon(s.type),
                    size: 20
                  }, null, _parent2, _scopeId));
                  _push2(`</span><div class="min-w-0"${_scopeId}><p class="text-sm text-muted"${_scopeId}>${ssrInterpolate(s.type_label)}</p>`);
                  if (s.lesson) {
                    _push2(`<p class="truncate font-medium"${_scopeId}>`);
                    _push2(ssrRenderComponent(_component_UiAutoItalian, {
                      text: s.lesson.title
                    }, null, _parent2, _scopeId));
                    _push2(`</p>`);
                  } else {
                    _push2(`<p class="text-muted"${_scopeId}>${ssrInterpolate(unref(t)("learn.noLessonSlot"))}</p>`);
                  }
                  _push2(`</div></div>`);
                  if (s.lesson) {
                    _push2(`<div class="flex shrink-0 items-center gap-2"${_scopeId}><span class="hidden text-sm text-muted sm:inline"${_scopeId}>${ssrInterpolate(unref(t)("learn.minutes", { count: s.lesson.duration_minutes }))}</span>`);
                    if (s.done_today) {
                      _push2(ssrRenderComponent(_component_UiBadge, { tone: "success" }, {
                        default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                          if (_push3) {
                            _push3(`${ssrInterpolate(unref(t)("learn.done"))}`);
                          } else {
                            return [
                              createTextVNode(toDisplayString(unref(t)("learn.done")), 1)
                            ];
                          }
                        }),
                        _: 2
                      }, _parent2, _scopeId));
                    } else {
                      _push2(`<!---->`);
                    }
                    _push2(ssrRenderComponent(_component_UiButton, {
                      to: `/learn-italian/lessons/${s.lesson.slug}`,
                      variant: s.done_today ? "secondary" : "primary"
                    }, {
                      default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                        if (_push3) {
                          _push3(`${ssrInterpolate(s.done_today ? unref(t)("learn.review") : unref(t)("learn.start"))}`);
                        } else {
                          return [
                            createTextVNode(toDisplayString(s.done_today ? unref(t)("learn.review") : unref(t)("learn.start")), 1)
                          ];
                        }
                      }),
                      _: 2
                    }, _parent2, _scopeId));
                    _push2(`</div>`);
                  } else {
                    _push2(`<!---->`);
                  }
                  _push2(`</li>`);
                });
                _push2(`<!--]--></ol>`);
              } else {
                return [
                  createVNode("div", { class: "flex flex-wrap items-center justify-between gap-3" }, [
                    createVNode("h2", {
                      id: "daily-h",
                      class: "text-xl font-bold"
                    }, toDisplayString(unref(t)("learn.dailyTitle")), 1),
                    createVNode("p", { class: "flex flex-wrap items-center gap-2 text-sm" }, [
                      createVNode(_component_UiBadge, { tone: "accent" }, {
                        default: withCtx(() => [
                          createVNode(_component_UiIcon, {
                            name: "flame",
                            size: 14
                          }),
                          createTextVNode(toDisplayString(unref(t)("learn.streak", { count: unref(mine).daily.streak })), 1)
                        ]),
                        _: 1
                      }),
                      createVNode(_component_UiBadge, null, {
                        default: withCtx(() => [
                          createVNode(_component_UiIcon, {
                            name: "clock",
                            size: 14
                          }),
                          createTextVNode(toDisplayString(unref(t)("learn.minutes", { count: unref(mine).daily.minutes })), 1)
                        ]),
                        _: 1
                      }),
                      createVNode(_component_UiBadge, { tone: "primary" }, {
                        default: withCtx(() => [
                          createTextVNode(toDisplayString(unref(mine).daily.level_label), 1)
                        ]),
                        _: 1
                      })
                    ])
                  ]),
                  createVNode(_component_UiProgressBar, {
                    value: unref(mine).daily.total ? Math.round(unref(mine).daily.done_today / unref(mine).daily.total * 100) : 0,
                    label: unref(t)("learn.doneToday", { done: unref(mine).daily.done_today, total: unref(mine).daily.total }),
                    "show-value": ""
                  }, null, 8, ["value", "label"]),
                  createVNode("ol", { class: "divide-y divide-line" }, [
                    (openBlock(true), createBlock(Fragment, null, renderList(unref(mine).daily.slots, (s) => {
                      return openBlock(), createBlock("li", {
                        key: s.slot,
                        class: "flex flex-wrap items-center justify-between gap-3 py-3"
                      }, [
                        createVNode("div", { class: "flex min-w-0 items-center gap-3" }, [
                          createVNode("span", {
                            class: ["grid size-10 shrink-0 place-items-center rounded-full", s.done_today ? "bg-success-soft text-success" : "bg-primary-soft text-primary-strong"]
                          }, [
                            createVNode(_component_UiIcon, {
                              name: s.done_today ? "check" : typeIcon(s.type),
                              size: 20
                            }, null, 8, ["name"])
                          ], 2),
                          createVNode("div", { class: "min-w-0" }, [
                            createVNode("p", { class: "text-sm text-muted" }, toDisplayString(s.type_label), 1),
                            s.lesson ? (openBlock(), createBlock("p", {
                              key: 0,
                              class: "truncate font-medium"
                            }, [
                              createVNode(_component_UiAutoItalian, {
                                text: s.lesson.title
                              }, null, 8, ["text"])
                            ])) : (openBlock(), createBlock("p", {
                              key: 1,
                              class: "text-muted"
                            }, toDisplayString(unref(t)("learn.noLessonSlot")), 1))
                          ])
                        ]),
                        s.lesson ? (openBlock(), createBlock("div", {
                          key: 0,
                          class: "flex shrink-0 items-center gap-2"
                        }, [
                          createVNode("span", { class: "hidden text-sm text-muted sm:inline" }, toDisplayString(unref(t)("learn.minutes", { count: s.lesson.duration_minutes })), 1),
                          s.done_today ? (openBlock(), createBlock(_component_UiBadge, {
                            key: 0,
                            tone: "success"
                          }, {
                            default: withCtx(() => [
                              createTextVNode(toDisplayString(unref(t)("learn.done")), 1)
                            ]),
                            _: 1
                          })) : createCommentVNode("", true),
                          createVNode(_component_UiButton, {
                            to: `/learn-italian/lessons/${s.lesson.slug}`,
                            variant: s.done_today ? "secondary" : "primary"
                          }, {
                            default: withCtx(() => [
                              createTextVNode(toDisplayString(s.done_today ? unref(t)("learn.review") : unref(t)("learn.start")), 1)
                            ]),
                            _: 2
                          }, 1032, ["to", "variant"])
                        ])) : createCommentVNode("", true)
                      ]);
                    }), 128))
                  ])
                ];
              }
            }),
            _: 1
          }, _parent));
          _push(ssrRenderComponent(_component_UiCard, {
            as: "section",
            "aria-labelledby": "prog-h",
            class: "min-w-0 space-y-4"
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              var _a2, _b2;
              if (_push2) {
                _push2(`<h2 id="prog-h" class="text-xl font-bold"${_scopeId}>${ssrInterpolate(unref(t)("learn.progressTitle"))}</h2><ul class="space-y-3"${_scopeId}><!--[-->`);
                ssrRenderList(unref(mine).progress.levels.filter((x) => x.total > 0), (l) => {
                  _push2(`<li${_scopeId}>`);
                  _push2(ssrRenderComponent(_component_UiProgressBar, {
                    value: l.percent,
                    label: `${l.label} \xB7 ${l.completed}/${l.total}`,
                    "show-value": ""
                  }, null, _parent2, _scopeId));
                  _push2(`</li>`);
                });
                _push2(`<!--]--></ul>`);
                if (!unref(mine).progress.levels.some((x) => x.total > 0)) {
                  _push2(`<p class="text-muted"${_scopeId}>${ssrInterpolate(unref(t)("learn.noLessonsYet"))}</p>`);
                } else {
                  _push2(`<!---->`);
                }
                if ((_a2 = unref(mine).daily.practice) == null ? void 0 : _a2.vocabulary) {
                  _push2(`<p class="rounded-md bg-sunken p-3 text-sm" data-testid="daily-practice"${_scopeId}>${ssrInterpolate(unref(t)("practice.dailyHint", { due: unref(mine).daily.practice.vocabulary.due, fresh: unref(mine).daily.practice.vocabulary.new }))} `);
                  _push2(ssrRenderComponent(_component_NuxtLink, {
                    to: unref(localePath)("/learn-italian/practice/review"),
                    class: "font-medium text-primary-strong underline underline-offset-4"
                  }, {
                    default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                      if (_push3) {
                        _push3(`${ssrInterpolate(unref(t)("practice.startReview"))}`);
                      } else {
                        return [
                          createTextVNode(toDisplayString(unref(t)("practice.startReview")), 1)
                        ];
                      }
                    }),
                    _: 1
                  }, _parent2, _scopeId));
                  _push2(`</p>`);
                } else {
                  _push2(`<!---->`);
                }
              } else {
                return [
                  createVNode("h2", {
                    id: "prog-h",
                    class: "text-xl font-bold"
                  }, toDisplayString(unref(t)("learn.progressTitle")), 1),
                  createVNode("ul", { class: "space-y-3" }, [
                    (openBlock(true), createBlock(Fragment, null, renderList(unref(mine).progress.levels.filter((x) => x.total > 0), (l) => {
                      return openBlock(), createBlock("li", {
                        key: l.level
                      }, [
                        createVNode(_component_UiProgressBar, {
                          value: l.percent,
                          label: `${l.label} \xB7 ${l.completed}/${l.total}`,
                          "show-value": ""
                        }, null, 8, ["value", "label"])
                      ]);
                    }), 128))
                  ]),
                  !unref(mine).progress.levels.some((x) => x.total > 0) ? (openBlock(), createBlock("p", {
                    key: 0,
                    class: "text-muted"
                  }, toDisplayString(unref(t)("learn.noLessonsYet")), 1)) : createCommentVNode("", true),
                  ((_b2 = unref(mine).daily.practice) == null ? void 0 : _b2.vocabulary) ? (openBlock(), createBlock("p", {
                    key: 1,
                    class: "rounded-md bg-sunken p-3 text-sm",
                    "data-testid": "daily-practice"
                  }, [
                    createTextVNode(toDisplayString(unref(t)("practice.dailyHint", { due: unref(mine).daily.practice.vocabulary.due, fresh: unref(mine).daily.practice.vocabulary.new })) + " ", 1),
                    createVNode(_component_NuxtLink, {
                      to: unref(localePath)("/learn-italian/practice/review"),
                      class: "font-medium text-primary-strong underline underline-offset-4"
                    }, {
                      default: withCtx(() => [
                        createTextVNode(toDisplayString(unref(t)("practice.startReview")), 1)
                      ]),
                      _: 1
                    }, 8, ["to"])
                  ])) : createCommentVNode("", true)
                ];
              }
            }),
            _: 1
          }, _parent));
          _push(`<!--]-->`);
        }
        _push(`</section>`);
      } else {
        _push(ssrRenderComponent(_component_UiAlert, {
          tone: "info",
          class: "mb-8"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<p${_scopeId}>${ssrInterpolate(unref(t)("learn.loginForDaily"))}</p>`);
              _push2(ssrRenderComponent(_component_UiButton, {
                to: "/login",
                variant: "secondary",
                class: "mt-3"
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
            } else {
              return [
                createVNode("p", null, toDisplayString(unref(t)("learn.loginForDaily")), 1),
                createVNode(_component_UiButton, {
                  to: "/login",
                  variant: "secondary",
                  class: "mt-3"
                }, {
                  default: withCtx(() => [
                    createTextVNode(toDisplayString(unref(t)("auth.login")), 1)
                  ]),
                  _: 1
                })
              ];
            }
          }),
          _: 1
        }, _parent));
      }
      _push(`<section aria-labelledby="browse-h" class="space-y-5"><h2 id="browse-h" class="text-xl font-bold">${ssrInterpolate(unref(t)("learn.browse"))}</h2><div class="grid gap-4 rounded-lg border border-line bg-surface p-4 sm:grid-cols-3">`);
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
        label: unref(t)("learn.type")
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
      _push(`</div><div aria-live="polite" class="sr-only">${ssrInterpolate(unref(lm) ? unref(t)("guides.resultsCount", { count: (_a = unref(lm).total) != null ? _a : unref(lessons).length }) : "")}</div>`);
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
      } else if (!unref(lessons).length) {
        _push(ssrRenderComponent(_component_UiEmptyState, {
          title: unref(t)("learn.emptyTitle"),
          description: unref(hasFilters) ? unref(t)("guides.noResults") : unref(t)("learn.empty"),
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
        ssrRenderList(unref(lessons), (l) => {
          _push(`<li>`);
          _push(ssrRenderComponent(_component_UiCard, {
            as: "article",
            class: "relative flex h-full flex-col gap-3 transition-shadow focus-within:shadow-3 hover:shadow-2"
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              var _a2, _b2;
              if (_push2) {
                _push2(`<div class="flex flex-wrap items-center gap-2"${_scopeId}>`);
                _push2(ssrRenderComponent(_component_UiBadge, { tone: "primary" }, {
                  default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                    if (_push3) {
                      _push3(`${ssrInterpolate(l.level_label)}`);
                    } else {
                      return [
                        createTextVNode(toDisplayString(l.level_label), 1)
                      ];
                    }
                  }),
                  _: 2
                }, _parent2, _scopeId));
                _push2(ssrRenderComponent(_component_UiBadge, null, {
                  default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                    if (_push3) {
                      _push3(`${ssrInterpolate(l.type_label)}`);
                    } else {
                      return [
                        createTextVNode(toDisplayString(l.type_label), 1)
                      ];
                    }
                  }),
                  _: 2
                }, _parent2, _scopeId));
                if (((_a2 = l.progress) == null ? void 0 : _a2.status) === "completed") {
                  _push2(ssrRenderComponent(_component_UiBadge, { tone: "success" }, {
                    default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                      if (_push3) {
                        _push3(ssrRenderComponent(_component_UiIcon, {
                          name: "check",
                          size: 14
                        }, null, _parent3, _scopeId2));
                        _push3(`${ssrInterpolate(unref(t)("learn.done"))}`);
                      } else {
                        return [
                          createVNode(_component_UiIcon, {
                            name: "check",
                            size: 14
                          }),
                          createTextVNode(toDisplayString(unref(t)("learn.done")), 1)
                        ];
                      }
                    }),
                    _: 2
                  }, _parent2, _scopeId));
                } else {
                  _push2(`<!---->`);
                }
                _push2(`</div><h3 class="text-lg font-bold"${_scopeId}>`);
                _push2(ssrRenderComponent(_component_NuxtLink, {
                  to: unref(localePath)(`/learn-italian/lessons/${l.slug}`),
                  class: "after:absolute after:inset-0 after:content-['']"
                }, {
                  default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                    if (_push3) {
                      _push3(ssrRenderComponent(_component_UiAutoItalian, {
                        text: l.title
                      }, null, _parent3, _scopeId2));
                    } else {
                      return [
                        createVNode(_component_UiAutoItalian, {
                          text: l.title
                        }, null, 8, ["text"])
                      ];
                    }
                  }),
                  _: 2
                }, _parent2, _scopeId));
                _push2(`</h3>`);
                if (l.summary) {
                  _push2(`<p class="line-clamp-3 text-ink-soft"${_scopeId}>${ssrInterpolate(l.summary)}</p>`);
                } else {
                  _push2(`<!---->`);
                }
                _push2(`<p class="mt-auto flex items-center gap-1.5 text-sm text-muted"${_scopeId}>`);
                _push2(ssrRenderComponent(_component_UiIcon, {
                  name: "clock",
                  size: 16
                }, null, _parent2, _scopeId));
                _push2(`${ssrInterpolate(unref(t)("learn.minutes", { count: l.duration_minutes }))}`);
                if (l.scenario_label) {
                  _push2(`<!--[--> \xB7 ${ssrInterpolate(l.scenario_label)}<!--]-->`);
                } else {
                  _push2(`<!---->`);
                }
                _push2(`</p>`);
              } else {
                return [
                  createVNode("div", { class: "flex flex-wrap items-center gap-2" }, [
                    createVNode(_component_UiBadge, { tone: "primary" }, {
                      default: withCtx(() => [
                        createTextVNode(toDisplayString(l.level_label), 1)
                      ]),
                      _: 2
                    }, 1024),
                    createVNode(_component_UiBadge, null, {
                      default: withCtx(() => [
                        createTextVNode(toDisplayString(l.type_label), 1)
                      ]),
                      _: 2
                    }, 1024),
                    ((_b2 = l.progress) == null ? void 0 : _b2.status) === "completed" ? (openBlock(), createBlock(_component_UiBadge, {
                      key: 0,
                      tone: "success"
                    }, {
                      default: withCtx(() => [
                        createVNode(_component_UiIcon, {
                          name: "check",
                          size: 14
                        }),
                        createTextVNode(toDisplayString(unref(t)("learn.done")), 1)
                      ]),
                      _: 1
                    })) : createCommentVNode("", true)
                  ]),
                  createVNode("h3", { class: "text-lg font-bold" }, [
                    createVNode(_component_NuxtLink, {
                      to: unref(localePath)(`/learn-italian/lessons/${l.slug}`),
                      class: "after:absolute after:inset-0 after:content-['']"
                    }, {
                      default: withCtx(() => [
                        createVNode(_component_UiAutoItalian, {
                          text: l.title
                        }, null, 8, ["text"])
                      ]),
                      _: 2
                    }, 1032, ["to"])
                  ]),
                  l.summary ? (openBlock(), createBlock("p", {
                    key: 0,
                    class: "line-clamp-3 text-ink-soft"
                  }, toDisplayString(l.summary), 1)) : createCommentVNode("", true),
                  createVNode("p", { class: "mt-auto flex items-center gap-1.5 text-sm text-muted" }, [
                    createVNode(_component_UiIcon, {
                      name: "clock",
                      size: 16
                    }),
                    createTextVNode(toDisplayString(unref(t)("learn.minutes", { count: l.duration_minutes })), 1),
                    l.scenario_label ? (openBlock(), createBlock(Fragment, { key: 0 }, [
                      createTextVNode(" \xB7 " + toDisplayString(l.scenario_label), 1)
                    ], 64)) : createCommentVNode("", true)
                  ])
                ];
              }
            }),
            _: 2
          }, _parent));
          _push(`</li>`);
        });
        _push(`<!--]--></ul>`);
        _push(ssrRenderComponent(_component_UiPagination, {
          page: (_c = (_b = unref(lm)) == null ? void 0 : _b.page) != null ? _c : 1,
          "last-page": (_e = (_d = unref(lm)) == null ? void 0 : _d.last_page) != null ? _e : 1,
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/learn-italian/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=index-BZZNTjTF.mjs.map
