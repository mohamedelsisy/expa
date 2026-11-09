import { _ as _sfc_main$1 } from './Skeleton-BTnKIEst.mjs';
import { u as useI18n, g as useApi, c as useLocalePath, i as _sfc_main$2, j as isApiError, d as _sfc_main$5$1, e as __nuxt_component_0, _ as _sfc_main$3$1 } from './server.mjs';
import { _ as _sfc_main$3 } from './EmptyState-N2xvHts8.mjs';
import { _ as _sfc_main$4 } from './ProgressBar-DvR1KKgW.mjs';
import { _ as _sfc_main$5 } from './Card-BxvVO_-_.mjs';
import { _ as _sfc_main$6 } from './AutoItalian-BD4PyQ-n.mjs';
import { _ as _sfc_main$7 } from './Badge-PdKIsny2.mjs';
import { defineComponent, withAsyncContext, watch, computed, mergeProps, unref, withCtx, createVNode, createTextVNode, toDisplayString, openBlock, createBlock, createCommentVNode, Fragment, ref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrInterpolate, ssrRenderComponent, ssrRenderList, ssrRenderAttr, ssrRenderClass } from 'vue/server-renderer';
import { u as useToast } from './useToast-BX2bodPv.mjs';
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

function useTasks() {
  const { request } = useApi();
  const { t } = useI18n();
  const toast = useToast();
  const tasks = ref([]);
  const pendingKeys = ref(/* @__PURE__ */ new Set());
  async function setStatus(key, status) {
    const before = tasks.value;
    if (pendingKeys.value.has(key)) return false;
    pendingKeys.value = new Set(pendingKeys.value).add(key);
    tasks.value = before.map((x) => x.key === key ? { ...x, status } : x);
    try {
      const res = await request(`dashboard/tasks/${encodeURIComponent(key)}`, { method: "PUT", body: { status } });
      tasks.value = res.data;
      return true;
    } catch (e) {
      tasks.value = before;
      toast.error(isApiError(e) ? e.message : t("errors.generic"));
      return false;
    } finally {
      const next = new Set(pendingKeys.value);
      next.delete(key);
      pendingKeys.value = next;
    }
  }
  return { tasks, pendingKeys, setStatus };
}
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "tasks",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const { t, locale } = useI18n();
    const { request } = useApi();
    const localePath = useLocalePath();
    const { tasks, pendingKeys, setStatus } = useTasks();
    useSeo(() => ({ title: t("tasks.title"), description: t("tasks.subtitle"), noindex: true }));
    const { data, error, refresh, status } = ([__temp, __restore] = withAsyncContext(() => useAsyncData("tasks", () => request("dashboard/tasks"), { watch: [locale] })), __temp = await __temp, __restore(), __temp);
    watch(data, (d) => {
      if (d) tasks.value = d.data;
    }, { immediate: true });
    const groups = computed(() => {
      const map = /* @__PURE__ */ new Map();
      for (const task of tasks.value) {
        if (!map.has(task.category)) map.set(task.category, { label: task.category_label, items: [] });
        map.get(task.category).items.push(task);
      }
      return [...map.entries()].map(([key, g]) => ({ key, ...g }));
    });
    const progress = computed(() => {
      const applicable = tasks.value.filter((x) => x.applicable && x.status !== "dismissed");
      return { done: applicable.filter((x) => x.status === "done").length, total: applicable.length };
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UiSkeleton = _sfc_main$1;
      const _component_UiErrorState = _sfc_main$2;
      const _component_UiEmptyState = _sfc_main$3;
      const _component_UiProgressBar = _sfc_main$4;
      const _component_UiCard = _sfc_main$5;
      const _component_UiAutoItalian = _sfc_main$6;
      const _component_UiBadge = _sfc_main$7;
      const _component_UiIcon = _sfc_main$5$1;
      const _component_NuxtLink = __nuxt_component_0;
      const _component_UiButton = _sfc_main$3$1;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "container-page max-w-3xl py-8 sm:py-12" }, _attrs))}><h1 class="text-2xl font-bold sm:text-3xl">${ssrInterpolate(unref(t)("tasks.title"))}</h1><p class="mt-1 text-ink-soft">${ssrInterpolate(unref(t)("tasks.subtitle"))}</p>`);
      if (unref(status) === "pending" && !unref(data)) {
        _push(`<div class="mt-8" aria-busy="true">`);
        _push(ssrRenderComponent(_component_UiSkeleton, {
          block: "",
          lines: 6
        }, null, _parent));
        _push(`</div>`);
      } else if (unref(error)) {
        _push(ssrRenderComponent(_component_UiErrorState, {
          class: "mt-8",
          message: ("isApiError" in _ctx ? _ctx.isApiError : unref(isApiError))(unref(error)) ? unref(error).message : void 0,
          retry: "",
          onRetry: ($event) => unref(refresh)()
        }, null, _parent));
      } else if (!unref(tasks).length) {
        _push(ssrRenderComponent(_component_UiEmptyState, {
          class: "mt-8",
          title: unref(t)("tasks.emptyTitle"),
          description: unref(t)("tasks.empty"),
          icon: "tasks"
        }, null, _parent));
      } else {
        _push(`<!--[--><div class="mt-6">`);
        _push(ssrRenderComponent(_component_UiProgressBar, {
          value: unref(progress).total ? Math.round(unref(progress).done / unref(progress).total * 100) : null,
          label: unref(t)("tasks.progress", { done: unref(progress).done, total: unref(progress).total }),
          "show-value": ""
        }, null, _parent));
        _push(`</div><!--[-->`);
        ssrRenderList(unref(groups), (g) => {
          _push(`<section class="mt-8"${ssrRenderAttr("aria-labelledby", `cat-${g.key}`)}><h2${ssrRenderAttr("id", `cat-${g.key}`)} class="mb-3 text-lg font-bold">${ssrInterpolate(g.label)}</h2><ul class="space-y-3"><!--[-->`);
          ssrRenderList(g.items, (task) => {
            _push(`<li>`);
            _push(ssrRenderComponent(_component_UiCard, {
              class: ["flex flex-col gap-3 !p-4 sm:flex-row sm:items-center", task.status !== "todo" || !task.applicable ? "opacity-90" : ""]
            }, {
              default: withCtx((_, _push2, _parent2, _scopeId) => {
                if (_push2) {
                  _push2(`<div class="min-w-0 flex-1"${_scopeId}><p class="${ssrRenderClass([task.status === "done" ? "text-ink-soft line-through decoration-1" : "", "font-semibold"])}"${_scopeId}>`);
                  _push2(ssrRenderComponent(_component_UiAutoItalian, {
                    text: task.title
                  }, null, _parent2, _scopeId));
                  _push2(`</p><p class="text-sm text-ink-soft"${_scopeId}>${ssrInterpolate(task.hint)}</p><div class="mt-1 flex flex-wrap items-center gap-2"${_scopeId}>`);
                  if (task.status === "done") {
                    _push2(ssrRenderComponent(_component_UiBadge, { tone: "success" }, {
                      default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                        if (_push3) {
                          _push3(ssrRenderComponent(_component_UiIcon, {
                            name: "check",
                            size: 14
                          }, null, _parent3, _scopeId2));
                          _push3(`${ssrInterpolate(unref(t)("tasks.status.done"))}`);
                        } else {
                          return [
                            createVNode(_component_UiIcon, {
                              name: "check",
                              size: 14
                            }),
                            createTextVNode(toDisplayString(unref(t)("tasks.status.done")), 1)
                          ];
                        }
                      }),
                      _: 2
                    }, _parent2, _scopeId));
                  } else if (task.status === "dismissed") {
                    _push2(ssrRenderComponent(_component_UiBadge, null, {
                      default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                        if (_push3) {
                          _push3(`${ssrInterpolate(unref(t)("tasks.status.dismissed"))}`);
                        } else {
                          return [
                            createTextVNode(toDisplayString(unref(t)("tasks.status.dismissed")), 1)
                          ];
                        }
                      }),
                      _: 2
                    }, _parent2, _scopeId));
                  } else {
                    _push2(`<!---->`);
                  }
                  if (task.guide) {
                    _push2(ssrRenderComponent(_component_NuxtLink, {
                      to: unref(localePath)(`/guides/${task.guide.slug}`),
                      class: "inline-flex min-h-touch items-center gap-1 text-sm font-medium text-primary-strong underline underline-offset-4"
                    }, {
                      default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                        if (_push3) {
                          _push3(ssrRenderComponent(_component_UiIcon, {
                            name: "book",
                            size: 16
                          }, null, _parent3, _scopeId2));
                          _push3(`${ssrInterpolate(unref(t)("tasks.readGuide"))}`);
                        } else {
                          return [
                            createVNode(_component_UiIcon, {
                              name: "book",
                              size: 16
                            }),
                            createTextVNode(toDisplayString(unref(t)("tasks.readGuide")), 1)
                          ];
                        }
                      }),
                      _: 2
                    }, _parent2, _scopeId));
                  } else {
                    _push2(`<!---->`);
                  }
                  _push2(`</div></div>`);
                  if (task.applicable || task.status === "dismissed") {
                    _push2(`<div class="flex shrink-0 flex-wrap gap-2"${_scopeId}>`);
                    if (task.status === "todo") {
                      _push2(`<!--[-->`);
                      _push2(ssrRenderComponent(_component_UiButton, {
                        variant: "primary",
                        loading: unref(pendingKeys).has(task.key),
                        onClick: ($event) => unref(setStatus)(task.key, "done")
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
                      _push2(ssrRenderComponent(_component_UiButton, {
                        variant: "ghost",
                        disabled: unref(pendingKeys).has(task.key),
                        onClick: ($event) => unref(setStatus)(task.key, "dismissed")
                      }, {
                        default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                          if (_push3) {
                            _push3(`${ssrInterpolate(unref(t)("tasks.notApplicable"))}`);
                          } else {
                            return [
                              createTextVNode(toDisplayString(unref(t)("tasks.notApplicable")), 1)
                            ];
                          }
                        }),
                        _: 2
                      }, _parent2, _scopeId));
                      _push2(`<!--]-->`);
                    } else {
                      _push2(ssrRenderComponent(_component_UiButton, {
                        variant: "secondary",
                        loading: unref(pendingKeys).has(task.key),
                        onClick: ($event) => unref(setStatus)(task.key, "todo")
                      }, {
                        default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                          if (_push3) {
                            _push3(ssrRenderComponent(_component_UiIcon, {
                              name: "refresh",
                              size: 18
                            }, null, _parent3, _scopeId2));
                            _push3(`${ssrInterpolate(unref(t)("tasks.reopen"))}`);
                          } else {
                            return [
                              createVNode(_component_UiIcon, {
                                name: "refresh",
                                size: 18
                              }),
                              createTextVNode(toDisplayString(unref(t)("tasks.reopen")), 1)
                            ];
                          }
                        }),
                        _: 2
                      }, _parent2, _scopeId));
                    }
                    _push2(`</div>`);
                  } else {
                    _push2(`<p class="text-sm text-muted"${_scopeId}>${ssrInterpolate(unref(t)("tasks.notApplicableAuto"))}</p>`);
                  }
                } else {
                  return [
                    createVNode("div", { class: "min-w-0 flex-1" }, [
                      createVNode("p", {
                        class: ["font-semibold", task.status === "done" ? "text-ink-soft line-through decoration-1" : ""]
                      }, [
                        createVNode(_component_UiAutoItalian, {
                          text: task.title
                        }, null, 8, ["text"])
                      ], 2),
                      createVNode("p", { class: "text-sm text-ink-soft" }, toDisplayString(task.hint), 1),
                      createVNode("div", { class: "mt-1 flex flex-wrap items-center gap-2" }, [
                        task.status === "done" ? (openBlock(), createBlock(_component_UiBadge, {
                          key: 0,
                          tone: "success"
                        }, {
                          default: withCtx(() => [
                            createVNode(_component_UiIcon, {
                              name: "check",
                              size: 14
                            }),
                            createTextVNode(toDisplayString(unref(t)("tasks.status.done")), 1)
                          ]),
                          _: 1
                        })) : task.status === "dismissed" ? (openBlock(), createBlock(_component_UiBadge, { key: 1 }, {
                          default: withCtx(() => [
                            createTextVNode(toDisplayString(unref(t)("tasks.status.dismissed")), 1)
                          ]),
                          _: 1
                        })) : createCommentVNode("", true),
                        task.guide ? (openBlock(), createBlock(_component_NuxtLink, {
                          key: 2,
                          to: unref(localePath)(`/guides/${task.guide.slug}`),
                          class: "inline-flex min-h-touch items-center gap-1 text-sm font-medium text-primary-strong underline underline-offset-4"
                        }, {
                          default: withCtx(() => [
                            createVNode(_component_UiIcon, {
                              name: "book",
                              size: 16
                            }),
                            createTextVNode(toDisplayString(unref(t)("tasks.readGuide")), 1)
                          ]),
                          _: 1
                        }, 8, ["to"])) : createCommentVNode("", true)
                      ])
                    ]),
                    task.applicable || task.status === "dismissed" ? (openBlock(), createBlock("div", {
                      key: 0,
                      class: "flex shrink-0 flex-wrap gap-2"
                    }, [
                      task.status === "todo" ? (openBlock(), createBlock(Fragment, { key: 0 }, [
                        createVNode(_component_UiButton, {
                          variant: "primary",
                          loading: unref(pendingKeys).has(task.key),
                          onClick: ($event) => unref(setStatus)(task.key, "done")
                        }, {
                          default: withCtx(() => [
                            createVNode(_component_UiIcon, {
                              name: "check",
                              size: 18
                            }),
                            createTextVNode(toDisplayString(unref(t)("tasks.markDone")), 1)
                          ]),
                          _: 1
                        }, 8, ["loading", "onClick"]),
                        createVNode(_component_UiButton, {
                          variant: "ghost",
                          disabled: unref(pendingKeys).has(task.key),
                          onClick: ($event) => unref(setStatus)(task.key, "dismissed")
                        }, {
                          default: withCtx(() => [
                            createTextVNode(toDisplayString(unref(t)("tasks.notApplicable")), 1)
                          ]),
                          _: 1
                        }, 8, ["disabled", "onClick"])
                      ], 64)) : (openBlock(), createBlock(_component_UiButton, {
                        key: 1,
                        variant: "secondary",
                        loading: unref(pendingKeys).has(task.key),
                        onClick: ($event) => unref(setStatus)(task.key, "todo")
                      }, {
                        default: withCtx(() => [
                          createVNode(_component_UiIcon, {
                            name: "refresh",
                            size: 18
                          }),
                          createTextVNode(toDisplayString(unref(t)("tasks.reopen")), 1)
                        ]),
                        _: 1
                      }, 8, ["loading", "onClick"]))
                    ])) : (openBlock(), createBlock("p", {
                      key: 1,
                      class: "text-sm text-muted"
                    }, toDisplayString(unref(t)("tasks.notApplicableAuto")), 1))
                  ];
                }
              }),
              _: 2
            }, _parent));
            _push(`</li>`);
          });
          _push(`<!--]--></ul></section>`);
        });
        _push(`<!--]--><!--]-->`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/tasks.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=tasks-aPJ49tpu.mjs.map
