import { _ as _sfc_main$1 } from './Skeleton-BTnKIEst.mjs';
import { u as useI18n, g as useApi, i as _sfc_main$2, j as isApiError, _ as _sfc_main$3$1, d as _sfc_main$5$1 } from './server.mjs';
import { _ as _sfc_main$3 } from './Alert-D-zfMDy5.mjs';
import { _ as _sfc_main$4 } from './Card-BxvVO_-_.mjs';
import { _ as _sfc_main$5 } from './ScoreRing-D5NDFTYF.mjs';
import { _ as _sfc_main$6 } from './ProgressBar-DvR1KKgW.mjs';
import { _ as _sfc_main$7 } from './EmptyState-N2xvHts8.mjs';
import { _ as _sfc_main$8 } from './AutoItalian-BD4PyQ-n.mjs';
import { _ as _sfc_main$9 } from './Badge-PdKIsny2.mjs';
import { _ as _sfc_main$a } from './List-fxeFRg0m.mjs';
import { defineComponent, withAsyncContext, computed, ref, mergeProps, unref, withCtx, createTextVNode, toDisplayString, createVNode, openBlock, createBlock, Fragment, renderList, withDirectives, vShow, createCommentVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderList, ssrRenderAttr, ssrRenderStyle } from 'vue/server-renderer';
import { u as useToast } from './useToast-BX2bodPv.mjs';
import { u as useSeo } from './useSeo-BU4sLOnV.mjs';
import { u as useAsyncData } from './asyncData-bKJD5Wmv.mjs';
import { a as mapApiAction } from './routes-BNQ9Jhms.mjs';
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
  __name: "dashboard",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const { t, locale } = useI18n();
    const { request } = useApi();
    const toast = useToast();
    useSeo(() => ({ title: t("dashboard.title"), description: t("dashboard.subtitle"), noindex: true }));
    const { data, error, refresh, status } = ([__temp, __restore] = withAsyncContext(() => useAsyncData("dashboard", () => request("dashboard"), { watch: [locale] })), __temp = await __temp, __restore(), __temp);
    const dash = computed(() => {
      var _a;
      return (_a = data.value) == null ? void 0 : _a.data;
    });
    const { data: recs, error: recsError, refresh: refreshRecs, status: recsStatus } = ([__temp, __restore] = withAsyncContext(async () => useAsyncData("dashboard-recs", async () => (await request("recommendations")).data, { watch: [locale] })), __temp = await __temp, __restore(), __temp);
    const showHow = ref(false);
    function linkFor(a) {
      return mapApiAction(a.cta);
    }
    const doneKeys = ref(/* @__PURE__ */ new Set());
    const busyKeys = ref(/* @__PURE__ */ new Set());
    const actions = computed(() => {
      var _a, _b;
      return ((_b = (_a = dash.value) == null ? void 0 : _a.next_actions) != null ? _b : []).filter((a) => !doneKeys.value.has(a.key));
    });
    async function markDone(a) {
      busyKeys.value = new Set(busyKeys.value).add(a.key);
      doneKeys.value = new Set(doneKeys.value).add(a.key);
      try {
        await request(`dashboard/tasks/${encodeURIComponent(a.cta.target)}`, { method: "PUT", body: { status: "done" } });
        toast.success(t("tasks.markedDone"));
        await refresh();
      } catch (e) {
        const rollback = new Set(doneKeys.value);
        rollback.delete(a.key);
        doneKeys.value = rollback;
        toast.error(isApiError(e) ? e.message : t("errors.generic"));
      } finally {
        const next = new Set(busyKeys.value);
        next.delete(a.key);
        busyKeys.value = next;
        doneKeys.value = /* @__PURE__ */ new Set();
      }
    }
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UiSkeleton = _sfc_main$1;
      const _component_UiErrorState = _sfc_main$2;
      const _component_UiAlert = _sfc_main$3;
      const _component_UiButton = _sfc_main$3$1;
      const _component_UiCard = _sfc_main$4;
      const _component_UiScoreRing = _sfc_main$5;
      const _component_UiProgressBar = _sfc_main$6;
      const _component_UiIcon = _sfc_main$5$1;
      const _component_UiEmptyState = _sfc_main$7;
      const _component_UiAutoItalian = _sfc_main$8;
      const _component_UiBadge = _sfc_main$9;
      const _component_RecsList = _sfc_main$a;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "container-page py-8 sm:py-12" }, _attrs))}>`);
      if (unref(status) === "pending" && !unref(data)) {
        _push(`<div aria-busy="true" class="grid gap-6 lg:grid-cols-3">`);
        _push(ssrRenderComponent(_component_UiSkeleton, {
          block: "",
          class: "lg:col-span-1"
        }, null, _parent));
        _push(ssrRenderComponent(_component_UiSkeleton, {
          block: "",
          class: "lg:col-span-2",
          lines: 5
        }, null, _parent));
        _push(`</div>`);
      } else if (unref(error) || !unref(dash)) {
        _push(ssrRenderComponent(_component_UiErrorState, {
          "heading-level": 1,
          message: ("isApiError" in _ctx ? _ctx.isApiError : unref(isApiError))(unref(error)) ? unref(error).message : void 0,
          code: ("isApiError" in _ctx ? _ctx.isApiError : unref(isApiError))(unref(error)) ? unref(error).code : void 0,
          retry: "",
          onRetry: ($event) => unref(refresh)()
        }, null, _parent));
      } else {
        _push(`<!--[--><header class="mb-8"><h1 class="text-2xl font-bold sm:text-3xl">${ssrInterpolate(unref(t)("dashboard.greeting", { name: unref(dash).greeting.name }))}</h1><p class="mt-1 text-ink-soft">${ssrInterpolate(unref(t)("dashboard.subtitle"))}</p></header>`);
        if (!unref(dash).personalization.enabled) {
          _push(ssrRenderComponent(_component_UiAlert, {
            tone: "info",
            class: "mb-6",
            title: unref(t)("dashboard.personalizationOffTitle")
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              var _a, _b;
              if (_push2) {
                _push2(`<p${_scopeId}>${ssrInterpolate((_a = unref(dash).score.note) != null ? _a : unref(t)("dashboard.personalizationOff"))}</p>`);
                _push2(ssrRenderComponent(_component_UiButton, {
                  to: "/privacy-settings",
                  variant: "secondary",
                  class: "mt-3"
                }, {
                  default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                    if (_push3) {
                      _push3(`${ssrInterpolate(unref(t)("dashboard.personalizationOffCta"))}`);
                    } else {
                      return [
                        createTextVNode(toDisplayString(unref(t)("dashboard.personalizationOffCta")), 1)
                      ];
                    }
                  }),
                  _: 1
                }, _parent2, _scopeId));
              } else {
                return [
                  createVNode("p", null, toDisplayString((_b = unref(dash).score.note) != null ? _b : unref(t)("dashboard.personalizationOff")), 1),
                  createVNode(_component_UiButton, {
                    to: "/privacy-settings",
                    variant: "secondary",
                    class: "mt-3"
                  }, {
                    default: withCtx(() => [
                      createTextVNode(toDisplayString(unref(t)("dashboard.personalizationOffCta")), 1)
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
        _push(`<div class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">`);
        _push(ssrRenderComponent(_component_UiCard, {
          as: "section",
          "aria-labelledby": "score-h",
          class: "space-y-5"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<h2 id="score-h" class="text-xl font-bold"${_scopeId}>${ssrInterpolate(unref(t)("score.title"))}</h2><div class="flex justify-center"${_scopeId}>`);
              _push2(ssrRenderComponent(_component_UiScoreRing, {
                value: unref(dash).score.overall,
                label: unref(t)("score.label"),
                size: 176
              }, null, _parent2, _scopeId));
              _push2(`</div>`);
              if (unref(dash).score.overall !== null) {
                _push2(`<p class="text-center text-sm text-muted"${_scopeId}>${ssrInterpolate(unref(t)("score.summary", { done: unref(dash).score.done_tasks, total: unref(dash).score.applicable_tasks }))}</p>`);
              } else {
                _push2(`<p class="text-center text-sm text-muted"${_scopeId}>${ssrInterpolate(unref(t)("score.notEnoughData"))}</p>`);
              }
              _push2(`<ul class="space-y-4"${_scopeId}><!--[-->`);
              ssrRenderList(unref(dash).score.categories, (c) => {
                _push2(`<li${_scopeId}>`);
                _push2(ssrRenderComponent(_component_UiProgressBar, {
                  value: c.percent,
                  label: c.label,
                  "show-value": ""
                }, null, _parent2, _scopeId));
                if (c.percent === null) {
                  _push2(`<p class="mt-1 text-xs text-muted"${_scopeId}>${ssrInterpolate(unref(t)("score.notApplicable"))}</p>`);
                } else {
                  _push2(`<p class="mt-1 text-xs text-muted"${_scopeId}>${ssrInterpolate(unref(t)("score.categoryCount", { done: c.done, total: c.total }))}</p>`);
                }
                _push2(`</li>`);
              });
              _push2(`<!--]--></ul><div${_scopeId}><button type="button" class="inline-flex min-h-touch items-center gap-2 font-medium text-primary-strong"${ssrRenderAttr("aria-expanded", unref(showHow))} aria-controls="how-calc"${_scopeId}>`);
              _push2(ssrRenderComponent(_component_UiIcon, {
                name: "chevron-down",
                size: 18,
                class: unref(showHow) ? "rotate-180" : ""
              }, null, _parent2, _scopeId));
              _push2(`${ssrInterpolate(unref(t)("score.howTitle"))}</button><p id="how-calc" class="prose-plain mt-2 rounded-md bg-sunken p-3 text-ink-soft" style="${ssrRenderStyle(unref(showHow) ? null : { display: "none" })}"${_scopeId}>${ssrInterpolate(unref(dash).score.how_calculated)}</p></div>`);
            } else {
              return [
                createVNode("h2", {
                  id: "score-h",
                  class: "text-xl font-bold"
                }, toDisplayString(unref(t)("score.title")), 1),
                createVNode("div", { class: "flex justify-center" }, [
                  createVNode(_component_UiScoreRing, {
                    value: unref(dash).score.overall,
                    label: unref(t)("score.label"),
                    size: 176
                  }, null, 8, ["value", "label"])
                ]),
                unref(dash).score.overall !== null ? (openBlock(), createBlock("p", {
                  key: 0,
                  class: "text-center text-sm text-muted"
                }, toDisplayString(unref(t)("score.summary", { done: unref(dash).score.done_tasks, total: unref(dash).score.applicable_tasks })), 1)) : (openBlock(), createBlock("p", {
                  key: 1,
                  class: "text-center text-sm text-muted"
                }, toDisplayString(unref(t)("score.notEnoughData")), 1)),
                createVNode("ul", { class: "space-y-4" }, [
                  (openBlock(true), createBlock(Fragment, null, renderList(unref(dash).score.categories, (c) => {
                    return openBlock(), createBlock("li", {
                      key: c.key
                    }, [
                      createVNode(_component_UiProgressBar, {
                        value: c.percent,
                        label: c.label,
                        "show-value": ""
                      }, null, 8, ["value", "label"]),
                      c.percent === null ? (openBlock(), createBlock("p", {
                        key: 0,
                        class: "mt-1 text-xs text-muted"
                      }, toDisplayString(unref(t)("score.notApplicable")), 1)) : (openBlock(), createBlock("p", {
                        key: 1,
                        class: "mt-1 text-xs text-muted"
                      }, toDisplayString(unref(t)("score.categoryCount", { done: c.done, total: c.total })), 1))
                    ]);
                  }), 128))
                ]),
                createVNode("div", null, [
                  createVNode("button", {
                    type: "button",
                    class: "inline-flex min-h-touch items-center gap-2 font-medium text-primary-strong",
                    "aria-expanded": unref(showHow),
                    "aria-controls": "how-calc",
                    onClick: ($event) => showHow.value = !unref(showHow)
                  }, [
                    createVNode(_component_UiIcon, {
                      name: "chevron-down",
                      size: 18,
                      class: unref(showHow) ? "rotate-180" : ""
                    }, null, 8, ["class"]),
                    createTextVNode(toDisplayString(unref(t)("score.howTitle")), 1)
                  ], 8, ["aria-expanded", "onClick"]),
                  withDirectives(createVNode("p", {
                    id: "how-calc",
                    class: "prose-plain mt-2 rounded-md bg-sunken p-3 text-ink-soft"
                  }, toDisplayString(unref(dash).score.how_calculated), 513), [
                    [vShow, unref(showHow)]
                  ])
                ])
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(ssrRenderComponent(_component_UiCard, {
          as: "section",
          "aria-labelledby": "next-h",
          class: "space-y-4"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<div class="flex items-center justify-between gap-3"${_scopeId}><h2 id="next-h" class="text-xl font-bold"${_scopeId}>${ssrInterpolate(unref(t)("dashboard.nextTitle"))}</h2>`);
              _push2(ssrRenderComponent(_component_UiButton, {
                to: "/tasks",
                variant: "ghost"
              }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(`${ssrInterpolate(unref(t)("dashboard.allTasks"))}`);
                    _push3(ssrRenderComponent(_component_UiIcon, {
                      name: "chevron-end",
                      size: 18
                    }, null, _parent3, _scopeId2));
                  } else {
                    return [
                      createTextVNode(toDisplayString(unref(t)("dashboard.allTasks")), 1),
                      createVNode(_component_UiIcon, {
                        name: "chevron-end",
                        size: 18
                      })
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
              _push2(`</div>`);
              if (!unref(actions).length) {
                _push2(ssrRenderComponent(_component_UiEmptyState, {
                  title: unref(t)("dashboard.nextEmptyTitle"),
                  description: unref(t)("dashboard.nextEmpty"),
                  icon: "check"
                }, null, _parent2, _scopeId));
              } else {
                _push2(`<ul class="divide-y divide-line"${_scopeId}><!--[-->`);
                ssrRenderList(unref(actions), (a) => {
                  _push2(`<li class="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"${_scopeId}><div class="min-w-0"${_scopeId}><p class="font-semibold"${_scopeId}>`);
                  _push2(ssrRenderComponent(_component_UiAutoItalian, {
                    text: a.title
                  }, null, _parent2, _scopeId));
                  _push2(`</p>`);
                  if (a.description) {
                    _push2(`<p class="text-sm text-ink-soft"${_scopeId}>${ssrInterpolate(a.description)}</p>`);
                  } else {
                    _push2(`<!---->`);
                  }
                  _push2(`</div><div class="shrink-0"${_scopeId}>`);
                  if (a.cta.type === "task") {
                    _push2(ssrRenderComponent(_component_UiButton, {
                      variant: "secondary",
                      loading: unref(busyKeys).has(a.key),
                      onClick: ($event) => markDone(a)
                    }, {
                      default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                        if (_push3) {
                          _push3(ssrRenderComponent(_component_UiIcon, {
                            name: "check",
                            size: 18
                          }, null, _parent3, _scopeId2));
                          _push3(`${ssrInterpolate(unref(t)("tasks.markDone"))}`);
                        } else {
                          return [
                            createVNode(_component_UiIcon, {
                              name: "check",
                              size: 18
                            }),
                            createTextVNode(toDisplayString(unref(t)("tasks.markDone")), 1)
                          ];
                        }
                      }),
                      _: 2
                    }, _parent2, _scopeId));
                  } else if (linkFor(a)) {
                    _push2(ssrRenderComponent(_component_UiButton, {
                      to: linkFor(a),
                      variant: "secondary"
                    }, {
                      default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                        if (_push3) {
                          _push3(`${ssrInterpolate(a.cta.type === "guide" ? unref(t)("dashboard.readGuide") : unref(t)("dashboard.open"))}`);
                          _push3(ssrRenderComponent(_component_UiIcon, {
                            name: "arrow-end",
                            size: 18
                          }, null, _parent3, _scopeId2));
                        } else {
                          return [
                            createTextVNode(toDisplayString(a.cta.type === "guide" ? unref(t)("dashboard.readGuide") : unref(t)("dashboard.open")), 1),
                            createVNode(_component_UiIcon, {
                              name: "arrow-end",
                              size: 18
                            })
                          ];
                        }
                      }),
                      _: 2
                    }, _parent2, _scopeId));
                  } else {
                    _push2(ssrRenderComponent(_component_UiBadge, null, {
                      default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                        if (_push3) {
                          _push3(`${ssrInterpolate(unref(t)("common.comingSoon"))}`);
                        } else {
                          return [
                            createTextVNode(toDisplayString(unref(t)("common.comingSoon")), 1)
                          ];
                        }
                      }),
                      _: 2
                    }, _parent2, _scopeId));
                  }
                  _push2(`</div></li>`);
                });
                _push2(`<!--]--></ul>`);
              }
            } else {
              return [
                createVNode("div", { class: "flex items-center justify-between gap-3" }, [
                  createVNode("h2", {
                    id: "next-h",
                    class: "text-xl font-bold"
                  }, toDisplayString(unref(t)("dashboard.nextTitle")), 1),
                  createVNode(_component_UiButton, {
                    to: "/tasks",
                    variant: "ghost"
                  }, {
                    default: withCtx(() => [
                      createTextVNode(toDisplayString(unref(t)("dashboard.allTasks")), 1),
                      createVNode(_component_UiIcon, {
                        name: "chevron-end",
                        size: 18
                      })
                    ]),
                    _: 1
                  })
                ]),
                !unref(actions).length ? (openBlock(), createBlock(_component_UiEmptyState, {
                  key: 0,
                  title: unref(t)("dashboard.nextEmptyTitle"),
                  description: unref(t)("dashboard.nextEmpty"),
                  icon: "check"
                }, null, 8, ["title", "description"])) : (openBlock(), createBlock("ul", {
                  key: 1,
                  class: "divide-y divide-line"
                }, [
                  (openBlock(true), createBlock(Fragment, null, renderList(unref(actions), (a) => {
                    return openBlock(), createBlock("li", {
                      key: a.key,
                      class: "flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"
                    }, [
                      createVNode("div", { class: "min-w-0" }, [
                        createVNode("p", { class: "font-semibold" }, [
                          createVNode(_component_UiAutoItalian, {
                            text: a.title
                          }, null, 8, ["text"])
                        ]),
                        a.description ? (openBlock(), createBlock("p", {
                          key: 0,
                          class: "text-sm text-ink-soft"
                        }, toDisplayString(a.description), 1)) : createCommentVNode("", true)
                      ]),
                      createVNode("div", { class: "shrink-0" }, [
                        a.cta.type === "task" ? (openBlock(), createBlock(_component_UiButton, {
                          key: 0,
                          variant: "secondary",
                          loading: unref(busyKeys).has(a.key),
                          onClick: ($event) => markDone(a)
                        }, {
                          default: withCtx(() => [
                            createVNode(_component_UiIcon, {
                              name: "check",
                              size: 18
                            }),
                            createTextVNode(toDisplayString(unref(t)("tasks.markDone")), 1)
                          ]),
                          _: 1
                        }, 8, ["loading", "onClick"])) : linkFor(a) ? (openBlock(), createBlock(_component_UiButton, {
                          key: 1,
                          to: linkFor(a),
                          variant: "secondary"
                        }, {
                          default: withCtx(() => [
                            createTextVNode(toDisplayString(a.cta.type === "guide" ? unref(t)("dashboard.readGuide") : unref(t)("dashboard.open")), 1),
                            createVNode(_component_UiIcon, {
                              name: "arrow-end",
                              size: 18
                            })
                          ]),
                          _: 2
                        }, 1032, ["to"])) : (openBlock(), createBlock(_component_UiBadge, { key: 2 }, {
                          default: withCtx(() => [
                            createTextVNode(toDisplayString(unref(t)("common.comingSoon")), 1)
                          ]),
                          _: 1
                        }))
                      ])
                    ]);
                  }), 128))
                ]))
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div>`);
        _push(ssrRenderComponent(_component_UiCard, {
          as: "section",
          "aria-labelledby": "recs-h",
          class: "mt-6 space-y-4",
          "data-testid": "dashboard-recs"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<div class="flex items-center justify-between gap-3"${_scopeId}><h2 id="recs-h" class="text-xl font-bold"${_scopeId}>${ssrInterpolate(unref(t)("recs.title"))}</h2>`);
              _push2(ssrRenderComponent(_component_UiButton, {
                to: "/recommendations",
                variant: "ghost"
              }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(`${ssrInterpolate(unref(t)("recs.seeAll"))}`);
                    _push3(ssrRenderComponent(_component_UiIcon, {
                      name: "chevron-end",
                      size: 18
                    }, null, _parent3, _scopeId2));
                  } else {
                    return [
                      createTextVNode(toDisplayString(unref(t)("recs.seeAll")), 1),
                      createVNode(_component_UiIcon, {
                        name: "chevron-end",
                        size: 18
                      })
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
              _push2(`</div>`);
              if (unref(recsStatus) === "pending" && !unref(recs)) {
                _push2(`<div aria-busy="true"${_scopeId}>`);
                _push2(ssrRenderComponent(_component_UiSkeleton, {
                  block: "",
                  lines: 3
                }, null, _parent2, _scopeId));
                _push2(`</div>`);
              } else if (unref(recsError) || !unref(recs)) {
                _push2(ssrRenderComponent(_component_UiAlert, { tone: "warning" }, {
                  default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                    if (_push3) {
                      _push3(`<p${_scopeId2}>${ssrInterpolate(unref(t)("recs.loadError"))}</p>`);
                      _push3(ssrRenderComponent(_component_UiButton, {
                        variant: "secondary",
                        class: "mt-3",
                        onClick: ($event) => unref(refreshRecs)()
                      }, {
                        default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                          if (_push4) {
                            _push4(`${ssrInterpolate(unref(t)("common.retry"))}`);
                          } else {
                            return [
                              createTextVNode(toDisplayString(unref(t)("common.retry")), 1)
                            ];
                          }
                        }),
                        _: 1
                      }, _parent3, _scopeId2));
                    } else {
                      return [
                        createVNode("p", null, toDisplayString(unref(t)("recs.loadError")), 1),
                        createVNode(_component_UiButton, {
                          variant: "secondary",
                          class: "mt-3",
                          onClick: ($event) => unref(refreshRecs)()
                        }, {
                          default: withCtx(() => [
                            createTextVNode(toDisplayString(unref(t)("common.retry")), 1)
                          ]),
                          _: 1
                        }, 8, ["onClick"])
                      ];
                    }
                  }),
                  _: 1
                }, _parent2, _scopeId));
              } else {
                _push2(ssrRenderComponent(_component_RecsList, {
                  recs: unref(recs),
                  "heading-level": 3,
                  "id-prefix": "drecs",
                  notice: unref(dash).personalization.enabled === false ? false : true
                }, null, _parent2, _scopeId));
              }
            } else {
              return [
                createVNode("div", { class: "flex items-center justify-between gap-3" }, [
                  createVNode("h2", {
                    id: "recs-h",
                    class: "text-xl font-bold"
                  }, toDisplayString(unref(t)("recs.title")), 1),
                  createVNode(_component_UiButton, {
                    to: "/recommendations",
                    variant: "ghost"
                  }, {
                    default: withCtx(() => [
                      createTextVNode(toDisplayString(unref(t)("recs.seeAll")), 1),
                      createVNode(_component_UiIcon, {
                        name: "chevron-end",
                        size: 18
                      })
                    ]),
                    _: 1
                  })
                ]),
                unref(recsStatus) === "pending" && !unref(recs) ? (openBlock(), createBlock("div", {
                  key: 0,
                  "aria-busy": "true"
                }, [
                  createVNode(_component_UiSkeleton, {
                    block: "",
                    lines: 3
                  })
                ])) : unref(recsError) || !unref(recs) ? (openBlock(), createBlock(_component_UiAlert, {
                  key: 1,
                  tone: "warning"
                }, {
                  default: withCtx(() => [
                    createVNode("p", null, toDisplayString(unref(t)("recs.loadError")), 1),
                    createVNode(_component_UiButton, {
                      variant: "secondary",
                      class: "mt-3",
                      onClick: ($event) => unref(refreshRecs)()
                    }, {
                      default: withCtx(() => [
                        createTextVNode(toDisplayString(unref(t)("common.retry")), 1)
                      ]),
                      _: 1
                    }, 8, ["onClick"])
                  ]),
                  _: 1
                })) : (openBlock(), createBlock(_component_RecsList, {
                  key: 2,
                  recs: unref(recs),
                  "heading-level": 3,
                  "id-prefix": "drecs",
                  notice: unref(dash).personalization.enabled === false ? false : true
                }, null, 8, ["recs", "notice"]))
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`<!--]-->`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/dashboard.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=dashboard-cnQN08tx.mjs.map
