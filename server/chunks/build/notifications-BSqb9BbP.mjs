import { u as useI18n, f as useRoute, c as useLocalePath, g as useApi, _ as _sfc_main$3, d as _sfc_main$5, i as _sfc_main$2$1, j as isApiError, h as formatDateTime, n as navigateTo } from './server.mjs';
import { _ as _sfc_main$1 } from './Chips-BU8ln322.mjs';
import { _ as _sfc_main$2 } from './Card-BxvVO_-_.mjs';
import { _ as _sfc_main$4 } from './Skeleton-BTnKIEst.mjs';
import { _ as _sfc_main$6 } from './EmptyState-N2xvHts8.mjs';
import { _ as _sfc_main$7 } from './Badge-PdKIsny2.mjs';
import { _ as _sfc_main$8 } from './AutoItalian-BD4PyQ-n.mjs';
import { _ as _sfc_main$9 } from './Pagination-DA28GIFv.mjs';
import { defineComponent, computed, withAsyncContext, watch, ref, mergeProps, unref, withCtx, createVNode, createTextVNode, toDisplayString, openBlock, createBlock, createCommentVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrInterpolate, ssrRenderComponent, ssrRenderList, ssrRenderAttr } from 'vue/server-renderer';
import { a as mapApiAction } from './routes-BNQ9Jhms.mjs';
import { u as useToast } from './useToast-BX2bodPv.mjs';
import { u as useNotifications } from './useNotifications-epL0jSED.mjs';
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
  __name: "notifications",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const { t, locale } = useI18n();
    const route = useRoute();
    const localePath = useLocalePath();
    const { request } = useApi();
    const toast = useToast();
    const { setUnread } = useNotifications();
    useSeo(() => ({ title: t("notifications.title"), description: t("notifications.subtitle"), noindex: true }));
    const filter = computed(() => route.query.filter === "unread" ? "unread" : "");
    const page = computed(() => Math.max(1, Number(route.query.page) || 1));
    const { data, error, refresh, status } = ([__temp, __restore] = withAsyncContext(() => useAsyncData("notifications", () => request("notifications", {
      query: { unread: filter.value ? 1 : void 0, page: page.value, per_page: 20 }
    }), { watch: [filter, page, locale] })), __temp = await __temp, __restore(), __temp);
    const items = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.data) != null ? _b : [];
    });
    const meta = computed(() => {
      var _a;
      return (_a = data.value) == null ? void 0 : _a.meta;
    });
    watch(meta, (m) => {
      if (m && typeof m.unread === "number") setUnread(m.unread);
    }, { immediate: true });
    const busy = ref(null);
    const busyAll = ref(false);
    function setFilter(v) {
      return navigateTo({ path: route.path, query: v ? { filter: v } : {} });
    }
    const changePage = (p) => navigateTo({ path: route.path, query: { ...route.query, page: p } });
    async function markRead(n, quiet = false) {
      var _a, _b, _c;
      if (n.read) return;
      busy.value = n.id;
      try {
        await request(`notifications/${n.id}/read`, { method: "POST" });
        n.read = true;
        setUnread(((_b = (_a = meta.value) == null ? void 0 : _a.unread) != null ? _b : 1) - 1);
        if (data.value) data.value.meta.unread = Math.max(0, ((_c = data.value.meta.unread) != null ? _c : 1) - 1);
        if (!quiet) toast.success(t("notifications.markedRead"));
      } catch (e) {
        toast.error(isApiError(e) ? e.message : t("errors.generic"));
      } finally {
        busy.value = null;
      }
    }
    async function markAll() {
      busyAll.value = true;
      try {
        await request("notifications/read-all", { method: "POST" });
        setUnread(0);
        toast.success(t("notifications.allMarkedRead"));
        await refresh();
      } catch (e) {
        toast.error(isApiError(e) ? e.message : t("errors.generic"));
      } finally {
        busyAll.value = false;
      }
    }
    async function remove(n) {
      busy.value = n.id;
      try {
        await request(`notifications/${n.id}`, { method: "DELETE" });
        toast.success(t("notifications.deleted"));
        await refresh();
      } catch (e) {
        toast.error(isApiError(e) ? e.message : t("errors.generic"));
      } finally {
        busy.value = null;
      }
    }
    const ctaPath = (n) => mapApiAction(n.cta);
    async function open(n) {
      const to = ctaPath(n);
      if (!to) return;
      await markRead(n, true);
      await navigateTo(localePath(to));
    }
    const chips = computed(() => [{ value: "", label: t("notifications.all") }, { value: "unread", label: t("notifications.unread") }]);
    return (_ctx, _push, _parent, _attrs) => {
      var _a, _b, _c, _d, _e, _f;
      const _component_UiButton = _sfc_main$3;
      const _component_UiIcon = _sfc_main$5;
      const _component_UiChips = _sfc_main$1;
      const _component_UiCard = _sfc_main$2;
      const _component_UiSkeleton = _sfc_main$4;
      const _component_UiErrorState = _sfc_main$2$1;
      const _component_UiEmptyState = _sfc_main$6;
      const _component_UiBadge = _sfc_main$7;
      const _component_UiAutoItalian = _sfc_main$8;
      const _component_UiPagination = _sfc_main$9;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "container-page max-w-3xl py-8 sm:py-12" }, _attrs))}><header class="mb-6 flex flex-wrap items-end justify-between gap-3"><div><h1 class="text-2xl font-bold sm:text-3xl">${ssrInterpolate(unref(t)("notifications.title"))}</h1><p class="mt-1 text-ink-soft">${ssrInterpolate(unref(t)("notifications.subtitle"))}</p></div>`);
      _push(ssrRenderComponent(_component_UiButton, {
        variant: "secondary",
        loading: unref(busyAll),
        disabled: !((_a = unref(meta)) == null ? void 0 : _a.unread),
        onClick: markAll
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_UiIcon, {
              name: "check",
              size: 18
            }, null, _parent2, _scopeId));
            _push2(`${ssrInterpolate(unref(t)("notifications.markAll"))}`);
          } else {
            return [
              createVNode(_component_UiIcon, {
                name: "check",
                size: 18
              }),
              createTextVNode(toDisplayString(unref(t)("notifications.markAll")), 1)
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</header>`);
      _push(ssrRenderComponent(_component_UiChips, {
        "model-value": unref(filter),
        options: unref(chips),
        label: unref(t)("notifications.filter"),
        class: "mb-5",
        "onUpdate:modelValue": setFilter
      }, null, _parent));
      _push(`<p class="sr-only" role="status" aria-live="polite">${ssrInterpolate(unref(meta) ? unref(t)("notifications.unreadCount", { count: (_b = unref(meta).unread) != null ? _b : 0 }) : "")}</p>`);
      if (unref(status) === "pending" && !unref(data)) {
        _push(`<ul aria-busy="true" class="space-y-3"><!--[-->`);
        ssrRenderList(4, (n) => {
          _push(`<li>`);
          _push(ssrRenderComponent(_component_UiCard, null, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(ssrRenderComponent(_component_UiSkeleton, { lines: 2 }, null, _parent2, _scopeId));
              } else {
                return [
                  createVNode(_component_UiSkeleton, { lines: 2 })
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
      } else if (!unref(items).length) {
        _push(ssrRenderComponent(_component_UiEmptyState, {
          title: unref(filter) ? unref(t)("notifications.emptyUnreadTitle") : unref(t)("notifications.emptyTitle"),
          description: unref(filter) ? unref(t)("notifications.emptyUnread") : unref(t)("notifications.empty"),
          icon: "bell"
        }, null, _parent));
      } else {
        _push(`<!--[--><ul class="space-y-3"><!--[-->`);
        ssrRenderList(unref(items), (n) => {
          _push(`<li>`);
          _push(ssrRenderComponent(_component_UiCard, {
            as: "article",
            class: ["space-y-2", n.read ? "" : "border-primary"],
            "data-read": n.read ? "true" : "false"
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              var _a2, _b2;
              if (_push2) {
                _push2(`<div class="flex items-start justify-between gap-3"${_scopeId}><div class="min-w-0"${_scopeId}><p class="flex flex-wrap items-center gap-2 font-semibold"${_scopeId}>`);
                if (!n.read) {
                  _push2(ssrRenderComponent(_component_UiBadge, { tone: "accent" }, {
                    default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                      if (_push3) {
                        _push3(`${ssrInterpolate(unref(t)("notifications.new"))}`);
                      } else {
                        return [
                          createTextVNode(toDisplayString(unref(t)("notifications.new")), 1)
                        ];
                      }
                    }),
                    _: 2
                  }, _parent2, _scopeId));
                } else {
                  _push2(`<!---->`);
                }
                _push2(ssrRenderComponent(_component_UiAutoItalian, {
                  text: n.title
                }, null, _parent2, _scopeId));
                _push2(`</p>`);
                if (n.body) {
                  _push2(`<p class="mt-1 text-ink-soft"${_scopeId}>`);
                  _push2(ssrRenderComponent(_component_UiAutoItalian, {
                    text: n.body
                  }, null, _parent2, _scopeId));
                  _push2(`</p>`);
                } else {
                  _push2(`<!---->`);
                }
                _push2(`<p class="mt-1 text-xs text-muted"${_scopeId}><time${ssrRenderAttr("datetime", (_a2 = n.created_at) != null ? _a2 : void 0)}${_scopeId}>${ssrInterpolate(unref(formatDateTime)(n.created_at, unref(locale)))}</time></p></div></div><div class="flex flex-wrap gap-2"${_scopeId}>`);
                if (ctaPath(n)) {
                  _push2(ssrRenderComponent(_component_UiButton, {
                    variant: "primary",
                    onClick: ($event) => open(n)
                  }, {
                    default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                      if (_push3) {
                        _push3(`${ssrInterpolate(unref(t)("notifications.open"))}`);
                        _push3(ssrRenderComponent(_component_UiIcon, {
                          name: "arrow-end",
                          size: 16
                        }, null, _parent3, _scopeId2));
                      } else {
                        return [
                          createTextVNode(toDisplayString(unref(t)("notifications.open")), 1),
                          createVNode(_component_UiIcon, {
                            name: "arrow-end",
                            size: 16
                          })
                        ];
                      }
                    }),
                    _: 2
                  }, _parent2, _scopeId));
                } else {
                  _push2(`<!---->`);
                }
                if (!n.read) {
                  _push2(ssrRenderComponent(_component_UiButton, {
                    variant: "secondary",
                    loading: unref(busy) === n.id,
                    onClick: ($event) => markRead(n)
                  }, {
                    default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                      if (_push3) {
                        _push3(ssrRenderComponent(_component_UiIcon, {
                          name: "check",
                          size: 16
                        }, null, _parent3, _scopeId2));
                        _push3(`${ssrInterpolate(unref(t)("notifications.markRead"))}`);
                      } else {
                        return [
                          createVNode(_component_UiIcon, {
                            name: "check",
                            size: 16
                          }),
                          createTextVNode(toDisplayString(unref(t)("notifications.markRead")), 1)
                        ];
                      }
                    }),
                    _: 2
                  }, _parent2, _scopeId));
                } else {
                  _push2(`<!---->`);
                }
                _push2(ssrRenderComponent(_component_UiButton, {
                  variant: "ghost",
                  disabled: unref(busy) === n.id,
                  onClick: ($event) => remove(n)
                }, {
                  default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                    if (_push3) {
                      _push3(ssrRenderComponent(_component_UiIcon, {
                        name: "trash",
                        size: 16
                      }, null, _parent3, _scopeId2));
                      _push3(`${ssrInterpolate(unref(t)("common.delete"))}`);
                    } else {
                      return [
                        createVNode(_component_UiIcon, {
                          name: "trash",
                          size: 16
                        }),
                        createTextVNode(toDisplayString(unref(t)("common.delete")), 1)
                      ];
                    }
                  }),
                  _: 2
                }, _parent2, _scopeId));
                _push2(`</div>`);
              } else {
                return [
                  createVNode("div", { class: "flex items-start justify-between gap-3" }, [
                    createVNode("div", { class: "min-w-0" }, [
                      createVNode("p", { class: "flex flex-wrap items-center gap-2 font-semibold" }, [
                        !n.read ? (openBlock(), createBlock(_component_UiBadge, {
                          key: 0,
                          tone: "accent"
                        }, {
                          default: withCtx(() => [
                            createTextVNode(toDisplayString(unref(t)("notifications.new")), 1)
                          ]),
                          _: 1
                        })) : createCommentVNode("", true),
                        createVNode(_component_UiAutoItalian, {
                          text: n.title
                        }, null, 8, ["text"])
                      ]),
                      n.body ? (openBlock(), createBlock("p", {
                        key: 0,
                        class: "mt-1 text-ink-soft"
                      }, [
                        createVNode(_component_UiAutoItalian, {
                          text: n.body
                        }, null, 8, ["text"])
                      ])) : createCommentVNode("", true),
                      createVNode("p", { class: "mt-1 text-xs text-muted" }, [
                        createVNode("time", {
                          datetime: (_b2 = n.created_at) != null ? _b2 : void 0
                        }, toDisplayString(unref(formatDateTime)(n.created_at, unref(locale))), 9, ["datetime"])
                      ])
                    ])
                  ]),
                  createVNode("div", { class: "flex flex-wrap gap-2" }, [
                    ctaPath(n) ? (openBlock(), createBlock(_component_UiButton, {
                      key: 0,
                      variant: "primary",
                      onClick: ($event) => open(n)
                    }, {
                      default: withCtx(() => [
                        createTextVNode(toDisplayString(unref(t)("notifications.open")), 1),
                        createVNode(_component_UiIcon, {
                          name: "arrow-end",
                          size: 16
                        })
                      ]),
                      _: 1
                    }, 8, ["onClick"])) : createCommentVNode("", true),
                    !n.read ? (openBlock(), createBlock(_component_UiButton, {
                      key: 1,
                      variant: "secondary",
                      loading: unref(busy) === n.id,
                      onClick: ($event) => markRead(n)
                    }, {
                      default: withCtx(() => [
                        createVNode(_component_UiIcon, {
                          name: "check",
                          size: 16
                        }),
                        createTextVNode(toDisplayString(unref(t)("notifications.markRead")), 1)
                      ]),
                      _: 1
                    }, 8, ["loading", "onClick"])) : createCommentVNode("", true),
                    createVNode(_component_UiButton, {
                      variant: "ghost",
                      disabled: unref(busy) === n.id,
                      onClick: ($event) => remove(n)
                    }, {
                      default: withCtx(() => [
                        createVNode(_component_UiIcon, {
                          name: "trash",
                          size: 16
                        }),
                        createTextVNode(toDisplayString(unref(t)("common.delete")), 1)
                      ]),
                      _: 1
                    }, 8, ["disabled", "onClick"])
                  ])
                ];
              }
            }),
            _: 2
          }, _parent));
          _push(`</li>`);
        });
        _push(`<!--]--></ul><div class="mt-8">`);
        _push(ssrRenderComponent(_component_UiPagination, {
          page: (_d = (_c = unref(meta)) == null ? void 0 : _c.page) != null ? _d : 1,
          "last-page": (_f = (_e = unref(meta)) == null ? void 0 : _e.last_page) != null ? _f : 1,
          onChange: changePage
        }, null, _parent));
        _push(`</div><!--]-->`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/notifications.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=notifications-BSqb9BbP.mjs.map
