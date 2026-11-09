import { _ as _sfc_main$1 } from './Breadcrumbs-C7SaJcTR.mjs';
import { _ as _sfc_main$2 } from './Skeleton-BTnKIEst.mjs';
import { u as useI18n, f as useRoute, a as useAuthStore, g as useApi, j as isApiError, o as createError, i as _sfc_main$2$1, d as _sfc_main$5, _ as _sfc_main$3$1 } from './server.mjs';
import { _ as _sfc_main$3 } from './Badge-PdKIsny2.mjs';
import { _ as _sfc_main$4 } from './AutoItalian-BD4PyQ-n.mjs';
import { _ as _sfc_main$6 } from './FallbackNotice-CwHuyozE.mjs';
import { _ as _sfc_main$7 } from './Card-BxvVO_-_.mjs';
import { _ as _sfc_main$8 } from './ListenButton-BzYdaHKB.mjs';
import { _ as _sfc_main$9 } from './Alert-D-zfMDy5.mjs';
import { defineComponent, computed, withAsyncContext, ref, watch, mergeProps, unref, withCtx, createTextVNode, toDisplayString, createVNode, openBlock, createBlock, createCommentVNode, Fragment, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderAttr, ssrRenderList, ssrRenderClass } from 'vue/server-renderer';
import { u as useToast } from './useToast-BX2bodPv.mjs';
import { u as useAsyncData } from './asyncData-bKJD5Wmv.mjs';
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
import 'perfect-debounce';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "[slug]",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const { t, locale } = useI18n();
    const route = useRoute();
    const auth = useAuthStore();
    const { request } = useApi();
    const toast = useToast();
    const slug = computed(() => String(route.params.slug));
    const { data: lesson, error, refresh, status } = ([__temp, __restore] = withAsyncContext(async () => useAsyncData(() => `lesson-${slug.value}`, async () => (await request(`italian/lessons/${encodeURIComponent(slug.value)}`)).data, { watch: [locale] })), __temp = await __temp, __restore(), __temp);
    if (isApiError(error.value) && error.value.status === 404) throw createError({ statusCode: 404, statusMessage: "Not Found", fatal: true });
    useSeo(() => {
      var _a, _b;
      return { title: lesson.value ? `${lesson.value.title} | EXPA` : t("learn.title"), description: (_b = (_a = lesson.value) == null ? void 0 : _a.summary) != null ? _b : t("learn.subtitle") };
    });
    const crumbs = computed(() => {
      var _a, _b;
      return [{ label: t("learn.title"), to: "/learn-italian" }, { label: (_b = (_a = lesson.value) == null ? void 0 : _a.title) != null ? _b : "" }];
    });
    const completed = ref(false);
    watch(lesson, (l) => {
      var _a;
      completed.value = ((_a = l == null ? void 0 : l.progress) == null ? void 0 : _a.status) === "completed";
    }, { immediate: true });
    const saving = ref(false);
    const feedback = ref(null);
    async function complete() {
      saving.value = true;
      try {
        const res = await request(`italian/lessons/${encodeURIComponent(slug.value)}/progress`, { method: "POST", body: { status: "completed" } });
        completed.value = true;
        feedback.value = { streak: res.data.streak };
        toast.success(t("learn.completedToast"));
      } catch (e) {
        toast.error(isApiError(e) ? e.message : t("errors.generic"));
      } finally {
        saving.value = false;
      }
    }
    const items = computed(() => {
      var _a, _b;
      return (_b = (_a = lesson.value) == null ? void 0 : _a.items) != null ? _b : [];
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UiBreadcrumbs = _sfc_main$1;
      const _component_UiSkeleton = _sfc_main$2;
      const _component_UiErrorState = _sfc_main$2$1;
      const _component_UiBadge = _sfc_main$3;
      const _component_UiIcon = _sfc_main$5;
      const _component_UiAutoItalian = _sfc_main$4;
      const _component_GuideFallbackNotice = _sfc_main$6;
      const _component_UiCard = _sfc_main$7;
      const _component_LearnListenButton = _sfc_main$8;
      const _component_UiButton = _sfc_main$3$1;
      const _component_UiAlert = _sfc_main$9;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "container-page max-w-3xl py-8 sm:py-12" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_UiBreadcrumbs, {
        items: unref(crumbs),
        class: "mb-6"
      }, null, _parent));
      if (unref(status) === "pending" && !unref(lesson)) {
        _push(`<div aria-busy="true">`);
        _push(ssrRenderComponent(_component_UiSkeleton, {
          block: "",
          lines: 5
        }, null, _parent));
        _push(`</div>`);
      } else if (unref(error) || !unref(lesson)) {
        _push(ssrRenderComponent(_component_UiErrorState, {
          "heading-level": 1,
          message: ("isApiError" in _ctx ? _ctx.isApiError : unref(isApiError))(unref(error)) ? unref(error).message : void 0,
          retry: "",
          onRetry: ($event) => unref(refresh)()
        }, null, _parent));
      } else {
        _push(`<article class="space-y-6"><header class="space-y-3"><div class="flex flex-wrap items-center gap-2">`);
        _push(ssrRenderComponent(_component_UiBadge, { tone: "primary" }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`${ssrInterpolate(unref(lesson).level_label)}`);
            } else {
              return [
                createTextVNode(toDisplayString(unref(lesson).level_label), 1)
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(ssrRenderComponent(_component_UiBadge, null, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`${ssrInterpolate(unref(lesson).type_label)}`);
            } else {
              return [
                createTextVNode(toDisplayString(unref(lesson).type_label), 1)
              ];
            }
          }),
          _: 1
        }, _parent));
        if (unref(lesson).scenario_label) {
          _push(ssrRenderComponent(_component_UiBadge, null, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`${ssrInterpolate(unref(lesson).scenario_label)}`);
              } else {
                return [
                  createTextVNode(toDisplayString(unref(lesson).scenario_label), 1)
                ];
              }
            }),
            _: 1
          }, _parent));
        } else {
          _push(`<!---->`);
        }
        _push(ssrRenderComponent(_component_UiBadge, null, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_UiIcon, {
                name: "clock",
                size: 14
              }, null, _parent2, _scopeId));
              _push2(`${ssrInterpolate(unref(t)("learn.minutes", { count: unref(lesson).duration_minutes }))}`);
            } else {
              return [
                createVNode(_component_UiIcon, {
                  name: "clock",
                  size: 14
                }),
                createTextVNode(toDisplayString(unref(t)("learn.minutes", { count: unref(lesson).duration_minutes })), 1)
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div><h1 class="text-3xl font-bold">`);
        _push(ssrRenderComponent(_component_UiAutoItalian, {
          text: unref(lesson).title
        }, null, _parent));
        _push(`</h1>`);
        if (unref(lesson).summary) {
          _push(`<p class="text-lg text-ink-soft">${ssrInterpolate(unref(lesson).summary)}</p>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</header>`);
        if (unref(lesson).fallback) {
          _push(ssrRenderComponent(_component_GuideFallbackNotice, {
            locale: unref(lesson).locale
          }, null, _parent));
        } else {
          _push(`<!---->`);
        }
        if (unref(lesson).body && unref(lesson).type !== "vocabulary") {
          _push(`<p class="prose-plain rounded-lg border border-line bg-surface p-4 text-lg"${ssrRenderAttr("data-type", unref(lesson).type)}>`);
          _push(ssrRenderComponent(_component_UiAutoItalian, {
            text: unref(lesson).body
          }, null, _parent));
          _push(`</p>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(lesson).type === "vocabulary") {
          _push(`<ul class="grid gap-4 sm:grid-cols-2"><!--[-->`);
          ssrRenderList(unref(items), (it, i) => {
            _push(`<li>`);
            _push(ssrRenderComponent(_component_UiCard, {
              class: "space-y-2",
              "data-testid": "vocab-card"
            }, {
              default: withCtx((_, _push2, _parent2, _scopeId) => {
                if (_push2) {
                  _push2(`<div class="flex items-start justify-between gap-2"${_scopeId}><p class="text-2xl font-bold" lang="it" dir="ltr"${_scopeId}>${ssrInterpolate(it.it)}</p>`);
                  _push2(ssrRenderComponent(_component_LearnListenButton, {
                    text: it.it
                  }, null, _parent2, _scopeId));
                  _push2(`</div>`);
                  if (it.gloss) {
                    _push2(`<p class="text-ink-soft"${_scopeId}>${ssrInterpolate(it.gloss)}</p>`);
                  } else {
                    _push2(`<!---->`);
                  }
                  if (it.example_it) {
                    _push2(`<div class="rounded-md bg-sunken p-3 text-sm"${_scopeId}><p lang="it" dir="ltr" class="flex items-start justify-between gap-2"${_scopeId}><span${_scopeId}>${ssrInterpolate(it.example_it)}</span>`);
                    _push2(ssrRenderComponent(_component_LearnListenButton, {
                      text: it.example_it
                    }, null, _parent2, _scopeId));
                    _push2(`</p>`);
                    if (it.example_gloss) {
                      _push2(`<p class="mt-1 text-ink-soft"${_scopeId}>${ssrInterpolate(it.example_gloss)}</p>`);
                    } else {
                      _push2(`<!---->`);
                    }
                    _push2(`</div>`);
                  } else {
                    _push2(`<!---->`);
                  }
                } else {
                  return [
                    createVNode("div", { class: "flex items-start justify-between gap-2" }, [
                      createVNode("p", {
                        class: "text-2xl font-bold",
                        lang: "it",
                        dir: "ltr"
                      }, toDisplayString(it.it), 1),
                      createVNode(_component_LearnListenButton, {
                        text: it.it
                      }, null, 8, ["text"])
                    ]),
                    it.gloss ? (openBlock(), createBlock("p", {
                      key: 0,
                      class: "text-ink-soft"
                    }, toDisplayString(it.gloss), 1)) : createCommentVNode("", true),
                    it.example_it ? (openBlock(), createBlock("div", {
                      key: 1,
                      class: "rounded-md bg-sunken p-3 text-sm"
                    }, [
                      createVNode("p", {
                        lang: "it",
                        dir: "ltr",
                        class: "flex items-start justify-between gap-2"
                      }, [
                        createVNode("span", null, toDisplayString(it.example_it), 1),
                        createVNode(_component_LearnListenButton, {
                          text: it.example_it
                        }, null, 8, ["text"])
                      ]),
                      it.example_gloss ? (openBlock(), createBlock("p", {
                        key: 0,
                        class: "mt-1 text-ink-soft"
                      }, toDisplayString(it.example_gloss), 1)) : createCommentVNode("", true)
                    ])) : createCommentVNode("", true)
                  ];
                }
              }),
              _: 2
            }, _parent));
            _push(`</li>`);
          });
          _push(`<!--]--></ul>`);
        } else if (unref(lesson).type === "grammar" && unref(items).length) {
          _push(`<ul class="space-y-3"><!--[-->`);
          ssrRenderList(unref(items), (it, i) => {
            _push(`<li class="rounded-md border border-line bg-surface p-3"><p class="flex items-start justify-between gap-2 font-semibold" lang="it" dir="ltr"><span>${ssrInterpolate(it.it)}</span>`);
            _push(ssrRenderComponent(_component_LearnListenButton, {
              text: it.it
            }, null, _parent));
            _push(`</p>`);
            if (it.gloss) {
              _push(`<p class="text-ink-soft">${ssrInterpolate(it.gloss)}</p>`);
            } else {
              _push(`<!---->`);
            }
            if (it.tip) {
              _push(`<p class="mt-1 text-sm text-muted">${ssrInterpolate(it.tip)}</p>`);
            } else {
              _push(`<!---->`);
            }
            _push(`</li>`);
          });
          _push(`<!--]--></ul>`);
        } else if (unref(lesson).type === "conversation") {
          _push(`<ol class="space-y-3"${ssrRenderAttr("aria-label", unref(t)("learn.dialogue"))}><!--[-->`);
          ssrRenderList(unref(items), (it, i) => {
            _push(`<li class="${ssrRenderClass([i % 2 ? "justify-end" : "justify-start", "flex"])}" data-testid="dialogue-line"><div class="${ssrRenderClass([i % 2 ? "bg-primary-soft" : "bg-surface border border-line", "max-w-[90%] rounded-lg px-4 py-3"])}">`);
            if (it.speaker) {
              _push(`<p class="text-xs font-bold text-muted">${ssrInterpolate(it.speaker)}</p>`);
            } else {
              _push(`<!---->`);
            }
            _push(`<p class="flex items-start gap-2 font-medium" lang="it" dir="ltr"><span>${ssrInterpolate(it.it)}</span>`);
            _push(ssrRenderComponent(_component_LearnListenButton, {
              text: it.it
            }, null, _parent));
            _push(`</p>`);
            if (it.gloss) {
              _push(`<p class="text-sm text-ink-soft">${ssrInterpolate(it.gloss)}</p>`);
            } else {
              _push(`<!---->`);
            }
            _push(`</div></li>`);
          });
          _push(`<!--]--></ol>`);
        } else if (unref(lesson).type === "pronunciation") {
          _push(`<ul class="space-y-3"><!--[-->`);
          ssrRenderList(unref(items), (it, i) => {
            _push(`<li>`);
            _push(ssrRenderComponent(_component_UiCard, {
              class: "space-y-1",
              "data-testid": "pron-item"
            }, {
              default: withCtx((_, _push2, _parent2, _scopeId) => {
                if (_push2) {
                  _push2(`<div class="flex items-start justify-between gap-2"${_scopeId}><p class="text-xl font-bold" lang="it" dir="ltr"${_scopeId}>${ssrInterpolate(it.it)}</p>`);
                  _push2(ssrRenderComponent(_component_LearnListenButton, {
                    text: it.it
                  }, null, _parent2, _scopeId));
                  _push2(`</div>`);
                  if (it.phonetic) {
                    _push2(`<p class="text-primary-strong" dir="ltr"${_scopeId}>/${ssrInterpolate(it.phonetic.replace(/^\/|\/$/g, ""))}/</p>`);
                  } else {
                    _push2(`<!---->`);
                  }
                  if (it.gloss) {
                    _push2(`<p class="text-ink-soft"${_scopeId}>${ssrInterpolate(it.gloss)}</p>`);
                  } else {
                    _push2(`<!---->`);
                  }
                  if (it.tip) {
                    _push2(`<p class="rounded-md bg-sunken p-2 text-sm"${_scopeId}>${ssrInterpolate(it.tip)}</p>`);
                  } else {
                    _push2(`<!---->`);
                  }
                } else {
                  return [
                    createVNode("div", { class: "flex items-start justify-between gap-2" }, [
                      createVNode("p", {
                        class: "text-xl font-bold",
                        lang: "it",
                        dir: "ltr"
                      }, toDisplayString(it.it), 1),
                      createVNode(_component_LearnListenButton, {
                        text: it.it
                      }, null, 8, ["text"])
                    ]),
                    it.phonetic ? (openBlock(), createBlock("p", {
                      key: 0,
                      class: "text-primary-strong",
                      dir: "ltr"
                    }, "/" + toDisplayString(it.phonetic.replace(/^\/|\/$/g, "")) + "/", 1)) : createCommentVNode("", true),
                    it.gloss ? (openBlock(), createBlock("p", {
                      key: 1,
                      class: "text-ink-soft"
                    }, toDisplayString(it.gloss), 1)) : createCommentVNode("", true),
                    it.tip ? (openBlock(), createBlock("p", {
                      key: 2,
                      class: "rounded-md bg-sunken p-2 text-sm"
                    }, toDisplayString(it.tip), 1)) : createCommentVNode("", true)
                  ];
                }
              }),
              _: 2
            }, _parent));
            _push(`</li>`);
          });
          _push(`<!--]--></ul>`);
        } else if (unref(lesson).type === "mission" && unref(items).length) {
          _push(`<ol class="list-decimal space-y-2 ps-6"><!--[-->`);
          ssrRenderList(unref(items), (it, i) => {
            _push(`<li><span lang="it" dir="ltr">${ssrInterpolate(it.it)}</span>`);
            if (it.gloss) {
              _push(`<span class="text-ink-soft"> \u2014 ${ssrInterpolate(it.gloss)}</span>`);
            } else {
              _push(`<!---->`);
            }
            _push(`</li>`);
          });
          _push(`<!--]--></ol>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(auth).isAuthenticated) {
          _push(ssrRenderComponent(_component_UiCard, {
            tone: "soft",
            class: "space-y-3",
            "aria-live": "polite"
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                if (unref(completed)) {
                  _push2(`<!--[--><p class="flex items-center gap-2 text-lg font-bold text-success"${_scopeId}>`);
                  _push2(ssrRenderComponent(_component_UiIcon, {
                    name: "check-circle",
                    size: 22
                  }, null, _parent2, _scopeId));
                  _push2(`${ssrInterpolate(unref(t)("learn.completed"))}</p>`);
                  if (unref(feedback)) {
                    _push2(`<p class="flex items-center gap-2"${_scopeId}>`);
                    _push2(ssrRenderComponent(_component_UiIcon, {
                      name: "flame",
                      size: 18
                    }, null, _parent2, _scopeId));
                    _push2(`${ssrInterpolate(unref(t)("learn.streak", { count: unref(feedback).streak }))}</p>`);
                  } else {
                    _push2(`<!---->`);
                  }
                  _push2(ssrRenderComponent(_component_UiButton, {
                    to: "/learn-italian",
                    variant: "secondary"
                  }, {
                    default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                      if (_push3) {
                        _push3(`${ssrInterpolate(unref(t)("learn.backToPlan"))}`);
                      } else {
                        return [
                          createTextVNode(toDisplayString(unref(t)("learn.backToPlan")), 1)
                        ];
                      }
                    }),
                    _: 1
                  }, _parent2, _scopeId));
                  _push2(`<!--]-->`);
                } else {
                  _push2(ssrRenderComponent(_component_UiButton, {
                    loading: unref(saving),
                    size: "lg",
                    onClick: complete
                  }, {
                    default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                      if (_push3) {
                        _push3(ssrRenderComponent(_component_UiIcon, {
                          name: "check",
                          size: 20
                        }, null, _parent3, _scopeId2));
                        _push3(`${ssrInterpolate(unref(t)("learn.markComplete"))}`);
                      } else {
                        return [
                          createVNode(_component_UiIcon, {
                            name: "check",
                            size: 20
                          }),
                          createTextVNode(toDisplayString(unref(t)("learn.markComplete")), 1)
                        ];
                      }
                    }),
                    _: 1
                  }, _parent2, _scopeId));
                }
              } else {
                return [
                  unref(completed) ? (openBlock(), createBlock(Fragment, { key: 0 }, [
                    createVNode("p", { class: "flex items-center gap-2 text-lg font-bold text-success" }, [
                      createVNode(_component_UiIcon, {
                        name: "check-circle",
                        size: 22
                      }),
                      createTextVNode(toDisplayString(unref(t)("learn.completed")), 1)
                    ]),
                    unref(feedback) ? (openBlock(), createBlock("p", {
                      key: 0,
                      class: "flex items-center gap-2"
                    }, [
                      createVNode(_component_UiIcon, {
                        name: "flame",
                        size: 18
                      }),
                      createTextVNode(toDisplayString(unref(t)("learn.streak", { count: unref(feedback).streak })), 1)
                    ])) : createCommentVNode("", true),
                    createVNode(_component_UiButton, {
                      to: "/learn-italian",
                      variant: "secondary"
                    }, {
                      default: withCtx(() => [
                        createTextVNode(toDisplayString(unref(t)("learn.backToPlan")), 1)
                      ]),
                      _: 1
                    })
                  ], 64)) : (openBlock(), createBlock(_component_UiButton, {
                    key: 1,
                    loading: unref(saving),
                    size: "lg",
                    onClick: complete
                  }, {
                    default: withCtx(() => [
                      createVNode(_component_UiIcon, {
                        name: "check",
                        size: 20
                      }),
                      createTextVNode(toDisplayString(unref(t)("learn.markComplete")), 1)
                    ]),
                    _: 1
                  }, 8, ["loading"]))
                ];
              }
            }),
            _: 1
          }, _parent));
        } else {
          _push(ssrRenderComponent(_component_UiAlert, { tone: "info" }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`<p${_scopeId}>${ssrInterpolate(unref(t)("learn.loginToSave"))}</p>`);
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
                  createVNode("p", null, toDisplayString(unref(t)("learn.loginToSave")), 1),
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
        _push(`</article>`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/learn-italian/lessons/[slug].vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=_slug_-DbJDPYr9.mjs.map
