import { _ as _sfc_main$1 } from './Disclaimer-ByrpdAjg.mjs';
import { u as useI18n, c as useLocalePath, a as useAuthStore, g as useApi, _ as _sfc_main$3, d as _sfc_main$5, i as _sfc_main$2$1, j as isApiError, e as __nuxt_component_0 } from './server.mjs';
import { _ as _sfc_main$2 } from './Skeleton-BTnKIEst.mjs';
import { _ as _sfc_main$4 } from './Card-BxvVO_-_.mjs';
import { _ as _sfc_main$6 } from './Alert-D-zfMDy5.mjs';
import { _ as _sfc_main$7 } from './SourceBadge-4_eAChkr.mjs';
import { _ as _sfc_main$8 } from './AutoItalian-BD4PyQ-n.mjs';
import { _ as _sfc_main$9 } from './FallbackNotice-CwHuyozE.mjs';
import { _ as _sfc_main$a } from './EmptyState-N2xvHts8.mjs';
import { _ as _sfc_main$b } from './Badge-PdKIsny2.mjs';
import { defineComponent, withAsyncContext, computed, mergeProps, unref, withCtx, createVNode, createTextVNode, toDisplayString, openBlock, createBlock, Fragment, renderList, createCommentVNode, useSSRContext } from 'vue';
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
    const localePath = useLocalePath();
    const auth = useAuthStore();
    const { request } = useApi();
    useSeo(() => ({ title: t("patente.title"), description: t("patente.subtitle") }));
    const { data, error, refresh, status } = ([__temp, __restore] = withAsyncContext(async () => useAsyncData("patente-home", async () => {
      const [cats, topics] = await Promise.all([request("patente/categories"), request("patente/topics")]);
      let progress = null;
      if (auth.isAuthenticated) {
        try {
          progress = (await request("patente/progress")).data;
        } catch {
          progress = null;
        }
      }
      return { cats: cats.data, topics: topics.data, progress };
    }, { watch: [locale] })), __temp = await __temp, __restore(), __temp);
    const acc = computed(() => {
      var _a, _b, _c;
      return new Map(((_c = (_b = (_a = data.value) == null ? void 0 : _a.progress) == null ? void 0 : _b.topics) != null ? _c : []).map((x) => [x.topic.slug, x]));
    });
    const weak = computed(() => {
      var _a, _b, _c;
      return ((_c = (_b = (_a = data.value) == null ? void 0 : _a.progress) == null ? void 0 : _b.topics) != null ? _c : []).filter((x) => x.weak);
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_PatenteDisclaimer = _sfc_main$1;
      const _component_UiButton = _sfc_main$3;
      const _component_UiIcon = _sfc_main$5;
      const _component_UiSkeleton = _sfc_main$2;
      const _component_UiErrorState = _sfc_main$2$1;
      const _component_UiCard = _sfc_main$4;
      const _component_UiAlert = _sfc_main$6;
      const _component_NuxtLink = __nuxt_component_0;
      const _component_UiSourceBadge = _sfc_main$7;
      const _component_UiAutoItalian = _sfc_main$8;
      const _component_GuideFallbackNotice = _sfc_main$9;
      const _component_UiEmptyState = _sfc_main$a;
      const _component_UiBadge = _sfc_main$b;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "container-page py-8 sm:py-12" }, _attrs))}><header class="mb-6 max-w-2xl"><h1 class="text-2xl font-bold sm:text-3xl">${ssrInterpolate(unref(t)("patente.title"))}</h1><p class="mt-1 text-ink-soft">${ssrInterpolate(unref(t)("patente.subtitle"))}</p></header>`);
      _push(ssrRenderComponent(_component_PatenteDisclaimer, { class: "mb-6" }, null, _parent));
      _push(`<div class="mb-8 flex flex-wrap gap-3">`);
      _push(ssrRenderComponent(_component_UiButton, { to: "/patente/exam" }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_UiIcon, {
              name: "clock",
              size: 18
            }, null, _parent2, _scopeId));
            _push2(`${ssrInterpolate(unref(t)("patente.startExam"))}`);
          } else {
            return [
              createVNode(_component_UiIcon, {
                name: "clock",
                size: 18
              }),
              createTextVNode(toDisplayString(unref(t)("patente.startExam")), 1)
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_UiButton, {
        to: "/patente/practice",
        variant: "secondary"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_UiIcon, {
              name: "list",
              size: 18
            }, null, _parent2, _scopeId));
            _push2(`${ssrInterpolate(unref(t)("patente.practice"))}`);
          } else {
            return [
              createVNode(_component_UiIcon, {
                name: "list",
                size: 18
              }),
              createTextVNode(toDisplayString(unref(t)("patente.practice")), 1)
            ];
          }
        }),
        _: 1
      }, _parent));
      if (unref(auth).isAuthenticated) {
        _push(ssrRenderComponent(_component_UiButton, {
          to: "/patente/weak",
          variant: "secondary"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_UiIcon, {
                name: "alert",
                size: 18
              }, null, _parent2, _scopeId));
              _push2(`${ssrInterpolate(unref(t)("patente.weakPage.title"))}`);
            } else {
              return [
                createVNode(_component_UiIcon, {
                  name: "alert",
                  size: 18
                }),
                createTextVNode(toDisplayString(unref(t)("patente.weakPage.title")), 1)
              ];
            }
          }),
          _: 1
        }, _parent));
      } else {
        _push(`<!---->`);
      }
      _push(ssrRenderComponent(_component_UiButton, {
        to: "/patente/glossary",
        variant: "ghost"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`${ssrInterpolate(unref(t)("patente.glossary.title"))}`);
          } else {
            return [
              createTextVNode(toDisplayString(unref(t)("patente.glossary.title")), 1)
            ];
          }
        }),
        _: 1
      }, _parent));
      if (unref(auth).isAuthenticated) {
        _push(ssrRenderComponent(_component_UiButton, {
          to: "/patente/history",
          variant: "ghost"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`${ssrInterpolate(unref(t)("patente.history"))}`);
            } else {
              return [
                createTextVNode(toDisplayString(unref(t)("patente.history")), 1)
              ];
            }
          }),
          _: 1
        }, _parent));
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
      if (unref(status) === "pending" && !unref(data)) {
        _push(`<div aria-busy="true">`);
        _push(ssrRenderComponent(_component_UiSkeleton, {
          block: "",
          lines: 4
        }, null, _parent));
        _push(`</div>`);
      } else if (unref(error) || !unref(data)) {
        _push(ssrRenderComponent(_component_UiErrorState, {
          message: ("isApiError" in _ctx ? _ctx.isApiError : unref(isApiError))(unref(error)) ? unref(error).message : void 0,
          retry: "",
          onRetry: ($event) => unref(refresh)()
        }, null, _parent));
      } else {
        _push(`<!--[-->`);
        if (unref(data).progress) {
          _push(`<section aria-labelledby="sum-h" class="mb-8 space-y-3"><h2 id="sum-h" class="text-xl font-bold">${ssrInterpolate(unref(t)("patente.yourProgress"))}</h2><dl class="grid grid-cols-2 gap-3 sm:grid-cols-4"><!--[-->`);
          ssrRenderList(["exams_taken", "exams_passed", "practice_sessions"], (k) => {
            _push(ssrRenderComponent(_component_UiCard, {
              key: k,
              class: "!p-4"
            }, {
              default: withCtx((_, _push2, _parent2, _scopeId) => {
                if (_push2) {
                  _push2(`<dt class="text-sm text-muted"${_scopeId}>${ssrInterpolate(unref(t)(`patente.summary.${k}`))}</dt><dd class="text-2xl font-bold tabular-nums"${_scopeId}>${ssrInterpolate(unref(data).progress.summary[k])}</dd>`);
                } else {
                  return [
                    createVNode("dt", { class: "text-sm text-muted" }, toDisplayString(unref(t)(`patente.summary.${k}`)), 1),
                    createVNode("dd", { class: "text-2xl font-bold tabular-nums" }, toDisplayString(unref(data).progress.summary[k]), 1)
                  ];
                }
              }),
              _: 2
            }, _parent));
          });
          _push(`<!--]-->`);
          _push(ssrRenderComponent(_component_UiCard, { class: "!p-4" }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              var _a, _b;
              if (_push2) {
                _push2(`<dt class="text-sm text-muted"${_scopeId}>${ssrInterpolate(unref(t)("patente.summary.average_errors"))}</dt><dd class="text-2xl font-bold tabular-nums"${_scopeId}>${ssrInterpolate((_a = unref(data).progress.summary.average_errors) != null ? _a : "\u2013")}</dd>`);
              } else {
                return [
                  createVNode("dt", { class: "text-sm text-muted" }, toDisplayString(unref(t)("patente.summary.average_errors")), 1),
                  createVNode("dd", { class: "text-2xl font-bold tabular-nums" }, toDisplayString((_b = unref(data).progress.summary.average_errors) != null ? _b : "\u2013"), 1)
                ];
              }
            }),
            _: 1
          }, _parent));
          _push(`</dl>`);
          if (unref(weak).length) {
            _push(ssrRenderComponent(_component_UiAlert, {
              tone: "warning",
              title: unref(t)("patente.weakTitle")
            }, {
              default: withCtx((_, _push2, _parent2, _scopeId) => {
                if (_push2) {
                  _push2(`<ul class="list-disc ps-5"${_scopeId}><!--[-->`);
                  ssrRenderList(unref(weak), (w) => {
                    _push2(`<li${_scopeId}>`);
                    _push2(ssrRenderComponent(_component_NuxtLink, {
                      to: unref(localePath)(`/patente/topics/${w.topic.slug}`),
                      class: "underline underline-offset-4"
                    }, {
                      default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                        if (_push3) {
                          _push3(`${ssrInterpolate(w.topic.title)}`);
                        } else {
                          return [
                            createTextVNode(toDisplayString(w.topic.title), 1)
                          ];
                        }
                      }),
                      _: 2
                    }, _parent2, _scopeId));
                    _push2(` (${ssrInterpolate(w.accuracy)}%)</li>`);
                  });
                  _push2(`<!--]--></ul>`);
                } else {
                  return [
                    createVNode("ul", { class: "list-disc ps-5" }, [
                      (openBlock(true), createBlock(Fragment, null, renderList(unref(weak), (w) => {
                        return openBlock(), createBlock("li", {
                          key: w.topic.slug
                        }, [
                          createVNode(_component_NuxtLink, {
                            to: unref(localePath)(`/patente/topics/${w.topic.slug}`),
                            class: "underline underline-offset-4"
                          }, {
                            default: withCtx(() => [
                              createTextVNode(toDisplayString(w.topic.title), 1)
                            ]),
                            _: 2
                          }, 1032, ["to"]),
                          createTextVNode(" (" + toDisplayString(w.accuracy) + "%)", 1)
                        ]);
                      }), 128))
                    ])
                  ];
                }
              }),
              _: 1
            }, _parent));
          } else {
            _push(`<!---->`);
          }
          _push(`</section>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(data).cats.length) {
          _push(`<section aria-labelledby="cat-h" class="mb-8 space-y-3"><h2 id="cat-h" class="text-xl font-bold">${ssrInterpolate(unref(t)("patente.categories"))}</h2><ul class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"><!--[-->`);
          ssrRenderList(unref(data).cats, (c) => {
            _push(`<li>`);
            _push(ssrRenderComponent(_component_UiCard, {
              as: "article",
              class: "space-y-2 h-full"
            }, {
              default: withCtx((_, _push2, _parent2, _scopeId) => {
                if (_push2) {
                  _push2(`<div class="flex flex-wrap gap-2"${_scopeId}>`);
                  _push2(ssrRenderComponent(_component_UiSourceBadge, {
                    type: c.source.type
                  }, null, _parent2, _scopeId));
                  _push2(`</div><h3 class="font-bold"${_scopeId}>`);
                  _push2(ssrRenderComponent(_component_UiAutoItalian, {
                    text: c.title
                  }, null, _parent2, _scopeId));
                  _push2(`</h3>`);
                  if (c.summary) {
                    _push2(`<p class="text-ink-soft"${_scopeId}>${ssrInterpolate(c.summary)}</p>`);
                  } else {
                    _push2(`<!---->`);
                  }
                  if (c.fallback) {
                    _push2(ssrRenderComponent(_component_GuideFallbackNotice, {
                      locale: c.locale
                    }, null, _parent2, _scopeId));
                  } else {
                    _push2(`<!---->`);
                  }
                } else {
                  return [
                    createVNode("div", { class: "flex flex-wrap gap-2" }, [
                      createVNode(_component_UiSourceBadge, {
                        type: c.source.type
                      }, null, 8, ["type"])
                    ]),
                    createVNode("h3", { class: "font-bold" }, [
                      createVNode(_component_UiAutoItalian, {
                        text: c.title
                      }, null, 8, ["text"])
                    ]),
                    c.summary ? (openBlock(), createBlock("p", {
                      key: 0,
                      class: "text-ink-soft"
                    }, toDisplayString(c.summary), 1)) : createCommentVNode("", true),
                    c.fallback ? (openBlock(), createBlock(_component_GuideFallbackNotice, {
                      key: 1,
                      locale: c.locale
                    }, null, 8, ["locale"])) : createCommentVNode("", true)
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
        _push(`<section aria-labelledby="top-h" class="space-y-3"><h2 id="top-h" class="text-xl font-bold">${ssrInterpolate(unref(t)("patente.topics"))}</h2>`);
        if (!unref(data).topics.length) {
          _push(ssrRenderComponent(_component_UiEmptyState, {
            title: unref(t)("patente.noTopicsTitle"),
            description: unref(t)("patente.noTopics"),
            icon: "car"
          }, null, _parent));
        } else {
          _push(`<ul class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"><!--[-->`);
          ssrRenderList(unref(data).topics, (tp) => {
            _push(`<li>`);
            _push(ssrRenderComponent(_component_UiCard, {
              as: "article",
              class: "relative flex h-full flex-col gap-2 hover:shadow-2"
            }, {
              default: withCtx((_, _push2, _parent2, _scopeId) => {
                var _a, _b, _c, _d;
                if (_push2) {
                  _push2(`<div class="flex flex-wrap gap-2"${_scopeId}>`);
                  _push2(ssrRenderComponent(_component_UiSourceBadge, {
                    type: tp.source.type
                  }, null, _parent2, _scopeId));
                  if ((_a = unref(acc).get(tp.slug)) == null ? void 0 : _a.weak) {
                    _push2(ssrRenderComponent(_component_UiBadge, { tone: "warning" }, {
                      default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                        if (_push3) {
                          _push3(ssrRenderComponent(_component_UiIcon, {
                            name: "alert",
                            size: 14
                          }, null, _parent3, _scopeId2));
                          _push3(`${ssrInterpolate(unref(t)("patente.weak"))}`);
                        } else {
                          return [
                            createVNode(_component_UiIcon, {
                              name: "alert",
                              size: 14
                            }),
                            createTextVNode(toDisplayString(unref(t)("patente.weak")), 1)
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
                    to: unref(localePath)(`/patente/topics/${tp.slug}`),
                    class: "after:absolute after:inset-0 after:content-['']"
                  }, {
                    default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                      if (_push3) {
                        _push3(ssrRenderComponent(_component_UiAutoItalian, {
                          text: tp.title
                        }, null, _parent3, _scopeId2));
                      } else {
                        return [
                          createVNode(_component_UiAutoItalian, {
                            text: tp.title
                          }, null, 8, ["text"])
                        ];
                      }
                    }),
                    _: 2
                  }, _parent2, _scopeId));
                  _push2(`</h3>`);
                  if (tp.summary) {
                    _push2(`<p class="line-clamp-3 text-ink-soft"${_scopeId}>${ssrInterpolate(tp.summary)}</p>`);
                  } else {
                    _push2(`<!---->`);
                  }
                  _push2(`<div class="mt-auto space-y-1 pt-2 text-sm text-muted"${_scopeId}><p${_scopeId}>${ssrInterpolate(unref(t)("patente.questionCount", { count: tp.question_count }))}</p>`);
                  if (((_b = unref(acc).get(tp.slug)) == null ? void 0 : _b.accuracy) != null) {
                    _push2(`<p${_scopeId}>${ssrInterpolate(unref(t)("patente.accuracy", { value: unref(acc).get(tp.slug).accuracy }))}</p>`);
                  } else {
                    _push2(`<!---->`);
                  }
                  if (tp.source.freshness !== "fresh") {
                    _push2(`<p class="${ssrRenderClass([tp.source.freshness === "stale" ? "text-warning" : "text-danger", "font-medium"])}"${_scopeId}>${ssrInterpolate(unref(t)(`freshness.state.${tp.source.freshness}`))}</p>`);
                  } else {
                    _push2(`<!---->`);
                  }
                  _push2(`</div>`);
                } else {
                  return [
                    createVNode("div", { class: "flex flex-wrap gap-2" }, [
                      createVNode(_component_UiSourceBadge, {
                        type: tp.source.type
                      }, null, 8, ["type"]),
                      ((_c = unref(acc).get(tp.slug)) == null ? void 0 : _c.weak) ? (openBlock(), createBlock(_component_UiBadge, {
                        key: 0,
                        tone: "warning"
                      }, {
                        default: withCtx(() => [
                          createVNode(_component_UiIcon, {
                            name: "alert",
                            size: 14
                          }),
                          createTextVNode(toDisplayString(unref(t)("patente.weak")), 1)
                        ]),
                        _: 1
                      })) : createCommentVNode("", true)
                    ]),
                    createVNode("h3", { class: "text-lg font-bold" }, [
                      createVNode(_component_NuxtLink, {
                        to: unref(localePath)(`/patente/topics/${tp.slug}`),
                        class: "after:absolute after:inset-0 after:content-['']"
                      }, {
                        default: withCtx(() => [
                          createVNode(_component_UiAutoItalian, {
                            text: tp.title
                          }, null, 8, ["text"])
                        ]),
                        _: 2
                      }, 1032, ["to"])
                    ]),
                    tp.summary ? (openBlock(), createBlock("p", {
                      key: 0,
                      class: "line-clamp-3 text-ink-soft"
                    }, toDisplayString(tp.summary), 1)) : createCommentVNode("", true),
                    createVNode("div", { class: "mt-auto space-y-1 pt-2 text-sm text-muted" }, [
                      createVNode("p", null, toDisplayString(unref(t)("patente.questionCount", { count: tp.question_count })), 1),
                      ((_d = unref(acc).get(tp.slug)) == null ? void 0 : _d.accuracy) != null ? (openBlock(), createBlock("p", { key: 0 }, toDisplayString(unref(t)("patente.accuracy", { value: unref(acc).get(tp.slug).accuracy })), 1)) : createCommentVNode("", true),
                      tp.source.freshness !== "fresh" ? (openBlock(), createBlock("p", {
                        key: 1,
                        class: ["font-medium", tp.source.freshness === "stale" ? "text-warning" : "text-danger"]
                      }, toDisplayString(unref(t)(`freshness.state.${tp.source.freshness}`)), 3)) : createCommentVNode("", true)
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
        _push(`</section><!--]-->`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/patente/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=index-LaF-88O8.mjs.map
